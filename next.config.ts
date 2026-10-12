import type { NextConfig } from 'next';

/**
 * Export estático: Hostinger sirve archivos, no corre Node.
 *
 * Por eso no hay rutas de API, ni server actions, ni middleware. Todo lo que
 * antes resolvía el servidor lo resuelve el navegador contra Supabase: la clave
 * anon es pública por diseño y lo que protege los datos es el RLS.
 *
 * `trailingSlash` hace que cada ruta se escriba como carpeta con su index.html,
 * que es lo que entiende Apache sin configuración extra.
 */
const config: NextConfig = {
  output: 'export',
  // El panel tiene /admin/productos/[id]: en estático hace falta una página por
  // id. Como los ids salen de la base y cambian, se usa una sola que resuelve
  // el id en el navegador (ver generateStaticParams en esa ruta).
  trailingSlash: true,
  images: {
    // El optimizador de imágenes necesita servidor; en estático se sirven tal cual
    unoptimized: true,
  },
};

export default config;
