import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Armazon } from '@/components/Armazon';
import { Catalogo } from '@/components/Catalogo';
import { LOGOS_MARCA, MARCAS } from '@/lib/catalogo/mock';
import { slugificar } from '@/lib/formato';

export async function generateStaticParams() {
  return MARCAS.map((m) => ({ slug: slugificar(m) }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const marca = MARCAS.find((m) => slugificar(m) === slug);
  if (!marca) return {};
  return {
    title: marca,
    description: `Productos ${marca} en Total Electrodomésticos.`,
    alternates: { canonical: `/marca/${slug}` },
  };
}

export default async function Marca({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const marca = MARCAS.find((m) => slugificar(m) === slug);
  if (!marca) notFound();
  const logo = LOGOS_MARCA[marca];

  return (
    <Armazon>
      <div className="border-b border-linea bg-total-50">
        <div className="mx-auto flex max-w-[1400px] items-center gap-5 px-6 py-10">
          {logo ? (
            <Image src={logo.src} alt={marca} width={150} height={logo.alto} className="max-h-12 w-auto object-contain" />
          ) : (
            <span className="text-3xl font-bold tracking-widest uppercase">{marca}</span>
          )}
          <p className="text-sm text-grafito">Productos {marca} disponibles en Total.</p>
        </div>
      </div>
      <Catalogo titulo={marca} marcaFija={marca} />
    </Armazon>
  );
}
