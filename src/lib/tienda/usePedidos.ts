'use client';

import { useEffect, useState } from 'react';
import type { Pedido } from './tipos';
import { misPedidos, pedidoPorNumero } from './pedidos';

/**
 * Pedidos del cliente, desde la base.
 *
 * Con número busca ese pedido (sirve para quien compró sin cuenta y vuelve
 * desde la confirmación). Sin número, los del usuario con sesión.
 */
export function usePedidos(numero?: string) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    const tarea = numero ? pedidoPorNumero(numero).then((p) => (p ? [p] : [])) : misPedidos();
    tarea
      .then((p) => { if (vigente) setPedidos(p); })
      .catch(() => { if (vigente) setError('No pudimos cargar tus pedidos.'); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [numero]);

  return { pedidos, cargando, error };
}
