'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { obtenerAdministrador, type Administrador } from '@/lib/admin/sesion';
import { ArmazonPanel } from './ArmazonPanel';

/**
 * Control de entrada al panel.
 *
 * En estático no hay servidor que redirija antes de servir la página, así que
 * el control corre en el navegador: mientras verifica no muestra nada, y si no
 * hay administrador manda al login.
 *
 * Esto es presentación. Lo que de verdad protege los datos es el RLS: aunque
 * alguien llegue a estas pantallas, la base no le deja leer ni escribir nada.
 */
export function Guardia({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Administrador | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let vigente = true;
    obtenerAdministrador()
      .then((a) => {
        if (!vigente) return;
        if (!a) { router.replace('/admin/ingresar'); return; }
        setAdmin(a);
      })
      .finally(() => { if (vigente) setVerificando(false); });
    return () => { vigente = false; };
  }, [router]);

  if (verificando || !admin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-fondo">
        <span className="size-8 animate-girar rounded-full border-3 border-total-200 border-t-total-500" aria-hidden="true" />
        <span className="sr-only">Verificando tu sesión…</span>
      </div>
    );
  }

  return <ArmazonPanel admin={admin}>{children}</ArmazonPanel>;
}
