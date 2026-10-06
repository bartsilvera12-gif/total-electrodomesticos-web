import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { Catalogo } from '@/components/Catalogo';

export const metadata: Metadata = {
  title: 'Novedades',
  description: 'Lo último que llegó a Total Electrodomésticos.',
  alternates: { canonical: '/novedades' },
};

export default function Novedades() {
  return (
    <Armazon>
      <Catalogo
        titulo="Recién llegados"
        bajada="Lo último que llegó a Total, antes que nadie."
        soloNuevosFijo
      />
    </Armazon>
  );
}
