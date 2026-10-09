'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { alternarDestacado, alternarPublicado } from '@/lib/admin/acciones';
import type { ProductoPanel } from '@/lib/admin/consultas';
import { guaranies } from '@/lib/formato';

const POR_PAGINA = 25;

export function TablaProductos({
  productos, total, pagina, busqueda,
}: { productos: ProductoPanel[]; total: number; pagina: number; busqueda: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(busqueda);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const irA = (cambios: Record<string, string>) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(cambios).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.push(`/admin/productos?${p}`);
  };

  const accion = (fn: () => Promise<void>) =>
    iniciar(async () => {
      setError(null);
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo guardar');
      }
    });

  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <>
      <form
        onSubmit={(e) => { e.preventDefault(); irA({ q, pagina: '' }); }}
        className="mt-6 flex flex-wrap gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o código…"
          className="min-w-64 flex-1 rounded-sm border border-[#c9ced8] px-3 py-2.5 text-sm"
        />
        <button type="submit" className="rounded-sm bg-total-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-total-600">
          Buscar
        </button>
        {busqueda && (
          <button type="button" onClick={() => { setQ(''); irA({ q: '', pagina: '' }); }} className="rounded-sm border border-linea px-4 py-2.5 text-sm">
            Limpiar
          </button>
        )}
      </form>

      {error && <p className="mt-4 rounded-sm bg-[#f1f2f4] px-4 py-3 text-sm">{error}</p>}

      {productos.length === 0 ? (
        <p className="mt-8 border border-linea bg-white p-8 text-center text-sm text-humo">
          {busqueda
            ? `No encontramos productos para "${busqueda}".`
            : 'Todavía no hay productos vendibles en el ERP.'}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-linea bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-linea text-left">
              <tr className="font-mono text-[10px] tracking-widest text-humo uppercase">
                <th className="p-4">Producto</th>
                <th className="p-4">Código</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">En la tienda</th>
                <th className="p-4">Destacado</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linea">
              {productos.map((p) => (
                <tr key={p.id} className={pendiente ? 'opacity-60' : ''}>
                  <td className="p-4">
                    <span className="flex items-center gap-3">
                      {p.imagenUrl ? (
                        <Image src={p.imagenUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-sm object-cover" unoptimized />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-total-50 font-mono text-[9px] text-total-400">
                          sin foto
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="font-mono text-[10px] tracking-widest text-humo uppercase">
                          {p.marca ?? '—'}
                        </span>
                        <span className="block font-semibold">{p.nombre}</span>
                      </span>
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[12px] text-humo">{p.sku ?? '—'}</td>
                  <td className="p-4 text-humo">{guaranies(p.precio)}</td>
                  <td className="p-4 text-humo">{p.stock ?? '—'}</td>
                  <td className="p-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={p.publicado}
                        disabled={pendiente}
                        onChange={(e) => accion(() => alternarPublicado(p.id, e.target.checked))}
                        className="size-4 accent-total-500"
                      />
                      <span className="text-[13px] text-humo">
                        {p.publicado ? 'Publicado' : 'Oculto'}
                      </span>
                    </label>
                  </td>
                  <td className="p-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={p.destacado}
                        disabled={pendiente}
                        onChange={(e) => accion(() => alternarDestacado(p.id, e.target.checked))}
                        className="size-4 accent-total-500"
                      />
                      <span className="text-[13px] text-humo">En la home</span>
                    </label>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/productos/${p.id}`} className="font-semibold text-total-500 hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paginas > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <span className="text-humo">Página {pagina} de {paginas} · {total} productos</span>
          <span className="flex gap-2">
            <button
              type="button"
              disabled={pagina <= 1}
              onClick={() => irA({ pagina: String(pagina - 1) })}
              className="rounded-sm border border-linea px-4 py-2 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={pagina >= paginas}
              onClick={() => irA({ pagina: String(pagina + 1) })}
              className="rounded-sm border border-linea px-4 py-2 disabled:opacity-40"
            >
              Siguiente
            </button>
          </span>
        </div>
      )}
    </>
  );
}
