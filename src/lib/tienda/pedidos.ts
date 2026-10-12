'use client';

import { supa } from '@/lib/supabase/cliente';
import type { Cliente, Entrega, EstadoPago, LineaCarrito, Pedido } from './tipos';

/**
 * Pedidos de la tienda.
 *
 * El alta va por la función `total.web_crear_pedido` de la base, no por un
 * INSERT. Es a propósito: la función busca el precio en el catálogo y arma el
 * pedido con ese valor. Si el navegador pudiera insertar directo, cualquiera
 * compraría al precio que quisiera — por eso `web_pedido` tampoco tiene policy
 * de INSERT.
 */

interface FilaPedido {
  numero: string; created_at: string;
  cliente: Cliente; entrega: Entrega;
  subtotal: number; total: number;
  estado: Pedido['estado']; estado_pago: Pedido['estadoPago'];
  items?: Array<{
    producto_id: string | null; nombre: string; marca: string | null;
    sku: string | null; precio: number; cantidad: number;
  }>;
  web_pedido_item?: FilaPedido['items'];
}

export function aPedido(f: FilaPedido): Pedido {
  const items = f.items ?? f.web_pedido_item ?? [];
  return {
    numero: f.numero,
    fechaISO: f.created_at,
    lineas: items.map((i) => ({
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

export async function crearPedido(datos: {
  lineas: LineaCarrito[];
  cliente: Cliente;
  entrega: Entrega;
  estadoPago: EstadoPago;
}): Promise<string> {
  const { data, error } = await supa().rpc('web_crear_pedido', {
    p_lineas: datos.lineas.map((l) => ({ producto_id: l.productoId, cantidad: l.cantidad })),
    p_cliente: datos.cliente,
    p_entrega: datos.entrega,
    p_pago: datos.estadoPago === 'aprobado' ? 'aprobado' : 'pendiente',
  });
  if (error) throw new Error(error.message);
  return data as string;
}

/** Un pedido por su número: lo usa la confirmación de quien compró sin cuenta. */
export async function pedidoPorNumero(numero: string): Promise<Pedido | null> {
  const { data, error } = await supa().rpc('web_pedido_por_numero', { p_numero: numero });
  if (error) throw new Error(error.message);
  return data ? aPedido(data as FilaPedido) : null;
}

/** Los pedidos del cliente con sesión iniciada. */
export async function misPedidos(): Promise<Pedido[]> {
  const sb = supa();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from('web_pedido')
    .select('numero, created_at, cliente, entrega, subtotal, total, estado, estado_pago, web_pedido_item(*)')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((f) => aPedido(f as FilaPedido));
}
