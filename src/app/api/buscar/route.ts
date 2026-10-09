import { NextResponse } from 'next/server';
import { sugerencias } from '@/lib/catalogo/servicio';

/** Buscador instantáneo: productos, categorías y marcas. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  try {
    return NextResponse.json(await sugerencias(q));
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
