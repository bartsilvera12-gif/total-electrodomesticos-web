import { supa, supaBuild, urlPublicaImagen } from '@/lib/supabase/cliente';
import { ESPACIOS, FILTROS_DINAMICOS, LOGOS_MARCA } from './mock';
import type {
  ConsultaCatalogo, Disponibilidad, Espacio, FiltroDinamico,
  Producto, ResultadoCatalogo, Rubro,
} from './tipos';

/**
 * Servicio de catálogo.
 *
 * Único punto por donde la web lee productos. Lee del schema `total`, el mismo
 * del ERP, por las vistas `web_*`: nunca de `total.productos`, que tiene la
 * columna del costo.
 *
 * Funciona igual en el build (genera el HTML) y en el navegador (lo repinta con
 * lo último). Por eso elige el cliente según dónde esté corriendo.
 */

const POR_PAGINA = 12;

const sb = () => (typeof window === 'undefined' ? supaBuild() : supa());

interface FilaCatalogo {
  id: string; slug: string; nombre: string; sku: string | null;
  codigo_barras: string | null;
  descripcion_erp: string | null; descripcion_web: string | null;
  precio: number; precio_anterior: number | null;
  stock_actual: number | null; destacado: boolean | null;
  garantia_meses: number | null;
  // `imagen_url`: foto alojada afuera (se pega a mano). `imagen_path`: foto
  // subida desde el ERP al bucket publico. Puede venir una, otra o ninguna.
  imagen_url: string | null; imagen_path: string | null;
  galeria: string[] | null;
  ficha: Array<{ etiqueta: string; valor: string }> | null;
  orden: number | null; seo_titulo: string | null; seo_desc: string | null;
  marca: string | null; categoria_id: string | null;
  categoria: string | null; categoria_slug: string | null;
  disponibilidad: Disponibilidad;
}

function aProducto(f: FilaCatalogo): Producto {
  const foto = f.imagen_url ?? urlPublicaImagen(f.imagen_path);
  return {
    id: f.id,
    codigo: f.sku ?? '',
    codigoBarras: f.codigo_barras ?? undefined,
    nombre: f.nombre,
    slug: f.slug,
    marca: f.marca ?? '',
    rubro: f.categoria_slug ?? '',
    subcategoria: f.categoria ?? '',
    specs: (f.ficha ?? []).map((x) => `${x.etiqueta}: ${x.valor}`).slice(0, 3),
    precio: Number(f.precio),
    precioAnterior: f.precio_anterior != null ? Number(f.precio_anterior) : undefined,
    disponibilidad: f.disponibilidad,
    imagen: foto ?? f.nombre,
    imagenUrl: foto,
    galeria: f.galeria ?? [],
    fichaTecnica: f.ficha ?? undefined,
    descripcion: f.descripcion_web ?? f.descripcion_erp ?? undefined,
    destacado: Boolean(f.destacado),
    garantiaMeses: f.garantia_meses ?? undefined,
    seoTitulo: f.seo_titulo ?? undefined,
    seoDescripcion: f.seo_desc ?? undefined,
  };
}

export async function obtenerRubros(): Promise<Rubro[]> {
  const { data, error } = await sb()
    .from('web_categoria_publica')
    .select('id, slug, nombre, parent_id, orden, destaque, imagen_url, productos')
    .order('orden');
  if (error) throw new Error(`No se pudo leer las categorías: ${error.message}`);

  const filas = data ?? [];
  return filas
    .filter((f) => !f.parent_id)
    .map((f) => ({
      id: f.slug,
      nombre: f.nombre,
      slug: f.slug,
      subcategorias: filas.filter((h) => h.parent_id === f.id).map((h) => h.nombre),
      imagenUrl: f.imagen_url ?? undefined,
      destaque: f.destaque ?? 1,
    }));
}

export async function obtenerRubro(slug: string): Promise<Rubro | null> {
  return (await obtenerRubros()).find((r) => r.slug === slug) ?? null;
}

