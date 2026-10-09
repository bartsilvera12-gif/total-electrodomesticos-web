import Link from 'next/link';
import { SITIO } from '@/lib/sitio';
import type { Rubro } from '@/lib/catalogo/tipos';
import { LineasWhatsapp } from './ConsultarWhatsapp';

export function Pie({ rubros }: { rubros: Rubro[] }) {
  return (
    <footer className="mt-20 border-t border-linea bg-total-50">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-total-500 uppercase">
            {SITIO.nombre}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-grafito">
            {SITIO.descripcion}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold">Categorías</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {rubros.slice(0, 6).map((r) => (
              <li key={r.id}>
                <Link href={`/categoria/${r.slug}`} className="text-sm text-grafito hover:text-total-500">
                  {r.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold">Tienda</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-grafito">
            <li><Link href="/productos" className="hover:text-total-500">Todos los productos</Link></li>
            <li><Link href="/ofertas" className="hover:text-total-500">Ofertas</Link></li>
            <li><Link href="/novedades" className="hover:text-total-500">Novedades</Link></li>
            <li><Link href="/marcas" className="hover:text-total-500">Marcas</Link></li>
            <li><Link href="/cuenta" className="hover:text-total-500">Mi cuenta</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold">Contacto</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-grafito">
            <li className="flex flex-col gap-2">
              <span className="font-semibold text-carbon">WhatsApp</span>
              <LineasWhatsapp className="hover:text-total-500" />
            </li>
            <li>
              <a href={`mailto:${SITIO.correo}`} className="break-all hover:text-total-500">{SITIO.correo}</a>
            </li>
            <li>
              <a href={SITIO.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-total-500">
                Instagram @total_electrodomesticos
              </a>
            </li>
            <li>
              <a href={SITIO.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-total-500">Facebook</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-total-200">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-5 text-[13px] text-humo">
          <span>© {new Date().getFullYear()} {SITIO.nombre}</span>
          <span className="flex gap-4">
            <Link href="/admin" className="hover:text-total-500">Panel web</Link>
            <span>
              Desarrollado por{' '}
              <a href="https://neura.com.py" target="_blank" rel="noopener noreferrer" className="font-bold text-total-500 hover:underline">
                Neura
              </a>
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
