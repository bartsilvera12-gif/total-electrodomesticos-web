import { obtenerConfig } from '@/lib/admin/consultas';
import { EditorHome } from '@/components/admin/EditorHome';

export const metadata = { title: 'Home' };

export default async function HomePanel() {
  const config = await obtenerConfig();
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Home</h1>
      <p className="mt-1 text-sm text-humo">
        Los textos de la portada y qué bloques se muestran.
      </p>
      <EditorHome config={config} />
    </>
  );
}
