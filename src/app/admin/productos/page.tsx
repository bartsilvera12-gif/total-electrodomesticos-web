import { listarProductos } from '@/lib/admin/consultas';
import { TablaProductos } from '@/components/admin/TablaProductos';

export const metadata = { title: 'Productos' };

export default async function ProductosPanel({
  searchParams,
}: { searchParams: Promise<{ q?: string; pagina?: string }> }) {
  const { q, pagina } = await searchParams;
  const p = Number(pagina ?? 1);
  const { productos, total } = await listarProductos({ busqueda: q, pagina: p });

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
      <p className="mt-1 text-sm text-humo">
        El nombre, el precio y el stock salen del ERP y no se editan acá. Lo que
        se administra es qué se publica, la descripción comercial, la ficha y el SEO.
      </p>
      <TablaProductos productos={productos} total={total} pagina={p} busqueda={q ?? ''} />
    </>
  );
}
