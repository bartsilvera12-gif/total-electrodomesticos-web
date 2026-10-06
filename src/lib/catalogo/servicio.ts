import {
  ESPACIOS, FILTROS_DINAMICOS, MARCAS, PRODUCTOS, RUBROS,
} from './mock';
import type {
  ConsultaCatalogo, Espacio, FiltroDinamico, Producto, ResultadoCatalogo, Rubro,
} from './tipos';

/**
 * Servicio de catálogo.
 *
 * Único punto por donde la web lee productos. Hoy resuelve contra el mock en
 * memoria; cuando exista el ERP se reimplementa acá contra su base y ningún
 * componente se entera. Por eso todo devuelve promesas aunque hoy sean
 * síncronas: la firma ya es la que va a necesitar la integración.
 */

const POR_PAGINA = 12;

export async function obtenerRubros(): Promise<Rubro[]> {
  return RUBROS;
}

export async function obtenerRubro(slug: string): Promise<Rubro | null> {
  return RUBROS.find((r) => r.slug === slug) ?? null;
}

export async function obtenerMarcas(): Promise<string[]> {
  return MARCAS;
}

export async function obtenerEspacios(): Promise<Espacio[]> {
  return ESPACIOS;
}

export async function obtenerFiltrosDinamicos(rubroId?: string | null): Promise<FiltroDinamico[]> {
  if (!rubroId) return [];
  return FILTROS_DINAMICOS[rubroId] ?? [];
}

export async function obtenerProductoPorSlug(slug: string): Promise<Producto | null> {
  return PRODUCTOS.find((p) => p.slug === slug) ?? null;
}

export async function obtenerProductosPorId(ids: string[]): Promise<Producto[]> {
  const porId = new Map(PRODUCTOS.map((p) => [p.id, p]));
  return ids.map((id) => porId.get(id)).filter((p): p is Producto => Boolean(p));
}

export async function obtenerDestacados(limite = 4): Promise<Producto[]> {
  return PRODUCTOS.filter((p) => p.destacado).slice(0, limite);
}

export async function obtenerOfertas(limite = 12): Promise<Producto[]> {
  // Solo productos con una rebaja real. No inventar descuentos.
  return PRODUCTOS.filter((p) => p.precioAnterior && p.precioAnterior > p.precio).slice(0, limite);
}

export async function obtenerNovedades(limite = 12): Promise<Producto[]> {
  return PRODUCTOS.filter((p) => p.nuevo).slice(0, limite);
}

/** Productos de la misma categoría, para el comparador y los relacionados */
export async function obtenerRelacionados(producto: Producto, limite = 4): Promise<Producto[]> {
  return PRODUCTOS.filter((p) => p.rubro === producto.rubro && p.id !== producto.id).slice(0, limite);
}

const normalizar = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function coincideBusqueda(p: Producto, termino: string): boolean {
  const q = normalizar(termino);
  // Busca por nombre, marca, subcategoría y código de artículo
  return [p.nombre, p.marca, p.subcategoria, p.codigo, p.specs.join(' ')]
    .some((campo) => normalizar(campo).includes(q));
}

function coincideTecnicos(p: Producto, tecnicos: Record<string, string[]>): boolean {
  const texto = normalizar([p.nombre, ...p.specs].join(' '));
  return Object.values(tecnicos).every((valores) => {
    if (!valores.length) return true;
    // Dentro de un mismo filtro las opciones suman; entre filtros distintos, restringen
    return valores.some((v) => texto.includes(normalizar(v)));
  });
}

export async function buscarProductos(consulta: ConsultaCatalogo = {}): Promise<ResultadoCatalogo> {
  const {
    rubro, subcategoria, marcas = [], disponibilidad = [],
    precioMin, precioMax, soloOfertas, tecnicos = {},
    orden = 'relevancia', busqueda, pagina = 1, porPagina = POR_PAGINA,
  } = consulta;

  let items = PRODUCTOS.slice();

  if (rubro) items = items.filter((p) => p.rubro === rubro);
  if (subcategoria) items = items.filter((p) => p.subcategoria === subcategoria);
  if (marcas.length) items = items.filter((p) => marcas.includes(p.marca));
  if (disponibilidad.length) items = items.filter((p) => disponibilidad.includes(p.disponibilidad));
  if (typeof precioMin === 'number') items = items.filter((p) => p.precio >= precioMin);
  if (typeof precioMax === 'number') items = items.filter((p) => p.precio <= precioMax);
  if (soloOfertas) items = items.filter((p) => p.precioAnterior && p.precioAnterior > p.precio);
  if (Object.keys(tecnicos).length) items = items.filter((p) => coincideTecnicos(p, tecnicos));
  if (busqueda?.trim()) items = items.filter((p) => coincideBusqueda(p, busqueda));

  if (orden === 'precio-asc') items.sort((a, b) => a.precio - b.precio);
  else if (orden === 'precio-desc') items.sort((a, b) => b.precio - a.precio);
  else if (orden === 'nuevos') items.sort((a, b) => Number(b.nuevo ?? 0) - Number(a.nuevo ?? 0));

  const total = items.length;
  const desde = (pagina - 1) * porPagina;
  // Paginado en el servicio, no en el cliente: con el catálogo real son ~3.400 artículos
  const pagina_ = items.slice(desde, desde + porPagina);

  return { productos: pagina_, total, pagina, porPagina, hayMas: desde + porPagina < total };
}

/** Sugerencias del buscador instantáneo: productos, rubros y marcas */
export async function sugerencias(termino: string) {
  const q = termino.trim();
  if (!q) return { productos: [], rubros: [], marcas: [] };
  const n = normalizar(q);
  return {
    productos: PRODUCTOS.filter((p) => coincideBusqueda(p, q)).slice(0, 5),
    rubros: RUBROS.filter((r) => normalizar(r.nombre).includes(n)
      || r.subcategorias.some((s) => normalizar(s).includes(n))).slice(0, 3),
    marcas: MARCAS.filter((m) => normalizar(m).includes(n)).slice(0, 3),
  };
}
