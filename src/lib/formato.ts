/** Precios en guaraníes: Gs. 3.360.000 */
export function guaranies(monto: number): string {
  return `Gs. ${Math.round(monto).toLocaleString('es-PY').replace(/,/g, '.')}`;
}

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function slugificar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'y').replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Enlace de WhatsApp. `numero` va en formato internacional sin signos
 * (Paraguay: 595 + número sin el 0 inicial), que es lo que espera wa.me.
 */
export function linkWhatsapp(numero: string, mensaje?: string): string {
  const base = `https://wa.me/${numero}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/** Una línea de pedido para armar el mensaje de WhatsApp. */
export type LineaPedido = {
  nombre: string;
  marca?: string | null;
  codigo?: string | null;
  cantidad: number;
  precio: number;
};

/**
 * Mensaje de pedido para WhatsApp: qué quiere comprar, cuánto y el total.
 *
 * Va escrito para que del otro lado se pueda responder sin pedir dos veces lo
 * mismo. El total es orientativo: el envío se confirma por chat.
 */
export function mensajePedidoWhatsapp(lineas: LineaPedido[], url?: string): string {
  if (lineas.length === 0) return 'Hola Total, quiero hacer un pedido.';
  const detalle = lineas
    .map((l) => {
      const marca = l.marca ? `${l.marca} ` : '';
      const codigo = l.codigo ? ` (cód. ${l.codigo})` : '';
      return `· ${marca}${l.nombre}${codigo} × ${l.cantidad} — ${guaranies(l.precio * l.cantidad)}`;
    })
    .join('\n');
  const total = lineas.reduce((t, l) => t + l.precio * l.cantidad, 0);
  const cierre = lineas.length > 1 ? `\nTotal: ${guaranies(total)}` : '';
  const link = url ? `\n${url}` : '';
  return `Hola Total, quiero comprar:\n${detalle}${cierre}${link}`;
}
