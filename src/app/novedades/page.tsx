import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { Catalogo } from '@/components/Catalogo';
import { obtenerMarcas, obtenerRubros } from '@/lib/catalogo/servicio';

export const metadata: Metadata = {
  title: 'Novedades',
  description: 'Lo último que llegó a Total Electrodomésticos.',
  alternates: { canonical: '/novedades' },
};

export default async function Novedades() {
  const [rubros, marcasDisponibles] = await Promise.all([obtenerRubros(), obtenerMarcas()]);
  return (
    <Armazon>
      <Catalogo
        rubros={rubros}
        marcasDisponibles={marcasDisponibles}
        titulo="Recién llegados"
        bajada="Lo último que llegó a Total, antes que nadie."
        soloNuevosFijo
      />
    </Armazon>
  );
}
