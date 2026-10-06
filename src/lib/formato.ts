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
