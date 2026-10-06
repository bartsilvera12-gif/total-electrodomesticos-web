import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { Catalogo } from '@/components/Catalogo';

export const metadata: Metadata = {
  title: 'Ofertas',
  description: 'Productos con precio rebajado en Total Electrodomésticos.',
  alternates: { canonical: '/ofertas' },
};

export default function Ofertas() {
  return (
    <Armazon>
      <Catalogo
        titulo="Oportunidades que vale la pena mirar"
        bajada="Productos con una rebaja real sobre su precio anterior."
        soloOfertasFijo
      />
    </Armazon>
  );
}
