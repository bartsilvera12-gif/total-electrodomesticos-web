import { notFound } from 'next/navigation';
import { obtenerProductoPanel } from '@/lib/admin/consultas';
import { EditorProducto } from '@/components/admin/EditorProducto';

export const metadata = { title: 'Editar producto' };

export default async function EditarProducto({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producto = await obtenerProductoPanel(id);
  if (!producto) notFound();
  return <EditorProducto producto={producto} />;
}
