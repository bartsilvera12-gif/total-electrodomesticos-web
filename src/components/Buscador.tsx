'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Producto, Rubro } from '@/lib/catalogo/tipos';
import { slugificar } from '@/lib/formato';
import { guaranies } from '@/lib/formato';

const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const SUGERENCIAS = ['Smart TV', 'Aire acondicionado', 'Heladera', 'Lavarropas'];

/**
 * Buscador instantáneo. Con el catálogo real esto pasa a consultar al servidor
 * por página, no a filtrar en memoria.
 */
export function Buscador({ abierto, cerrar }: { abierto: boolean; cerrar: () => void }) {
  const [q, setQ] = useState('');
  const campo = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (abierto) {
      setQ('');
      requestAnimationFrame(() => campo.current?.focus());
    }
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar(); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto, cerrar]);

  const [resultados, setResultados] = useState<{
    productos: Producto[]; rubros: Rubro[]; marcas: string[];
  } | null>(null);
  const [buscando, setBuscando] = useState(false);

  // Se consulta al servidor con una espera corta: así no se dispara una
  // búsqueda por tecla, y el navegador nunca recibe el catálogo entero.
  useEffect(() => {
    const t = q.trim();
    if (!t) {
      setResultados(null);
      return;
    }
    let vigente = true;
    setBuscando(true);
    const id = setTimeout(() => {
      fetch(`/api/buscar?q=${encodeURIComponent(t)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (vigente && d) setResultados(d); })
        .catch(() => { if (vigente) setResultados({ productos: [], rubros: [], marcas: [] }); })
        .finally(() => { if (vigente) setBuscando(false); });
    }, 220);
    return () => { vigente = false; clearTimeout(id); };
  }, [q]);

  const vacio = resultados
    && !resultados.productos.length && !resultados.rubros.length && !resultados.marcas.length;

  const irATodos = () => {
    if (!q.trim()) return;
    cerrar();
    router.push(`/productos?q=${encodeURIComponent(q.trim())}`);
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-60 bg-carbon/40" onClick={cerrar} role="presentation">
      <div
        className="mx-auto mt-0 max-w-3xl bg-white sm:mt-20"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Buscar productos"
      >
        <form
          onSubmit={(e) => { e.preventDefault(); irATodos(); }}
          className="flex items-center gap-3 border-b border-linea px-5 py-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            ref={campo}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscá producto, marca, modelo o código…"
            aria-label="Buscar"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-humo"
          />
          <button type="button" onClick={cerrar} aria-label="Cerrar búsqueda" className="text-2xl leading-none text-humo">
            ×
          </button>
        </form>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {buscando && !resultados && (
            <p className="py-8 text-center text-sm text-humo">Buscando…</p>
          )}

          {!resultados && !buscando && (
            <div>
              <p className="mb-3 font-mono text-[11px] tracking-widest text-humo uppercase">Probá con</p>
              <div className="flex flex-wrap gap-2">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQ(s)}
                    className="rounded-full border border-linea px-3.5 py-1.5 text-sm hover:border-total-500 hover:text-total-500"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {vacio && !buscando && (
            <p className="py-8 text-center text-humo">
              No encontramos productos para <strong>{q}</strong>.
            </p>
          )}

          {resultados && !vacio && (
            <div className="flex flex-col gap-6">
              {resultados.productos.length > 0 && (
                <section>
                  <p className="mb-2 font-mono text-[11px] tracking-widest text-humo uppercase">Productos</p>
                  <ul className="divide-y divide-linea">
                    {resultados.productos.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/producto/${p.slug}`}
                          onClick={cerrar}
                          className="flex items-center justify-between gap-4 py-2.5 hover:text-total-500"
                        >
                          <span className="min-w-0">
                            <span className="font-mono text-[10px] tracking-widest text-humo uppercase">{p.marca}</span>
                            <span className="block truncate text-sm font-semibold">{p.nombre}</span>
                          </span>
                          <span className="shrink-0 text-sm font-bold">{guaranies(p.precio)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {resultados.rubros.length > 0 && (
                <section>
                  <p className="mb-2 font-mono text-[11px] tracking-widest text-humo uppercase">Categorías</p>
                  <div className="flex flex-wrap gap-2">
                    {resultados.rubros.map((r) => (
                      <Link
                        key={r.id}
                        href={`/categoria/${r.slug}`}
                        onClick={cerrar}
                        className="rounded-full border border-linea px-3.5 py-1.5 text-sm hover:border-total-500 hover:text-total-500"
                      >
                        {r.nombre}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {resultados.marcas.length > 0 && (
                <section>
                  <p className="mb-2 font-mono text-[11px] tracking-widest text-humo uppercase">Marcas</p>
                  <div className="flex flex-wrap gap-2">
                    {resultados.marcas.map((m) => (
                      <Link
                        key={m}
                        href={`/marca/${slugificar(m)}`}
                        onClick={cerrar}
                        className="rounded-full border border-linea px-3.5 py-1.5 text-sm hover:border-total-500 hover:text-total-500"
                      >
                        {m}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <button
                type="button"
                onClick={irATodos}
                className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600"
              >
                Ver todos los resultados
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
