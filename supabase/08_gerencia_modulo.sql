-- =============================================================================
-- 08 · Alta del módulo "Gerencia"
-- =============================================================================
--
-- La pantalla ya está en el ERP (/gerencia). Esto solo la habilita: el gate de
-- acceso pide que el slug esté en `empresa_modulos`, si no el ítem no aparece
-- en el menú y la ruta responde "módulo no habilitado".
--
-- No crea tablas ni vistas: Gerencia lee de `ventas`, `ventas_items`,
-- `cobros_clientes`, `cuentas_por_cobrar` y `clientes`, que ya existen.
--
-- Probalo primero con BEGIN; ... ROLLBACK; y mirá la verificación del final.
-- =============================================================================

DO $$
DECLARE
  v_modulo uuid;
BEGIN
  SELECT id INTO v_modulo FROM total.modulos WHERE slug = 'gerencia' LIMIT 1;

  IF v_modulo IS NULL THEN
    INSERT INTO total.modulos (nombre, descripcion, slug)
    VALUES ('Gerencia', 'Cómo viene el mes contra el anterior, y qué falta cobrar', 'gerencia')
    RETURNING id INTO v_modulo;
    RAISE NOTICE '[gerencia] módulo creado';
  ELSE
    RAISE NOTICE '[gerencia] el módulo ya existía';
  END IF;

  -- `empresa_modulos` no tiene unique en (empresa_id, modulo_id): NOT EXISTS.
  INSERT INTO total.empresa_modulos (empresa_id, modulo_id, activo)
  SELECT e.id, v_modulo, true
    FROM total.empresas e
   WHERE NOT EXISTS (
     SELECT 1 FROM total.empresa_modulos em
      WHERE em.empresa_id = e.id AND em.modulo_id = v_modulo
   );
END $$;

NOTIFY pgrst, 'reload schema';

-- VERIFICACIÓN
SELECT 'modulo gerencia' AS que,
       m.slug,
       count(em.id) FILTER (WHERE em.activo) AS empresas_con_el_modulo
FROM total.modulos m
LEFT JOIN total.empresa_modulos em ON em.modulo_id = m.id
WHERE m.slug = 'gerencia'
GROUP BY m.slug;
