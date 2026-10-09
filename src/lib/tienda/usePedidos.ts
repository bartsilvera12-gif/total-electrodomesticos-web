'use client';

import { useEffect, useState } from 'react';
import type { Pedido } from './tipos';

/** Lo que devuelve la API, con los nombres de la base */
interface FilaPedido {
  id: string; numero: string; created_at: string;
  cliente: Pedido['cliente']; entrega: Pedido['entrega'];
  subtotal: number; total: number;
  estado: Pedido['estado']; estado_pago: Pedido['estadoPago'];
  web_pedido_item: Array<{
    producto_id: string | null; nombre: string; marca: string | null;
    sku: string | null; precio: number; cantidad: number;
  }>;
}

function aPedido(f: FilaPedido): Pedido {
  return {
    numero: f.numero,
    fechaISO: f.created_at,
    lineas: (f.web_pedido_item ?? []).map((i) => ({
      productoId: i.producto_id ?? '',
      nombre: i.nombre,
      marca: i.marca ?? '',
      codigo: i.sku ?? '',
      precio: Number(i.precio),
      cantidad: i.cantidad,
    })),
    subtotal: Number(f.subtotal),
    total: Number(f.total),
    cliente: f.cliente,
    entrega: f.entrega,
    estado: f.estado,
    estadoPago: f.estado_pago,
  };
}

/**
 * Pedidos del cliente, desde la base.
 *
 * Antes vivían en el navegador, así que se perdían al cambiar de dispositivo.
 * Ahora quedan guardados y el panel ve los mismos.
 */
export function usePedidos(numero?: string) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    const url = numero ? `/api/mis-pedidos?numero=${encodeURIComponent(numero)}` : '/api/mis-pedidos';
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!vigente) return;
        if (d.error) setError(d.error);
        else setPedidos((d.pedidos ?? []).map(aPedido));
      })
      .catch(() => { if (vigente) setError('No pudimos cargar tus pedidos.'); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [numero]);

  return { pedidos, cargando, error };
}
