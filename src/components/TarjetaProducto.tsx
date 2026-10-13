'use client';

import Link from 'next/link';
import { useTienda } from '@/lib/tienda/contexto';
import type { Producto } from '@/lib/catalogo/tipos';
import { EstadoStock, sePuedeComprar } from './EstadoStock';
import { FotoProducto } from './FotoProducto';
import { Precio } from './Precio';

export function TarjetaProducto({ producto }: { producto: Producto }) {
  const { agregar, cambiarCantidad, quitar, carrito, alternarFavorito, esFavorito } = useTienda();
  const favorito = esFavorito(producto.id);
  const comprable = sePuedeComprar(producto.disponibilidad);
  // Cuántas unidades de ESTE producto ya hay en el carrito. Mientras sea 0 se
  // muestra "Agregar"; apenas hay una, el botón pasa a ser el contador, así no
  // hay que abrir el carrito para saber cuánto se lleva.
  const enCarrito = carrito.find((l) => l.productoId === producto.id)?.cantidad ?? 0;

  return (
    // `h-full` para que la tarjeta ocupe toda la celda de la grilla: sin esto,
    // las de nombre corto quedaban mas bajas y los botones no alineaban.
    <article className="group relative flex h-full flex-col border border-linea transition-colors hover:border-total-300">
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
          url={producto.imagenUrl}
          className="aspect-4/3 transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* En celular la tarjeta mide ~170px: la marca y el estado no entran
            en una sola linea, y el chip terminaba montado sobre la marca.
            `min-w-0` + `truncate` achican la marca; `shrink-0` deja el chip
            entero, y si aun asi no entran, la fila se apila. */}
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
          <span className="min-w-0 truncate font-mono text-[11px] tracking-widest text-humo uppercase">
            {producto.marca}
          </span>
          <EstadoStock estado={producto.disponibilidad} />
        </div>

        <h3 className="text-[15px] leading-snug font-semibold break-words">
          <Link href={`/producto/${producto.slug}`} className="hover:text-total-500">
            {producto.nombre}
          </Link>
        </h3>

        <p className="text-[13px] break-words text-humo">{producto.specs.join(' · ')}</p>

        <div className="mt-auto pt-2">
          <Precio monto={producto.precio} anterior={producto.precioAnterior} />
        </div>

        {comprable ? (
          enCarrito > 0 ? (
            <div className="mt-1 flex items-stretch overflow-hidden rounded-sm border border-total-500">
              <button
                type="button"
                onClick={() =>
                  enCarrito > 1 ? cambiarCantidad(producto.id, enCarrito - 1) : quitar(producto.id)
                }
                aria-label={enCarrito > 1 ? 'Quitar una unidad' : 'Sacar del carrito'}
                className="px-3 py-3 text-lg leading-none font-bold text-total-500 transition-colors hover:bg-total-50"
              >
                −
              </button>
              <span className="flex flex-1 items-center justify-center gap-1.5 px-1 text-sm font-bold text-total-600 tabular-nums">
                {enCarrito}
                <span className="text-[11px] font-semibold text-humo">
                  {enCarrito === 1 ? 'en el carrito' : 'en el carrito'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => agregar(producto.id)}
                aria-label="Agregar una unidad"
                className="px-3 py-3 text-lg leading-none font-bold text-total-500 transition-colors hover:bg-total-50"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => agregar(producto.id)}
              className="mt-1 w-full rounded-sm bg-total-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-total-600"
            >
              Agregar
            </button>
          )
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
