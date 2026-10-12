-- =============================================================================
-- TOTAL ELECTRODOMÉSTICOS — El catálogo de la tienda se controla desde el ERP
--
-- POR QUÉ
-- Hasta ahora, publicar un producto en la tienda y marcarlo como destacado se
-- hacía en el panel de la web, en tablas `web_*` aparte. Eso obliga a entrar a
-- dos lugares para una sola decisión.
--
-- Ahora esas decisiones viven donde vive el producto: en `total.productos` y
-- `total.categorias_productos`. Se marcan desde Inventario del ERP.
--
-- Mismo patrón que Marilia Magazine, CON UNA DIFERENCIA IMPORTANTE:
-- allá se le dio a `anon` permiso de SELECT sobre `productos`, y como el RLS
-- filtra filas y no columnas, el costo quedó público (415 productos con su
-- margen a la vista). Acá no: la tienda sigue leyendo SOLO por vistas que no
-- incluyen el costo, y `productos` sigue cerrada.
--
-- Lo editorial largo —descripción comercial, galería, ficha, SEO— se queda en
-- `web_producto`, que es del sitio y no tiene por qué ensuciar el ERP.
--
-- Idempotente.
-- =============================================================================

-- ── PARTE 1: las decisiones de tienda, en las tablas del ERP ────────────────

ALTER TABLE total.productos
  ADD COLUMN IF NOT EXISTS visible_web boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS orden_web   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS slug_web    text;

COMMENT ON COLUMN total.productos.visible_web IS
  'Se muestra en la tienda online. Se marca desde Inventario del ERP.';
COMMENT ON COLUMN total.productos.orden_web IS
  'Orden en los listados de la tienda. Más bajo aparece antes.';
COMMENT ON COLUMN total.productos.slug_web IS
  'Dirección del producto en la tienda. Si queda vacía se arma sola del nombre.';

CREATE INDEX IF NOT EXISTS idx_productos_visible_web
  ON total.productos (empresa_id, visible_web) WHERE visible_web;
CREATE INDEX IF NOT EXISTS idx_productos_destacado_web
  ON total.productos (empresa_id, destacado) WHERE destacado;
CREATE UNIQUE INDEX IF NOT EXISTS uq_productos_slug_web
  ON total.productos (empresa_id, slug_web) WHERE slug_web IS NOT NULL;

ALTER TABLE total.categorias_productos
  ADD COLUMN IF NOT EXISTS visible_web    boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS orden_web      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS destaque_web   integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS subtitulo_home text,
  ADD COLUMN IF NOT EXISTS slug_web       text;

COMMENT ON COLUMN total.categorias_productos.visible_web IS
  'Aparece en el menú y la portada de la tienda.';
COMMENT ON COLUMN total.categorias_productos.destaque_web IS
  'Peso en la grilla de la portada: 1 normal, 2 bloque grande.';
COMMENT ON COLUMN total.categorias_productos.subtitulo_home IS
  'Bajada corta bajo el nombre, en la portada.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_categorias_slug_web
  ON total.categorias_productos (empresa_id, slug_web) WHERE slug_web IS NOT NULL;


-- ── PARTE 2: la dirección se arma sola ──────────────────────────────────────
--
-- Publicar desde el ERP no puede exigir inventar una URL. Si el slug viene
-- vacío se arma del nombre, y si choca con otro se le agrega el código.

CREATE OR REPLACE FUNCTION total.web_slug(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      lower(translate(COALESCE(txt, ''),
        'ÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÃÕÑÇáéíóúàèìòùäëïöüâêîôûãõñç"''',
        'AEIOUAEIOUAEIOUAEIOUAONCaeiouaeiouaeiouaeiouaonc  ')),
      '[^a-z0-9]+', '-', 'g'));
$$;

