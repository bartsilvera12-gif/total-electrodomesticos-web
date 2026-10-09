import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * El genérico de SupabaseClient fija el schema en el tipo, y como acá no es
 * `public` hay que aflojarlo. Mismo criterio que usa el ERP.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClienteTotal = SupabaseClient<any, any, any, any, any>;

/**
 * Clientes de Supabase.
 *
 * La web comparte el schema `total` con el ERP: el ERP es la fuente de verdad
 * de producto, precio y stock, así que no hay nada que sincronizar.
 *
 * REGLA QUE NO SE NEGOCIA: la tienda lee por las vistas `web_catalogo`,
 * `web_categoria_publica` y `web_marca_publica`. Nunca `total.productos`, que
 * tiene la columna `costo_promedio`. Las vistas no la incluyen.
 */

export const SCHEMA = 'total';

function requerido(nombre: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. En local va en .env.local; en Vercel, en Settings → Environment Variables.`,
    );
  }
  return valor;
}

/**
 * Cliente público: el que usa el navegador y el render de la tienda.
 * Con la anon key solo alcanza lo que el RLS permite, que son las vistas
 * del catálogo y los pedidos propios.
 */
export function clientePublico(): ClienteTotal {
  return createClient(
    requerido('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    requerido('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    { db: { schema: SCHEMA }, auth: { persistSession: false } },
  );
}

/**
 * Cliente con service role. SOLO del lado del servidor.
 *
 * Saltea el RLS, así que nunca puede terminar en un componente de cliente ni en
 * una variable NEXT_PUBLIC_. Se usa para el panel y para crear pedidos, que es
 * donde hay que validar precios contra el ERP en vez de confiar en el navegador.
 */
export function clienteServidor(): ClienteTotal {
  if (typeof window !== 'undefined') {
    throw new Error('clienteServidor() no puede usarse en el navegador: expondría la service role key.');
  }
  return createClient(
    requerido('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    requerido('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
    { db: { schema: SCHEMA }, auth: { autoRefreshToken: false, persistSession: false } },
  );
}
