import { listarCategorias } from '@/lib/admin/consultas';
import { EditorCategorias } from '@/components/admin/EditorCategorias';

export const metadata = { title: 'Categorías' };

export default async function CategoriasPanel() {
  const categorias = await listarCategorias();
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
      <p className="mt-1 text-sm text-humo">
        Las categorías se crean en el ERP. Acá se decide cuáles aparecen en la
        tienda, en qué orden y con qué peso en la portada.
      </p>
      <EditorCategorias categorias={categorias} />
    </>
  );
}
