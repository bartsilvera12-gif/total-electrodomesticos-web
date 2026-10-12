-- =============================================================================
-- 06 · Que las fotos subidas desde el ERP se vean en la web
-- =============================================================================
--
-- EL PROBLEMA
--
-- Cuando se sube una foto desde Inventario, el ERP la guarda en el bucket
-- `productos-imagenes` y en el producto deja:
--
--     imagen_path = '{empresa_id}/{producto_id}/principal.jpg'
--     imagen_url  = NULL          <-- la pone en null a proposito
--
-- Pero `web_catalogo` expone solo `imagen_url`. Resultado: TODA foto subida
-- desde el ERP sale como placeholder en la tienda. Verificado en vivo: de 21
-- productos, 2 ya tenian foto cargada y ninguna se veia.
--
-- POR QUE NO SE FIRMA LA URL
--
-- La tienda se sirve como archivos estaticos en Hostinger: no hay servidor que
-- pueda firmar una URL de storage. Pero no hace falta: el bucket
-- `productos-imagenes` ya es publico en esta instancia (se verifico contra
-- /storage/v1/bucket), asi que la URL se arma sin credenciales:
--
--     https://api.neura.com.py/storage/v1/object/public/productos-imagenes/{path}
--
-- Comprobado sin apikey: HTTP 200, image/jpeg, 55009 bytes.
--
-- LA SOLUCION
--
-- Exponer `imagen_path` en la vista y que la web arme la URL publica (lo hace
-- `urlPublicaImagen()` en src/lib/supabase/cliente.ts, usando su propia
-- SUPA_URL en vez de hardcodear el host aca).
--
-- `imagen_url` se mantiene y tiene prioridad: sigue sirviendo para fotos
-- alojadas afuera, pegadas a mano.
--
-- SEGURIDAD
--
-- `imagen_path` es `{empresa_id}/{producto_id}/archivo`. El `empresa_id` ya
-- estaba en la vista y el `id` del producto tambien, asi que no agrega nada
-- que no se viera. Sigue sin aparecer `costo_promedio`, que es la regla que no
-- se negocia.
--
-- COMO CORRERLO
--
-- Probalo primero envuelto en transaccion, mirá la verificacion del final y
-- recien despues corré el archivo tal cual:
--
--     BEGIN;
--     \i 06_fotos_del_erp_en_la_web.sql
--     ROLLBACK;
--
-- Se usa CREATE OR REPLACE y la columna nueva va al FINAL de la lista, que es
-- la unica forma en que Postgres lo permite sin dropear. Asi no hay que tocar
-- `web_categoria_publica` ni `web_marca_publica`, que dependen de esta vista.
-- =============================================================================

CREATE OR REPLACE VIEW total.web_catalogo AS
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
  END                       AS disponibilidad,
  -- COLUMNA NUEVA (va al final para poder usar CREATE OR REPLACE).
  -- Ruta dentro del bucket publico `productos-imagenes`. La web arma la URL.
  p.imagen_path
FROM total.productos p
LEFT JOIN total.web_producto wp         ON wp.producto_id = p.id
LEFT JOIN total.marcas m                ON m.id = p.marca_id
LEFT JOIN total.categorias_productos c  ON c.id = p.categoria_principal_id
WHERE p.activo
  AND p.es_vendible
  AND p.visible_web
  AND p.slug_web IS NOT NULL;

COMMENT ON VIEW total.web_catalogo IS
  'Catálogo público. Se controla desde Inventario del ERP (visible_web, destacado, orden_web). Expone imagen_path del bucket público productos-imagenes. No expone costo_promedio.';

GRANT SELECT ON total.web_catalogo TO anon, authenticated;

NOTIFY pgrst, 'reload schema';


-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================

-- 1) La columna aparece y el costo sigue fuera.
SELECT 'columnas de web_catalogo' AS que,
       count(*)                                           AS total,
       count(*) FILTER (WHERE column_name = 'imagen_path') AS tiene_imagen_path,
       count(*) FILTER (WHERE column_name ILIKE '%costo%') AS filtra_costo_debe_ser_0
FROM information_schema.columns
WHERE table_schema = 'total' AND table_name = 'web_catalogo';

-- 2) Cuántos publicados tienen foto, y de qué tipo.
SELECT 'fotos de los publicados' AS que,
       count(*)                                          AS publicados,
       count(*) FILTER (WHERE imagen_url  IS NOT NULL)    AS con_url_a_mano,
       count(*) FILTER (WHERE imagen_path IS NOT NULL)    AS subidas_desde_el_erp,
       count(*) FILTER (WHERE imagen_url IS NULL
                          AND imagen_path IS NULL)        AS sin_foto
FROM total.web_catalogo;

-- 3) Las rutas, para pegar una en el navegador y confirmar que abre:
--    https://api.neura.com.py/storage/v1/object/public/productos-imagenes/<imagen_path>
SELECT nombre, imagen_path
FROM total.web_catalogo
WHERE imagen_path IS NOT NULL
ORDER BY nombre
LIMIT 10;
