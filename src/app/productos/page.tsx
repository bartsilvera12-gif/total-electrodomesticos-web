import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { CatalogoConBusqueda } from '@/components/CatalogoConBusqueda';
import { obtenerMarcas, obtenerRubros } from '@/lib/catalogo/servicio';

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Todo el catálogo de Total Electrodomésticos: tecnología, climatización, cocina, lavado, descanso y más.',
  alternates: { canonical: '/productos' },
};

export default async function Productos() {
  const [rubros, marcasDisponibles] = await Promise.all([obtenerRubros(), obtenerMarcas()]);
  return (
    <Armazon>
      <CatalogoConBusqueda rubros={rubros} marcasDisponibles={marcasDisponibles} />
    </Armazon>
  );
}
