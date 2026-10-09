-- =============================================================================
-- TOTAL ELECTRODOMÉSTICOS — Capa web sobre el schema `total`
-- Destino: Supabase self-hosted → SQL Editor (ejecutar como `postgres`)
--
-- La web comparte el schema del ERP a propósito: el ERP es la fuente de verdad
-- de producto, precio y stock, así que no hay nada que sincronizar.
--
-- REGLA QUE ORDENA TODO ESTO:
-- `total.productos` tiene la columna `costo_promedio`. La web NUNCA la consulta.
-- Lee por las vistas `web_catalogo` y `web_categoria`, que no la incluyen.
-- Las vistas además saltean el RLS del ERP a propósito: `puede_acceder_empresa`
-- exige estar en `total.usuarios`, y un cliente de la tienda no lo está.
--
-- Lo que la web SÍ posee son las tablas `web_*`: contenido editorial, banners,
-- configuración de la home y los pedidos que entran por la tienda.
--
-- Idempotente: se puede re-ejecutar.
-- =============================================================================

DO $empresa$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM total.empresas) THEN
    RAISE EXCEPTION 'No hay empresa en total.empresas. Corré antes 01_empresa_usuario_modulos.sql del ERP.';
  END IF;
END $empresa$;


-- =============================================================================
-- PARTE 1 — TABLAS PROPIAS DE LA WEB
-- =============================================================================

