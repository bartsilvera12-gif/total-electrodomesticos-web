import { clienteServidor } from '@/lib/supabase/cliente';
import { empresaId } from './sesion';

/**
 * Lecturas del panel.
 *
 * Van con service role porque el panel sí necesita ver lo que la tienda no:
 * productos sin publicar, categorías ocultas, todos los pedidos.
 *
 * Lo que NUNCA se trae es `costo_promedio`. El panel administra contenido, no
 * necesita el costo, y pedirlo sería abrir la puerta a que termine en el HTML.
 */

export interface ProductoPanel {
  id: string;
  nombre: string;
  sku: string | null;
  precio: number;
  stock: number | null;
  activo: boolean;
  destacado: boolean;
  imagenUrl: string | null;
  marca: string | null;
  categoria: string | null;
  // De la capa web
  slug: string | null;
  publicado: boolean;
  orden: number;
  descripcion: string | null;
  ficha: Array<{ etiqueta: string; valor: string }>;
  galeria: string[];
  seoTitulo: string | null;
  seoDesc: string | null;
}

const COLUMNAS_ERP =
  'id, nombre, sku, precio_venta, stock_actual, activo, destacado, imagen_url, ' +
  'marcas(nombre), categorias_productos(nombre)';

interface FilaErp {
  id: string; nombre: string; sku: string | null;
  precio_venta: number; stock_actual: number | null;
  activo: boolean; destacado: boolean | null; imagen_url: string | null;
  marcas: { nombre: string } | null;
  categorias_productos: { nombre: string } | null;
}

interface FilaWeb {
  producto_id: string; slug: string; publicado: boolean; orden: number;
  descripcion: string | null;
  ficha: Array<{ etiqueta: string; valor: string }> | null;
  galeria: string[] | null;
  seo_titulo: string | null; seo_desc: string | null;
}

function unir(erp: FilaErp, web?: FilaWeb): ProductoPanel {
  return {
    id: erp.id,
    nombre: erp.nombre,
    sku: erp.sku,
    precio: Number(erp.precio_venta ?? 0),
    stock: erp.stock_actual,
    activo: erp.activo,
    destacado: Boolean(erp.destacado),
    imagenUrl: erp.imagen_url,
    marca: erp.marcas?.nombre ?? null,
    categoria: erp.categorias_productos?.nombre ?? null,
    slug: web?.slug ?? null,
    publicado: Boolean(web?.publicado),
    orden: web?.orden ?? 0,
    descripcion: web?.descripcion ?? null,
    ficha: web?.ficha ?? [],
    galeria: web?.galeria ?? [],
    seoTitulo: web?.seo_titulo ?? null,
    seoDesc: web?.seo_desc ?? null,
  };
}

export async function listarProductos(opts: {
  busqueda?: string; soloSinPublicar?: boolean; pagina?: number; porPagina?: number;
} = {}): Promise<{ productos: ProductoPanel[]; total: number }> {
  const { busqueda, soloSinPublicar, pagina = 1, porPagina = 25 } = opts;
  const sb = clienteServidor();

  let q = sb.from('productos').select(COLUMNAS_ERP, { count: 'exact' }).eq('es_vendible', true);
  if (busqueda?.trim()) {
    const t = busqueda.trim();
    q = q.or(`nombre.ilike.%${t}%,sku.ilike.%${t}%`);
  }
  const desde = (pagina - 1) * porPagina;
  const { data, error, count } = await q
    .order('nombre').range(desde, desde + porPagina - 1);
  if (error) throw new Error(`No se pudo leer los productos: ${error.message}`);

  const filas = (data ?? []) as unknown as FilaErp[];
  const ids = filas.map((f) => f.id);

  const { data: web } = ids.length
    ? await sb.from('web_producto').select('*').in('producto_id', ids)
    : { data: [] };
  const porId = new Map(((web ?? []) as FilaWeb[]).map((w) => [w.producto_id, w]));

  let productos = filas.map((f) => unir(f, porId.get(f.id)));
  if (soloSinPublicar) productos = productos.filter((p) => !p.publicado);

  return { productos, total: count ?? productos.length };
}

export async function obtenerProductoPanel(id: string): Promise<ProductoPanel | null> {
  const sb = clienteServidor();
  const { data } = await sb.from('productos').select(COLUMNAS_ERP).eq('id', id).maybeSingle();
  if (!data) return null;
  const { data: web } = await sb
    .from('web_producto').select('*').eq('producto_id', id).maybeSingle();
  return unir(data as unknown as FilaErp, (web ?? undefined) as FilaWeb | undefined);
}

export interface CategoriaPanel {
  id: string; nombre: string; parentId: string | null; activo: boolean;
  slug: string | null; publicado: boolean; orden: number; destaque: number;
  imagenUrl: string | null; seoTitulo: string | null; seoDesc: string | null;
}

export async function listarCategorias(): Promise<CategoriaPanel[]> {
  const sb = clienteServidor();
  const [{ data: cats }, { data: web }] = await Promise.all([
    sb.from('categorias_productos').select('id, nombre, parent_id, activo, imagen_web_url, imagen_url').order('nombre'),
    sb.from('web_categoria').select('*'),
  ]);
  const porId = new Map((web ?? []).map((w) => [w.categoria_id, w]));
  return (cats ?? []).map((c) => {
    const w = porId.get(c.id);
    return {
      id: c.id, nombre: c.nombre, parentId: c.parent_id, activo: c.activo,
      slug: w?.slug ?? null,
      publicado: Boolean(w?.publicado),
      orden: w?.orden ?? 0,
      destaque: w?.destaque ?? 1,
      imagenUrl: w?.imagen_url ?? c.imagen_web_url ?? c.imagen_url ?? null,
      seoTitulo: w?.seo_titulo ?? null,
      seoDesc: w?.seo_desc ?? null,
    };
  });
}

export async function obtenerConfig() {
  const sb = clienteServidor();
  const empresa = await empresaId();
  const { data } = await sb.from('web_config').select('*').eq('empresa_id', empresa).maybeSingle();
  return data;
}

export async function listarPedidos() {
  const sb = clienteServidor();
  const { data, error } = await sb
    .from('web_pedido')
    .select('*, web_pedido_item(*)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(`No se pudo leer los pedidos: ${error.message}`);
  return data ?? [];
}

export async function resumenPanel() {
  const sb = clienteServidor();
  const [vendibles, publicados, sinImagen, pedidos] = await Promise.all([
    sb.from('productos').select('id', { count: 'exact', head: true }).eq('es_vendible', true),
    sb.from('web_producto').select('producto_id', { count: 'exact', head: true }).eq('publicado', true),
    sb.from('productos').select('id', { count: 'exact', head: true }).eq('es_vendible', true).is('imagen_url', null),
    sb.from('web_pedido').select('id', { count: 'exact', head: true }),
  ]);
  return {
    vendibles: vendibles.count ?? 0,
    publicados: publicados.count ?? 0,
    sinImagen: sinImagen.count ?? 0,
    pedidos: pedidos.count ?? 0,
  };
}
