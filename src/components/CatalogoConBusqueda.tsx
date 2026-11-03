'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Rubro } from '@/lib/catalogo/tipos';
import { useMarcasVivas, useRubrosVivos } from '@/lib/catalogo/useCatalogoVivo';
import { Catalogo } from './Catalogo';

/**
 * Catálogo con el término de búsqueda tomado de la URL.
 *
 * Va aparte porque en estático el servidor no puede leer `?q=`: la página se
 * genera una sola vez y el término lo lee el navegador.
 *
 * Los productos los pide `Catalogo` en vivo, pero las categorías y marcas de
 * los filtros bajaban del build: quedaban las de la fecha en que se compiló.
 * Por eso se vuelven a pedir acá.
 */
function Interno({ rubros, marcasDisponibles }: { rubros: Rubro[]; marcasDisponibles: string[] }) {
  const q = useSearchParams().get('q') ?? '';
  const rubrosVivos = useRubrosVivos(rubros);
  const marcasVivas = useMarcasVivas(marcasDisponibles);
  return (
    <Catalogo
      titulo={q ? `Resultados para "${q}"` : 'Todos los productos'}
      bajada={q ? undefined : 'Filtrá por categoría, marca, precio y disponibilidad.'}
      busquedaInicial={q || undefined}
      rubros={rubrosVivos}
      marcasDisponibles={marcasVivas}
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
