import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Armazon } from '@/components/Armazon';
import { Catalogo } from '@/components/Catalogo';
import { obtenerRubros, obtenerMarcas } from '@/lib/catalogo/servicio';
import { slugificar } from '@/lib/formato';

/** Resuelve tanto /categoria/televisores (subcategoría) como /categoria/tv-y-audio (rubro) */
async function resolver(slug: string) {
  const RUBROS = await obtenerRubros();
  const rubro = RUBROS.find((r) => r.slug === slug);
  if (rubro) return { rubro, subcategoria: null };
  const porSub = RUBROS.find((r) => r.subcategorias.some((s) => slugificar(s) === slug));
  if (!porSub) return null;
  return {
    rubro: porSub,
    subcategoria: porSub.subcategorias.find((s) => slugificar(s) === slug) ?? null,
  };
}

/** Una página por categoría y por subcategoría, con lo que hay en la base. */
export async function generateStaticParams() {
  const rubros = await obtenerRubros();
  return [
    ...rubros.map((r) => ({ slug: r.slug })),
    ...rubros.flatMap((r) => r.subcategorias.map((s) => ({ slug: slugificar(s) }))),
  ];
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await resolver(slug);
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
  const r = await resolver(slug);
  if (!r) notFound();

  const [rubros, marcasDisponibles] = await Promise.all([obtenerRubros(), obtenerMarcas()]);
  return (
    <Armazon>
      <Catalogo
        rubros={rubros}
        marcasDisponibles={marcasDisponibles}
        titulo={r.subcategoria ?? r.rubro.nombre}
        bajada={r.subcategoria ? `En ${r.rubro.nombre}` : r.rubro.subcategorias.join(' · ')}
        rubroFijo={r.rubro.id}
      />
    </Armazon>
  );
}
