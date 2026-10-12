'use client';

import { useCallback } from 'react';
import { listarCategorias } from '@/lib/admin/consultas';
import { useDatos } from '@/lib/admin/useDatos';
import { EditorCategorias } from '@/components/admin/EditorCategorias';

export default function CategoriasPanel() {
  const { datos, cargando, error, recargar } = useDatos(
    useCallback(() => listarCategorias(), []), [],
  );

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
      <p className="mt-1 text-sm text-humo">
        Las categorías se crean en el ERP. Acá se decide cuáles aparecen en la
        tienda, en qué orden y con qué peso en la portada.
      </p>
      {cargando ? (
        <p className="mt-8 border border-linea bg-white p-8 text-center text-sm text-humo">Cargando…</p>
      ) : error ? (
        <p className="mt-6 rounded-sm bg-[#f1f2f4] px-4 py-3 text-sm">{error}</p>
      ) : (
        <EditorCategorias categorias={datos} alRecargar={recargar} />
      )}
    </>
  );
}
