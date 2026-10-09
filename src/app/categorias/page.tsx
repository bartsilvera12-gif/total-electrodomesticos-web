import type { Metadata } from 'next';
import Link from 'next/link';
import { Armazon } from '@/components/Armazon';
import { Espacios } from '@/components/SeccionesHome';
import { obtenerRubros } from '@/lib/catalogo/servicio';
import { slugificar } from '@/lib/formato';

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Todas las categorías de Total Electrodomésticos, de climatización a descanso.',
  alternates: { canonical: '/categorias' },
};

export default async function Categorias() {
  const RUBROS = await obtenerRubros();
  return (
    <Armazon>
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <h1 className="text-[clamp(28px,3.5vw,42px)] font-bold tracking-tight">Categorías</h1>
        <p className="mt-2 text-grafito">Recorré el catálogo por rubro.</p>

        <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {RUBROS.map((r) => (
            <section key={r.id}>
              <h2 className="text-lg font-bold">
                <Link href={`/categoria/${r.slug}`} className="hover:text-total-500">{r.nombre}</Link>
              </h2>
              <ul className="mt-2.5 flex flex-col gap-1.5 border-t border-linea pt-2.5">
                {r.subcategorias.map((s) => (
                  <li key={s}>
                    <Link href={`/categoria/${slugificar(s)}`} className="text-sm text-grafito hover:text-total-500">
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <Espacios />
    </Armazon>
  );
}
