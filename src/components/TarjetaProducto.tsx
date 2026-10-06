'use client';

import Link from 'next/link';
import { useTienda } from '@/lib/tienda/contexto';
import type { Producto } from '@/lib/catalogo/tipos';
import { EstadoStock, sePuedeComprar } from './EstadoStock';
import { FotoProducto } from './FotoProducto';
import { Precio } from './Precio';

export function TarjetaProducto({ producto }: { producto: Producto }) {
  const { agregar, alternarFavorito, esFavorito } = useTienda();
  const favorito = esFavorito(producto.id);
  const comprable = sePuedeComprar(producto.disponibilidad);

  return (
    <article className="group relative flex flex-col border border-linea transition-colors hover:border-total-300">
      <button
        type="button"
        onClick={() => alternarFavorito(producto.id)}
        aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        aria-pressed={favorito}
        className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white/95 transition-transform active:scale-90"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={favorito ? '#355DB4' : 'none'} stroke="#355DB4" strokeWidth="2" aria-hidden="true">
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        </svg>
      </button>

      <Link href={`/producto/${producto.slug}`} className="block overflow-hidden">
        <FotoProducto
          descripcion={producto.imagen}
          className="aspect-4/3 transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[11px] tracking-widest text-humo uppercase">
            {producto.marca}
          </span>
          <EstadoStock estado={producto.disponibilidad} />
        </div>

        <h3 className="text-[15px] leading-snug font-semibold">
          <Link href={`/producto/${producto.slug}`} className="hover:text-total-500">
            {producto.nombre}
          </Link>
        </h3>

        <p className="text-[13px] text-humo">{producto.specs.join(' · ')}</p>

        <div className="mt-auto pt-2">
          <Precio monto={producto.precio} anterior={producto.precioAnterior} />
        </div>

        {comprable ? (
          <button
            type="button"
            onClick={() => agregar(producto.id)}
            className="mt-1 w-full rounded-sm bg-total-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-total-600"
          >
            Agregar
          </button>
        ) : (
          <Link
            href={`/producto/${producto.slug}`}
            className="mt-1 w-full rounded-sm border border-carbon px-4 py-3 text-center text-sm font-bold transition-colors hover:bg-carbon hover:text-white"
          >
            Consultar disponibilidad
          </Link>
        )}
      </div>
    </article>
  );
}
