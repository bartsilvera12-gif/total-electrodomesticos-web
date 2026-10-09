-- =============================================================================
-- TOTAL ELECTRODOMÉSTICOS — Catálogo de ejemplo
--
-- Carga categorías, marcas y 20 productos para que la tienda se pueda mostrar
-- y probar antes de que Total cargue su catálogo real.
--
-- Los productos van en el ERP (`total.productos`), que es donde corresponde: la
-- tienda los lee de ahí. El costo se carga en 0 a propósito — es información
-- que el cliente va a completar, y mientras tanto nadie necesita un número
-- inventado.
--
-- PARA BORRARLOS DESPUÉS:
--   DELETE FROM total.productos WHERE sku LIKE 'DEMO-%';
--   DELETE FROM total.categorias_productos WHERE codigo LIKE 'DEMO-%';
--   DELETE FROM total.marcas WHERE codigo LIKE 'DEMO-%';
--
-- Idempotente.
-- =============================================================================

DO $demo$
DECLARE
  v_emp   uuid;
  v_cat   text;
  v_marca text;
  v_cid   uuid;
  v_mid   uuid;
  v_pid   uuid;
  r       RECORD;
BEGIN
  SELECT id INTO v_emp FROM total.empresas LIMIT 1;
  IF v_emp IS NULL THEN
    RAISE EXCEPTION 'No hay empresa. Corré antes 01_empresa_usuario_modulos.sql del ERP.';
  END IF;

  -- ── Categorías ─────────────────────────────────────────────────────────────
  FOREACH v_cat IN ARRAY ARRAY[
    'Climatización','TV & Audio','Celulares & Tecnología','Refrigeración',
    'Cocina','Lavado','Hogar','Dormitorio','Cuidado Personal','Deportes & Exterior'
  ] LOOP
    INSERT INTO total.categorias_productos (empresa_id, nombre, codigo, activo)
    SELECT v_emp, v_cat, 'DEMO-' || upper(left(regexp_replace(v_cat,'[^a-zA-Z]','','g'), 8)), true
    WHERE NOT EXISTS (
      SELECT 1 FROM total.categorias_productos
      WHERE empresa_id = v_emp AND nombre = v_cat);
  END LOOP;

  -- ── Marcas ─────────────────────────────────────────────────────────────────
  FOREACH v_marca IN ARRAY ARRAY[
    'Samsung','Philips','Tokyo','Midea','Carrier','Goodweather',
    'JBL','Xiaomi','Electrolux','Remington','Babyliss','Tramontina'
  ] LOOP
    INSERT INTO total.marcas (empresa_id, nombre, codigo, activo)
    SELECT v_emp, v_marca, 'DEMO-' || upper(left(v_marca, 8)), true
    WHERE NOT EXISTS (
      SELECT 1 FROM total.marcas WHERE empresa_id = v_emp AND nombre = v_marca);
  END LOOP;

  -- ── Productos ──────────────────────────────────────────────────────────────
  FOR r IN
    SELECT * FROM (VALUES
      ('DEMO-10234','Smart TV 55" 4K','Samsung','TV & Audio',3360000,12,NULL::numeric,true),
      ('DEMO-10198','Smart TV 43" Full HD','Samsung','TV & Audio',2150000,8,NULL,false),
      ('DEMO-10988','Parlante portátil Bluetooth','JBL','TV & Audio',890000,0,NULL,false),
      ('DEMO-10455','Barra de sonido 2.1','JBL','TV & Audio',1450000,5,NULL,false),
      ('DEMO-20412','Aire acondicionado 12.000 BTU Inverter','Midea','Climatización',3950000,3,NULL,true),
      ('DEMO-20590','Aire acondicionado 18.000 BTU Inverter','Carrier','Climatización',5400000,6,NULL,false),
      ('DEMO-20033','Ventilador de pie 3 velocidades','Goodweather','Climatización',250000,20,40000,false),
      ('DEMO-30871','Heladera 300 L Frío seco','Tokyo','Refrigeración',2890000,7,NULL,true),
      ('DEMO-30412','Heladera No Frost 400 L','Electrolux','Refrigeración',4250000,4,NULL,false),
      ('DEMO-30119','Congelador horizontal 200 L','Midea','Refrigeración',2450000,3,NULL,false),
      ('DEMO-40125','Smartphone 128 GB','Xiaomi','Celulares & Tecnología',1690000,15,NULL,true),
      ('DEMO-40310','Smartphone 256 GB','Samsung','Celulares & Tecnología',2990000,2,NULL,false),
      ('DEMO-50330','Freidora de aire 4,1 L','Philips','Cocina',590000,18,100000,false),
      ('DEMO-50612','Juego de ollas acero inoxidable','Tramontina','Cocina',450000,25,NULL,false),
      ('DEMO-50217','Microondas 20 L','Midea','Cocina',890000,10,NULL,false),
      ('DEMO-50888','Cocina 4 hornallas con horno','Tokyo','Cocina',2350000,5,NULL,false),
      ('DEMO-60217','Lavarropas 8 kg carga frontal','Electrolux','Lavado',3150000,0,NULL,false),
      ('DEMO-60455','Lavarropas 11 kg carga superior','Midea','Lavado',2890000,6,NULL,false),
      ('DEMO-70144','Afeitadora recargable','Remington','Cuidado Personal',290000,30,50000,false),
      ('DEMO-70288','Planchita de pelo placas cerámicas','Babyliss','Cuidado Personal',390000,22,NULL,false)
    ) AS t(sku, nombre, marca, categoria, precio, stock, descuento, destacado)
  LOOP
    SELECT id INTO v_cid FROM total.categorias_productos
      WHERE empresa_id = v_emp AND nombre = r.categoria LIMIT 1;
    SELECT id INTO v_mid FROM total.marcas
      WHERE empresa_id = v_emp AND nombre = r.marca LIMIT 1;

    SELECT id INTO v_pid FROM total.productos WHERE empresa_id = v_emp AND sku = r.sku;

    IF v_pid IS NULL THEN
      INSERT INTO total.productos (
        empresa_id, nombre, sku, precio_venta, costo_promedio, stock_actual,
        stock_minimo, activo, es_vendible, controla_stock, destacado,
        categoria_principal_id, marca_id, unidad_medida,
        discount_type, discount_value, discount_starts_at, discount_ends_at
      ) VALUES (
        v_emp, r.nombre, r.sku, r.precio, 0, r.stock,
        3, true, true, true, r.destacado,
        v_cid, v_mid, 'unidad',
        CASE WHEN r.descuento IS NOT NULL THEN 'fixed' END,
        COALESCE(r.descuento, 0),
        CASE WHEN r.descuento IS NOT NULL THEN now() - interval '1 day' END,
        CASE WHEN r.descuento IS NOT NULL THEN now() + interval '60 days' END
      ) RETURNING id INTO v_pid;
    END IF;

    -- Publicarlo en la tienda con su enlace
    INSERT INTO total.web_producto (producto_id, empresa_id, slug, publicado, orden, ficha)
    VALUES (
      v_pid, v_emp,
      lower(regexp_replace(
        translate(r.marca || ' ' || r.nombre, 'ÁÉÍÓÚáéíóúÑñ"''', 'AEIOUaeiouNn  '),
        '[^a-zA-Z0-9]+', '-', 'g')),
      true, 0, '[]'::jsonb
    )
    ON CONFLICT (producto_id) DO UPDATE SET publicado = true;
  END LOOP;

  -- ── Publicar las categorías en la tienda ───────────────────────────────────
  FOR r IN SELECT id, nombre FROM total.categorias_productos WHERE empresa_id = v_emp
  LOOP
    INSERT INTO total.web_categoria (categoria_id, empresa_id, slug, publicado, orden, destaque)
    VALUES (
      r.id, v_emp,
      lower(regexp_replace(
        translate(r.nombre, 'ÁÉÍÓÚáéíóúÑñ&', 'AEIOUaeiouNny'),
        '[^a-zA-Z0-9]+', '-', 'g')),
      true, 0,
      CASE WHEN r.nombre = 'TV & Audio' THEN 2 ELSE 1 END
    )
    ON CONFLICT (categoria_id) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Catálogo de ejemplo listo.';
END $demo$;

-- Verificación
SELECT 'productos publicados' AS que, count(*) AS n FROM total.web_catalogo
UNION ALL SELECT 'categorías', count(*) FROM total.web_categoria_publica
UNION ALL SELECT 'con oferta vigente', count(*) FROM total.web_catalogo WHERE precio_anterior IS NOT NULL
UNION ALL SELECT 'destacados', count(*) FROM total.web_catalogo WHERE destacado;
