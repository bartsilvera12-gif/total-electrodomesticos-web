import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Armazon } from '@/components/Armazon';
import { Ingresar } from '@/components/Ingresar';

export const metadata: Metadata = {
  title: 'Ingresar',
  description: 'Iniciá sesión o creá tu cuenta en Total Electrodomésticos.',
  alternates: { canonical: '/ingresar' },
  robots: { index: false, follow: true },
};

export default function PaginaIngresar() {
  return (
    <Armazon>
      <Suspense fallback={<div className="py-24 text-center text-humo">Cargando…</div>}>
        <Ingresar />
      </Suspense>
    </Armazon>
  );
}
