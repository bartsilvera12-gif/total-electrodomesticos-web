-- =============================================================================
-- 07 · Módulo "Pedidos web" en el ERP
-- =============================================================================
--
-- Portado del ERP de Marilia Magazine (`mariliaerp.v_web_pedidos` +
-- `web_marcar_envio`), adaptado a las tablas que Total YA tiene.
--
-- QUÉ SE PORTA Y QUÉ NO
--
-- Marilia tiene `web_pedidos` / `web_pedido_items` con una columna por cada
-- dato del cliente y un `estado_envio` separado del `estado_pago`. Total tiene
-- `web_pedido` / `web_pedido_item`, con el cliente y la entrega en jsonb y un
-- solo `estado` que ya incluye los estados de entrega.
--
-- No se tocan las tablas de Total: la tienda ya crea pedidos contra ellas y
-- cambiarlas obligaría a tocar el checkout, que funciona. Lo que se porta es
-- lo que el ERP necesita para trabajarlos:
--
--   · la vista `v_web_pedidos`, que aplana el jsonb, arma el resumen de los
--     items y el link de WhatsApp ya listo para tocar;
--   · la función `web_marcar_envio`, que cambia el estado y deja la marca de
--     tiempo del cambio, para poder saber después cuánto tardó cada pedido.
--
-- ESTADOS
--
-- El CHECK de `total.web_pedido.estado` ya admite:
--   recibido · pago-pendiente · pagado · preparando · listo · entregado · cancelado
--
-- El tablero del ERP usa los cuatro últimos como columnas; 'recibido' y
-- 'pagado' son la bandeja de entrada. Donde Marilia dice 'enviado', Total dice
-- 'listo', que es el estado que ya estaba.
--
-- CÓMO CORRERLO
--
--     BEGIN;
--     \i 07_pedidos_web_en_el_erp.sql
--     ROLLBACK;
--
-- Mirá la verificación del final y recién después corrélo de verdad.
-- =============================================================================


-- ── PARTE 1: columnas de seguimiento ────────────────────────────────────────
-- Cuándo pasó a cada estado y la nota interna del que lo despacha.

ALTER TABLE total.web_pedido
  ADD COLUMN IF NOT EXISTS preparando_at   timestamptz,
  ADD COLUMN IF NOT EXISTS listo_at        timestamptz,
  ADD COLUMN IF NOT EXISTS entregado_at    timestamptz,
  ADD COLUMN IF NOT EXISTS notas_internas  text;

COMMENT ON COLUMN total.web_pedido.notas_internas IS
  'Nota del que prepara o entrega. No se muestra en la tienda.';


-- ── PARTE 2: la vista que lee el ERP ────────────────────────────────────────

