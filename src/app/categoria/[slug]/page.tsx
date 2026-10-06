import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Armazon } from '@/components/Armazon';
import { Catalogo } from '@/components/Catalogo';
import { RUBROS } from '@/lib/catalogo/mock';
import { slugificar } from '@/lib/formato';

/** Resuelve tanto /categoria/televisores (subcategoría) como /categoria/tv-y-audio (rubro) */
function resolver(slug: string) {
  const rubro = RUBROS.find((r) => r.slug === slug);
  if (rubro) return { rubro, subcategoria: null };
  const porSub = RUBROS.find((r) => r.subcategorias.some((s) => slugificar(s) === slug));
  if (!porSub) return null;
  return {
    rubro: porSub,
    subcategoria: porSub.subcategorias.find((s) => slugificar(s) === slug) ?? null,
  };
}

export async function generateStaticParams() {
  return [
    ...RUBROS.map((r) => ({ slug: r.slug })),
    ...RUBROS.flatMap((r) => r.subcategorias.map((s) => ({ slug: slugificar(s) }))),
  ];
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = resolver(slug);
  if (!r) return {};
  const nombre = r.subcategoria ?? r.rubro.nombre;
  return {
    title: nombre,
    description: `${nombre} en Total Electrodomésticos. Compará modelos, precios y disponibilidad.`,
    alternates: { canonical: `/categoria/${slug}` },
    openGraph: { title: nombre, url: `/categoria/${slug}` },
  };
}

export default async function Categoria({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = resolver(slug);
  if (!r) notFound();

  return (
    <Armazon>
      <Catalogo
        titulo={r.subcategoria ?? r.rubro.nombre}
        bajada={r.subcategoria ? `En ${r.rubro.nombre}` : r.rubro.subcategorias.join(' · ')}
        rubroFijo={r.rubro.id}
      />
    </Armazon>
  );
}
