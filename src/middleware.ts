import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refresca la sesión de Supabase en cada request del panel.
 *
 * Sin esto el token vence y el panel empieza a mandar al login sin motivo
 * aparente. Solo corre bajo /admin: la tienda es pública y no necesita sesión.
 */
export async function middleware(req: NextRequest) {
  // El layout del panel necesita saber la ruta para dejar pasar el login.
  // Next no la expone en headers(), así que se agrega acá.
  const cabeceras = new Headers(req.headers);
  cabeceras.set('x-pathname', req.nextUrl.pathname);

  let res = NextResponse.next({ request: { headers: cabeceras } });

  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (lista) => {
          lista.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: { headers: cabeceras } });
          lista.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );

  await sb.auth.getUser();
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
