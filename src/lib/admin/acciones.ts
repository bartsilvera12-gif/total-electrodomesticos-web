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

export async function guardarProducto(datos: {
  productoId: string;
  slug: string;
  publicado: boolean;
  orden: number;
  descripcion: string;
  ficha: Array<{ etiqueta: string; valor: string }>;
  galeria: string[];
  seoTitulo: string;
  seoDesc: string;
}) {
  await exigirAdmin();
  const empresa = await empresaId();
  const slug = slugificar(datos.slug) || datos.productoId;

  const { error } = await supa().from('web_producto').upsert({
    producto_id: datos.productoId,
    empresa_id: empresa,
    slug,
    publicado: datos.publicado,
    orden: datos.orden,
    descripcion: datos.descripcion || null,
    ficha: datos.ficha,
    galeria: datos.galeria,
    seo_titulo: datos.seoTitulo || null,
    seo_desc: datos.seoDesc || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw traducir(error, slug);
  return { slug };
}

/** Publica o despublica desde la tabla, sin entrar al detalle. */
export async function alternarPublicado(productoId: string, publicado: boolean) {
  await exigirAdmin();
  const sb = supa();
  const empresa = await empresaId();

  const { data: existente } = await sb
    .from('web_producto').select('slug').eq('producto_id', productoId).maybeSingle();

  if (existente) {
    const { error } = await sb.from('web_producto')
      .update({ publicado, updated_at: new Date().toISOString() })
      .eq('producto_id', productoId);
    if (error) throw traducir(error);
    return;
  }

  // Primera vez que se publica: hace falta un enlace, se arma del nombre
  const { data: p } = await sb
    .from('productos').select('nombre, sku').eq('id', productoId).maybeSingle();
  const base = slugificar(`${p?.nombre ?? ''} ${p?.sku ?? ''}`) || productoId;
  const { error } = await sb.from('web_producto').insert({
    producto_id: productoId, empresa_id: empresa, slug: base, publicado,
  });
  if (error) throw traducir(error, base);
}

/** El destacado vive en el ERP (`productos.destacado`), no en la capa web. */
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
  const slug = slugificar(datos.slug) || datos.categoriaId;

  const { error } = await supa().from('web_categoria').upsert({
    categoria_id: datos.categoriaId,
    empresa_id: empresa,
    slug,
    publicado: datos.publicado,
    orden: datos.orden,
    destaque: datos.destaque,
    imagen_url: datos.imagenUrl || null,
    seo_titulo: datos.seoTitulo || null,
    seo_desc: datos.seoDesc || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw traducir(error, slug);
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
