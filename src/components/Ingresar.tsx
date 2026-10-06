'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTienda } from '@/lib/tienda/contexto';

/**
 * Login y registro.
 *
 * No hay backend de autenticación todavía: la sesión se guarda en el navegador
 * con los datos que la persona escribe. Lo importante es que ya no entra como
 * un usuario inventado — el nombre que aparece después es el que ingresó.
 */
export function Ingresar() {
  const router = useRouter();
  const params = useSearchParams();
  const { ingresar } = useTienda();
  const [solapa, setSolapa] = useState<'ingresar' | 'registro'>('ingresar');
  const [recuperar, setRecuperar] = useState(false);
  const [datos, setDatos] = useState({
    nombre: '', apellido: '', documento: '', telefono: '', correo: '', clave: '',
  });
  const [errores, setErrores] = useState<Record<string, string>>({});

  const volverA = params.get('volver') ?? '/cuenta';

  const campo = (clave: keyof typeof datos, etiqueta: string, tipo = 'text') => (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
      {etiqueta}
      <input
        type={tipo}
        value={datos[clave]}
        onChange={(e) => setDatos({ ...datos, [clave]: e.target.value })}
        aria-invalid={Boolean(errores[clave])}
        autoComplete={tipo === 'password' ? 'current-password' : undefined}
        className={`rounded-sm border px-3 py-3 text-[15px] font-normal ${
          errores[clave] ? 'border-carbon' : 'border-[#c9ced8]'
        }`}
      />
      {errores[clave] && <span className="font-normal text-carbon">{errores[clave]}</span>}
    </label>
  );

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo)) err.correo = 'Ingresá un correo válido';
    if (datos.clave.length < 6) err.clave = 'La contraseña necesita al menos 6 caracteres';
    if (solapa === 'registro') {
      if (!datos.nombre.trim()) err.nombre = 'Ingresá tu nombre';
      if (!datos.apellido.trim()) err.apellido = 'Ingresá tu apellido';
    }
    setErrores(err);
    if (Object.keys(err).length) return;

    ingresar({
      // Si entra con una cuenta existente todavía no hay de dónde traer el nombre,
      // así que se usa la parte local del correo hasta que exista el backend.
      nombre: datos.nombre.trim() || datos.correo.split('@')[0],
      apellido: datos.apellido.trim(),
      correo: datos.correo.trim(),
      documento: datos.documento.trim() || undefined,
      telefono: datos.telefono.trim() || undefined,
    });
    router.push(volverA);
  }

  if (recuperar) {
    return (
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-humo">
          Te enviamos un enlace para crear una nueva contraseña.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); setRecuperar(false); }} className="mt-6 flex flex-col gap-4">
          {campo('correo', 'Correo', 'email')}
          <button type="submit" className="rounded-sm bg-total-500 px-5 py-3.5 text-sm font-bold text-white hover:bg-total-600">
            Enviar enlace
          </button>
          <button type="button" onClick={() => setRecuperar(false)} className="text-sm text-total-500 hover:underline">
            Volver a iniciar sesión
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="mb-7 flex gap-6 border-b border-linea">
        {([['ingresar', 'Iniciar sesión'], ['registro', 'Crear cuenta']] as const).map(([v, etiqueta]) => (
          <button
            key={v}
            type="button"
            onClick={() => { setSolapa(v); setErrores({}); }}
            className={`-mb-px border-b-2 pb-3 font-semibold transition-colors ${
              solapa === v ? 'border-total-500 text-total-500' : 'border-transparent text-humo hover:text-carbon'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        {solapa === 'registro' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {campo('nombre', 'Nombre')}
            {campo('apellido', 'Apellido')}
            {campo('documento', 'Documento')}
            {campo('telefono', 'Teléfono', 'tel')}
          </div>
        )}
        {campo('correo', 'Correo', 'email')}
        {campo('clave', 'Contraseña', 'password')}

        <button type="submit" className="mt-2 rounded-sm bg-total-500 px-5 py-3.5 text-sm font-bold text-white hover:bg-total-600">
          {solapa === 'registro' ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>

        {solapa === 'ingresar' && (
          <button type="button" onClick={() => setRecuperar(true)} className="text-sm text-total-500 hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        )}
      </form>

      <p className="mt-8 border-t border-linea pt-6 text-sm text-humo">
        No hace falta tener cuenta para mirar el catálogo o armar el carrito.{' '}
        <Link href="/productos" className="font-semibold text-total-500 hover:underline">
          Seguir explorando
        </Link>
      </p>
    </div>
  );
}
