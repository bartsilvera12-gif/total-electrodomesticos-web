import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { Catalogo } from '@/components/Catalogo';
import { obtenerMarcas, obtenerRubros } from '@/lib/catalogo/servicio';

export const metadata: Metadata = {
  title: 'Ofertas',
  description: 'Productos con precio rebajado en Total Electrodomésticos.',
  alternates: { canonical: '/ofertas' },
};

export default async function Ofertas() {
  const [rubros, marcasDisponibles] = await Promise.all([obtenerRubros(), obtenerMarcas()]);
  return (
    <Armazon>
      <Catalogo
        rubros={rubros}
        marcasDisponibles={marcasDisponibles}
        titulo="Oportunidades que vale la pena mirar"
        bajada="Productos con una rebaja real sobre su precio anterior."
        soloOfertasFijo
      />
    </Armazon>
  );
}
