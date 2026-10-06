'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PRODUCTOS } from '@/lib/catalogo/mock';
import { guaranies } from '@/lib/formato';
import { useTienda } from '@/lib/tienda/contexto';
import type { EstadoPago } from '@/lib/tienda/tipos';
import { FotoProducto } from './FotoProducto';

type Paso = 'datos' | 'redirigiendo' | 'pasarela' | 'rechazado' | 'cancelado';

const vacio = { nombre: '', apellido: '', documento: '', telefono: '', correo: '' };

function Campo({
  etiqueta, valor, alCambiar, error, tipo = 'text',
}: {
  etiqueta: string;
  valor: string;
  alCambiar: (v: string) => void;
  error?: string;
  tipo?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
      {etiqueta}
      <input
        type={tipo}
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`rounded-sm border px-3 py-3 text-[15px] font-normal ${
          error ? 'border-carbon' : 'border-[#c9ced8]'
        }`}
      />
      {error && <span className="font-normal text-carbon">{error}</span>}
    </label>
  );
}

export function Checkout() {
  const router = useRouter();
  const { carrito, sesion, crearPedido, listo } = useTienda();
  const [paso, setPaso] = useState<Paso>('datos');
  const [modo, setModo] = useState<'envio' | 'retiro'>('envio');
  const [cliente, setCliente] = useState(vacio);
  const [entrega, setEntrega] = useState({ direccion: '', ciudad: '', referencia: '' });
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Si ya inició sesión, los datos vienen cargados, pero siguen siendo editables
  useEffect(() => {
    if (sesion) {
      setCliente((c) => ({
        ...c,
        nombre: c.nombre || sesion.nombre,
        apellido: c.apellido || sesion.apellido,
        correo: c.correo || sesion.correo,
        documento: c.documento || sesion.documento || '',
        telefono: c.telefono || sesion.telefono || '',
      }));
    }
  }, [sesion]);

  const porId = new Map(PRODUCTOS.map((p) => [p.id, p]));
  const lineas = carrito.flatMap((l) => {
    const p = porId.get(l.productoId);
    return p ? [{ ...l, producto: p }] : [];
  });
  const subtotal = lineas.reduce((t, l) => t + l.producto.precio * l.cantidad, 0);

  function validar(): boolean {
    const e: Record<string, string> = {};
    if (!cliente.nombre.trim()) e.nombre = 'Ingresá tu nombre';
    if (!cliente.apellido.trim()) e.apellido = 'Ingresá tu apellido';
    if (!cliente.documento.trim()) e.documento = 'Ingresá tu documento';
    if (!cliente.telefono.trim()) e.telefono = 'Ingresá tu teléfono';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cliente.correo)) e.correo = 'Ingresá un correo válido';
    if (modo === 'envio') {
      if (!entrega.direccion.trim()) e.direccion = 'Ingresá la dirección';
      if (!entrega.ciudad.trim()) e.ciudad = 'Ingresá la ciudad';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  /**
   * PagoPar todavía no está integrado: acá se simula el ida y vuelta para poder
   * probar el flujo completo. La integración real reemplaza este tramo.
   */
  const irAPagar = () => {
    if (!validar()) return;
    setPaso('redirigiendo');
    setTimeout(() => setPaso('pasarela'), 1600);
  };

  const resolver = (resultado: EstadoPago) => {
    if (resultado === 'rechazado') return setPaso('rechazado');
    if (resultado === 'cancelado') return setPaso('cancelado');
    const pedido = crearPedido({
      productos: PRODUCTOS,
      cliente,
      entrega: modo === 'envio' ? { modo, ...entrega } : { modo },
      estadoPago: resultado,
    });
    router.push(`/confirmacion?pedido=${pedido.numero}`);
  };

  if (!listo) {
    return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-humo">Cargando tu pedido…</div>;
  }

  if (lineas.length === 0 && paso === 'datos') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-humo">Agregá productos antes de finalizar la compra.</p>
        <Link href="/productos" className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600">
          Explorar productos
        </Link>
      </div>
    );
  }

  if (paso === 'redirigiendo') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-28 text-center">
        <span className="size-10 animate-girar rounded-full border-3 border-total-200 border-t-total-500" aria-hidden="true" />
        <h1 className="text-xl font-bold">Redireccionando a PagoPar…</h1>
        <p className="text-sm text-humo">No cierres esta ventana.</p>
      </div>
    );
  }

  if (paso === 'pasarela') {
    return (
      <div className="mx-auto max-w-md px-6 py-20">
        <div className="border border-linea p-7">
          <p className="font-mono text-[11px] tracking-widest text-humo uppercase">PagoPar</p>
          <h1 className="mt-2 text-xl font-bold">Pago con PagoPar</h1>
          <p className="mt-1 text-sm text-humo">Comercio: Total Electrodomésticos</p>
          <p className="mt-5 text-3xl font-bold tracking-tight">{guaranies(subtotal)}</p>
          <p className="mt-6 text-sm font-semibold">Elegí el resultado a simular:</p>
          <div className="mt-3 flex flex-col gap-2">
            {([
              ['aprobado', 'Pago aprobado'],
              ['pendiente', 'Pago pendiente'],
              ['rechazado', 'Pago rechazado'],
              ['cancelado', 'Cancelar y volver a la tienda'],
            ] as Array<[EstadoPago, string]>).map(([valor, etiqueta]) => (
              <button
                key={valor}
                type="button"
                onClick={() => resolver(valor)}
                className={`rounded-sm px-5 py-3 text-sm font-bold ${
                  valor === 'aprobado'
                    ? 'bg-total-500 text-white hover:bg-total-600'
                    : 'border border-linea hover:border-carbon'
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs text-humo">
            Pantalla de prueba. La integración real con PagoPar se hace con las claves del comercio.
          </p>
        </div>
      </div>
    );
  }

  if (paso === 'rechazado' || paso === 'cancelado') {
    const rechazado = paso === 'rechazado';
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">{rechazado ? 'Pago rechazado' : 'Pago cancelado'}</h1>
        <p className="text-humo">
          {rechazado
            ? 'El pago no se pudo procesar. Podés intentar de nuevo con otro medio.'
            : 'Cancelaste el pago. Tu carrito sigue como estaba.'}
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setPaso('datos')}
            className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600"
          >
            Intentar nuevamente
          </button>
          <Link href="/productos" className="rounded-sm border border-carbon px-5 py-3 text-sm font-bold hover:bg-carbon hover:text-white">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <h1 className="text-[clamp(26px,3vw,36px)] font-bold tracking-tight">Finalizar compra</h1>

      {!sesion && (
        <p className="mt-3 text-sm text-humo">
          ¿Ya tenés cuenta?{' '}
          <Link href="/ingresar" className="font-semibold text-total-500 hover:underline">
            Iniciá sesión
          </Link>{' '}
          para completar tus datos.
        </p>
      )}

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={(e) => { e.preventDefault(); irAPagar(); }} className="flex flex-col gap-9">
          <section>
            <h2 className="mb-4 text-lg font-bold">Tus datos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Nombre" error={errores.nombre} valor={cliente.nombre} alCambiar={(v) => setCliente({ ...cliente, nombre: v })} />
              <Campo etiqueta="Apellido" error={errores.apellido} valor={cliente.apellido} alCambiar={(v) => setCliente({ ...cliente, apellido: v })} />
              <Campo etiqueta="Documento" error={errores.documento} valor={cliente.documento} alCambiar={(v) => setCliente({ ...cliente, documento: v })} />
              <Campo etiqueta="Teléfono" error={errores.telefono} tipo="tel" valor={cliente.telefono} alCambiar={(v) => setCliente({ ...cliente, telefono: v })} />
              <div className="sm:col-span-2">
                <Campo etiqueta="Correo" error={errores.correo} tipo="email" valor={cliente.correo} alCambiar={(v) => setCliente({ ...cliente, correo: v })} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold">Entrega</h2>
            <div className="mb-4 flex gap-2">
              {([['envio', 'Envío a domicilio'], ['retiro', 'Retiro en local']] as const).map(([v, etiqueta]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setModo(v)}
                  className={`flex-1 rounded-sm border px-4 py-3 text-sm font-semibold ${
                    modo === v ? 'border-total-500 bg-total-50 text-total-500' : 'border-linea'
                  }`}
                >
                  {etiqueta}
                </button>
              ))}
            </div>

            {modo === 'envio' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Campo etiqueta="Dirección" error={errores.direccion} valor={entrega.direccion} alCambiar={(v) => setEntrega({ ...entrega, direccion: v })} />
                </div>
                <Campo etiqueta="Ciudad" error={errores.ciudad} valor={entrega.ciudad} alCambiar={(v) => setEntrega({ ...entrega, ciudad: v })} />
                <Campo etiqueta="Referencia" error={errores.referencia} valor={entrega.referencia} alCambiar={(v) => setEntrega({ ...entrega, referencia: v })} />
              </div>
            ) : (
              <p className="border border-linea bg-total-50 p-4 text-sm text-grafito">
                Dirección y horarios del local a confirmar por Total. Te contactamos para coordinar el retiro.
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold">Pago</h2>
            <div className="border border-total-500 bg-total-50 p-4">
              <p className="font-semibold">PagoPar</p>
              <p className="mt-1 text-sm text-grafito">
                Tarjetas, billeteras y otros medios disponibles en PagoPar. Al continuar vas a ser
                redireccionado para completar el pago.
              </p>
            </div>
          </section>

          <button
            type="submit"
            className="rounded-sm bg-total-500 px-6 py-4 text-[15px] font-bold text-white hover:bg-total-600"
          >
            Continuar a PagoPar
          </button>
        </form>

        <aside className="h-fit border border-linea p-6 lg:sticky lg:top-32">
          <h2 className="text-lg font-bold">Tu pedido</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {lineas.map((l) => (
              <li key={l.productoId} className="flex gap-3">
                <FotoProducto descripcion={l.producto.imagen} className="size-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{l.producto.nombre}</p>
                  <p className="text-xs text-humo">{l.producto.marca} · × {l.cantidad}</p>
                </div>
                <span className="text-sm font-bold">{guaranies(l.producto.precio * l.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-linea pt-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-humo">Subtotal</span>
              <span className="font-semibold">{guaranies(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-humo">Envío</span>
              <span className="text-humo">Se confirma según la dirección</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-linea pt-3">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold">{guaranies(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
