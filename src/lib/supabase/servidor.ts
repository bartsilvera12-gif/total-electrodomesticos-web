import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SCHEMA } from './cliente';

/**
 * Cliente de Supabase atado a las cookies de la request.
 *
 * Es el que sostiene la sesión del panel: `@supabase/ssr` guarda el token en
 * cookies para que el servidor sepa quién está logueado.
 */
export async function clienteConSesion() {
  const almacen = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: SCHEMA },
      cookies: {
        getAll: () => almacen.getAll(),
        setAll: (lista) => {
          try {
            lista.forEach(({ name, value, options }) => almacen.set(name, value, options));
          } catch {
            // Los Server Components no pueden escribir cookies. El middleware
            // refresca la sesión, así que acá se puede ignorar.
          }
        },
      },
    },
  );
}
