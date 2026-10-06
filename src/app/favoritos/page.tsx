import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { Favoritos } from '@/components/Favoritos';

export const metadata: Metadata = {
  title: 'Favoritos',
  alternates: { canonical: '/favoritos' },
  robots: { index: false, follow: true },
};

export default function PaginaFavoritos() {
  return (
    <Armazon>
      <Favoritos />
    </Armazon>
  );
}
