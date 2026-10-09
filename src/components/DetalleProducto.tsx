'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Producto, Rubro } from '@/lib/catalogo/tipos';
import { guaranies } from '@/lib/formato';
import { ConsultarWhatsapp } from './ConsultarWhatsapp';
import { useTienda } from '@/lib/tienda/contexto';
import { EstadoStock, sePuedeComprar } from './EstadoStock';
import { FotoProducto } from './FotoProducto';
import { Precio } from './Precio';
import { TarjetaProducto } from './TarjetaProducto';

const SOLAPAS = [
  { id: 'caracteristicas', etiqueta: 'Características principales' },
  { id: 'ficha', etiqueta: 'Ficha técnica' },
  { id: 'descripcion', etiqueta: 'Descripción' },
  { id: 'garantia', etiqueta: 'Garantía' },
] as const;

export function DetalleProducto({
  producto, relacionados, rubro,
}: { producto: Producto; relacionados: Producto[]; rubro: Rubro | null }) {
  const { agregar, alternarFavorito, esFavorito } = useTienda();
  const router = useRouter();
  const [cantidad, setCantidad] = useState(1);
  const [solapa, setSolapa] = useState<(typeof SOLAPAS)[number]['id']>('caracteristicas');
  const [comparar, setComparar] = useState<string>(relacionados[0]?.id ?? '');

  const comprable = sePuedeComprar(producto.disponibilidad);
  const favorito = esFavorito(producto.id);
  const comparado = relacionados.find((r) => r.id === comparar);

  const comprarAhora = () => {
    agregar(producto.id, cantidad);
    router.push('/checkout');
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <nav aria-label="Migas" className="mb-6 flex flex-wrap gap-1.5 text-[13px] text-humo">
        <Link href="/" className="hover:text-total-500">Inicio</Link>
        <span>/</span>
        {rubro && (
          <>
            <Link href={`/categoria/${rubro.slug}`} className="hover:text-total-500">{rubro.nombre}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-carbon">{producto.nombre}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <FotoProducto descripcion={producto.imagen} className="aspect-4/3 w-full" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <FotoProducto
                key={i}
                descripcion={i === 0 ? producto.imagen : 'pendiente'}
                className={`aspect-square ${i === 0 ? 'ring-2 ring-total-500' : ''}`}
              />
            ))}
          </div>
          <p className="mt-3 text-[13px] text-humo">
            Las imágenes se cargan desde el panel web. Todavía no hay fotos para este artículo.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/marca/${producto.marca.toLowerCase()}`}
              className="font-mono text-[11px] tracking-widest text-humo uppercase hover:text-total-500"
            >
              {producto.marca}
            </Link>
            <EstadoStock estado={producto.disponibilidad} />
          </div>

          <h1 className="text-[clamp(26px,3vw,38px)] leading-tight font-bold tracking-tight">
            {producto.nombre}
          </h1>

          <p className="text-grafito">{producto.specs.join(' · ')}</p>
          <p className="font-mono text-[12px] text-humo">Código {producto.codigo}</p>

          <Precio monto={producto.precio} anterior={producto.precioAnterior} tamano="grande" />

          {comprable ? (
            <>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">Cantidad</span>
                <div className="flex items-center border border-linea">
                  <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Quitar una unidad" className="px-3.5 py-2">−</button>
                  <span className="min-w-10 text-center font-semibold">{cantidad}</span>
                  <button type="button" onClick={() => setCantidad((c) => c + 1)} aria-label="Agregar una unidad" className="px-3.5 py-2">+</button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => agregar(producto.id, cantidad)}
                  className="flex-1 rounded-sm bg-total-500 px-6 py-4 text-[15px] font-bold text-white hover:bg-total-600"
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  onClick={comprarAhora}
                  className="flex-1 rounded-sm border border-carbon px-6 py-4 text-[15px] font-bold hover:bg-carbon hover:text-white"
                >
                  Comprar ahora
                </button>
              </div>
            </>
          ) : (
            <div className="border border-linea bg-total-50 p-4">
              <p className="text-sm font-semibold">
                {producto.disponibilidad === 'sin-stock'
                  ? 'Este producto está sin stock.'
                  : 'Consultá disponibilidad antes de comprar.'}
              </p>
              <p className="mt-1 text-sm text-humo">
                Escribinos y te confirmamos cuándo vuelve a ingresar.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <ConsultarWhatsapp
              mensaje={`Hola Total, quiero consultar por: ${producto.marca} ${producto.nombre} (cód. ${producto.codigo})`}
              className="cursor-pointer text-sm font-semibold text-total-500 hover:underline"
            >
              Consultar por WhatsApp sobre este producto
            </ConsultarWhatsapp>
            <button
              type="button"
              onClick={() => alternarFavorito(producto.id)}
              className="text-sm text-humo hover:text-carbon"
            >
              {favorito ? '♥ En favoritos' : '♡ Agregar a favoritos'}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-carbon pt-8">
        <div className="flex flex-wrap gap-6 border-b border-linea">
          {SOLAPAS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSolapa(s.id)}
              className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
                solapa === s.id ? 'border-total-500 text-total-500' : 'border-transparent text-humo hover:text-carbon'
              }`}
            >
              {s.etiqueta}
            </button>
          ))}
        </div>

        <div className="py-7 text-[15px] leading-relaxed text-grafito">
          {solapa === 'caracteristicas' && (
            <ul className="flex flex-col gap-2">
              {producto.specs.map((s) => (
                <li key={s} className="flex gap-2.5">
                  <span className="text-total-500">·</span>{s}
                </li>
              ))}
            </ul>
          )}
          {solapa === 'ficha' && (
            <dl className="grid max-w-xl gap-px bg-linea">
              {[
                ['Marca', producto.marca],
                ['Código', producto.codigo],
                ['Categoría', rubro?.nombre ?? '—'],
                ['Subcategoría', producto.subcategoria],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 gap-4 bg-white px-4 py-3">
                  <dt className="text-sm text-humo">{k}</dt>
                  <dd className="text-sm font-semibold text-carbon">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {solapa === 'descripcion' && (
            <p className="max-w-2xl">
              {producto.descripcion ?? 'La descripción comercial se carga desde el panel web. Todavía no hay texto para este artículo.'}
            </p>
          )}
          {solapa === 'garantia' && (
            <p className="max-w-2xl">
              Las condiciones de garantía las define Total para cada artículo. Consultanos por
              WhatsApp antes de comprar y te las confirmamos.
            </p>
          )}
        </div>
      </section>

      {comparado && (
        <section className="mt-12 border-t border-carbon pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Comparar con otro producto</h2>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-humo">Misma categoría</span>
              <select
                value={comparar}
                onChange={(e) => setComparar(e.target.value)}
                className="rounded-sm border border-linea px-3 py-2 text-sm"
              >
                {relacionados.map((r) => (
                  <option key={r.id} value={r.id}>{r.marca} {r.nombre}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-linea text-left">
                  <th className="w-40 py-3 font-normal text-humo">&nbsp;</th>
                  <th className="px-3 py-3 font-bold">{producto.nombre}</th>
                  <th className="px-3 py-3 font-bold">{comparado.nombre}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Marca', producto.marca, comparado.marca],
                  ['Características', producto.specs.join(' · '), comparado.specs.join(' · ')],
                  ['Precio', guaranies(producto.precio), guaranies(comparado.precio)],
                  ['Código', producto.codigo, comparado.codigo],
                ].map(([k, a, b]) => (
                  <tr key={k} className="border-b border-linea">
                    <th scope="row" className="py-3 text-left font-normal text-humo">{k}</th>
                    <td className="px-3 py-3">{a}</td>
                    <td className="px-3 py-3">{b}</td>
                  </tr>
                ))}
                <tr>
                  <td />
                  <td className="px-3 py-4" />
                  <td className="px-3 py-4">
                    <Link href={`/producto/${comparado.slug}`} className="text-sm font-semibold text-total-500 hover:underline">
                      Ver producto →
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {relacionados.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">También en {rubro?.nombre}</h2>
          <div className="mt-6 grid grid-cols-2 gap-px bg-linea lg:grid-cols-4">
            {relacionados.map((r) => (
              <div key={r.id} className="bg-white">
                <TarjetaProducto producto={r} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
