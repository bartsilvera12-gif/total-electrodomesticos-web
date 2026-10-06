import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Armazon } from '@/components/Armazon';
import { Confirmacion } from '@/components/Confirmacion';

export const metadata: Metadata = {
  title: 'Pedido recibido',
  alternates: { canonical: '/confirmacion' },
  robots: { index: false, follow: false },
};

export default function PaginaConfirmacion() {
  return (
    <Armazon>
      <Suspense fallback={<div className="py-24 text-center text-humo">Cargando…</div>}>
        <Confirmacion />
      </Suspense>
    </Armazon>
  );
}