CREATE OR REPLACE FUNCTION total.productos_slug_web_auto()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_base text;
BEGIN
  IF NEW.visible_web AND COALESCE(NEW.slug_web, '') = '' THEN
    v_base := total.web_slug(NEW.nombre);
    IF v_base = '' THEN v_base := 'producto'; END IF;

    -- Si ya existe, se desempata con el código del artículo
    IF EXISTS (SELECT 1 FROM total.productos p
               WHERE p.empresa_id = NEW.empresa_id AND p.slug_web = v_base
                 AND p.id <> NEW.id) THEN
      v_base := v_base || '-' || total.web_slug(COALESCE(NEW.sku, left(NEW.id::text, 6)));
    END IF;

    NEW.slug_web := v_base;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_productos_slug_web ON total.productos;
CREATE TRIGGER trg_productos_slug_web
  BEFORE INSERT OR UPDATE OF visible_web, nombre, slug_web ON total.productos
  FOR EACH ROW EXECUTE FUNCTION total.productos_slug_web_auto();

CREATE OR REPLACE FUNCTION total.categorias_slug_web_auto()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(NEW.slug_web, '') = '' THEN
    NEW.slug_web := NULLIF(total.web_slug(NEW.nombre), '');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_categorias_slug_web ON total.categorias_productos;
CREATE TRIGGER trg_categorias_slug_web
  BEFORE INSERT OR UPDATE OF nombre, slug_web ON total.categorias_productos
  FOR EACH ROW EXECUTE FUNCTION total.categorias_slug_web_auto();


-- ── PARTE 3: traer lo que ya estaba en la capa web ──────────────────────────
--
-- Los 20 productos publicados desde el panel pasan a estarlo desde el ERP, sin
-- que nadie tenga que volver a marcarlos.

UPDATE total.productos p
SET visible_web = w.publicado,
    orden_web   = w.orden,
    slug_web    = COALESCE(NULLIF(p.slug_web, ''), w.slug)
FROM total.web_producto w
WHERE w.producto_id = p.id;

UPDATE total.categorias_productos c
SET visible_web  = w.publicado,
    orden_web    = w.orden,
    destaque_web = w.destaque,
    slug_web     = COALESCE(NULLIF(c.slug_web, ''), w.slug)
FROM total.web_categoria w
WHERE w.categoria_id = c.id;

-- Las categorías que nunca pasaron por el panel igual necesitan su dirección
UPDATE total.categorias_productos
SET slug_web = total.web_slug(nombre)
WHERE COALESCE(slug_web, '') = '';


-- ── PARTE 4: las vistas, ahora leyendo del ERP ──────────────────────────────
--
-- Siguen sin exponer el costo. Es la única puerta por la que entra la tienda.

-- CREATE OR REPLACE no puede reordenar ni renombrar columnas de una vista:
-- hay que borrarlas y rehacerlas. web_categoria_publica depende de
-- web_catalogo, así que se borra primero y se crea última.
-- web_categoria_publica y web_marca_publica cuentan productos de web_catalogo,
-- así que dependen de ella: se borran primero y se rehacen al final.
DROP VIEW IF EXISTS total.web_categoria_publica;
DROP VIEW IF EXISTS total.web_marca_publica;
DROP VIEW IF EXISTS total.web_catalogo;

CREATE VIEW total.web_catalogo AS
SELECT
  p.id,
  p.slug_web                AS slug,
  p.nombre,
  p.sku,
  p.codigo_barras,
  p.descripcion             AS descripcion_erp,
  wp.descripcion            AS descripcion_web,
  p.precio_venta            AS precio,
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
  END                       AS precio_anterior,
  p.stock_actual,
  p.destacado,
  p.garantia_meses,
  p.imagen_url,
  COALESCE(wp.galeria, '[]'::jsonb) AS galeria,
  COALESCE(wp.ficha,   '[]'::jsonb) AS ficha,
  p.orden_web               AS orden,
  wp.seo_titulo,
  wp.seo_desc,
  m.nombre                  AS marca,
  c.id                      AS categoria_id,
  c.nombre                  AS categoria,
  c.slug_web                AS categoria_slug,
  p.empresa_id,
  CASE
    WHEN NOT p.controla_stock   THEN 'consultar'
    WHEN p.stock_actual <= 0    THEN 'sin-stock'
    WHEN p.stock_actual <= COALESCE(p.stock_minimo, 0) THEN 'ultimas'
    ELSE 'disponible'
  END                       AS disponibilidad
