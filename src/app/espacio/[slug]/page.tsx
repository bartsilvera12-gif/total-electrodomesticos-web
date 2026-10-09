import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Armazon } from '@/components/Armazon';
import { GrillaProductos } from '@/components/GrillaProductos';
import { ESPACIOS } from '@/lib/catalogo/mock';
import { buscarProductos, obtenerRubros } from '@/lib/catalogo/servicio';

export async function generateStaticParams() {
  return ESPACIOS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = ESPACIOS.find((x) => x.slug === slug);
  if (!e) return {};
  return {
    title: `Equipá tu ${e.nombre.toLowerCase()}`,
    description: e.descripcion,
    alternates: { canonical: `/espacio/${slug}` },
  };
}

export default async function Espacio({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const espacio = ESPACIOS.find((e) => e.slug === slug);
  if (!espacio) notFound();

  // Un espacio agrupa varios rubros: se piden en paralelo y se juntan.
  const RUBROS = await obtenerRubros();
  const porRubro = await Promise.all(
    espacio.rubros.map((r) => buscarProductos({ rubro: r, porPagina: 8 })),
  );
  const productos = porRubro.flatMap((r) => r.productos);

  return (
    <Armazon>
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <p className="font-mono text-[11px] tracking-widest text-total-500 uppercase">Equipá tu casa</p>
        <h1 className="mt-2 text-[clamp(28px,3.5vw,42px)] font-bold tracking-tight">{espacio.nombre}</h1>
        <p className="mt-2 max-w-xl text-grafito">{espacio.descripcion}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {espacio.atajos.map((a) => {
            const r = RUBROS.find((x) => x.id === a.rubro);
            return (
              <Link
                key={`${a.rubro}-${a.nombre}`}
                href={r ? `/categoria/${r.slug}` : '/productos'}
                className="rounded-full border border-linea px-4 py-2 text-sm hover:border-total-500 hover:text-total-500"
              >
                {a.nombre}
              </Link>
            );
          })}
        </div>

        <div className="mt-10">
          {productos.length ? (
            <GrillaProductos productos={productos} />
          ) : (
            <p className="py-16 text-center text-humo">
              Todavía no hay productos cargados para este espacio.
            </p>
          )}
        </div>
      </div>
    </Armazon>
  );
}
