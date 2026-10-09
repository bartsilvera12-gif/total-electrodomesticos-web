'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Ingreso al panel.
 *
 * Usa el mismo usuario del ERP: no hay cuentas de administrador propias de la
 * web. Quien entra al ERP entra acá.
 */
export function FormularioIngreso() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error: err } = await sb.auth.signInWithPassword({
      email: correo.trim(),
      password: clave,
    });

    if (err) {
      setError('No pudimos ingresar. Revisá el correo y la contraseña.');
      setEnviando(false);
      return;
    }

    // El layout del panel vuelve a validar contra total.usuarios: tener sesión
    // en Supabase no alcanza, hay que ser admin del ERP.
    router.replace('/admin');
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-total-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image src="/assets/logo-total.png" alt="Total Electrodomésticos" width={180} height={52} priority className="h-13 w-auto" />
          <p className="font-mono text-[11px] tracking-widest text-humo uppercase">Panel web</p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-4 rounded-lg border border-linea bg-white p-7 shadow-sm">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Correo
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="username"
              required
              className="rounded-sm border border-[#c9ced8] px-3 py-3 text-[15px] font-normal"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Contraseña
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              autoComplete="current-password"
              required
              className="rounded-sm border border-[#c9ced8] px-3 py-3 text-[15px] font-normal"
            />
          </label>

          {error && (
            <p className="rounded-sm bg-[#f1f2f4] px-3 py-2.5 text-sm text-carbon">{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-1 rounded-sm bg-total-500 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-total-600 disabled:opacity-60"
          >
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>

          <p className="text-center text-[13px] text-humo">
            Se entra con el mismo usuario del ERP.
          </p>
        </form>
      </div>
    </div>
  );
}
