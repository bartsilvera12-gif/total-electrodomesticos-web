import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { ListaCategorias } from '@/components/ListaCategorias';
import { Espacios } from '@/components/SeccionesHome';
import { obtenerRubros } from '@/lib/catalogo/servicio';

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Todas las categorías de Total Electrodomésticos, de climatización a descanso.',
  alternates: { canonical: '/categorias' },
};

/**
 * Categorías.
 *
 * Acá se leen en el build: eso es lo que queda escrito en el HTML y lo que ve
 * un buscador. `<ListaCategorias>` las vuelve a pedir en el navegador, así que
 * lo que se activa o desactiva en el ERP se ve sin rebuildear.
 */
export default async function Categorias() {
  const rubros = await obtenerRubros();
  return (
    <Armazon>
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <h1 className="text-[clamp(28px,3.5vw,42px)] font-bold tracking-tight">Categorías</h1>
        <p className="mt-2 text-grafito">Recorré el catálogo por rubro.</p>
        <ListaCategorias inicial={rubros} />
      </div>
      <Espacios />
    </Armazon>
  );
}
