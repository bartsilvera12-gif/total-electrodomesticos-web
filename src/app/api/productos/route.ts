import { NextResponse } from 'next/server';
import { obtenerProductosPorId } from '@/lib/catalogo/servicio';

/**
 * Productos por id. Lo usan el carrito, los favoritos y el checkout, que
 * guardan ids en el navegador y necesitan los datos frescos —sobre todo el
 * precio y el stock, que los manda el ERP.
 */
export async function GET(req: Request) {
  const ids = new URL(req.url).searchParams.get('ids')?.split(',').filter(Boolean) ?? [];
  if (!ids.length) return NextResponse.json({ productos: [] });
  try {
    return NextResponse.json({ productos: await obtenerProductosPorId(ids) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
