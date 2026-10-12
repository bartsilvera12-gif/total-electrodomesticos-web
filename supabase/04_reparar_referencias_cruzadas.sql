-- =============================================================================
-- TOTAL ELECTRODOMÉSTICOS — Reparar policies que apuntan a otro cliente
--
-- EL PROBLEMA
-- 26 policies del schema `total` llaman a funciones y tablas de
-- `reservacaacupe`: otro cliente. Vinieron en la cadena de clones
-- (ferrecolor → asunhome → total) y el reescritor solo cambiaba el nombre del
-- schema origen, no los de terceros que ya estaban adentro.
--
-- POR QUÉ IMPORTA
-- 1. `empresas` queda ilegible para el admin de Total: la policy pregunta por
--    `reservacaacupe.empresa_id_actual()`, que busca en los usuarios del OTRO
--    cliente y no lo encuentra. Es lo que rompía el panel.
-- 2. Deja a Total atado a un schema ajeno: si ese schema cambia o se borra,
--    Total se rompe.
-- 3. Hay policies que deciden el acceso de Total mirando `reservacaacupe.usuarios`.
--
-- QUÉ HACE
-- Reescribe cada policy de `total` cambiando `reservacaacupe.` por `total.`.
-- Solo toca el schema `total`; no modifica reservacaacupe ni ningún otro.
--
-- Idempotente: si no queda ninguna, no hace nada.
-- =============================================================================

DO $reparar$
DECLARE
  r        RECORD;
  v_qual   text;
  v_check  text;
  v_roles  text;
  v_sql    text;
  n        int := 0;
BEGIN
  FOR r IN
    SELECT p.policyname, p.tablename, p.cmd, p.permissive, p.roles,
           p.qual, p.with_check
    FROM pg_policies p
    WHERE p.schemaname = 'total'
      AND (COALESCE(p.qual,'') || COALESCE(p.with_check,'')) ~ 'reservacaacupe\.'
  LOOP
    v_qual  := replace(r.qual, 'reservacaacupe.', 'total.');
    v_check := replace(r.with_check, 'reservacaacupe.', 'total.');
    v_roles := array_to_string(r.roles, ', ');

    v_sql := format('DROP POLICY IF EXISTS %I ON total.%I', r.policyname, r.tablename);
    EXECUTE v_sql;

    v_sql := format('CREATE POLICY %I ON total.%I AS %s FOR %s TO %s',
                    r.policyname, r.tablename,
                    CASE WHEN r.permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
                    r.cmd, v_roles);
    IF v_qual IS NOT NULL THEN
      v_sql := v_sql || format(' USING (%s)', v_qual);
    END IF;
    IF v_check IS NOT NULL THEN
      v_sql := v_sql || format(' WITH CHECK (%s)', v_check);
    END IF;

    EXECUTE v_sql;
    n := n + 1;
    RAISE NOTICE 'reparada: %.%', r.tablename, r.policyname;
  END LOOP;

  RAISE NOTICE 'policies reparadas: %', n;
END $reparar$;


-- Las funciones de `total` que nombren otro schema
DO $funcs$
DECLARE
  r     RECORD;
  v_def text;
  n     int := 0;
BEGIN
  FOR r IN
    SELECT p.oid, p.proname, pg_get_functiondef(p.oid) AS def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'total' AND pg_get_functiondef(p.oid) ~ 'reservacaacupe\.'
  LOOP
    v_def := replace(r.def, 'reservacaacupe.', 'total.');
    EXECUTE v_def;
    n := n + 1;
    RAISE NOTICE 'reparada la función: %', r.proname;
  END LOOP;
  RAISE NOTICE 'funciones reparadas: %', n;
END $funcs$;


-- El search_path de las funciones heredadas también quedó apuntando afuera
DO $paths$
DECLARE
  r RECORD;
  n int := 0;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS firma, p.proname
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE ns.nspname = 'total'
      AND EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.proconfig, '{}')) c
        WHERE c LIKE 'search_path=%'
          AND c !~ '(^|[=,])\s*total(\s|,|$)')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path TO total, public', r.firma);
    n := n + 1;
  END LOOP;
  RAISE NOTICE 'search_path corregidos: %', n;
END $paths$;


-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
SELECT 'policies que todavía apuntan afuera' AS que, count(*) AS n
FROM pg_policies
WHERE schemaname='total'
  AND (COALESCE(qual,'')||COALESCE(with_check,'')) ~ '(reservacaacupe|ferrecolor|asunhome|enlodemari)\.'
UNION ALL
SELECT 'funciones que apuntan afuera', count(*)
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='total' AND pg_get_functiondef(p.oid) ~ '(reservacaacupe|ferrecolor|enlodemari)\.';
