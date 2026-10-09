import type { Disponibilidad, Espacio, FiltroDinamico } from './tipos';

/**
 * Taxonomía de la tienda.
 *
 * Los productos, las categorías y las marcas salen del schema `total`, el mismo
 * del ERP, por `servicio.ts`. Acá queda solo lo que es decisión de la tienda y
 * no existe en el ERP: los espacios de la casa, las zonas del hero, los filtros
 * técnicos por rubro y los logotipos de marca.
 */

const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;


/** Logotipos disponibles. Las marcas sin archivo se componen tipográficamente. */
export const LOGOS_MARCA: Record<string, { src: string; alto: number }> = {
  Samsung: { src: '/assets/brands/samsung.svg', alto: 24 },
  Philips: { src: '/assets/brands/philips.svg', alto: 26 },
  JBL: { src: '/assets/brands/jbl.svg', alto: 52 },
  Xiaomi: { src: '/assets/brands/xiaomi.svg', alto: 46 },
  Electrolux: { src: '/assets/brands/electrolux.svg', alto: 22 },
  Remington: { src: '/assets/brands/remington.svg', alto: 26 },
  Midea: { src: '/assets/brands/midea.svg', alto: 38 },
  Babyliss: { src: '/assets/brands/babyliss.svg', alto: 26 },
};

export const ETIQUETA_DISPONIBILIDAD: Record<Disponibilidad, string> = {
  disponible: 'Disponible',
  ultimas: 'Últimas unidades',
  'sin-stock': 'Sin stock',
  consultar: 'Consultar',
};

/** Filtros técnicos por rubro. No mostrar filtros irrelevantes en rubros que no aplican. */
export const FILTROS_DINAMICOS: Record<string, FiltroDinamico[]> = {
  tv: [
    { etiqueta: 'Pulgadas', opciones: ['32"', '43"', '50"', '55"', '65"'] },
    { etiqueta: 'Resolución', opciones: ['HD', 'Full HD', '4K'] },
    { etiqueta: 'Smart TV', opciones: ['Sí', 'No'] },
  ],
  clima: [
    { etiqueta: 'BTU', opciones: ['9.000', '12.000', '18.000', '24.000'] },
    { etiqueta: 'Inverter', opciones: ['Sí', 'No'] },
    { etiqueta: 'Tipo', opciones: ['Split', 'Ventana', 'Portátil'] },
  ],
  refri: [
    { etiqueta: 'Capacidad', opciones: ['Hasta 250 L', '250 a 400 L', 'Más de 400 L'] },
    { etiqueta: 'Tipo', opciones: ['Frío seco', 'No Frost', 'Side by side'] },
  ],
  cel: [
    { etiqueta: 'Almacenamiento', opciones: ['64 GB', '128 GB', '256 GB'] },
    { etiqueta: 'Memoria', opciones: ['4 GB', '6 GB', '8 GB'] },
  ],
};

export const ESPACIOS: Espacio[] = [
  { nombre: 'Living', slug: 'living', foto: pexels(6186813), rubros: ['tv', 'hogar'], descripcion: 'Televisores, audio y muebles para el espacio donde se comparte.',
    atajos: [{ nombre: 'Televisores', rubro: 'tv' }, { nombre: 'Parlantes', rubro: 'tv' }, { nombre: 'Mesas', rubro: 'hogar' }, { nombre: 'Sillas', rubro: 'hogar' }] },
  { nombre: 'Cocina', slug: 'cocina', foto: pexels(3623785), rubros: ['cocina', 'refri'], descripcion: 'Refrigeración y electrodomésticos para cocinar todos los días.',
    atajos: [{ nombre: 'Heladeras', rubro: 'refri' }, { nombre: 'Cocinas', rubro: 'cocina' }, { nombre: 'Microondas', rubro: 'cocina' }, { nombre: 'Freidoras', rubro: 'cocina' }, { nombre: 'Cafeteras', rubro: 'cocina' }] },
  { nombre: 'Dormitorio', slug: 'dormitorio', foto: pexels(8135502), rubros: ['dorm', 'clima', 'cuidado'], descripcion: 'Descanso, climatización y guardado.',
    atajos: [{ nombre: 'Colchones', rubro: 'dorm' }, { nombre: 'Sommiers', rubro: 'dorm' }, { nombre: 'Aires acondicionados', rubro: 'clima' }, { nombre: 'Roperos', rubro: 'hogar' }] },
  { nombre: 'Lavadero', slug: 'lavadero', rubros: ['lavado'], descripcion: 'Lavado y cuidado de la ropa.',
    atajos: [{ nombre: 'Lavarropas', rubro: 'lavado' }] },
  { nombre: 'Oficina', slug: 'oficina', foto: pexels(669228), rubros: ['cel'], descripcion: 'Tecnología y confort para trabajar o estudiar.',
    atajos: [{ nombre: 'Celulares', rubro: 'cel' }, { nombre: 'Accesorios', rubro: 'cel' }, { nombre: 'Ventiladores', rubro: 'clima' }, { nombre: 'Sillas', rubro: 'hogar' }] },
  { nombre: 'Exterior', slug: 'exterior', rubros: ['ext'], descripcion: 'Recreación y productos para el patio.',
    atajos: [{ nombre: 'Bicicletas', rubro: 'ext' }, { nombre: 'Piscinas', rubro: 'ext' }, { nombre: 'Recreación', rubro: 'ext' }] },
];

/** Las 5 zonas de la casa del hero */
export const ZONAS_HERO = [
  { id: 'clima', ambiente: 'Altillo', titulo: 'Climatización', rubro: 'clima', foto: pexels(8583859) },
  { id: 'living', ambiente: 'Living', titulo: 'TV & Audio', rubro: 'tv', foto: pexels(1571459) },
  { id: 'cocina', ambiente: 'Cocina', titulo: 'Cocina', rubro: 'cocina', foto: pexels(6835124) },
  { id: 'tecno', ambiente: 'Escritorio', titulo: 'Tecnología', rubro: 'cel', foto: pexels(4526428) },
  { id: 'dorm', ambiente: 'Dormitorio', titulo: 'Dormitorio', rubro: 'dorm', foto: pexels(7598137) },
] as const;
