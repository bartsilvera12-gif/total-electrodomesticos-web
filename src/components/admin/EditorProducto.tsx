'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { guardarProducto } from '@/lib/admin/acciones';
import type { ProductoPanel } from '@/lib/admin/consultas';
import { guaranies, slugificar } from '@/lib/formato';

/** Campo del ERP: se muestra para dar contexto, no se edita acá. */
function DelErp({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-linea py-2.5 last:border-0">
      <dt className="text-sm text-humo">{etiqueta}</dt>
      <dd className="text-sm font-semibold">{valor}</dd>
    </div>
  );
}

export function EditorProducto({ producto }: { producto: ProductoPanel }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const [slug, setSlug] = useState(producto.slug ?? slugificar(`${producto.marca ?? ''} ${producto.nombre}`));
  const [publicado, setPublicado] = useState(producto.publicado);
  const [orden, setOrden] = useState(producto.orden);
  const [descripcion, setDescripcion] = useState(producto.descripcion ?? '');
  const [ficha, setFicha] = useState(producto.ficha.length ? producto.ficha : [{ etiqueta: '', valor: '' }]);
  const [galeria, setGaleria] = useState<string[]>(producto.galeria);
  const [nuevaFoto, setNuevaFoto] = useState('');
  const [seoTitulo, setSeoTitulo] = useState(producto.seoTitulo ?? '');
  const [seoDesc, setSeoDesc] = useState(producto.seoDesc ?? '');

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      setMensaje(null);
      try {
        await guardarProducto({
          productoId: producto.id,
          slug,
          publicado,
          orden,
          descripcion,
          ficha: ficha.filter((f) => f.etiqueta.trim() && f.valor.trim()),
          galeria: galeria.filter(Boolean),
          seoTitulo,
          seoDesc,
        });
        setMensaje({ tipo: 'ok', texto: 'Guardado. Ya se ve en la tienda.' });
        router.refresh();
      } catch (err) {
        setMensaje({ tipo: 'error', texto: err instanceof Error ? err.message : 'No se pudo guardar' });
      }
    });
  }

  return (
    <>
      <Link href="/admin/productos" className="text-sm font-semibold text-total-500 hover:underline">
        ← Volver a productos
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">{producto.nombre}</h1>

      <form onSubmit={guardar} className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-5 border border-linea bg-white p-6">
            <h2 className="text-sm font-bold">Publicación</h2>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={publicado}
                onChange={(e) => setPublicado(e.target.checked)}
                className="size-4 accent-total-500"
              />
              <span className="text-sm font-semibold">Mostrar este producto en la tienda</span>
            </label>

            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Enlace
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-sm border border-[#c9ced8] px-3 py-2.5 font-mono text-[14px] font-normal"
              />
              <span className="font-normal text-humo">
                La tienda lo va a mostrar en /producto/{slugificar(slug) || '…'}
              </span>
            </label>

            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Orden
              <input
                type="number"
                value={orden}
                onChange={(e) => setOrden(Number(e.target.value))}
                className="w-28 rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
              />
              <span className="font-normal text-humo">Más bajo aparece antes en los listados.</span>
            </label>
          </section>

          <section className="flex flex-col gap-5 border border-linea bg-white p-6">
            <h2 className="text-sm font-bold">Contenido</h2>

            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Descripción comercial
              <textarea
                rows={5}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Cómo se le cuenta este producto al cliente."
                className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
              />
            </label>

            <div>
              <p className="text-[13px] font-semibold">Ficha técnica</p>
              <p className="mt-1 text-[13px] text-humo">
                Lo que se muestra en la card y en la ficha del producto.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {ficha.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={f.etiqueta}
                      onChange={(e) => setFicha(ficha.map((x, j) => (j === i ? { ...x, etiqueta: e.target.value } : x)))}
                      placeholder="Pulgadas"
                      className="w-40 rounded-sm border border-[#c9ced8] px-3 py-2 text-sm"
                    />
                    <input
                      value={f.valor}
                      onChange={(e) => setFicha(ficha.map((x, j) => (j === i ? { ...x, valor: e.target.value } : x)))}
                      placeholder='55"'
                      className="flex-1 rounded-sm border border-[#c9ced8] px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setFicha(ficha.filter((_, j) => j !== i))}
                      aria-label="Quitar"
                      className="px-2 text-humo hover:text-carbon"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFicha([...ficha, { etiqueta: '', valor: '' }])}
                className="mt-2 text-sm font-semibold text-total-500 hover:underline"
              >
                + Agregar una característica
              </button>
            </div>

            <div>
              <p className="text-[13px] font-semibold">Fotos adicionales</p>
              <p className="mt-1 text-[13px] text-humo">
                La foto principal se carga en el ERP. Acá se suman las demás, por
                dirección web.
              </p>
              {galeria.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {galeria.map((g, i) => (
                    <li key={i} className="relative">
                      <Image src={g} alt="" width={72} height={72} unoptimized className="size-18 rounded-sm border border-linea object-cover" />
                      <button
                        type="button"
                        onClick={() => setGaleria(galeria.filter((_, j) => j !== i))}
                        aria-label="Quitar foto"
                        className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border border-linea bg-white text-sm"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex gap-2">
                <input
                  value={nuevaFoto}
                  onChange={(e) => setNuevaFoto(e.target.value)}
                  placeholder="https://…"
                  className="flex-1 rounded-sm border border-[#c9ced8] px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => { if (nuevaFoto.trim()) { setGaleria([...galeria, nuevaFoto.trim()]); setNuevaFoto(''); } }}
                  className="rounded-sm border border-carbon px-4 py-2 text-sm font-semibold"
                >
                  Agregar
                </button>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-5 border border-linea bg-white p-6">
            <h2 className="text-sm font-bold">SEO</h2>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Título
              <input
                value={seoTitulo}
                onChange={(e) => setSeoTitulo(e.target.value)}
                placeholder={`${producto.marca ?? ''} ${producto.nombre}`.trim()}
                className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
              Descripción
              <textarea
                rows={2}
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
              />
            </label>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pendiente}
              className="rounded-sm bg-total-500 px-6 py-3.5 text-sm font-bold text-white hover:bg-total-600 disabled:opacity-60"
            >
              {pendiente ? 'Guardando…' : 'Guardar'}
            </button>
            {producto.publicado && producto.slug && (
              <Link href={`/producto/${producto.slug}`} target="_blank" className="text-sm font-semibold text-total-500 hover:underline">
                Ver en la tienda →
              </Link>
            )}
            {mensaje && (
              <span className={`text-sm ${mensaje.tipo === 'ok' ? 'text-total-500' : 'text-carbon'}`}>
                {mensaje.texto}
              </span>
            )}
          </div>
        </div>

        <aside className="h-fit border border-linea bg-white p-6 lg:sticky lg:top-10">
          <h2 className="text-sm font-bold">Datos del ERP</h2>
          <p className="mt-1 text-[13px] text-humo">
            Solo lectura. Se cambian en el ERP y acá se ven en vivo.
          </p>

          {producto.imagenUrl ? (
            <Image src={producto.imagenUrl} alt="" width={260} height={200} unoptimized className="mt-4 w-full rounded-sm border border-linea object-cover" />
          ) : (
            <p className="mt-4 flex h-28 items-center justify-center rounded-sm bg-total-50 text-center font-mono text-[11px] text-total-400">
              sin foto principal
            </p>
          )}

          <dl className="mt-4">
            <DelErp etiqueta="Código" valor={producto.sku ?? '—'} />
            <DelErp etiqueta="Precio" valor={guaranies(producto.precio)} />
            <DelErp etiqueta="Stock" valor={String(producto.stock ?? '—')} />
            <DelErp etiqueta="Marca" valor={producto.marca ?? '—'} />
            <DelErp etiqueta="Categoría" valor={producto.categoria ?? '—'} />
            <DelErp etiqueta="Activo" valor={producto.activo ? 'Sí' : 'No'} />
          </dl>

          <p className="mt-4 border-t border-linea pt-4 text-[13px] text-humo">
            El costo nunca se muestra, ni acá ni en la tienda.
          </p>
        </aside>
      </form>
    </>
  );
}
