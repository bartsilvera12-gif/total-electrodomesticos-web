'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fechaCorta, guaranies } from '@/lib/formato';
import { ConsultarWhatsapp } from './ConsultarWhatsapp';
import { ASESORES, SITIO } from '@/lib/sitio';
import { useTienda } from '@/lib/tienda/contexto';
import { ETIQUETA_ESTADO } from '@/lib/tienda/tipos';

export function Confirmacion() {
  const params = useSearchParams();
  const numero = params.get('pedido');
  const { pedidos, listo } = useTienda();
  const pedido = pedidos.find((p) => p.numero === numero);

  if (!listo) {
    return <div className="py-24 text-center text-humo">Buscando tu pedido…</div>;
  }

  if (!pedido) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">No encontramos ese pedido</h1>
        <p className="text-humo">
          Puede que se haya hecho en otro dispositivo. Escribinos y lo buscamos.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link href="/cuenta" className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600">
            Ver mis pedidos
          </Link>
          <ConsultarWhatsapp
            mensaje="Hola Total, quiero consultar por un pedido web."
            className="cursor-pointer rounded-sm border border-carbon px-5 py-3 text-sm font-bold hover:bg-carbon hover:text-white"
          >
            Consultar por WhatsApp
          </ConsultarWhatsapp>
        </div>
      </div>
    );
  }

  const aprobado = pedido.estadoPago === 'aprobado';

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="border border-linea p-8">
        <p className="font-mono text-[11px] tracking-widest text-total-500 uppercase">
          Pedido {pedido.numero}
        </p>
        <h1 className="mt-3 text-[clamp(28px,3.5vw,38px)] font-bold tracking-tight">
          ¡Pedido recibido!
        </h1>
        <p className="mt-2 text-grafito">
          {aprobado
            ? 'Tu pago fue aprobado. Te vamos a contactar para coordinar la entrega.'
            : 'Tu pedido quedó registrado con el pago pendiente. Te contactamos para completarlo.'}
        </p>

        <dl className="mt-8 grid gap-px bg-linea">
          {[
            ['Fecha', fechaCorta(pedido.fechaISO)],
            ['Estado', ETIQUETA_ESTADO[pedido.estado]],
            ['Estado de pago', aprobado ? 'Pago aprobado' : 'Pago pendiente'],
            ['Monto', guaranies(pedido.total)],
            ['Entrega', pedido.entrega.modo === 'envio'
              ? `${pedido.entrega.direccion}, ${pedido.entrega.ciudad}`
              : 'Retiro en local'],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-2 gap-4 bg-white px-4 py-3">
              <dt className="text-sm text-humo">{k}</dt>
              <dd className="text-sm font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-8 text-sm font-bold">Resumen</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {pedido.lineas.map((l) => (
            <li key={l.productoId} className="flex justify-between gap-4 border-b border-linea pb-2">
              <span>{l.marca} {l.nombre} × {l.cantidad}</span>
              <span className="font-semibold">{guaranies(l.precio * l.cantidad)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-2.5">
          <Link href="/cuenta" className="rounded-sm bg-total-500 px-5 py-3.5 text-sm font-bold text-white hover:bg-total-600">
            Ver mi pedido
          </Link>
          <ConsultarWhatsapp
            mensaje={`Hola Total, consulto por mi pedido ${pedido.numero}.`}
            className="cursor-pointer rounded-sm border border-carbon px-5 py-3.5 text-sm font-bold hover:bg-carbon hover:text-white"
          >
            Consultar por WhatsApp
          </ConsultarWhatsapp>
        </div>

        <p className="mt-6 text-sm text-humo">
          Consultas a {ASESORES.map((a) => a.local).join(' o ')}, o a {SITIO.correo}.
        </p>
      </div>
    </div>
  );
}
