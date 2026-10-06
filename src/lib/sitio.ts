/** Datos comerciales confirmados por el cliente. No agregar nada que no esté acá. */
export const SITIO = {
  nombre: 'Total Electrodomésticos',
  descripcion:
    'Tecnología, electrodomésticos, muebles y productos para acompañar cada espacio de tu hogar.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://total-electrodomesticos-web.vercel.app',
  correo: 'total_electronica@hotmail.com',
  telefono: '0983 918 520',
  instagram: 'https://instagram.com/total_electrodomesticos',
  facebook: 'https://www.facebook.com/',
} as const;

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
