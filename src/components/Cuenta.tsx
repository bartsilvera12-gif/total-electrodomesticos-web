'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fechaCorta, guaranies } from '@/lib/formato';
import { useTienda } from '@/lib/tienda/contexto';
import { usePedidos } from '@/lib/tienda/usePedidos';
import { ETIQUETA_ESTADO, PASOS_PEDIDO, type Pedido } from '@/lib/tienda/tipos';

const SOLAPAS = [
  { id: 'pedidos', etiqueta: 'Mis pedidos' },
  { id: 'datos', etiqueta: 'Mis datos' },
  { id: 'direcciones', etiqueta: 'Direcciones' },
  { id: 'clave', etiqueta: 'Cambiar contraseña' },
] as const;

function Seguimiento({ pedido }: { pedido: Pedido }) {
  if (pedido.estado === 'cancelado') {
    return <p className="text-sm text-humo">Este pedido fue cancelado.</p>;
  }
  const actual = PASOS_PEDIDO.indexOf(pedido.estado);
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2">
      {PASOS_PEDIDO.map((paso, i) => {
        const hecho = i <= actual;
        return (
          <li key={paso} className="flex items-center gap-2 text-sm">
            <span
              className={`size-2.5 rounded-full ${hecho ? 'bg-total-500' : 'bg-linea'}`}
              aria-hidden="true"
            />
            <span className={hecho ? 'font-semibold' : 'text-humo'}>{ETIQUETA_ESTADO[paso]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Cuenta() {
  const router = useRouter();
  const { sesion, salir, listo } = useTienda();
  const { pedidos, cargando: cargandoPedidos } = usePedidos();
  const [solapa, setSolapa] = useState<(typeof SOLAPAS)[number]['id']>('pedidos');
  const [abierto, setAbierto] = useState<string | null>(null);

  useEffect(() => {
    if (listo && !sesion) router.replace('/ingresar?volver=/cuenta');
  }, [listo, sesion, router]);

  if (!listo || !sesion) {
    return <div className="py-24 text-center text-humo">Cargando tu cuenta…</div>;
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <h1 className="text-[clamp(28px,3.5vw,42px)] font-bold tracking-tight">
        Hola, {sesion.nombre}
      </h1>
      <p className="mt-1 text-grafito">{sesion.correo}</p>

      <div className="mt-8 flex flex-wrap gap-6 border-b border-linea">
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
        <button
          type="button"
          onClick={async () => { await salir(); router.push('/'); router.refresh(); }}
          className="-mb-px border-b-2 border-transparent pb-3 text-sm font-semibold text-humo hover:text-carbon"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="py-8">
        {solapa === 'pedidos' && (
          cargandoPedidos ? (
            <p className="py-16 text-center text-humo">Cargando tus pedidos…</p>
          ) : pedidos.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-lg font-semibold">Todavía no tenés pedidos.</p>
              <p className="max-w-sm text-sm text-humo">
                Cuando compres, acá vas a ver el estado de cada pedido.
              </p>
              <Link href="/productos" className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600">
                Explorar productos
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {pedidos.map((p) => (
                <li key={p.numero} className="border border-linea">
                  <button
                    type="button"
                    onClick={() => setAbierto(abierto === p.numero ? null : p.numero)}
                    aria-expanded={abierto === p.numero}
                    className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
                  >
                    <span>
                      <span className="font-mono text-[12px] text-humo">{p.numero}</span>
                      <span className="block font-semibold">{fechaCorta(p.fechaISO)}</span>
                    </span>
                    <span className="text-sm">{ETIQUETA_ESTADO[p.estado]}</span>
                    <span className="font-bold">{guaranies(p.total)}</span>
                  </button>

                  {abierto === p.numero && (
                    <div className="border-t border-linea p-5">
                      <Seguimiento pedido={p} />
                      <ul className="mt-5 flex flex-col gap-2 text-sm">
                        {p.lineas.map((l) => (
                          <li key={l.productoId} className="flex justify-between gap-4">
                            <span>{l.marca} {l.nombre} × {l.cantidad}</span>
                            <span className="font-semibold">{guaranies(l.precio * l.cantidad)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-sm text-humo">
                        {p.entrega.modo === 'envio'
                          ? `Envío a ${p.entrega.direccion}, ${p.entrega.ciudad}`
                          : 'Retiro en local'}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )
        )}

        {solapa === 'datos' && (
          <dl className="grid max-w-lg gap-px bg-linea">
            {[
              ['Nombre', sesion.nombre],
              ['Apellido', sesion.apellido || '—'],
              ['Correo', sesion.correo],
              ['Documento', sesion.documento || '—'],
              ['Teléfono', sesion.telefono || '—'],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 gap-4 bg-white px-4 py-3">
                <dt className="text-sm text-humo">{k}</dt>
                <dd className="text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {solapa === 'direcciones' && (
          <div className="max-w-lg">
            {pedidos.find((p) => p.entrega.modo === 'envio') ? (
              <ul className="flex flex-col gap-3">
                {Array.from(
                  new Map(
                    pedidos
                      .filter((p) => p.entrega.modo === 'envio' && p.entrega.direccion)
                      .map((p) => [`${p.entrega.direccion}|${p.entrega.ciudad}`, p.entrega]),
                  ).values(),
                ).map((e, i) => (
                  <li key={i} className="border border-linea p-4 text-sm">
                    <p className="font-semibold">{e.direccion}</p>
                    <p className="text-humo">{e.ciudad}{e.referencia ? ` · ${e.referencia}` : ''}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-humo">
                Todavía no cargaste ninguna dirección. Se guardan al completar una compra con envío.
              </p>
            )}
          </div>
        )}

        {solapa === 'clave' && (
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex max-w-sm flex-col gap-4"
          >
            {['Contraseña actual', 'Nueva contraseña', 'Repetir nueva contraseña'].map((etiqueta) => (
              <label key={etiqueta} className="flex flex-col gap-1.5 text-[13px] font-semibold">
                {etiqueta}
                <input type="password" className="rounded-sm border border-[#c9ced8] px-3 py-3 text-[15px] font-normal" />
              </label>
            ))}
            <p className="text-sm text-humo">
              El cambio de contraseña va a funcionar cuando exista la autenticación en el servidor.
            </p>
            <button type="submit" disabled className="rounded-sm bg-total-500 px-5 py-3.5 text-sm font-bold text-white opacity-50">
              Actualizar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
