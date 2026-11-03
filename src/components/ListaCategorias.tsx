'use client';

import Link from 'next/link';
import type { Rubro } from '@/lib/catalogo/tipos';
import { useRubrosVivos } from '@/lib/catalogo/useCatalogoVivo';
import { slugificar } from '@/lib/formato';

/**
 * Las categorías de /categorias, al día.
 *
 * El HTML lo escribe el build; esto las vuelve a pedir en el navegador para
 * que lo que se activa o desactiva en el ERP se vea sin desplegar de nuevo.
 */
export function ListaCategorias({ inicial }: { inicial: Rubro[] }) {
  const rubros = useRubrosVivos(inicial);

  if (rubros.length === 0) {
    return (
      <p className="mt-10 text-grafito">
        Todavía no hay categorías publicadas.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {rubros.map((r) => (
        <section key={r.id}>
          <h2 className="text-lg font-bold">
            <Link href={`/categoria/${r.slug}`} className="hover:text-total-500">
              {r.nombre}
            </Link>
          </h2>
          <ul className="mt-2.5 flex flex-col gap-1.5 border-t border-linea pt-2.5">
            {r.subcategorias.map((s) => (
              <li key={s}>
                <Link
                  href={`/categoria/${slugificar(s)}`}
                  className="text-sm text-grafito hover:text-total-500"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
