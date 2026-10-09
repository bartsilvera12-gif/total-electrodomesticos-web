import { cache } from 'react';
import { clientePublico } from '@/lib/supabase/cliente';
import { ESPACIOS, FILTROS_DINAMICOS, LOGOS_MARCA } from './mock';
import type {
  ConsultaCatalogo, Disponibilidad, Espacio, FiltroDinamico,
  Producto, ResultadoCatalogo, Rubro,
} from './tipos';

/**
 * Servicio de catálogo.
 *
 * Único punto por donde la web lee productos. Lee del schema `total`, el mismo
 * del ERP, a través de las vistas `web_*`: nunca de `total.productos`, que tiene
 * la columna del costo.
 *
 * Los espacios de la casa y los filtros técnicos siguen saliendo de `mock.ts`:
 * son taxonomía de la tienda, no datos del ERP.
 */

const POR_PAGINA = 12;

/** Lo que devuelve la vista `web_catalogo` */
interface FilaCatalogo {
  id: string;
  slug: string;
  nombre: string;
  sku: string | null;
  codigo_barras: string | null;
  descripcion_erp: string | null;
  descripcion_web: string | null;
  precio: number;
  precio_anterior: number | null;
  stock_actual: number | null;
  destacado: boolean | null;
  garantia_meses: number | null;
  imagen_url: string | null;
  galeria: string[] | null;
  ficha: Array<{ etiqueta: string; valor: string }> | null;
  orden: number | null;
  seo_titulo: string | null;
  seo_desc: string | null;
  marca: string | null;
  categoria_id: string | null;
  categoria: string | null;
  categoria_slug: string | null;
  disponibilidad: Disponibilidad;
}

function aProducto(f: FilaCatalogo): Producto {
  const descripcion = f.descripcion_web ?? f.descripcion_erp ?? undefined;
  return {
    id: f.id,
    codigo: f.sku ?? '',
    codigoBarras: f.codigo_barras ?? undefined,
    nombre: f.nombre,
    slug: f.slug,
    marca: f.marca ?? '',
    rubro: f.categoria_slug ?? f.categoria_id ?? '',
    subcategoria: f.categoria ?? '',
    // La ficha del panel manda; si no hay, se arma con lo que haya
    specs: (f.ficha ?? []).map((x) => `${x.etiqueta}: ${x.valor}`).slice(0, 3),
    precio: Number(f.precio),
    precioAnterior: f.precio_anterior != null ? Number(f.precio_anterior) : undefined,
    disponibilidad: f.disponibilidad,
    imagen: f.imagen_url ?? f.nombre,
    imagenUrl: f.imagen_url ?? undefined,
    galeria: f.galeria ?? [],
    fichaTecnica: f.ficha ?? undefined,
    descripcion,
    destacado: Boolean(f.destacado),
    garantiaMeses: f.garantia_meses ?? undefined,
    seoTitulo: f.seo_titulo ?? undefined,
    seoDescripcion: f.seo_desc ?? undefined,
  };
}

const COLUMNAS = '*';

/** React cachea por request: varias secciones de la home no repiten la consulta. */
export const obtenerRubros = cache(async (): Promise<Rubro[]> => {
  const sb = clientePublico();
  const { data, error } = await sb
    .from('web_categoria_publica')
    .select('id, slug, nombre, parent_id, orden, destaque, imagen_url, productos')
    .order('orden', { ascending: true });

  if (error) throw new Error(`No se pudo leer las categorías: ${error.message}`);

  const filas = data ?? [];
  const hijasDe = (id: string) =>
    filas.filter((f) => f.parent_id === id).map((f) => f.nombre);

  // Solo las raíces van al menú; las hijas quedan como subcategorías
  return filas
    .filter((f) => !f.parent_id)
    .map((f) => ({
      id: f.slug,
      nombre: f.nombre,
      slug: f.slug,
      subcategorias: hijasDe(f.id),
      imagenUrl: f.imagen_url ?? undefined,
      destaque: f.destaque ?? 1,
    }));
});

export const obtenerRubro = cache(async (slug: string): Promise<Rubro | null> => {
  const rubros = await obtenerRubros();
  return rubros.find((r) => r.slug === slug) ?? null;
});

export const obtenerMarcas = cache(async (): Promise<string[]> => {
  const sb = clientePublico();
  const { data, error } = await sb
    .from('web_marca_publica')
    .select('nombre, productos')
    .order('nombre');
  if (error) throw new Error(`No se pudo leer las marcas: ${error.message}`);
  return (data ?? []).filter((m) => (m.productos ?? 0) > 0).map((m) => m.nombre);
});

export async function obtenerEspacios(): Promise<Espacio[]> {
  return ESPACIOS;
}

export async function obtenerFiltrosDinamicos(rubroId?: string | null): Promise<FiltroDinamico[]> {
  if (!rubroId) return [];
  return FILTROS_DINAMICOS[rubroId] ?? [];
}

export { LOGOS_MARCA };

export const obtenerProductoPorSlug = cache(async (slug: string): Promise<Producto | null> => {
  const sb = clientePublico();
  const { data, error } = await sb
    .from('web_catalogo').select(COLUMNAS).eq('slug', slug).maybeSingle();
  if (error) throw new Error(`No se pudo leer el producto: ${error.message}`);
  return data ? aProducto(data as FilaCatalogo) : null;
});

