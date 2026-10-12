'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Rubro } from '@/lib/catalogo/tipos';
import { Catalogo } from './Catalogo';

/**
 * Catálogo con el término de búsqueda tomado de la URL.
 *
 * Va aparte porque en estático el servidor no puede leer `?q=`: la página se
 * genera una sola vez y el término lo lee el navegador.
 */
function Interno({ rubros, marcasDisponibles }: { rubros: Rubro[]; marcasDisponibles: string[] }) {
  const q = useSearchParams().get('q') ?? '';
  return (
    <Catalogo
      titulo={q ? `Resultados para "${q}"` : 'Todos los productos'}
      bajada={q ? undefined : 'Filtrá por categoría, marca, precio y disponibilidad.'}
      busquedaInicial={q || undefined}
      rubros={rubros}
      marcasDisponibles={marcasDisponibles}
    />
  );
}

export function CatalogoConBusqueda(props: { rubros: Rubro[]; marcasDisponibles: string[] }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1400px] px-6 py-16 text-humo">Cargando…</div>}>
      <Interno {...props} />
    </Suspense>
  );
}
