import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { Checkout } from '@/components/Checkout';

export const metadata: Metadata = {
  title: 'Finalizar compra',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: false },
};

export default function PaginaCheckout() {
  return (
    <Armazon>
      <Checkout />
    </Armazon>
  );
}
