'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { PRODUCTOS, RUBROS } from '@/lib/catalogo/mock';
import { fechaCorta, guaranies } from '@/lib/formato';
import { useTienda } from '@/lib/tienda/contexto';
import { ETIQUETA_ESTADO } from '@/lib/tienda/tipos';

/**
 * Panel web.
 *
 * NO sustituye al ERP. Administra solo lo editorial de la tienda: imágenes,
 * descripciones comerciales, destacados, orden de la home y SEO.
 *
 * Los campos que vienen del ERP —precio, stock, código— se muestran como solo
 * lectura, para que quede claro desde el día uno quién manda sobre cada dato y
 * no se construya una segunda fuente de verdad que después entre en conflicto.
 */

const SECCIONES = [
  { id: 'dashboard', etiqueta: 'Dashboard' },
  { id: 'catalogo', etiqueta: 'Catálogo web' },
  { id: 'home', etiqueta: 'Home' },
  { id: 'pedidos', etiqueta: 'Pedidos web' },
] as const;

type Seccion = (typeof SECCIONES)[number]['id'];

const BLOQUES_HOME = [
  'Hero · La casa Total',
  'Categorías',
  '¿Qué querés equipar?',
  'Elegidos de Total',
  'Beneficios',
  'Ofertas',
  'Marcas',
  'Total para tu hogar + Redes',
];

function SoloLectura({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <span className="rounded-sm bg-fondo px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-humo uppercase">
        ERP
      </span>
    </span>
  );
}

