import { NextResponse } from 'next/server';
import { buscarProductos } from '@/lib/catalogo/servicio';
import type { Disponibilidad } from '@/lib/catalogo/tipos';

/**
 * Catálogo paginado para el filtrado del lado del cliente.
 *
 * Existe para que el navegador no reciba el catálogo entero: con el catálogo
 * real son miles de artículos. Filtra y pagina en la base.
 */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const lista = (k: string) => p.get(k)?.split(',').filter(Boolean) ?? [];
  const num = (k: string) => (p.get(k) ? Number(p.get(k)) : undefined);

  try {
    const r = await buscarProductos({
      rubro: p.get('rubro') || undefined,
      subcategoria: p.get('subcategoria') || undefined,
      marcas: lista('marcas'),
      disponibilidad: lista('disponibilidad') as Disponibilidad[],
      precioMin: num('precioMin'),
      precioMax: num('precioMax'),
      soloOfertas: p.get('ofertas') === '1',
      orden: (p.get('orden') as 'relevancia' | 'precio-asc' | 'precio-desc' | 'nuevos') || 'relevancia',
      busqueda: p.get('q') || undefined,
      pagina: Number(p.get('pagina') ?? 1),
      porPagina: Number(p.get('porPagina') ?? 12),
    });
    return NextResponse.json(r);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
