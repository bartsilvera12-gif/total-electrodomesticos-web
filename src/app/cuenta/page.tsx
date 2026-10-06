import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { Cuenta } from '@/components/Cuenta';

export const metadata: Metadata = {
  title: 'Mi cuenta',
  alternates: { canonical: '/cuenta' },
  robots: { index: false, follow: false },
};

export default function PaginaCuenta() {
  return (
    <Armazon>
      <Cuenta />
    </Armazon>
  );
}
