import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Armazon } from '@/components/Armazon';
import { LOGOS_MARCA, MARCAS } from '@/lib/catalogo/mock';
import { slugificar } from '@/lib/formato';

export const metadata: Metadata = {
  title: 'Marcas',
  description: 'Marcas que encontrás en Total Electrodomésticos.',
  alternates: { canonical: '/marcas' },
};

export default function Marcas() {
  return (
    <Armazon>
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <h1 className="text-[clamp(28px,3.5vw,42px)] font-bold tracking-tight">Marcas</h1>
        <p className="mt-2 text-grafito">
          Tocá una marca para ver sus productos. El listado completo va a salir del catálogo del ERP.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-px bg-linea sm:grid-cols-3 lg:grid-cols-4">
          {MARCAS.map((m) => {
            const logo = LOGOS_MARCA[m];
            return (
              <Link
                key={m}
                href={`/marca/${slugificar(m)}`}
                className="flex h-32 items-center justify-center bg-white p-6 transition-colors hover:bg-total-50"
              >
                {logo ? (
                  <Image src={logo.src} alt={m} width={130} height={logo.alto} className="max-h-9 w-auto object-contain opacity-70 transition-opacity hover:opacity-100" />
                ) : (
                  <span className="text-sm font-bold tracking-widest uppercase">{m}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </Armazon>
  );
}
