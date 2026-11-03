import type { Metadata } from 'next';
import { Armazon } from '@/components/Armazon';
import { ListaMarcas } from '@/components/ListaMarcas';
import { obtenerMarcas } from '@/lib/catalogo/servicio';

export const metadata: Metadata = {
  title: 'Marcas',
  description: 'Marcas que encontrás en Total Electrodomésticos.',
  alternates: { canonical: '/marcas' },
};

/**
 * Marcas.
 *
 * Se leen en el build para el HTML y el buscador, y `<ListaMarcas>` las vuelve
 * a pedir en el navegador: las marcas salen del catálogo del ERP y cambian sin
 * que haya un despliegue de por medio.
 */
export default async function Marcas() {
  const marcas = await obtenerMarcas();
  return (
    <Armazon>
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <h1 className="text-[clamp(28px,3.5vw,42px)] font-bold tracking-tight">Marcas</h1>
        <p className="mt-2 text-grafito">Tocá una marca para ver sus productos.</p>
        <ListaMarcas inicial={marcas} />
      </div>
    </Armazon>
  );
}
