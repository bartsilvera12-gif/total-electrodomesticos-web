import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase.
 *
 * La web se sirve como archivos estáticos, así que no hay servidor: todo lo
 * resuelve el navegador. La clave anon es pública por diseño —va en el bundle y
 * se ve en el inspector— y lo que protege los datos es el RLS.
 *
 * REGLA QUE NO SE NEGOCIA: la tienda lee por las vistas `web_catalogo`,
 * `web_categoria_publica` y `web_marca_publica`. Nunca `total.productos`, que
 * tiene `costo_promedio`. Las vistas no la incluyen, y además el RLS del ERP
 * bloquea esa tabla a quien no sea del ERP.
 */

export const SUPA_URL = 'https://api.neura.com.py';

// Clave anon de la Supabase compartida. Es pública: identifica al proyecto, no
// autoriza nada por sí sola.
export const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc0MTAxNDYxLCJleHAiOjE5MzE3ODE0NjF9.7_wAph8IolPMXtgfpezSwS5XR62IdD__qhqCywLDp3Q';

export const SCHEMA = 'total';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClienteTotal = SupabaseClient<any, any, any, any, any>;

let instancia: ClienteTotal | null = null;

/**
 * Una sola instancia: así la sesión se comparte entre todas las pantallas.
 * Solo para el navegador — guarda la sesión, que necesita localStorage.
 */
export function supa(): ClienteTotal {
  if (typeof window === 'undefined') {
    throw new Error('supa() es del navegador. En el build usá supaBuild().');
  }
  if (!instancia) {
    instancia = createClient(SUPA_URL, SUPA_KEY, {
      db: { schema: SCHEMA },
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return instancia;
}

/**
 * Para leer durante el build, cuando todavía no hay navegador.
 * Sin sesión: solo ve lo público, que es justo lo que se va a generar.
 */
export function supaBuild(): ClienteTotal {
  return createClient(SUPA_URL, SUPA_KEY, {
    db: { schema: SCHEMA },
    auth: { persistSession: false },
  });
}

/** Bucket publico donde el ERP deja las fotos de producto. */
export const BUCKET_PRODUCTOS = 'productos-imagenes';

/**
 * URL publica de una foto subida desde el ERP.
 *
 * El ERP guarda la foto en el bucket y deja en el producto el `imagen_path`
 * (`{empresa_id}/{producto_id}/principal.jpg`), con `imagen_url` en null. El
 * bucket es publico, asi que la URL se arma sin firmar nada: la web es
 * estatica y no tiene servidor que pueda firmar.
 *
 * `imagen_url` sigue existiendo para fotos alojadas afuera, pegadas a mano.
 */
export function urlPublicaImagen(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const limpio = path.replace(/^\/+/, '');
  return `${SUPA_URL}/storage/v1/object/public/${BUCKET_PRODUCTOS}/${limpio
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}
