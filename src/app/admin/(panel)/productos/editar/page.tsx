'use client';

import Link from 'next/link';
import { Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { obtenerProductoPanel } from '@/lib/admin/consultas';
import { useDatos } from '@/lib/admin/useDatos';
import { EditorProducto } from '@/components/admin/EditorProducto';

/**
 * El producto llega por query (`?id=…`) y no por segmento de ruta.
 *
 * En estático una ruta `[id]` obligaría a generar una página por producto en
 * cada build, y los productos cambian desde el ERP. Con query alcanza una sola.
 */
function Editor() {
  const id = useSearchParams().get('id') ?? '';
  const { datos, cargando, error } = useDatos(
    useCallback(() => (id ? obtenerProductoPanel(id) : Promise.resolve(null)), [id]),
    null,
  );

  if (cargando) {
    return <p className="border border-linea bg-white p-8 text-center text-sm text-humo">Cargando…</p>;
  }
  if (error || !datos) {
    return (
      <>
        <Link href="/admin/productos" className="text-sm font-semibold text-total-500 hover:underline">
          ← Volver a productos
        </Link>
        <p className="mt-6 rounded-sm bg-[#f1f2f4] px-4 py-3 text-sm">
          {error ?? 'No encontramos ese producto.'}
        </p>
      </>
    );
  }
  return <EditorProducto producto={datos} />;
}

export default function EditarProducto() {
  return (
    <Suspense fallback={<p className="text-sm text-humo">Cargando…</p>}>
      <Editor />
    </Suspense>
  );
}