export async function obtenerProductosPorId(ids: string[]): Promise<Producto[]> {
  if (!ids.length) return [];
  const sb = clientePublico();
  const { data, error } = await sb.from('web_catalogo').select(COLUMNAS).in('id', ids);
  if (error) throw new Error(`No se pudo leer los productos: ${error.message}`);
  const porId = new Map((data ?? []).map((f) => [f.id, aProducto(f as FilaCatalogo)]));
  return ids.map((id) => porId.get(id)).filter((p): p is Producto => Boolean(p));
}

export const obtenerDestacados = cache(async (limite = 4): Promise<Producto[]> => {
  const sb = clientePublico();
  const { data, error } = await sb
    .from('web_catalogo').select(COLUMNAS)
    .eq('destacado', true).order('orden').limit(limite);
  if (error) throw new Error(`No se pudo leer los destacados: ${error.message}`);
  return (data ?? []).map((f) => aProducto(f as FilaCatalogo));
});

export const obtenerOfertas = cache(async (limite = 12): Promise<Producto[]> => {
  const sb = clientePublico();
  // Solo con rebaja vigente: la vista ya calcula precio_anterior y lo deja
  // en null cuando no hay promoción real. No se inventan descuentos.
  const { data, error } = await sb
    .from('web_catalogo').select(COLUMNAS)
    .not('precio_anterior', 'is', null).order('orden').limit(limite);
  if (error) throw new Error(`No se pudo leer las ofertas: ${error.message}`);
  return (data ?? []).map((f) => aProducto(f as FilaCatalogo));
});

export const obtenerNovedades = cache(async (limite = 12): Promise<Producto[]> => {
  const sb = clientePublico();
  const { data, error } = await sb
    .from('web_catalogo').select(COLUMNAS)
    .order('orden', { ascending: true }).limit(limite);
  if (error) throw new Error(`No se pudo leer las novedades: ${error.message}`);
  return (data ?? []).map((f) => aProducto(f as FilaCatalogo));
});

export async function obtenerRelacionados(producto: Producto, limite = 4): Promise<Producto[]> {
  const sb = clientePublico();
  let q = sb.from('web_catalogo').select(COLUMNAS).neq('id', producto.id).limit(limite);
  if (producto.rubro) q = q.eq('categoria_slug', producto.rubro);
  const { data, error } = await q;
  if (error) throw new Error(`No se pudo leer los relacionados: ${error.message}`);
  return (data ?? []).map((f) => aProducto(f as FilaCatalogo));
}

export async function buscarProductos(consulta: ConsultaCatalogo = {}): Promise<ResultadoCatalogo> {
  const {
    rubro, subcategoria, marcas = [], disponibilidad = [],
    precioMin, precioMax, soloOfertas, orden = 'relevancia',
    busqueda, pagina = 1, porPagina = POR_PAGINA,
  } = consulta;

  const sb = clientePublico();
  let q = sb.from('web_catalogo').select(COLUMNAS, { count: 'exact' });

  if (rubro) q = q.eq('categoria_slug', rubro);
  if (subcategoria) q = q.eq('categoria', subcategoria);
  if (marcas.length) q = q.in('marca', marcas);
  if (disponibilidad.length) q = q.in('disponibilidad', disponibilidad);
  if (typeof precioMin === 'number') q = q.gte('precio', precioMin);
  if (typeof precioMax === 'number') q = q.lte('precio', precioMax);
  if (soloOfertas) q = q.not('precio_anterior', 'is', null);
  if (busqueda?.trim()) {
    const t = busqueda.trim();
    q = q.or(`nombre.ilike.%${t}%,marca.ilike.%${t}%,sku.ilike.%${t}%,categoria.ilike.%${t}%`);
  }

  if (orden === 'precio-asc') q = q.order('precio', { ascending: true });
  else if (orden === 'precio-desc') q = q.order('precio', { ascending: false });
  else q = q.order('orden', { ascending: true });

  // Paginado en el servidor: con el catálogo real son miles de artículos y el
  // brief pide explícitamente no mandarlos todos al navegador.
  const desde = (pagina - 1) * porPagina;
  const { data, error, count } = await q.range(desde, desde + porPagina - 1);
  if (error) throw new Error(`No se pudo buscar: ${error.message}`);

  const total = count ?? 0;
  return {
    productos: (data ?? []).map((f) => aProducto(f as FilaCatalogo)),
    total,
    pagina,
    porPagina,
    hayMas: desde + porPagina < total,
  };
}

/** Buscador instantáneo: productos, categorías y marcas */
export async function sugerencias(termino: string) {
  const t = termino.trim();
  if (!t) return { productos: [], rubros: [], marcas: [] };

  const sb = clientePublico();
  const [prod, rubros, marcas] = await Promise.all([
    sb.from('web_catalogo').select(COLUMNAS)
      .or(`nombre.ilike.%${t}%,marca.ilike.%${t}%,sku.ilike.%${t}%`).limit(5),
    obtenerRubros(),
    obtenerMarcas(),
  ]);

  const n = t.toLowerCase();
  return {
    productos: (prod.data ?? []).map((f) => aProducto(f as FilaCatalogo)),
    rubros: rubros.filter((r) => r.nombre.toLowerCase().includes(n)).slice(0, 3),
    marcas: marcas.filter((m) => m.toLowerCase().includes(n)).slice(0, 3),
  };
}
