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

export const WHATSAPP = '595983918520';

/** Enlace internacional de WhatsApp para Paraguay */
export function linkWhatsapp(mensaje?: string): string {
  const base = `https://wa.me/${WHATSAPP}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
