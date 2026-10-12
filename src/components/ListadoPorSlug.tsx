'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Catalogo } from '@/components/Catalogo';
import { obtenerMarcas, obtenerRubros } from '@/lib/catalogo/servicio';
import { slugificar } from '@/lib/formato';
import { useDatos } from '@/lib/useDatos';

/**
 * Categoría que todavía no tiene su HTML generado.
 *
 * Mismo caso que /producto/ver: una categoría que se publica desde el ERP
 * después del último build no tendría página. El .htaccess manda acá
 * cualquier /categoria/<slug>/ que no exista en disco, con el slug en la
 * query, y se resuelve en el navegador.
 */
function Listado() {
  const slug = useSearchParams().get('slug') ?? '';

  const { datos, cargando, error } = useDatos(
    useCallback(async () => {
      if (!slug) return null;
      const [rubros, marcas] = await Promise.all([obtenerRubros(), obtenerMarcas()]);

      // Igual que la página generada: el slug puede ser un rubro o una de sus
      // subcategorías.
      const rubro = rubros.find((r) => r.slug === slug);
      if (rubro) return { rubros, marcas, rubro, subcategoria: null as string | null };

      const porSub = rubros.find((r) => r.subcategorias.some((s) => slugificar(s) === slug));
      if (!porSub) return null;
      return {
        rubros,
        marcas,
        rubro: porSub,
        subcategoria: porSub.subcategorias.find((s) => slugificar(s) === slug) ?? null,
      };
    }, [slug]),
    null,
  );

  useEffect(() => {
    const nombre = datos?.subcategoria ?? datos?.rubro.nombre;
    if (nombre) document.title = `${nombre} · Total Electrodomésticos`;
  }, [datos]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-24 text-center text-sm text-humo">
        Cargando categoría…
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-24 text-center">
        <p className="text-lg font-semibold">No encontramos esa categoría.</p>
        <Link
          href="/categorias"
          className="mt-6 inline-block rounded-full bg-total-500 px-6 py-3 text-[15px] font-semibold text-white"
        >
          Ver todas las categorías
        </Link>
      </div>
    );
  }

  return (
    <Catalogo
      rubros={datos.rubros}
      marcasDisponibles={datos.marcas}
      titulo={datos.subcategoria ?? datos.rubro.nombre}
      bajada={
        datos.subcategoria
          ? `En ${datos.rubro.nombre}`
          : datos.rubro.subcategorias.join(' · ')
      }
      rubroFijo={datos.rubro.id}
    />
  );
}

export function ListadoPorSlug() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-6 py-24 text-center text-sm text-humo">
          Cargando categoría…
        </div>
      }
    >
      <Listado />
    </Suspense>
  );
}
