import type { Disponibilidad, Espacio, FiltroDinamico, Producto, Rubro } from './tipos';

/**
 * Catálogo de ejemplo. Son 14 productos representativos, a propósito.
 *
 * El catálogo real son ~3.400 artículos y no va acá: el brief pide no cargar
 * todo el catálogo en el cliente, y el archivo de origen trae una columna COSTO
 * que es información interna y no puede salir en la web ni quedar en git.
 */

const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

export const RUBROS: Rubro[] = [
  { id: 'clima', nombre: 'Climatización', slug: 'climatizacion', subcategorias: ['Aires acondicionados', 'Ventiladores', 'Otros'] },
  { id: 'tv', nombre: 'TV & Audio', slug: 'tv-y-audio', subcategorias: ['Televisores', 'Parlantes', 'Audio'] },
  { id: 'cel', nombre: 'Celulares & Tecnología', slug: 'celulares-y-tecnologia', subcategorias: ['Celulares', 'Accesorios', 'Tecnología'] },
  { id: 'refri', nombre: 'Refrigeración', slug: 'refrigeracion', subcategorias: ['Heladeras', 'Congeladores', 'Bebederos'] },
  { id: 'cocina', nombre: 'Cocina', slug: 'cocina', subcategorias: ['Cocinas', 'Hornos', 'Microondas', 'Freidoras', 'Licuadoras', 'Cafeteras'] },
  { id: 'lavado', nombre: 'Lavado', slug: 'lavado', subcategorias: ['Lavarropas', 'Otros'] },
  { id: 'hogar', nombre: 'Hogar', slug: 'hogar', subcategorias: ['Muebles', 'Mesas', 'Sillas', 'Roperos'] },
  { id: 'dorm', nombre: 'Dormitorio', slug: 'dormitorio', subcategorias: ['Sommiers', 'Colchones'] },
  { id: 'cuidado', nombre: 'Cuidado Personal', slug: 'cuidado-personal', subcategorias: ['Afeitadoras', 'Secadores', 'Planchitas'] },
  { id: 'ext', nombre: 'Deportes & Exterior', slug: 'deportes-y-exterior', subcategorias: ['Bicicletas', 'Piscinas', 'Recreación'] },
];

/** Las marcas reales salen del catálogo del ERP. Estas son las del mock. */
export const MARCAS = [
  'Samsung', 'Philips', 'Tokyo', 'Midea', 'Carrier', 'Goodweather',
  'JBL', 'Xiaomi', 'Electrolux', 'Remington', 'Babyliss', 'Tramontina',
];

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

const p = (
  id: string, codigo: string, marca: string, nombre: string, specs: string,
  rubro: string, subcategoria: string, precio: number,
  disponibilidad: Disponibilidad, imagen: string,
  extra: Partial<Producto> = {},
): Producto => ({
  id, codigo, marca, nombre,
  slug: `${marca} ${nombre}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'y').replace(/["']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  rubro, subcategoria, specs: specs.split(' · '), precio, disponibilidad, imagen, ...extra,
});

export const PRODUCTOS: Producto[] = [
  p('p1', '10234', 'Samsung', 'Smart TV 55" 4K', '55" · 4K UHD · Smart TV', 'tv', 'Televisores', 3360000, 'disponible', 'smart tv 55"', { destacado: true }),
  p('p2', '20412', 'Midea', 'Aire acondicionado 12.000 BTU', '12.000 BTU · Inverter · Split', 'clima', 'Aires acondicionados', 3950000, 'ultimas', 'aire split', { destacado: true }),
  p('p3', '30871', 'Tokyo', 'Heladera 300 L', '300 L · Frío seco', 'refri', 'Heladeras', 2890000, 'disponible', 'heladera', { destacado: true }),
  p('p4', '40125', 'Xiaomi', 'Smartphone 128 GB', '128 GB · 6 GB RAM', 'cel', 'Celulares', 1690000, 'disponible', 'smartphone', { destacado: true, nuevo: true }),
  p('p5', '50330', 'Philips', 'Freidora de aire 4,1 L', '4,1 L', 'cocina', 'Freidoras', 590000, 'disponible', 'freidora de aire', { precioAnterior: 690000 }),
  p('p6', '10988', 'JBL', 'Parlante portátil', 'Bluetooth', 'tv', 'Parlantes', 890000, 'sin-stock', 'parlante'),
  p('p7', '60217', 'Electrolux', 'Lavarropas 8 kg', '8 kg · Carga frontal', 'lavado', 'Lavarropas', 3150000, 'consultar', 'lavarropas'),
  p('p8', '70144', 'Remington', 'Afeitadora', 'Recargable', 'cuidado', 'Afeitadoras', 290000, 'disponible', 'afeitadora', { precioAnterior: 340000 }),
  p('p9', '40310', 'Samsung', 'Smartphone 256 GB', '256 GB · 8 GB RAM', 'cel', 'Celulares', 2990000, 'ultimas', 'smartphone', { nuevo: true }),
  p('p10', '20033', 'Goodweather', 'Ventilador de pie', '3 velocidades', 'clima', 'Ventiladores', 250000, 'disponible', 'ventilador', { precioAnterior: 290000 }),
  p('p11', '70288', 'Babyliss', 'Planchita de pelo', 'Placas cerámicas', 'cuidado', 'Planchitas', 390000, 'disponible', 'planchita', { nuevo: true }),
  p('p12', '20590', 'Carrier', 'Aire acondicionado 18.000 BTU', '18.000 BTU · Inverter · Split', 'clima', 'Aires acondicionados', 5400000, 'disponible', 'aire split'),
  p('p13', '10198', 'Samsung', 'Smart TV 43" Full HD', '43" · Full HD · Smart TV', 'tv', 'Televisores', 2150000, 'disponible', 'smart tv 43"', { nuevo: true }),
  p('p14', '50612', 'Tramontina', 'Juego de ollas', 'Acero inoxidable', 'cocina', 'Cocinas', 450000, 'disponible', 'juego de ollas', { nuevo: true }),
];
