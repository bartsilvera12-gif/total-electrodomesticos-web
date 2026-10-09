import type { MetadataRoute } from 'next';
import { ESPACIOS } from '@/lib/catalogo/mock';
import { buscarProductos, obtenerMarcas, obtenerRubros } from '@/lib/catalogo/servicio';
import { slugificar } from '@/lib/formato';
import { SITIO } from '@/lib/sitio';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (ruta: string) => `${SITIO.url}${ruta}`;

  // El sitemap sale de la base. Con el catálogo real son miles de URLs, así que
  // se pide una tanda grande en una sola consulta en vez de producto por producto.
  const [RUBROS, MARCAS, catalogo] = await Promise.all([
    obtenerRubros(),
    obtenerMarcas(),
    buscarProductos({ porPagina: 5000 }),
  ]);
  const PRODUCTOS = catalogo.productos;
  const ahora = new Date();

  return [
    { url: u('/'), lastModified: ahora, changeFrequency: 'daily', priority: 1 },
    { url: u('/productos'), lastModified: ahora, changeFrequency: 'daily', priority: 0.9 },
    { url: u('/categorias'), lastModified: ahora, changeFrequency: 'weekly', priority: 0.7 },
    { url: u('/marcas'), lastModified: ahora, changeFrequency: 'weekly', priority: 0.6 },
    { url: u('/ofertas'), lastModified: ahora, changeFrequency: 'daily', priority: 0.8 },
    { url: u('/novedades'), lastModified: ahora, changeFrequency: 'daily', priority: 0.7 },
    ...RUBROS.map((r) => ({
      url: u(`/categoria/${r.slug}`), lastModified: ahora,
      changeFrequency: 'weekly' as const, priority: 0.8,
    })),
    ...RUBROS.flatMap((r) => r.subcategorias.map((s) => ({
      url: u(`/categoria/${slugificar(s)}`), lastModified: ahora,
      changeFrequency: 'weekly' as const, priority: 0.7,
    }))),
    ...MARCAS.map((m) => ({
      url: u(`/marca/${slugificar(m)}`), lastModified: ahora,
      changeFrequency: 'weekly' as const, priority: 0.6,
    })),
    ...ESPACIOS.map((e) => ({
      url: u(`/espacio/${e.slug}`), lastModified: ahora,
      changeFrequency: 'monthly' as const, priority: 0.5,
    })),
    ...PRODUCTOS.map((p) => ({
      url: u(`/producto/${p.slug}`), lastModified: ahora,
      changeFrequency: 'weekly' as const, priority: 0.7,
    })),
  ];
}
