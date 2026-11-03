'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LOGOS_MARCA } from '@/lib/catalogo/mock';
import { useMarcasVivas } from '@/lib/catalogo/useCatalogoVivo';
import { slugificar } from '@/lib/formato';

/**
 * Las marcas de /marcas, al día.
 *
 * Mismo motivo que `ListaCategorias`: el build las congela y el catálogo de
 * Total sumó más de cien marcas que no existían cuando se compiló.
 */
export function ListaMarcas({ inicial }: { inicial: string[] }) {
  const marcas = useMarcasVivas(inicial);

  if (marcas.length === 0) {
    return <p className="mt-10 text-grafito">Todavía no hay marcas con productos publicados.</p>;
  }

  return (
    <div className="mt-10 grid grid-cols-2 gap-px bg-linea sm:grid-cols-3 lg:grid-cols-4">
      {marcas.map((m) => {
        const logo = LOGOS_MARCA[m];
        return (
          <Link
            key={m}
            href={`/marca/${slugificar(m)}`}
            className="flex h-32 items-center justify-center bg-white p-6 transition-colors hover:bg-total-50"
          >
            {logo ? (
              <Image
                src={logo.src}
                alt={m}
                width={130}
                height={logo.alto}
                className="max-h-9 w-auto object-contain opacity-70 transition-opacity hover:opacity-100"
              />
            ) : (
              <span className="text-center text-sm font-bold uppercase tracking-widest">{m}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
