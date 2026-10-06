import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Armazon } from '@/components/Armazon';
import { DetalleProducto } from '@/components/DetalleProducto';
import { PRODUCTOS } from '@/lib/catalogo/mock';
import { obtenerProductoPorSlug, obtenerRelacionados } from '@/lib/catalogo/servicio';
import { guaranies } from '@/lib/formato';
import { SITIO } from '@/lib/sitio';

export async function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await obtenerProductoPorSlug(slug);
  if (!p) return {};
  const titulo = `${p.marca} ${p.nombre}`;
  const descripcion = `${titulo} — ${p.specs.join(' · ')}. ${guaranies(p.precio)} en Total Electrodomésticos.`;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/producto/${slug}` },
    openGraph: { title: titulo, description: descripcion, url: `/producto/${slug}`, type: 'website' },
  };
}

export default async function PaginaProducto({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const producto = await obtenerProductoPorSlug(slug);
  if (!producto) notFound();
  const relacionados = await obtenerRelacionados(producto, 4);

  // Datos estructurados: que el producto se entienda en los buscadores.
  // El costo interno nunca sale: solo el precio de venta.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${producto.marca} ${producto.nombre}`,
    sku: producto.codigo,
    brand: { '@type': 'Brand', name: producto.marca },
    description: producto.specs.join(' · '),
    offers: {
      '@type': 'Offer',
      price: producto.precio,
      priceCurrency: 'PYG',
      availability:
        producto.disponibilidad === 'disponible' || producto.disponibilidad === 'ultimas'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITIO.url}/producto/${producto.slug}`,
    },
  };

  return (
    <Armazon>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DetalleProducto producto={producto} relacionados={relacionados} />
    </Armazon>
  );
}
