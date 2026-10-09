'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useTienda } from '@/lib/tienda/contexto';
import { guaranies } from '@/lib/formato';
import { ConsultarWhatsapp } from './ConsultarWhatsapp';
import { useProductos } from '@/lib/catalogo/useProductos';
import { FotoProducto } from './FotoProducto';

export function CarritoLateral({
  abierto, cerrar,
}: { abierto: boolean; cerrar: () => void }) {
  const { carrito, cambiarCantidad, quitar } = useTienda();
  // Se resuelven contra la base cada vez: el precio y el stock los manda el ERP
  // y pueden haber cambiado desde que el producto entró al carrito.
  const { productos } = useProductos(carrito.map((l) => l.productoId));

  // Cerrar con Escape y bloquear el scroll de fondo mientras está abierto
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar(); };
    window.addEventListener('keydown', alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = previo;
    };
  }, [abierto, cerrar]);

  const porId = new Map(productos.map((p) => [p.id, p]));
  const lineas = carrito.flatMap((l) => {
    const p = porId.get(l.productoId);
    return p ? [{ ...l, producto: p }] : [];
  });
  const subtotal = lineas.reduce((t, l) => t + l.producto.precio * l.cantidad, 0);

  const mensaje = lineas.length
    ? `Hola Total, quiero consultar por este carrito:\n${lineas
        .map((l) => `· ${l.producto.marca} ${l.producto.nombre} × ${l.cantidad}`)
        .join('\n')}`
    : '';

  return (
    <>
      <div
        onClick={cerrar}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-carbon/40 transition-opacity duration-300 ${
          abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-label="Carrito"
        aria-modal={abierto}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          abierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-linea px-5 py-4">
          <h2 className="text-lg font-bold">Carrito</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar carrito" className="p-2 text-2xl leading-none">
            ×
          </button>
        </header>

        {lineas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-humo">Tu carrito todavía está vacío.</p>
            <Link
              href="/productos"
              onClick={cerrar}
              className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600"
            >
              Explorar productos
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-linea overflow-y-auto">
              {lineas.map((l) => (
                <li key={l.productoId} className="flex gap-3 p-4">
                  <FotoProducto descripcion={l.producto.imagen} className="size-20 shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-mono text-[10px] tracking-widest text-humo uppercase">
                      {l.producto.marca}
                    </span>
                    <Link
                      href={`/producto/${l.producto.slug}`}
                      onClick={cerrar}
                      className="text-sm leading-snug font-semibold hover:text-total-500"
                    >
                      {l.producto.nombre}
                    </Link>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex items-center border border-linea">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(l.productoId, l.cantidad - 1)}
                          disabled={l.cantidad <= 1}
                          aria-label="Quitar una unidad"
                          className="px-2.5 py-1 text-sm disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">{l.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(l.productoId, l.cantidad + 1)}
                          aria-label="Agregar una unidad"
                          className="px-2.5 py-1 text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold">
                        {guaranies(l.producto.precio * l.cantidad)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => quitar(l.productoId)}
                      className="mt-1 self-start text-xs text-humo underline hover:text-carbon"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-linea p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-humo">Subtotal</span>
                <span className="text-xl font-bold">{guaranies(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-humo">
                El costo de envío se confirma según la dirección.
              </p>
              <Link
                href="/checkout"
                onClick={cerrar}
                className="mt-4 block rounded-sm bg-total-500 px-5 py-3.5 text-center text-sm font-bold text-white hover:bg-total-600"
              >
                Finalizar compra
              </Link>
              <div className="mt-2 flex justify-center">
                <ConsultarWhatsapp
                  mensaje={mensaje}
                  className="cursor-pointer py-2 text-sm font-semibold text-total-500 hover:underline"
                >
                  Consultar este carrito por WhatsApp
                </ConsultarWhatsapp>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
