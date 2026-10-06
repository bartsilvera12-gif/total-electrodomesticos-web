import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/sitio';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Pantallas privadas o sin valor en buscadores
      disallow: ['/checkout', '/confirmacion', '/cuenta', '/favoritos', '/admin', '/prototipo'],
    },
    sitemap: `${SITIO.url}/sitemap.xml`,
  };
}