export function Panel() {
  const { pedidos, listo } = useTienda();
  const [seccion, setSeccion] = useState<Seccion>('dashboard');
  const [destacados, setDestacados] = useState<string[]>(
    PRODUCTOS.filter((p) => p.destacado).map((p) => p.id),
  );
  const [bloques, setBloques] = useState(BLOQUES_HOME.map((b) => ({ nombre: b, visible: true })));
  const [editando, setEditando] = useState<string | null>(null);

  const mover = (i: number, d: number) => {
    setBloques((actual) => {
      const copia = [...actual];
      const j = i + d;
      if (j < 0 || j >= copia.length) return actual;
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  };

  const producto = PRODUCTOS.find((p) => p.id === editando);

  // Sobre datos de prueba: no inventamos facturación ni ventas
  const kpis = [
    { etiqueta: 'Pedidos web', valor: listo ? pedidos.length : '—' },
    { etiqueta: 'Productos publicados', valor: PRODUCTOS.length },
    { etiqueta: 'Sin imagen cargada', valor: PRODUCTOS.length },
    { etiqueta: 'Sin descripción', valor: PRODUCTOS.filter((p) => !p.descripcion).length },
    { etiqueta: 'Destacados en la home', valor: destacados.length },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-fondo lg:flex-row">
      <aside className="shrink-0 border-b border-linea bg-white lg:w-60 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-3 border-b border-linea px-5 py-4">
          <Image src="/assets/logo-total.png" alt="" width={100} height={30} className="h-8 w-auto" />
          <span className="font-mono text-[10px] tracking-widest text-humo uppercase">Panel web</span>
        </div>
        <nav className="flex overflow-x-auto p-3 lg:flex-col">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setSeccion(s.id); setEditando(null); }}
              className={`shrink-0 rounded-sm px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                seccion === s.id ? 'bg-total-50 text-total-500' : 'text-grafito hover:bg-fondo'
              }`}
            >
              {s.etiqueta}
            </button>
          ))}
        </nav>
        <div className="border-t border-linea p-5 text-[13px]">
          <p className="flex items-center gap-2 text-grafito">
            <span className="size-2 rounded-full border border-humo" aria-hidden="true" />
            ERP: sin conectar
          </p>
          <p className="mt-3 leading-relaxed text-humo">
            Precio, stock y código los va a controlar el ERP. Acá se administra solo el
            contenido de la web.
          </p>
          <Link href="/" className="mt-3 inline-block font-semibold text-total-500 hover:underline">
            Ver tienda →
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">
        {seccion === 'dashboard' && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-humo">
              Sobre datos de prueba. No hay facturación ni ventas: eso vive en el ERP.
            </p>
            <div className="mt-6 grid gap-px bg-linea sm:grid-cols-2 lg:grid-cols-5">
              {kpis.map((k) => (
                <div key={k.etiqueta} className="bg-white p-5">
                  <p className="font-mono text-[10px] tracking-widest text-humo uppercase">{k.etiqueta}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{k.valor}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-10 text-lg font-bold">Últimos pedidos web</h2>
            {!listo ? (
              <p className="mt-4 text-sm text-humo">Cargando…</p>
            ) : pedidos.length === 0 ? (
              <p className="mt-4 border border-linea bg-white p-6 text-sm text-humo">
                Todavía no entró ningún pedido desde la web.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-linea border border-linea bg-white">
                {pedidos.slice(0, 5).map((p) => (
                  <li key={p.numero} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                    <span className="font-mono text-[12px] text-humo">{p.numero}</span>
                    <span className="font-semibold">{p.cliente.nombre} {p.cliente.apellido}</span>
                    <span className="text-humo">{fechaCorta(p.fechaISO)}</span>
                    <span>{ETIQUETA_ESTADO[p.estado]}</span>
                    <span className="font-bold">{guaranies(p.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {seccion === 'catalogo' && !producto && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Catálogo web</h1>
            <p className="mt-1 text-sm text-humo">
              Contenido editorial de cada producto. Los datos del ERP se muestran, no se editan.
            </p>
            <div className="mt-6 overflow-x-auto border border-linea bg-white">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-linea text-left">
                  <tr className="font-mono text-[10px] tracking-widest text-humo uppercase">
                    <th className="p-4">Producto</th>
                    <th className="p-4"><SoloLectura>Código</SoloLectura></th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4"><SoloLectura>Precio</SoloLectura></th>
                    <th className="p-4">Destacado</th>
                    <th className="p-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linea">
                  {PRODUCTOS.map((p) => (
                    <tr key={p.id}>
                      <td className="p-4">
                        <span className="font-mono text-[10px] tracking-widest text-humo uppercase">{p.marca}</span>
                        <span className="block font-semibold">{p.nombre}</span>
                      </td>
                      <td className="p-4 font-mono text-[12px] text-humo">{p.codigo}</td>
                      <td className="p-4 text-grafito">{RUBROS.find((r) => r.id === p.rubro)?.nombre}</td>
                      <td className="p-4 text-humo">{guaranies(p.precio)}</td>
                      <td className="p-4">
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={destacados.includes(p.id)}
                            onChange={() =>
                              setDestacados((a) =>
                                a.includes(p.id) ? a.filter((x) => x !== p.id) : [...a, p.id])}
                            className="size-4 accent-total-500"
                          />
                          <span className="text-[13px] text-humo">En la home</span>
                        </label>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => setEditando(p.id)}
                          className="font-semibold text-total-500 hover:underline"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {seccion === 'catalogo' && producto && (
          <>
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="text-sm font-semibold text-total-500 hover:underline"
            >
              ← Volver al catálogo
            </button>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">{producto.nombre}</h1>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5 border border-linea bg-white p-6">
                <h2 className="text-sm font-bold">Contenido web</h2>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                  Nombre comercial
                  <input key={`n-${producto.id}`} defaultValue={producto.nombre} className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal" />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                  Slug
                  <input key={`s-${producto.id}`} defaultValue={producto.slug} className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal" />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                  Descripción comercial
                  <textarea
                    key={`d-${producto.id}`}
                    rows={4}
                    defaultValue={producto.descripcion ?? ''}
                    placeholder="Todavía no hay descripción cargada para este artículo."
                    className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
                  Meta descripción (SEO)
                  <textarea key={`m-${producto.id}`} rows={2} className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal" />
                </label>
                <div>
                  <p className="text-[13px] font-semibold">Imágenes</p>
                  <div className="mt-2 flex h-28 items-center justify-center border border-dashed border-[#c9ced8] text-sm text-humo">
                    Subir imagen o video
                  </div>
                </div>
                <button type="submit" className="self-start rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600">
                  Publicar
                </button>
              </form>

              <aside className="h-fit border border-linea bg-white p-6">
                <h2 className="text-sm font-bold">Datos del ERP</h2>
                <p className="mt-1 text-[13px] text-humo">
                  Solo lectura. Se van a sincronizar cuando exista la integración.
                </p>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  {[
                    ['Código', producto.codigo],
                    ['Precio de venta', guaranies(producto.precio)],
                    ['Stock', producto.disponibilidad],
                    ['Marca', producto.marca],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-humo">{k}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 border-t border-linea pt-4 text-[13px] text-humo">
                  El costo interno nunca se muestra, ni acá ni en la web pública.
                </p>
              </aside>
            </div>
          </>
        )}

        {seccion === 'home' && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Home</h1>
            <p className="mt-1 text-sm text-humo">Orden y visibilidad de los bloques de la portada.</p>
            <ul className="mt-6 divide-y divide-linea border border-linea bg-white">
              {bloques.map((b, i) => (
                <li key={b.nombre} className="flex items-center justify-between gap-4 p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={b.visible}
                      onChange={() =>
                        setBloques((a) => a.map((x, j) => (j === i ? { ...x, visible: !x.visible } : x)))}
                      className="size-4 accent-total-500"
                    />
                    <span className="text-sm font-semibold">{b.nombre}</span>
                  </label>
                  <span className="flex gap-1">
                    <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="rounded-sm border border-linea px-2.5 py-1 disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => mover(i, 1)} disabled={i === bloques.length - 1} aria-label="Bajar" className="rounded-sm border border-linea px-2.5 py-1 disabled:opacity-30">↓</button>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {seccion === 'pedidos' && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Pedidos web</h1>
            <p className="mt-1 text-sm text-humo">
              Pedidos hechos desde la tienda. Cuando se integre el ERP, van a bajar ahí como ventas.
            </p>
            {!listo ? (
              <p className="mt-6 text-sm text-humo">Cargando…</p>
            ) : pedidos.length === 0 ? (
              <p className="mt-6 border border-linea bg-white p-8 text-center text-sm text-humo">
                Todavía no hay pedidos. Hacé una compra de prueba en la tienda y va a aparecer acá.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto border border-linea bg-white">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b border-linea text-left">
                    <tr className="font-mono text-[10px] tracking-widest text-humo uppercase">
                      <th className="p-4">Pedido</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Pago</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Origen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linea">
                    {pedidos.map((p) => (
                      <tr key={p.numero}>
                        <td className="p-4 font-mono text-[12px]">{p.numero}</td>
                        <td className="p-4">
                          <span className="font-semibold">{p.cliente.nombre} {p.cliente.apellido}</span>
                          <span className="block text-[12px] text-humo">{p.cliente.correo}</span>
                        </td>
                        <td className="p-4 text-humo">{fechaCorta(p.fechaISO)}</td>
                        <td className="p-4 font-bold">{guaranies(p.total)}</td>
                        <td className="p-4">{p.estadoPago === 'aprobado' ? 'Aprobado' : 'Pendiente'}</td>
                        <td className="p-4">{ETIQUETA_ESTADO[p.estado]}</td>
                        <td className="p-4 text-humo">Web</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
