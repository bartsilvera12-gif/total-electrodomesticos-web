import Link from 'next/link';
import { resumenPanel } from '@/lib/admin/consultas';

export const metadata = { title: 'Resumen' };

export default async function Resumen() {
  const r = await resumenPanel();
  const sinPublicar = Math.max(0, r.vendibles - r.publicados);

  const fichas = [
    { etiqueta: 'Productos en el ERP', valor: r.vendibles, nota: 'vendibles' },
    { etiqueta: 'Publicados en la tienda', valor: r.publicados, nota: 'visibles al cliente' },
    { etiqueta: 'Sin publicar', valor: sinPublicar, nota: 'no se ven todavía' },
    { etiqueta: 'Sin foto cargada', valor: r.sinImagen, nota: 'muestran un marcador' },
    { etiqueta: 'Pedidos web', valor: r.pedidos, nota: 'desde la tienda' },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Resumen</h1>
      <p className="mt-1 text-sm text-humo">
        Los productos, los precios y el stock vienen del ERP. Acá se decide qué
        se publica en la tienda y cómo se ve.
      </p>

      <div className="mt-6 grid gap-px bg-linea sm:grid-cols-2 lg:grid-cols-5">
        {fichas.map((f) => (
          <div key={f.etiqueta} className="bg-white p-5">
            <p className="font-mono text-[10px] tracking-widest text-humo uppercase">{f.etiqueta}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{f.valor}</p>
            <p className="mt-1 text-[12px] text-humo">{f.nota}</p>
          </div>
        ))}
      </div>

      {r.vendibles === 0 && (
        <div className="mt-8 border border-linea bg-white p-6">
          <h2 className="font-bold">Todavía no hay productos en el ERP</h2>
          <p className="mt-2 max-w-xl text-sm text-grafito">
            La tienda lee el catálogo del ERP. Cargá los productos ahí y después
            volvé acá para elegir cuáles se publican, ponerles fotos y describirlos.
          </p>
        </div>
      )}

      {r.vendibles > 0 && r.publicados === 0 && (
        <div className="mt-8 border border-linea bg-white p-6">
          <h2 className="font-bold">Hay productos, pero ninguno publicado</h2>
          <p className="mt-2 max-w-xl text-sm text-grafito">
            Los productos del ERP no aparecen solos en la tienda: hay que
            publicarlos uno por uno. Así se controla qué se vende online.
          </p>
          <Link
            href="/admin/productos"
            className="mt-4 inline-block rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600"
          >
            Ir a productos
          </Link>
        </div>
      )}
    </>
  );
}
