'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Administrador } from '@/lib/admin/sesion';

const SECCIONES = [
  { href: '/admin', etiqueta: 'Resumen' },
  { href: '/admin/productos', etiqueta: 'Productos' },
  { href: '/admin/categorias', etiqueta: 'Categorías' },
  { href: '/admin/home', etiqueta: 'Home' },
  { href: '/admin/pedidos', etiqueta: 'Pedidos' },
];

export function ArmazonPanel({
  admin, children,
}: { admin: Administrador; children: React.ReactNode }) {
  const ruta = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);

  const activa = (href: string) =>
    href === '/admin' ? ruta === '/admin' : ruta.startsWith(href);

  async function salir() {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await sb.auth.signOut();
    router.replace('/admin/ingresar');
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-fondo lg:flex-row">
      <aside className="shrink-0 border-b border-linea bg-white lg:w-60 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 border-b border-linea px-5 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/assets/logo-total.png" alt="" width={110} height={32} className="h-8 w-auto" />
            <span className="font-mono text-[10px] tracking-widest text-humo uppercase">Panel</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-label="Menú"
            aria-expanded={menu}
            className="p-1.5 lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>
        </div>

        <nav className={`flex-col p-3 lg:flex ${menu ? 'flex' : 'hidden'}`}>
          {SECCIONES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={() => setMenu(false)}
              className={`rounded-sm px-4 py-2.5 text-sm font-semibold transition-colors ${
                activa(s.href) ? 'bg-total-50 text-total-500' : 'text-grafito hover:bg-fondo'
              }`}
            >
              {s.etiqueta}
            </Link>
          ))}
        </nav>

        <div className={`border-t border-linea p-5 text-[13px] lg:block ${menu ? 'block' : 'hidden'}`}>
          <p className="font-semibold text-carbon">{admin.nombre}</p>
          <p className="truncate text-humo">{admin.email}</p>
          <p className="mt-3 leading-relaxed text-humo">
            Precio y stock los controla el ERP. Acá se administra el contenido
            de la tienda.
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            <Link href="/" target="_blank" className="font-semibold text-total-500 hover:underline">
              Ver la tienda →
            </Link>
            <button type="button" onClick={salir} className="self-start text-humo hover:text-carbon">
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