FROM total.productos p
LEFT JOIN total.web_producto wp         ON wp.producto_id = p.id
LEFT JOIN total.marcas m                ON m.id = p.marca_id
LEFT JOIN total.categorias_productos c  ON c.id = p.categoria_principal_id
WHERE p.activo
  AND p.es_vendible
  AND p.visible_web
  AND p.slug_web IS NOT NULL;

COMMENT ON VIEW total.web_catalogo IS
  'Catálogo público. Se controla desde Inventario del ERP (visible_web, destacado, orden_web). No expone costo_promedio.';

CREATE VIEW total.web_categoria_publica AS
SELECT
  c.id,
  c.slug_web     AS slug,
  c.nombre,
  c.subtitulo_home,
  c.parent_id,
  c.orden_web    AS orden,
  c.destaque_web AS destaque,
  COALESCE(c.imagen_web_url, c.imagen_url) AS imagen_url,
  wc.seo_titulo,
  wc.seo_desc,
  c.empresa_id,
  (SELECT count(*) FROM total.web_catalogo wk WHERE wk.categoria_id = c.id) AS productos
FROM total.categorias_productos c
LEFT JOIN total.web_categoria wc ON wc.categoria_id = c.id
WHERE c.activo AND c.visible_web AND c.slug_web IS NOT NULL;

CREATE VIEW total.web_marca_publica AS
SELECT m.id, m.nombre, m.empresa_id,
       (SELECT count(*) FROM total.web_catalogo wk WHERE wk.marca = m.nombre) AS productos
FROM total.marcas m
WHERE m.activo;

GRANT SELECT ON total.web_catalogo, total.web_categoria_publica, total.web_marca_publica
  TO anon, authenticated;


-- ── PARTE 5: la capa web se queda solo con lo editorial ─────────────────────
--
-- `publicado`, `orden` y `slug` ya no mandan: ahora están en el ERP. Se dejan
-- las columnas para no romper nada que todavía las lea, pero quedan marcadas.

COMMENT ON COLUMN total.web_producto.publicado IS
  'OBSOLETA: ahora manda total.productos.visible_web, que se marca en el ERP.';
COMMENT ON COLUMN total.web_producto.orden IS
  'OBSOLETA: ahora manda total.productos.orden_web.';
COMMENT ON COLUMN total.web_producto.slug IS
  'OBSOLETA: ahora manda total.productos.slug_web.';


-- ── PARTE 6: que el ERP pueda escribir estos campos ─────────────────────────
GRANT UPDATE (visible_web, orden_web, slug_web, destacado) ON total.productos
  TO authenticated;
GRANT UPDATE (visible_web, orden_web, destaque_web, subtitulo_home, slug_web, imagen_web_url)
  ON total.categorias_productos TO authenticated;


-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
SELECT 'publicados desde el ERP' AS que, count(*) AS n FROM total.web_catalogo
UNION ALL SELECT 'categorías visibles', count(*) FROM total.web_categoria_publica
UNION ALL SELECT 'destacados', count(*) FROM total.web_catalogo WHERE destacado
UNION ALL SELECT 'con oferta vigente', count(*) FROM total.web_catalogo WHERE precio_anterior IS NOT NULL;

-- El costo no puede estar en ninguna vista pública
SELECT CASE WHEN count(*) = 0 THEN 'OK: ninguna vista expone el costo'
            ELSE 'PELIGRO: ' || string_agg(table_name || '.' || column_name, ', ') END AS control
FROM information_schema.columns
WHERE table_schema = 'total'
  AND table_name IN ('web_catalogo','web_categoria_publica','web_marca_publica')
  AND column_name ILIKE '%costo%';
