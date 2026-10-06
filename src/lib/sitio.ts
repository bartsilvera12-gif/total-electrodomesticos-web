/** Datos comerciales confirmados por el cliente. No agregar nada que no esté acá. */
export const SITIO = {
  nombre: 'Total Electrodomésticos',
  descripcion:
    'Tecnología, electrodomésticos, muebles y productos para acompañar cada espacio de tu hogar.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://total-electrodomesticos-web.vercel.app',
  correo: 'total_electronica@hotmail.com',
  instagram: 'https://instagram.com/total_electrodomesticos',
  facebook: 'https://www.facebook.com/',
} as const;

/**
 * Los dos números de atención.
 *
 * `numero` va en formato internacional sin signos, que es lo que pide wa.me.
 * Paraguay es 595 y el 0 inicial del número local no se incluye.
 *
 * Las etiquetas son provisorias: cuando Total confirme quién atiende cada línea,
 * se reemplazan por los nombres reales sin tocar nada más.
 */
export interface Asesor {
  etiqueta: string;
  /** Internacional sin signos, para wa.me */
  numero: string;
  /** Como se escribe en Paraguay, para mostrar */
  local: string;
}

export const ASESORES: Asesor[] = [
  { etiqueta: 'Asesor 1', numero: '595983918520', local: '0983 918 520' },
  { etiqueta: 'Asesor 2', numero: '595974203063', local: '0974 203 063' },
];

/**
 * Promesas que NO se pueden hacer sin confirmación del cliente: envío gratis,
 * financiación, garantías, entregas en 24 horas, años de trayectoria, cantidad
 * de sucursales. Si alguna se confirma, se agrega acá y recién ahí a la web.
 */
export const BENEFICIOS = [
  { titulo: 'Variedad', texto: 'Diferentes categorías dentro de una misma tienda.' },
  { titulo: 'Atención directa', texto: 'Contacto por WhatsApp.' },
  { titulo: 'Compra online', texto: 'Carrito y pedidos desde la web.' },
  { titulo: 'Pago digital', texto: 'PagoPar.' },
] as const;
