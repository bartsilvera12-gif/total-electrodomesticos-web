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

// Sin generateStaticParams: las categorías salen de la base y cambian desde el
// panel. Se renderizan a demanda y Next las cachea.

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
