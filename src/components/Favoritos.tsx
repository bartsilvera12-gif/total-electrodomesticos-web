'use client';

import Link from 'next/link';
import { PRODUCTOS } from '@/lib/catalogo/mock';
import { useTienda } from '@/lib/tienda/contexto';
import { GrillaProductos } from './GrillaProductos';

export function Favoritos() {
  const { favoritos, listo } = useTienda();
  const productos = PRODUCTOS.filter((p) => favoritos.includes(p.id));

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <h1 className="text-[clamp(28px,3.5vw,42px)] font-bold tracking-tight">Favoritos</h1>

      {!listo ? (
        <p className="py-16 text-center text-humo">Cargando…</p>
      ) : productos.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-lg font-semibold">Todavía no guardaste ningún producto.</p>
          <p className="max-w-sm text-sm text-humo">
            Tocá el corazón en cualquier producto para tenerlo a mano.
          </p>
          <Link href="/productos" className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <GrillaProductos productos={productos} />
        </div>
      )}
    </div>
  );
}
