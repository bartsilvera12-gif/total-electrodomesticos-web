'use client';

import { useCallback } from 'react';
import { listarPedidos } from '@/lib/admin/consultas';
import { useDatos } from '@/lib/useDatos';
import { TablaPedidos } from '@/components/admin/TablaPedidos';

export default function PedidosPanel() {
  const { datos, cargando, error, recargar } = useDatos(
    useCallback(() => listarPedidos(), []), [],
  );

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Pedidos web</h1>
      <p className="mt-1 text-sm text-humo">
        Los pedidos que entran por la tienda. El ERP los va a leer de acá cuando
        se integre el módulo de pedidos web.
      </p>
      {cargando ? (
        <p className="mt-8 border border-linea bg-white p-8 text-center text-sm text-humo">Cargando…</p>
      ) : error ? (
        <p className="mt-6 rounded-sm bg-[#f1f2f4] px-4 py-3 text-sm">{error}</p>
      ) : (
        <TablaPedidos pedidos={datos} alRecargar={recargar} />
      )}
    </>
  );
}
