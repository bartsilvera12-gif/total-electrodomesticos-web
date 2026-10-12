-- =============================================================================
-- TOTAL ELECTRODOMÉSTICOS — El panel escribe desde el navegador
--
-- La web se sirve como archivos estáticos en Hostinger, así que no hay servidor
-- que guarde el service role. El panel escribe con la sesión del administrador
-- y es el RLS el que decide.
--
-- Quién es administrador: quien esté en `total.usuarios` con rol admin. Es el
-- mismo usuario del ERP. Un cliente de la tienda está en `auth.users` pero NO
-- en `total.usuarios`, así que no pasa.
--
-- Idempotente.
-- =============================================================================

-- ── Quién administra la tienda ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION total.es_admin_web()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'total'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM total.usuarios u
    WHERE lower(trim(COALESCE(u.email, ''))) = total.jwt_email_normalized()
      AND u.activo
      AND u.rol IN ('admin', 'super_admin')
  );
$$;

COMMENT ON FUNCTION total.es_admin_web() IS
  'Administra la tienda quien administra el ERP. Resuelve por el email del JWT contra total.usuarios.';

GRANT EXECUTE ON FUNCTION total.es_admin_web() TO anon, authenticated;


-- ── Escritura del panel sobre las tablas de la web ──────────────────────────
DO $policies$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['web_producto','web_categoria','web_config','web_banner'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON total.%I', t || '_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON total.%I FOR ALL TO authenticated '
      'USING (total.es_admin_web()) WITH CHECK (total.es_admin_web())',
      t || '_admin', t);

    -- El panel necesita ver también lo que la tienda no: productos sin publicar,
    -- categorías ocultas. La policy de lectura pública sigue aparte.
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON total.%I TO authenticated', t);
  END LOOP;
END $policies$;

-- Los pedidos: el panel los lee todos y les cambia el estado
DROP POLICY IF EXISTS web_pedido_admin ON total.web_pedido;
CREATE POLICY web_pedido_admin ON total.web_pedido
  FOR ALL TO authenticated
  USING (total.es_admin_web()) WITH CHECK (total.es_admin_web());

DROP POLICY IF EXISTS web_pedido_item_admin ON total.web_pedido_item;
CREATE POLICY web_pedido_item_admin ON total.web_pedido_item
  FOR ALL TO authenticated
  USING (total.es_admin_web()) WITH CHECK (total.es_admin_web());

GRANT INSERT, UPDATE ON total.web_pedido, total.web_pedido_item TO authenticated;


-- ── Pedidos desde la tienda ─────────────────────────────────────────────────
--
-- Sin servidor, el pedido lo inserta el navegador. Para que nadie compre al
-- precio que quiera, el precio NO se acepta del cliente: una función lo busca
-- en el catálogo y arma el pedido con ese valor.
-- =============================================================================

CREATE OR REPLACE FUNCTION total.web_crear_pedido(
  p_lineas  jsonb,   -- [{ "producto_id": "...", "cantidad": 2 }]
  p_cliente jsonb,
  p_entrega jsonb,
  p_pago    text DEFAULT 'pendiente'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'total'
AS $$
DECLARE
  v_emp     uuid;
  v_numero  text;
  v_pedido  uuid;
  v_sub     numeric(14,2) := 0;
  r         RECORD;
BEGIN
  IF jsonb_array_length(COALESCE(p_lineas, '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'El carrito está vacío.';
  END IF;
  IF COALESCE(p_cliente->>'correo', '') = '' OR COALESCE(p_cliente->>'nombre', '') = '' THEN
    RAISE EXCEPTION 'Faltan los datos del cliente.';
  END IF;
  IF p_pago NOT IN ('pendiente','aprobado') THEN
    RAISE EXCEPTION 'Estado de pago inválido.';
  END IF;

  SELECT id INTO v_emp FROM total.empresas LIMIT 1;
  v_numero := total.web_siguiente_numero_pedido();

  INSERT INTO total.web_pedido (
    empresa_id, numero, auth_user_id, cliente, entrega,
    subtotal, total, estado, estado_pago
  ) VALUES (
    v_emp, v_numero, auth.uid(), p_cliente, p_entrega,
    0, 0,
    CASE WHEN p_pago = 'aprobado' THEN 'pagado' ELSE 'pago-pendiente' END,
    CASE WHEN p_pago = 'aprobado' THEN 'aprobado' ELSE 'pendiente' END
  ) RETURNING id INTO v_pedido;

  -- El precio sale del catálogo, nunca del cuerpo que mandó el navegador
  FOR r IN
    SELECT c.id, c.nombre, c.marca, c.sku, c.precio,
           GREATEST(1, (l->>'cantidad')::int) AS cantidad
    FROM jsonb_array_elements(p_lineas) AS l
    JOIN total.web_catalogo c ON c.id = (l->>'producto_id')::uuid
  LOOP
    INSERT INTO total.web_pedido_item (pedido_id, producto_id, nombre, marca, sku, precio, cantidad)
    VALUES (v_pedido, r.id, r.nombre, r.marca, r.sku, r.precio, r.cantidad);
    v_sub := v_sub + r.precio * r.cantidad;
  END LOOP;

  IF v_sub = 0 THEN
    DELETE FROM total.web_pedido WHERE id = v_pedido;
    RAISE EXCEPTION 'Los productos del carrito ya no están disponibles.';
  END IF;

  -- El costo de envío se confirma según la dirección, así que todavía no suma
  UPDATE total.web_pedido SET subtotal = v_sub, total = v_sub WHERE id = v_pedido;

  RETURN v_numero;
END $$;

COMMENT ON FUNCTION total.web_crear_pedido IS
  'Crea un pedido con los precios del catálogo. El precio que mande el navegador se ignora.';

GRANT EXECUTE ON FUNCTION total.web_crear_pedido(jsonb, jsonb, jsonb, text) TO anon, authenticated;


-- ── Consultar un pedido por su número ───────────────────────────────────────
-- Para la pantalla de confirmación de quien compró sin cuenta.
CREATE OR REPLACE FUNCTION total.web_pedido_por_numero(p_numero text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'total'
AS $$
  SELECT to_jsonb(p) || jsonb_build_object(
    'items', COALESCE((
      SELECT jsonb_agg(to_jsonb(i) ORDER BY i.nombre)
      FROM total.web_pedido_item i WHERE i.pedido_id = p.id), '[]'::jsonb))
  FROM total.web_pedido p
  WHERE p.numero = p_numero;
$$;

GRANT EXECUTE ON FUNCTION total.web_pedido_por_numero(text) TO anon, authenticated;

-- El panel necesita leer el catálogo completo, también lo no publicado
GRANT SELECT ON total.productos, total.categorias_productos, total.marcas TO authenticated;


-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
SELECT 'policies de admin' AS que, count(*) AS n
FROM pg_policies WHERE schemaname='total' AND policyname LIKE '%\_admin'
UNION ALL
SELECT 'funciones de la web', count(*)
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='total' AND p.proname LIKE 'web\_%';