CREATE OR REPLACE VIEW total.v_web_pedidos AS
SELECT
  p.id,
  p.numero                        AS numero_pedido,
  p.empresa_id,
  p.created_at                    AS fecha_pedido,
  p.estado                        AS estado_envio,
  p.estado_pago,
  p.estado_pago = 'aprobado'      AS esta_pagado,
  p.preparando_at,
  p.listo_at,
  p.entregado_at,
  p.notas_internas,

  -- Cliente: viene en jsonb desde el checkout
  -- ({nombre, apellido, documento, telefono, correo}).
  trim(
    COALESCE(p.cliente->>'nombre', '') || ' ' || COALESCE(p.cliente->>'apellido', '')
  )                               AS cliente_nombre,
  p.cliente->>'telefono'          AS cliente_telefono,
  p.cliente->>'correo'            AS cliente_email,
  p.cliente->>'documento'         AS cliente_documento,

  -- Teléfono normalizado a formato internacional paraguayo, para wa.me.
  CASE
    WHEN COALESCE(p.cliente->>'telefono', '') = '' THEN NULL
    ELSE
      CASE
        WHEN regexp_replace(p.cliente->>'telefono', '\D', '', 'g') ~ '^595'
          THEN regexp_replace(p.cliente->>'telefono', '\D', '', 'g')
        WHEN regexp_replace(p.cliente->>'telefono', '\D', '', 'g') ~ '^0'
          THEN '595' || substring(regexp_replace(p.cliente->>'telefono', '\D', '', 'g') from 2)
        WHEN length(regexp_replace(p.cliente->>'telefono', '\D', '', 'g')) = 9
          THEN '595' || regexp_replace(p.cliente->>'telefono', '\D', '', 'g')
        ELSE regexp_replace(p.cliente->>'telefono', '\D', '', 'g')
      END
  END                             AS whatsapp_numero,

  CASE
    WHEN COALESCE(p.cliente->>'telefono', '') = '' THEN NULL
    ELSE 'https://wa.me/' ||
      CASE
        WHEN regexp_replace(p.cliente->>'telefono', '\D', '', 'g') ~ '^595'
          THEN regexp_replace(p.cliente->>'telefono', '\D', '', 'g')
        WHEN regexp_replace(p.cliente->>'telefono', '\D', '', 'g') ~ '^0'
          THEN '595' || substring(regexp_replace(p.cliente->>'telefono', '\D', '', 'g') from 2)
        WHEN length(regexp_replace(p.cliente->>'telefono', '\D', '', 'g')) = 9
          THEN '595' || regexp_replace(p.cliente->>'telefono', '\D', '', 'g')
        ELSE regexp_replace(p.cliente->>'telefono', '\D', '', 'g')
      END
      || '?text=' || replace(
           replace(
             'Hola, te escribimos de Total Electrodomésticos por tu pedido #' || p.numero,
             ' ', '%20'),
           '#', '%23')
  END                             AS whatsapp_link,

  -- Entrega: {modo: 'envio'|'retiro', direccion?, ciudad?, referencia?}
  COALESCE(p.entrega->>'modo', 'retiro')  AS modalidad,
  p.entrega->>'ciudad'                    AS ciudad_nombre,
  p.entrega->>'direccion'                 AS direccion,
  p.entrega->>'referencia'                AS direccion_referencia,

  p.subtotal,
  p.total                         AS total_cobrado,
  COALESCE(i.cantidad_articulos, 0)       AS cantidad_articulos,
  COALESCE(i.resumen, '')                 AS detalle,
  COALESCE(i.items, '[]'::jsonb)          AS items
FROM total.web_pedido p
LEFT JOIN LATERAL (
  SELECT
    sum(d.cantidad)                                   AS cantidad_articulos,
    string_agg(d.cantidad || ' x ' || d.nombre, ' · ' ORDER BY d.nombre) AS resumen,
    jsonb_agg(
      jsonb_build_object(
        'producto_id', d.producto_id,
        'nombre',      d.nombre,
        'marca',       d.marca,
        'sku',         d.sku,
        'cantidad',    d.cantidad,
        'precio',      d.precio,
        'total_linea', d.precio * d.cantidad
      ) ORDER BY d.nombre
    )                                                 AS items
  FROM total.web_pedido_item d
  WHERE d.pedido_id = p.id
) i ON true;

COMMENT ON VIEW total.v_web_pedidos IS
  'Pedidos de la tienda, aplanados para el módulo Pedidos web del ERP. No expone costo.';


-- ── PARTE 3: cambiar el estado del pedido ───────────────────────────────────
--
-- SECURITY DEFINER para que corra con los permisos del dueño del schema: el
-- usuario del ERP no escribe directo en `web_pedido`, cuyo RLS está pensado
-- para la tienda.

CREATE OR REPLACE FUNCTION total.web_marcar_envio(
  p_pedido uuid,
  p_estado text,
  p_nota   text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'total', 'public'
AS $$
DECLARE
  v_estado text := lower(trim(p_estado));
BEGIN
  -- Los mismos valores que admite el CHECK de la tabla.
  IF v_estado NOT IN ('recibido','pago-pendiente','pagado','preparando','listo','entregado','cancelado') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'estado no válido: ' || p_estado);
  END IF;

  UPDATE total.web_pedido
     SET estado         = v_estado,
         -- La primera vez que entra a cada estado queda la hora. Si vuelve
         -- atrás y avanza de nuevo, se conserva la original.
         preparando_at  = CASE WHEN v_estado = 'preparando' THEN COALESCE(preparando_at, now()) ELSE preparando_at END,
         listo_at       = CASE WHEN v_estado = 'listo'      THEN COALESCE(listo_at, now())      ELSE listo_at END,
         entregado_at   = CASE WHEN v_estado = 'entregado'  THEN COALESCE(entregado_at, now())  ELSE entregado_at END,
         notas_internas = COALESCE(nullif(trim(COALESCE(p_nota, '')), ''), notas_internas),
         updated_at     = now()
   WHERE id = p_pedido;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'pedido no encontrado');
  END IF;

  RETURN jsonb_build_object('ok', true, 'estado_envio', v_estado);
