'use client';

import { supa } from '@/lib/supabase/cliente';
import { slugificar } from '@/lib/formato';
import { empresaId, obtenerAdministrador } from './sesion';

/**
 * Escrituras del panel.
 *
 * Van directo a Supabase con la sesión del administrador. No hay service role
 * acá: la web es estática y una clave así no puede vivir en el navegador.
 *
 * Quien autoriza es el RLS, con `total.es_admin_web()`. El control que hacemos
 * antes de cada escritura es para dar un mensaje claro, no para proteger: si
 * alguien lo saltea, la base igual lo rechaza.
 */

async function exigirAdmin() {
  const admin = await obtenerAdministrador();
  if (!admin) throw new Error('Sesión vencida. Volvé a ingresar al panel.');
  return admin;
}

function traducir(error: { code?: string; message: string }, slug?: string): Error {
  if (error.code === '23505') return new Error(`Ya hay otro elemento con el enlace "${slug}".`);
  if (error.code === '42501') {
    return new Error('Tu usuario no tiene permiso para esto. Tiene que ser admin del ERP.');
  }
  return new Error(`No se pudo guardar: ${error.message}`);
}

// ── Productos ────────────────────────────────────────────────────────────────

/**
 * Contenido editorial del producto.
 *
 * Qué se publica, en qué orden y con qué dirección NO se toca acá: eso vive en
 * `productos` y se marca desde Inventario del ERP. Lo de acá es lo que el ERP
 * no tiene por qué cargar: el texto comercial largo, la ficha, la galería y el SEO.
 */
export async function guardarProducto(datos: {
  productoId: string;
  descripcion: string;
  ficha: Array<{ etiqueta: string; valor: string }>;
  galeria: string[];
  seoTitulo: string;
  seoDesc: string;
}) {
  await exigirAdmin();
  const empresa = await empresaId();

  const { error } = await supa().from('web_producto').upsert({
    producto_id: datos.productoId,
    empresa_id: empresa,
    // `slug` quedó obsoleta en esta tabla, pero sigue siendo NOT NULL:
    // se guarda el id para no chocar con el índice único.
    slug: datos.productoId,
    descripcion: datos.descripcion || null,
    ficha: datos.ficha,
    galeria: datos.galeria,
    seo_titulo: datos.seoTitulo || null,
    seo_desc: datos.seoDesc || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw traducir(error);
}

/**
 * Publica o saca un producto de la tienda.
 *
 * Escribe en `productos.visible_web`, el mismo campo que marca el ERP en
 * Inventario: hay un solo lugar donde vive la decisión, se toque desde donde
 * se toque.
 */
export async function alternarPublicado(productoId: string, publicado: boolean) {
  await exigirAdmin();
  const cambios: Record<string, unknown> = { visible_web: publicado };
  // Sacarlo de la tienda también lo saca de los destacados: no tendría dónde verse
  if (!publicado) cambios.destacado = false;

  const { error } = await supa().from('productos').update(cambios).eq('id', productoId);
  if (error) throw traducir(error);
}

export async function alternarDestacado(productoId: string, destacado: boolean) {
  await exigirAdmin();
  const { error } = await supa().from('productos').update({ destacado }).eq('id', productoId);
  if (error) throw traducir(error);
}

// ── Categorías ───────────────────────────────────────────────────────────────

export async function guardarCategoria(datos: {
  categoriaId: string;
  slug: string;
  publicado: boolean;
  orden: number;
  destaque: number;
  imagenUrl: string;
  seoTitulo: string;
  seoDesc: string;
}) {
  await exigirAdmin();
  const empresa = await empresaId();
  const slug = slugificar(datos.slug) || null;
  const sb = supa();

  // Lo que ve el cliente va en la tabla del ERP: es lo mismo que se marca en
  // Inventario → Categorías.
  const { error: errErp } = await sb.from('categorias_productos').update({
    visible_web: datos.publicado,
    orden_web: datos.orden,
    destaque_web: datos.destaque,
    imagen_web_url: datos.imagenUrl || null,
    slug_web: slug,
  }).eq('id', datos.categoriaId);
  if (errErp) throw traducir(errErp, slug ?? undefined);

  // El SEO es del sitio y el ERP no lo necesita
  const { error } = await sb.from('web_categoria').upsert({
    categoria_id: datos.categoriaId,
    empresa_id: empresa,
    slug: datos.categoriaId,
    publicado: datos.publicado,
    orden: datos.orden,
    destaque: datos.destaque,
    seo_titulo: datos.seoTitulo || null,
    seo_desc: datos.seoDesc || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw traducir(error);
}

// ── Home ─────────────────────────────────────────────────────────────────────

export async function guardarConfig(datos: {
  barraSuperior: string;
  heroTitulo: string;
  heroBajada: string;
  seoTitulo: string;
  seoDesc: string;
  bloques: Array<{ id: string; nombre: string; visible: boolean }>;
}) {
  await exigirAdmin();
  const empresa = await empresaId();

  const { error } = await supa().from('web_config').upsert({
    empresa_id: empresa,
    barra_superior: datos.barraSuperior || null,
    hero_titulo: datos.heroTitulo || null,
    hero_bajada: datos.heroBajada || null,
    seo_titulo: datos.seoTitulo || null,
    seo_desc: datos.seoDesc || null,
    bloques: datos.bloques,
    updated_at: new Date().toISOString(),
  });
  if (error) throw traducir(error);
}

// ── Pedidos ──────────────────────────────────────────────────────────────────

export async function cambiarEstadoPedido(pedidoId: string, estado: string) {
  await exigirAdmin();
  const { error } = await supa().from('web_pedido')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', pedidoId);
  if (error) throw traducir(error);
}

// ── Banners de la portada ────────────────────────────────────────────────────

export interface BannerEntrada {
  /** Sin id = banner nuevo. */
  id?: string;
  titulo: string;
  bajada: string;
  imagenUrl: string;
  enlace: string;
  activo: boolean;
  orden: number;
}

/** Crea o actualiza un banner. Devuelve el id (util para el que recien nace). */
export async function guardarBanner(datos: BannerEntrada): Promise<string> {
  await exigirAdmin();
  const empresa = await empresaId();

  const fila = {
    empresa_id: empresa,
    titulo: datos.titulo.trim(),
    bajada: datos.bajada.trim() || null,
    imagen_url: datos.imagenUrl.trim() || null,
    enlace: datos.enlace.trim() || null,
    activo: datos.activo,
    orden: datos.orden,
  };

  const q = datos.id
    ? supa().from('web_banner').update(fila).eq('id', datos.id).select('id').maybeSingle()
    : supa().from('web_banner').insert(fila).select('id').maybeSingle();

  const { data, error } = await q;
  if (error) throw traducir(error);
  const id = (data as { id?: string } | null)?.id ?? datos.id;
  if (!id) throw new Error('No se pudo guardar el banner.');
  return id;
}

export async function borrarBanner(bannerId: string) {
  await exigirAdmin();
  const { error } = await supa().from('web_banner').delete().eq('id', bannerId);
  if (error) throw traducir(error);
}

/** Reescribe el orden de toda la lista en una sola pasada. */
export async function reordenarBanners(ids: string[]) {
  await exigirAdmin();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supa().from('web_banner').update({ orden: i }).eq('id', ids[i]);
    if (error) throw traducir(error);
  }
}