export async function obtenerMarcas(): Promise<string[]> {
  const { data, error } = await sb()
    .from('web_marca_publica').select('nombre, productos').order('nombre');
  if (error) throw new Error(`No se pudo leer las marcas: ${error.message}`);
  return (data ?? []).filter((m) => (m.productos ?? 0) > 0).map((m) => m.nombre);
}

export async function obtenerEspacios(): Promise<Espacio[]> {
  return ESPACIOS;
}

export async function obtenerFiltrosDinamicos(rubroId?: string | null): Promise<FiltroDinamico[]> {
  return rubroId ? (FILTROS_DINAMICOS[rubroId] ?? []) : [];
}

export { LOGOS_MARCA };

export async function obtenerProductoPorSlug(slug: string): Promise<Producto | null> {
  const { data, error } = await sb()
    .from('web_catalogo').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`No se pudo leer el producto: ${error.message}`);
  return data ? aProducto(data as FilaCatalogo) : null;
}

export async function obtenerProductosPorId(ids: string[]): Promise<Producto[]> {
  if (!ids.length) return [];
  const { data, error } = await sb().from('web_catalogo').select('*').in('id', ids);
  if (error) throw new Error(`No se pudo leer los productos: ${error.message}`);
  const porId = new Map((data ?? []).map((f) => [f.id, aProducto(f as FilaCatalogo)]));
  return ids.map((id) => porId.get(id)).filter((p): p is Producto => Boolean(p));
}

export async function obtenerDestacados(limite = 4): Promise<Producto[]> {
  const { data, error } = await sb()
    .from('web_catalogo').select('*').eq('destacado', true).order('orden').limit(limite);
  if (error) throw new Error(`No se pudo leer los destacados: ${error.message}`);
  return (data ?? []).map((f) => aProducto(f as FilaCatalogo));
}

export async function obtenerOfertas(limite = 12): Promise<Producto[]> {
  // Solo con rebaja vigente: la vista deja precio_anterior en null cuando no hay
  // promoción real. No se inventan descuentos.
  const { data, error } = await sb()
    .from('web_catalogo').select('*')
    .not('precio_anterior', 'is', null).order('orden').limit(limite);
  if (error) throw new Error(`No se pudo leer las ofertas: ${error.message}`);
  return (data ?? []).map((f) => aProducto(f as FilaCatalogo));
}

export async function obtenerNovedades(limite = 12): Promise<Producto[]> {
  const { data, error } = await sb()
    .from('web_catalogo').select('*').order('orden').limit(limite);
  if (error) throw new Error(`No se pudo leer las novedades: ${error.message}`);
  return (data ?? []).map((f) => aProducto(f as FilaCatalogo));
}

export async function obtenerRelacionados(producto: Producto, limite = 4): Promise<Producto[]> {
  let q = sb().from('web_catalogo').select('*').neq('id', producto.id).limit(limite);
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

  let q = sb().from('web_catalogo').select('*', { count: 'exact' });

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
  else q = q.order('orden');

  // Paginado en la base: con el catálogo real son miles de artículos y el brief
  // pide no mandarlos todos al navegador.
  const desde = (pagina - 1) * porPagina;
  const { data, error, count } = await q.range(desde, desde + porPagina - 1);
  if (error) throw new Error(`No se pudo buscar: ${error.message}`);

  const total = count ?? 0;
  return {
    productos: (data ?? []).map((f) => aProducto(f as FilaCatalogo)),
    total, pagina, porPagina,
    hayMas: desde + porPagina < total,
  };
}

export async function sugerencias(termino: string) {
  const t = termino.trim();
  if (!t) return { productos: [], rubros: [], marcas: [] };

  const [prod, rubros, marcas] = await Promise.all([
    sb().from('web_catalogo').select('*')
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

/** Todos los slugs publicados: el build genera una página por producto. */
export async function slugsDeProductos(): Promise<string[]> {
  const { data } = await supaBuild().from('web_catalogo').select('slug');
  return (data ?? []).map((p) => p.slug).filter(Boolean);
}
