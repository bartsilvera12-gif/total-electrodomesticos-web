import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { Catalogo } from '@/components/Catalogo';
import { obtenerMarcas, obtenerRubros } from '@/lib/catalogo/servicio';

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Todo el catálogo de Total Electrodomésticos: tecnología, climatización, cocina, lavado, descanso y más.',
  alternates: { canonical: '/productos' },
};

export default async function Productos({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const [rubros, marcasDisponibles] = await Promise.all([obtenerRubros(), obtenerMarcas()]);
  return (
    <Armazon>
      <Catalogo
        rubros={rubros}
        marcasDisponibles={marcasDisponibles}
        titulo={q ? `Resultados para "${q}"` : 'Todos los productos'}
        bajada={q ? undefined : 'Filtrá por categoría, marca, precio y disponibilidad.'}
        busquedaInicial={q}
      />
    </Armazon>
  );
}