END $$;


-- ── PARTE 4: permisos ───────────────────────────────────────────────────────
-- Solo el ERP (authenticated). La tienda NO lee esta vista: tiene los datos
-- del cliente de todos los pedidos.

GRANT SELECT ON total.v_web_pedidos TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION total.web_marcar_envio(uuid, text, text) TO authenticated, service_role;

REVOKE ALL ON total.v_web_pedidos FROM anon;
REVOKE ALL ON FUNCTION total.web_marcar_envio(uuid, text, text) FROM anon;


-- ── PARTE 5: alta del módulo en el menú ─────────────────────────────────────
--
-- Sin esto el ítem no aparece en el sidebar: el gate de acceso pide que el
-- slug esté en `empresa_modulos`.
--
-- MANASTINA hace esto recorriendo todos los schemas que matcheen
-- ('public','zentra_erp','manastina'), '^er_[0-9a-f]{32}$' o 'erp_%'. El
-- schema de Total se llama `total` y NO matchea ninguno de esos patrones, así
-- que ese bloque, copiado tal cual, no habría hecho nada. Va apuntado a mano.

DO $$
DECLARE
  v_modulo uuid;
BEGIN
  SELECT id INTO v_modulo FROM total.modulos WHERE slug = 'pedidos-web' LIMIT 1;

  IF v_modulo IS NULL THEN
    INSERT INTO total.modulos (nombre, descripcion, slug)
    VALUES ('Pedidos web', 'Pedidos de la tienda online: qué despachar y a dónde', 'pedidos-web')
    RETURNING id INTO v_modulo;
    RAISE NOTICE '[pedidos-web] módulo creado';
  ELSE
    RAISE NOTICE '[pedidos-web] el módulo ya existía';
  END IF;

  -- Se habilita en todas las empresas del schema (acá hay una sola).
  -- `empresa_modulos` no tiene unique en (empresa_id, modulo_id), asi que el
  -- ON CONFLICT no sirve: se filtra con NOT EXISTS.
  INSERT INTO total.empresa_modulos (empresa_id, modulo_id, activo)
  SELECT e.id, v_modulo, true
    FROM total.empresas e
   WHERE NOT EXISTS (
     SELECT 1 FROM total.empresa_modulos em
      WHERE em.empresa_id = e.id AND em.modulo_id = v_modulo
   );
END $$;


NOTIFY pgrst, 'reload schema';


-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================

-- 1) La vista existe y no expone costo.
SELECT 'columnas de v_web_pedidos' AS que,
       count(*)                                           AS total,
       count(*) FILTER (WHERE column_name ILIKE '%costo%') AS con_costo_debe_ser_0
FROM information_schema.columns
WHERE table_schema = 'total' AND table_name = 'v_web_pedidos';

-- 2) Qué hay cargado hoy.
SELECT 'pedidos por estado' AS que, estado_envio, estado_pago, count(*) AS n
FROM total.v_web_pedidos
GROUP BY estado_envio, estado_pago
ORDER BY n DESC;

-- 3) Que el link de WhatsApp salga armado (si todavía no hay pedidos, no
--    devuelve filas, y está bien).
SELECT numero_pedido, cliente_nombre, cantidad_articulos, total_cobrado, whatsapp_link
FROM total.v_web_pedidos
ORDER BY fecha_pedido DESC
LIMIT 5;

-- 4) Que anon NO pueda leerla (tiene datos personales de los compradores).
SELECT 'anon puede leer v_web_pedidos' AS que,
       has_table_privilege('anon', 'total.v_web_pedidos', 'SELECT') AS debe_ser_false;

-- 5) Que el módulo haya quedado habilitado (si no, no aparece en el menú).
SELECT 'modulo pedidos-web' AS que,
       m.slug,
       count(em.id) FILTER (WHERE em.activo) AS empresas_con_el_modulo
FROM total.modulos m
LEFT JOIN total.empresa_modulos em ON em.modulo_id = m.id
WHERE m.slug = 'pedidos-web'
GROUP BY m.slug;
