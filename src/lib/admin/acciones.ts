'use server';

import { revalidatePath } from 'next/cache';
import { clienteServidor } from '@/lib/supabase/cliente';
import { slugificar } from '@/lib/formato';
import { empresaId, obtenerAdministrador } from './sesion';

/**
 * Escrituras del panel.
 *
 * Todas pasan por acá y todas validan la sesión primero: son Server Actions, o
 * sea endpoints públicos, y sin el control cualquiera podría invocarlas.
 *
 * Usan el service role porque las tablas `web_*` no son escribibles desde el
 * navegador a propósito.
 */

async function exigirAdmin() {
  const admin = await obtenerAdministrador();
  if (!admin) throw new Error('Sesión vencida. Volvé a ingresar al panel.');
  return admin;
}

function refrescarTienda(extra: string[] = []) {
  // La tienda se renderiza en el servidor: sin esto el cambio no se ve.
  ['/', '/productos', '/ofertas', '/novedades', '/categorias', '/marcas', ...extra]
    .forEach((r) => revalidatePath(r));
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
  const sb = clienteServidor();
  const empresa = await empresaId();

  const slug = slugificar(datos.slug) || datos.productoId;

  const { error } = await sb.from('web_producto').upsert({
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

  if (error) {
    // El índice único es (empresa, slug): el choque más probable es ese
    if (error.code === '23505') throw new Error(`Ya hay otro producto con el enlace "${slug}".`);
    throw new Error(`No se pudo guardar: ${error.message}`);
  }

  refrescarTienda([`/producto/${slug}`]);
  revalidatePath('/admin/productos');
  return { slug };
}

/** Alta rápida: publica o despublica desde la tabla, sin entrar al detalle. */
export async function alternarPublicado(productoId: string, publicado: boolean) {
  await exigirAdmin();
  const sb = clienteServidor();
  const empresa = await empresaId();

  const { data: existente } = await sb
    .from('web_producto').select('slug').eq('producto_id', productoId).maybeSingle();

  if (existente) {
    const { error } = await sb.from('web_producto')
      .update({ publicado, updated_at: new Date().toISOString() })
      .eq('producto_id', productoId);
    if (error) throw new Error(error.message);
  } else {
    // Primera vez que se publica: hace falta un enlace. Se arma del nombre.
    const { data: p } = await sb
      .from('productos').select('nombre, sku').eq('id', productoId).maybeSingle();
    const base = slugificar(`${p?.nombre ?? ''} ${p?.sku ?? ''}`) || productoId;
    const { error } = await sb.from('web_producto').insert({
      producto_id: productoId, empresa_id: empresa, slug: base, publicado,
    });
    if (error) throw new Error(error.message);
  }

  refrescarTienda();
  revalidatePath('/admin/productos');
}

/** El destacado vive en el ERP (`productos.destacado`), no en la capa web. */
export async function alternarDestacado(productoId: string, destacado: boolean) {
  await exigirAdmin();
  const sb = clienteServidor();
  const { error } = await sb.from('productos').update({ destacado }).eq('id', productoId);
  if (error) throw new Error(error.message);
  refrescarTienda();
  revalidatePath('/admin/productos');
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
  const sb = clienteServidor();
  const empresa = await empresaId();
  const slug = slugificar(datos.slug) || datos.categoriaId;

  const { error } = await sb.from('web_categoria').upsert({
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
  if (error) {
    if (error.code === '23505') throw new Error(`Ya hay otra categoría con el enlace "${slug}".`);
    throw new Error(`No se pudo guardar: ${error.message}`);
  }

  refrescarTienda([`/categoria/${slug}`]);
  revalidatePath('/admin/categorias');
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
  const sb = clienteServidor();
  const empresa = await empresaId();

  const { error } = await sb.from('web_config').upsert({
    empresa_id: empresa,
    barra_superior: datos.barraSuperior || null,
    hero_titulo: datos.heroTitulo || null,
    hero_bajada: datos.heroBajada || null,
    seo_titulo: datos.seoTitulo || null,
    seo_desc: datos.seoDesc || null,
    bloques: datos.bloques,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`No se pudo guardar: ${error.message}`);

  refrescarTienda();
  revalidatePath('/admin/home');
}

// ── Pedidos ──────────────────────────────────────────────────────────────────

export async function cambiarEstadoPedido(pedidoId: string, estado: string) {
  await exigirAdmin();
  const sb = clienteServidor();
  const { error } = await sb.from('web_pedido')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', pedidoId);
  if (error) throw new Error(`No se pudo actualizar: ${error.message}`);
  revalidatePath('/admin/pedidos');
  revalidatePath('/cuenta');
}
