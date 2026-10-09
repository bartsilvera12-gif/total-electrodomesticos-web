'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { cambiarEstadoPedido } from '@/lib/admin/acciones';
import { fechaCorta, guaranies } from '@/lib/formato';
import { ETIQUETA_ESTADO, type EstadoPedido } from '@/lib/tienda/tipos';

const ESTADOS: EstadoPedido[] = [
  'recibido', 'pago-pendiente', 'pagado', 'preparando', 'listo', 'entregado', 'cancelado',
];

interface Item { id: string; nombre: string; marca: string | null; cantidad: number; precio: number }
interface Pedido {
  id: string; numero: string; created_at: string;
  cliente: { nombre?: string; apellido?: string; correo?: string; telefono?: string };
  entrega: { modo?: string; direccion?: string; ciudad?: string };
  total: number; estado: EstadoPedido; estado_pago: string;
  web_pedido_item: Item[];
}

export function TablaPedidos({ pedidos }: { pedidos: Pedido[] }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [abierto, setAbierto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function cambiar(id: string, estado: string) {
    iniciar(async () => {
      setError(null);
      try {
        await cambiarEstadoPedido(id, estado);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo actualizar');
      }
    });
  }

  if (!pedidos.length) {
    return (
      <p className="mt-8 border border-linea bg-white p-8 text-center text-sm text-humo">
        Todavía no entró ningún pedido desde la tienda.
      </p>
    );
  }

  return (
    <>
      {error && <p className="mt-4 rounded-sm bg-[#f1f2f4] px-4 py-3 text-sm">{error}</p>}

      <ul className="mt-6 flex flex-col gap-3">
        {pedidos.map((p) => (
          <li key={p.id} className={`border border-linea bg-white ${pendiente ? 'opacity-60' : ''}`}>
            <button
              type="button"
              onClick={() => setAbierto(abierto === p.id ? null : p.id)}
              aria-expanded={abierto === p.id}
              className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
            >
              <span>
                <span className="font-mono text-[12px] text-humo">{p.numero}</span>
                <span className="block font-semibold">
                  {p.cliente?.nombre} {p.cliente?.apellido}
                </span>
              </span>
              <span className="text-sm text-humo">{fechaCorta(p.created_at)}</span>
              <span className="text-sm">
                {p.estado_pago === 'aprobado' ? 'Pago aprobado' : 'Pago pendiente'}
              </span>
              <span className="font-bold">{guaranies(Number(p.total))}</span>
            </button>

            {abierto === p.id && (
              <div className="border-t border-linea p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    Estado
                    <select
                      value={p.estado}
                      onChange={(e) => cambiar(p.id, e.target.value)}
                      disabled={pendiente}
                      className="rounded-sm border border-[#c9ced8] px-3 py-2 text-sm font-normal"
                    >
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>
                      ))}
                    </select>
                  </label>
                  <span className="text-[13px] text-humo">
                    El cliente lo ve en Mi cuenta.
                  </span>
                </div>

                <ul className="mt-5 flex flex-col gap-2 text-sm">
                  {(p.web_pedido_item ?? []).map((i) => (
                    <li key={i.id} className="flex justify-between gap-4">
                      <span>{i.marca} {i.nombre} × {i.cantidad}</span>
                      <span className="font-semibold">{guaranies(Number(i.precio) * i.cantidad)}</span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                  <div><dt className="text-humo">Correo</dt><dd>{p.cliente?.correo ?? '—'}</dd></div>
                  <div><dt className="text-humo">Teléfono</dt><dd>{p.cliente?.telefono ?? '—'}</dd></div>
                  <div className="sm:col-span-2">
                    <dt className="text-humo">Entrega</dt>
                    <dd>
                      {p.entrega?.modo === 'envio'
                        ? `${p.entrega.direccion ?? ''}, ${p.entrega.ciudad ?? ''}`
                        : 'Retiro en local'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
