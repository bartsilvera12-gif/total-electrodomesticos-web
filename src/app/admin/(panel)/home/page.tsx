'use client';

import { useCallback } from 'react';
import { obtenerConfig } from '@/lib/admin/consultas';
import { useDatos } from '@/lib/admin/useDatos';
import { EditorHome } from '@/components/admin/EditorHome';

export default function HomePanel() {
  const { datos, cargando, error } = useDatos(useCallback(() => obtenerConfig(), []), null);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Home</h1>
      <p className="mt-1 text-sm text-humo">
        Los textos de la portada y qué bloques se muestran.
      </p>
      {cargando ? (
        <p className="mt-8 border border-linea bg-white p-8 text-center text-sm text-humo">Cargando…</p>
      ) : error ? (
        <p className="mt-6 rounded-sm bg-[#f1f2f4] px-4 py-3 text-sm">{error}</p>
      ) : (
        <EditorHome config={datos} />
      )}
    </>
  );
}
