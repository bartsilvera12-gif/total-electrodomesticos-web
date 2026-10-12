'use client';

import { useCallback } from 'react';
import { obtenerBanners, obtenerConfig } from '@/lib/admin/consultas';
import { useDatos } from '@/lib/admin/useDatos';
import { EditorBanners } from '@/components/admin/EditorBanners';
import { EditorHome } from '@/components/admin/EditorHome';

export default function HomePanel() {
  const { datos, cargando, error } = useDatos(
    useCallback(
      async () => {
        const [config, banners] = await Promise.all([obtenerConfig(), obtenerBanners()]);
        return { config, banners };
      },
      [],
    ),
    null,
  );

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Home</h1>
      <p className="mt-1 text-sm text-humo">
        Los textos de la portada, qué bloques se muestran y los banners de promo.
      </p>
      {cargando ? (
        <p className="mt-8 border border-linea bg-white p-8 text-center text-sm text-humo">Cargando…</p>
      ) : error ? (
        <p className="mt-6 rounded-sm bg-[#f1f2f4] px-4 py-3 text-sm">{error}</p>
      ) : (
        <div className="mt-6 grid max-w-4xl gap-6">
          <EditorHome config={datos?.config} />
          <EditorBanners iniciales={datos?.banners ?? []} />
        </div>
      )}
    </>
  );
}