-- Contenido editorial por producto. Una fila por producto que la web publica.
-- El nombre, el precio y el stock NO se guardan acá: salen del ERP en vivo.
CREATE TABLE IF NOT EXISTS total.web_producto (
  producto_id   uuid PRIMARY KEY REFERENCES total.productos(id) ON DELETE CASCADE,
  empresa_id    uuid NOT NULL REFERENCES total.empresas(id) ON DELETE CASCADE,
  slug          text NOT NULL,
  publicado     boolean NOT NULL DEFAULT false,
  orden         int NOT NULL DEFAULT 0,
  /** Texto comercial para la tienda. Puede diferir del del ERP. */
  descripcion   text,
  /** Fotos adicionales a `productos.imagen_url` */
  galeria       jsonb NOT NULL DEFAULT '[]'::jsonb,
  /** Pares etiqueta/valor de la ficha técnica */
  ficha         jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_titulo    text,
  seo_desc      text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_web_producto_slug ON total.web_producto (empresa_id, slug);
CREATE INDEX IF NOT EXISTS idx_web_producto_publicado ON total.web_producto (publicado, orden);

-- Contenido editorial por categoría
CREATE TABLE IF NOT EXISTS total.web_categoria (
  categoria_id  uuid PRIMARY KEY REFERENCES total.categorias_productos(id) ON DELETE CASCADE,
  empresa_id    uuid NOT NULL REFERENCES total.empresas(id) ON DELETE CASCADE,
  slug          text NOT NULL,
  publicado     boolean NOT NULL DEFAULT true,
  orden         int NOT NULL DEFAULT 0,
  /** Peso visual en la grilla editorial de la home: 1 = normal, 2 = bloque grande */
  destaque      int NOT NULL DEFAULT 1,
  imagen_url    text,
  seo_titulo    text,
  seo_desc      text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_web_categoria_slug ON total.web_categoria (empresa_id, slug);

-- Configuración de la tienda. Una sola fila por empresa.
CREATE TABLE IF NOT EXISTS total.web_config (
  empresa_id      uuid PRIMARY KEY REFERENCES total.empresas(id) ON DELETE CASCADE,
  barra_superior  text,
  hero_titulo     text,
  hero_bajada     text,
  seo_titulo      text,
  seo_desc        text,
  /** Orden y visibilidad de los bloques de la home */
  bloques         jsonb NOT NULL DEFAULT '[]'::jsonb,
  /** Líneas de WhatsApp: [{etiqueta, numero, local}] */
  asesores        jsonb NOT NULL DEFAULT '[]'::jsonb,
  instagram       text,
  facebook        text,
  correo          text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Banners de la home
CREATE TABLE IF NOT EXISTS total.web_banner (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  uuid NOT NULL REFERENCES total.empresas(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  bajada      text,
  imagen_url  text,
  enlace      text,
  activo      boolean NOT NULL DEFAULT true,
  orden       int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_web_banner_activo ON total.web_banner (activo, orden);

-- Pedidos que entran por la tienda. El ERP los va a leer de acá.
CREATE TABLE IF NOT EXISTS total.web_pedido (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    uuid NOT NULL REFERENCES total.empresas(id) ON DELETE CASCADE,
  numero        text NOT NULL,
  /** auth.users del cliente, si compró con sesión iniciada */
  auth_user_id  uuid,
  cliente       jsonb NOT NULL,
  entrega       jsonb NOT NULL,
  subtotal      numeric(14,2) NOT NULL DEFAULT 0,
  total         numeric(14,2) NOT NULL DEFAULT 0,
  estado        text NOT NULL DEFAULT 'recibido'
                CHECK (estado IN ('recibido','pago-pendiente','pagado','preparando','listo','entregado','cancelado')),
  estado_pago   text NOT NULL DEFAULT 'pendiente'
                CHECK (estado_pago IN ('pendiente','aprobado','rechazado','cancelado')),
  /** Identificador que devuelve PagoPar, cuando se integre */
  pago_ref      text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_web_pedido_numero ON total.web_pedido (empresa_id, numero);
CREATE INDEX IF NOT EXISTS idx_web_pedido_usuario ON total.web_pedido (auth_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_pedido_estado ON total.web_pedido (estado, created_at DESC);

CREATE TABLE IF NOT EXISTS total.web_pedido_item (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id    uuid NOT NULL REFERENCES total.web_pedido(id) ON DELETE CASCADE,
  producto_id  uuid REFERENCES total.productos(id) ON DELETE SET NULL,
  /** Nombre y precio congelados al momento de la compra */
  nombre       text NOT NULL,
  marca        text,
  sku          text,
  precio       numeric(14,2) NOT NULL,
  cantidad     int NOT NULL CHECK (cantidad > 0)
);
CREATE INDEX IF NOT EXISTS idx_web_pedido_item_pedido ON total.web_pedido_item (pedido_id);


-- =============================================================================
-- PARTE 2 — LAS VISTAS QUE LEE LA TIENDA
--
-- Acá está la protección del costo. `costo_promedio` no aparece, y como son
-- vistas comunes (no security_invoker) corren con los permisos del dueño, así
-- que saltean el RLS de `productos` sin exponer la tabla.
-- =============================================================================

CREATE OR REPLACE VIEW total.web_catalogo AS
SELECT
  p.id,
  wp.slug,
  p.nombre,
  p.sku,
  p.codigo_barras,
  p.descripcion            AS descripcion_erp,
  wp.descripcion           AS descripcion_web,
  p.precio_venta           AS precio,
  -- Precio anterior solo si hay una rebaja vigente de verdad
  CASE
    WHEN p.discount_value IS NOT NULL
     AND p.discount_value > 0
     AND (p.discount_starts_at IS NULL OR p.discount_starts_at <= now())
     AND (p.discount_ends_at   IS NULL OR p.discount_ends_at   >= now())
    -- discount_type solo admite 'percentage' o 'fixed' (CHECK del ERP)
    THEN CASE
           WHEN p.discount_type = 'percentage'
             THEN round(p.precio_venta / NULLIF(1 - p.discount_value / 100.0, 0), 0)
           ELSE p.precio_venta + p.discount_value
         END
  END                      AS precio_anterior,
  p.stock_actual,
  p.destacado,
  p.garantia_meses,
  p.imagen_url,
  wp.galeria,
  wp.ficha,
  wp.orden,
  wp.seo_titulo,
  wp.seo_desc,
  m.nombre                 AS marca,
  c.id                     AS categoria_id,
  c.nombre                 AS categoria,
  wc.slug                  AS categoria_slug,
  p.empresa_id,
  -- Disponibilidad tal como la muestra la tienda
  CASE
    WHEN NOT p.controla_stock   THEN 'consultar'
    WHEN p.stock_actual <= 0    THEN 'sin-stock'
    WHEN p.stock_actual <= COALESCE(p.stock_minimo, 0) THEN 'ultimas'
    ELSE 'disponible'
  END                      AS disponibilidad
FROM total.productos p
JOIN total.web_producto wp         ON wp.producto_id = p.id
LEFT JOIN total.marcas m           ON m.id = p.marca_id
LEFT JOIN total.categorias_productos c ON c.id = p.categoria_principal_id
LEFT JOIN total.web_categoria wc   ON wc.categoria_id = c.id
WHERE p.activo
  AND p.es_vendible
  AND wp.publicado;

COMMENT ON VIEW total.web_catalogo IS
  'Catálogo público. No expone costo_promedio: es la única puerta por la que la tienda lee productos.';

CREATE OR REPLACE VIEW total.web_categoria_publica AS
SELECT
  c.id,
  wc.slug,
  c.nombre,
  c.parent_id,
  wc.orden,
  wc.destaque,
  COALESCE(wc.imagen_url, c.imagen_web_url, c.imagen_url) AS imagen_url,
  wc.seo_titulo,
  wc.seo_desc,
  c.empresa_id,
  (SELECT count(*) FROM total.web_catalogo wk WHERE wk.categoria_id = c.id) AS productos
FROM total.categorias_productos c
JOIN total.web_categoria wc ON wc.categoria_id = c.id
WHERE c.activo AND wc.publicado;

CREATE OR REPLACE VIEW total.web_marca_publica AS
SELECT m.id, m.nombre, m.empresa_id,
       (SELECT count(*) FROM total.web_catalogo wk WHERE wk.marca = m.nombre) AS productos
FROM total.marcas m
WHERE m.activo;


-- =============================================================================
-- PARTE 3 — QUIÉN PUEDE QUÉ
--
-- `anon` (visitante sin sesión) y `authenticated` (cliente logueado) leen las
-- vistas y nada más. Las tablas `web_*` las escribe el panel, que entra con el
-- service role del lado del servidor.
-- =============================================================================

-- Las vistas son públicas: es el catálogo de la tienda.
GRANT SELECT ON total.web_catalogo          TO anon, authenticated;
GRANT SELECT ON total.web_categoria_publica TO anon, authenticated;
GRANT SELECT ON total.web_marca_publica     TO anon, authenticated;

ALTER TABLE total.web_producto    ENABLE ROW LEVEL SECURITY;
ALTER TABLE total.web_categoria   ENABLE ROW LEVEL SECURITY;
ALTER TABLE total.web_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE total.web_banner      ENABLE ROW LEVEL SECURITY;
ALTER TABLE total.web_pedido      ENABLE ROW LEVEL SECURITY;
ALTER TABLE total.web_pedido_item ENABLE ROW LEVEL SECURITY;

-- Configuración y banners: los lee cualquiera, son el contenido de la home.
DROP POLICY IF EXISTS web_config_lectura ON total.web_config;
CREATE POLICY web_config_lectura ON total.web_config
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS web_banner_lectura ON total.web_banner;
CREATE POLICY web_banner_lectura ON total.web_banner
  FOR SELECT TO anon, authenticated USING (activo);

-- Pedidos: cada cliente ve los suyos y nada más.
DROP POLICY IF EXISTS web_pedido_propio ON total.web_pedido;
CREATE POLICY web_pedido_propio ON total.web_pedido
  FOR SELECT TO authenticated USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS web_pedido_item_propio ON total.web_pedido_item;
CREATE POLICY web_pedido_item_propio ON total.web_pedido_item
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM total.web_pedido p
    WHERE p.id = pedido_id AND p.auth_user_id = auth.uid()));

-- Nadie inserta pedidos desde el navegador: el checkout los crea del lado del
-- servidor con el service role, que es quien valida precios contra el ERP.
-- Si el cliente pudiera insertar, podría mandar el precio que quisiera.

GRANT SELECT ON total.web_config, total.web_banner TO anon, authenticated;
GRANT SELECT ON total.web_pedido, total.web_pedido_item TO authenticated;
GRANT ALL ON total.web_producto, total.web_categoria, total.web_config,
             total.web_banner, total.web_pedido, total.web_pedido_item
          TO postgres, service_role;


-- =============================================================================
-- PARTE 4 — NUMERACIÓN DE PEDIDOS
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS total.web_pedido_numero_seq START 129;

CREATE OR REPLACE FUNCTION total.web_siguiente_numero_pedido()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'W-' || lpad(nextval('total.web_pedido_numero_seq')::text, 6, '0');
$$;


-- =============================================================================
-- PARTE 5 — CONFIGURACIÓN INICIAL
-- =============================================================================

INSERT INTO total.web_config (
  empresa_id, barra_superior, hero_titulo, hero_bajada,
  seo_titulo, seo_desc, bloques, asesores, instagram, facebook, correo
)
SELECT
  e.id,
  'Comprá online · Consultá por WhatsApp · Atención personalizada',
  'Todo para tu casa. Todo en un solo lugar.',
  'Tecnología, electrodomésticos, muebles y productos para acompañar cada espacio de tu hogar.',
  'Total Electrodomésticos — Todo para tu casa',
  'Tecnología, electrodomésticos, muebles y productos para acompañar cada espacio de tu hogar.',
  '[{"id":"hero","nombre":"Hero · La casa Total","visible":true},
    {"id":"categorias","nombre":"Categorías","visible":true},
    {"id":"espacios","nombre":"¿Qué querés equipar?","visible":true},
    {"id":"destacados","nombre":"Elegidos de Total","visible":true},
    {"id":"beneficios","nombre":"Beneficios","visible":true},
    {"id":"ofertas","nombre":"Ofertas","visible":true},
    {"id":"marcas","nombre":"Marcas","visible":true},
    {"id":"institucional","nombre":"Total para tu hogar + Redes","visible":true}]'::jsonb,
  '[{"etiqueta":"Asesor 1","numero":"595983918520","local":"0983 918 520"},
    {"etiqueta":"Asesor 2","numero":"595974203063","local":"0974 203 063"}]'::jsonb,
  'https://instagram.com/total_electrodomesticos',
  'https://www.facebook.com/',
  'total_electronica@hotmail.com'
FROM total.empresas e
ON CONFLICT (empresa_id) DO NOTHING;


-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================

SELECT 'tablas web' AS que, count(*) AS n
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'total' AND c.relkind = 'r' AND c.relname LIKE 'web\_%'
UNION ALL
SELECT 'vistas web', count(*)
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'total' AND c.relkind = 'v' AND c.relname LIKE 'web\_%'
UNION ALL
SELECT 'config', count(*) FROM total.web_config;

-- El costo NO puede estar en el catálogo público
SELECT CASE WHEN count(*) = 0
            THEN 'OK: la vista no expone el costo'
            ELSE 'PELIGRO: hay una columna de costo en web_catalogo' END AS control
FROM information_schema.columns
WHERE table_schema = 'total' AND table_name = 'web_catalogo'
  AND column_name ILIKE '%costo%';
