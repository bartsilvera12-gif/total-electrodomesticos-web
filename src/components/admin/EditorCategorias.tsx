'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { guardarCategoria } from '@/lib/admin/acciones';
import type { CategoriaPanel } from '@/lib/admin/consultas';
import { slugificar } from '@/lib/formato';

export function EditorCategorias({ categorias }: { categorias: CategoriaPanel[] }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [filas, setFilas] = useState(categorias);

  const cambiar = (id: string, cambios: Partial<CategoriaPanel>) =>
    setFilas(filas.map((c) => (c.id === id ? { ...c, ...cambios } : c)));

  function guardar(c: CategoriaPanel) {
    iniciar(async () => {
      setMensaje(null);
      try {
        await guardarCategoria({
          categoriaId: c.id,
          slug: c.slug ?? slugificar(c.nombre),
          publicado: c.publicado,
          orden: c.orden,
          destaque: c.destaque,
          imagenUrl: c.imagenUrl ?? '',
          seoTitulo: c.seoTitulo ?? '',
          seoDesc: c.seoDesc ?? '',
        });
        setMensaje(`"${c.nombre}" guardada.`);
        router.refresh();
      } catch (e) {
        setMensaje(e instanceof Error ? e.message : 'No se pudo guardar');
      }
    });
  }

  if (!filas.length) {
    return (
      <p className="mt-8 border border-linea bg-white p-8 text-center text-sm text-humo">
        Todavía no hay categorías en el ERP. Creálas ahí y después volvé acá.
      </p>
    );
  }

  return (
    <>
      {mensaje && <p className="mt-4 rounded-sm bg-[#f1f2f4] px-4 py-3 text-sm">{mensaje}</p>}

      <div className="mt-6 overflow-x-auto border border-linea bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-linea text-left">
            <tr className="font-mono text-[10px] tracking-widest text-humo uppercase">
              <th className="p-4">Categoría</th>
              <th className="p-4">Enlace</th>
              <th className="p-4">Orden</th>
              <th className="p-4">Peso en la portada</th>
              <th className="p-4">En la tienda</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {filas.map((c) => (
              <tr key={c.id} className={pendiente ? 'opacity-60' : ''}>
                <td className="p-4">
                  <span className="font-semibold">{c.nombre}</span>
                  {c.parentId && <span className="block text-[12px] text-humo">subcategoría</span>}
                </td>
                <td className="p-4">
                  <input
                    value={c.slug ?? ''}
                    onChange={(e) => cambiar(c.id, { slug: e.target.value })}
                    placeholder={slugificar(c.nombre)}
                    className="w-44 rounded-sm border border-[#c9ced8] px-2.5 py-1.5 font-mono text-[13px]"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    value={c.orden}
                    onChange={(e) => cambiar(c.id, { orden: Number(e.target.value) })}
                    className="w-20 rounded-sm border border-[#c9ced8] px-2.5 py-1.5 text-sm"
                  />
                </td>
                <td className="p-4">
                  <select
                    value={c.destaque}
                    onChange={(e) => cambiar(c.id, { destaque: Number(e.target.value) })}
                    className="rounded-sm border border-[#c9ced8] px-2.5 py-1.5 text-sm"
                  >
                    <option value={1}>Normal</option>
                    <option value={2}>Bloque grande</option>
                  </select>
                </td>
                <td className="p-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={c.publicado}
                      onChange={(e) => cambiar(c.id, { publicado: e.target.checked })}
                      className="size-4 accent-total-500"
                    />
                    <span className="text-[13px] text-humo">{c.publicado ? 'Visible' : 'Oculta'}</span>
                  </label>
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() => guardar(c)}
                    className="rounded-sm bg-total-500 px-4 py-2 text-sm font-bold text-white hover:bg-total-600 disabled:opacity-60"
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[13px] text-humo">
        El bloque grande es el que ocupa doble espacio en la grilla de la portada.
        Conviene marcar uno solo.
      </p>
    </>
  );
}
