'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PRODUCTOS, RUBROS } from '@/lib/catalogo/mock';
import { SITIO } from '@/lib/sitio';
import { slugificar } from '@/lib/formato';
import { ConsultarWhatsapp, LineasWhatsapp } from './ConsultarWhatsapp';
import { useTienda } from '@/lib/tienda/contexto';
import { Buscador } from './Buscador';
import { CarritoLateral } from './CarritoLateral';

const NAV = [
  { href: '/', etiqueta: 'Inicio' },
  { href: '/productos', etiqueta: 'Productos' },
  { href: '/categorias', etiqueta: 'Categorías', mega: true },
  { href: '/marcas', etiqueta: 'Marcas' },
  { href: '/ofertas', etiqueta: 'Ofertas' },
  { href: '/novedades', etiqueta: 'Novedades' },
];

export function Encabezado() {
  const ruta = usePathname();
  const { unidades, sesion, favoritos } = useTienda();
  const [mega, setMega] = useState(false);
  const [buscar, setBuscar] = useState(false);
  const [carrito, setCarrito] = useState(false);
  const [menu, setMenu] = useState(false);
  // La tecla del atajo depende del sistema: ⌘ en Mac, Ctrl en Windows/Linux.
  // Se resuelve en el cliente; hasta entonces no se muestra, para no
  // renderizar "⌘K" en el servidor y que la hidratación no coincida.
  const [atajo, setAtajo] = useState<string | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const plataforma = nav.userAgentData?.platform || nav.platform || nav.userAgent;
    setAtajo(/mac|iphone|ipad/i.test(plataforma) ? '⌘K' : 'Ctrl K');
  }, []);

  // ⌘K / Ctrl+K abre el buscador desde cualquier pantalla
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setBuscar(true);
        setMega(false);
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, []);

  useEffect(() => { setMega(false); setMenu(false); }, [ruta]);

  const activo = (href: string) =>
    href === '/' ? ruta === '/' : ruta.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-linea bg-white" onMouseLeave={() => setMega(false)}>
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-3.5">
          <Link href="/" aria-label={`${SITIO.nombre} — Inicio`} className="shrink-0">
            <Image src="/assets/logo-total.png" alt={SITIO.nombre} width={160} height={46} priority className="h-11 w-auto" />
          </Link>

          <nav aria-label="Principal" className="hidden min-w-0 flex-1 justify-center lg:ml-4 lg:flex min-[1360px]:ml-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setMega(Boolean(item.mega))}
                aria-expanded={item.mega ? mega : undefined}
                className={`whitespace-nowrap border-b-2 px-2 pt-2.5 pb-2 text-[14px] transition-colors min-[1360px]:px-3 min-[1360px]:text-[15px] ${
                  activo(item.href)
                    ? 'border-total-500 font-semibold text-total-500'
                    : 'border-transparent hover:text-total-500'
                }`}
              >
                {item.etiqueta}
                {item.mega && <span className="ml-1.5 text-[10px]">▾</span>}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setBuscar(true)}
              aria-label="Buscar"
              className="flex items-center gap-2.5 rounded-md border border-linea bg-fondo px-3 py-2.5 text-sm text-humo transition-colors hover:border-total-500 sm:w-44 lg:w-auto min-[1360px]:w-56"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              {/* Entre 1024 y 1360 el menú ocupa casi todo el ancho: ahí el buscador queda en ícono */}
              <span className="hidden flex-1 text-left sm:block lg:hidden min-[1360px]:block">Buscar</span>
              {atajo && (
                <kbd className="hidden whitespace-nowrap rounded border border-[#d4d8df] bg-white px-1.5 py-0.5 font-mono text-[11px] min-[1360px]:block">{atajo}</kbd>
              )}
            </button>

            <Link href="/favoritos" aria-label="Favoritos" className="relative hidden p-2.5 hover:text-total-500 sm:block">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
              </svg>
              {favoritos.length > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-total-500 text-[10px] font-bold text-white">
                  {favoritos.length}
                </span>
              )}
            </Link>

            <ConsultarWhatsapp
              alineacion="derecha"
              className="hidden cursor-pointer items-center gap-2 p-2.5 text-sm hover:text-total-500 sm:flex"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.5 20.5l1.3-4.1A8.6 8.6 0 1 1 8 19.3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
              <span className="hidden min-[1360px]:block">WhatsApp</span>
            </ConsultarWhatsapp>

            <Link href={sesion ? '/cuenta' : '/ingresar'} className="flex items-center gap-2 p-2.5 text-sm hover:text-total-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
              <span className="hidden min-[1360px]:block">{sesion ? sesion.nombre : 'Ingresar'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setCarrito(true)}
              className="flex items-center gap-2 rounded-sm bg-carbon px-4 py-2.5 text-sm font-semibold text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              <span className="hidden sm:block">Carrito</span>
              <span className="flex size-5 items-center justify-center rounded-full bg-total-500 text-[11px] font-bold">
                {unidades}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-label="Menú"
              aria-expanded={menu}
              className="p-2.5 lg:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>
          </div>
        </div>

        {mega && (
          <div
            className="absolute inset-x-0 top-full hidden border-t border-linea bg-white shadow-lg lg:block"
            onMouseLeave={() => setMega(false)}
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-5 gap-x-6 gap-y-4 px-6 py-5">
              {RUBROS.map((r) => (
                <div key={r.id}>
                  <Link href={`/categoria/${r.slug}`} className="text-[13px] font-bold hover:text-total-500">
                    {r.nombre}
                  </Link>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {r.subcategorias.map((s) => (
                      <li key={s}>
                        <Link
                          href={`/categoria/${slugificar(s)}`}
                          className="block text-[12.5px] leading-snug text-grafito hover:text-total-500"
                        >
                          {s}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {menu && (
          <div className="border-t border-linea bg-white lg:hidden">
            <nav className="flex flex-col divide-y divide-linea px-6">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="py-3.5 text-[15px] font-semibold">
                  {item.etiqueta}
                </Link>
              ))}
              <Link href="/favoritos" className="py-3.5 text-[15px] font-semibold">
                Favoritos {favoritos.length > 0 && `(${favoritos.length})`}
              </Link>
              <div className="flex flex-col gap-2 py-3.5 text-sm">
                <span className="font-semibold">WhatsApp</span>
                <LineasWhatsapp className="text-grafito hover:text-total-500" />
              </div>
            </nav>
          </div>
        )}
      </header>

      <Buscador abierto={buscar} cerrar={() => setBuscar(false)} />
      <CarritoLateral abierto={carrito} cerrar={() => setCarrito(false)} productos={PRODUCTOS} />
    </>
  );
}
