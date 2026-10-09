'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { guardarConfig } from '@/lib/admin/acciones';

interface Bloque { id: string; nombre: string; visible: boolean }

const BLOQUES_POR_DEFECTO: Bloque[] = [
  { id: 'hero', nombre: 'Hero · La casa Total', visible: true },
  { id: 'categorias', nombre: 'Categorías', visible: true },
  { id: 'espacios', nombre: '¿Qué querés equipar?', visible: true },
  { id: 'destacados', nombre: 'Elegidos de Total', visible: true },
  { id: 'beneficios', nombre: 'Beneficios', visible: true },
  { id: 'ofertas', nombre: 'Ofertas', visible: true },
  { id: 'marcas', nombre: 'Marcas', visible: true },
  { id: 'institucional', nombre: 'Total para tu hogar + Redes', visible: true },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EditorHome({ config }: { config: any }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [barra, setBarra] = useState(config?.barra_superior ?? '');
  const [heroTitulo, setHeroTitulo] = useState(config?.hero_titulo ?? '');
  const [heroBajada, setHeroBajada] = useState(config?.hero_bajada ?? '');
  const [seoTitulo, setSeoTitulo] = useState(config?.seo_titulo ?? '');
  const [seoDesc, setSeoDesc] = useState(config?.seo_desc ?? '');
  const [bloques, setBloques] = useState<Bloque[]>(
    config?.bloques?.length ? config.bloques : BLOQUES_POR_DEFECTO,
  );

  const mover = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= bloques.length) return;
    const copia = [...bloques];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    setBloques(copia);
  };

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      setMensaje(null);
      try {
        await guardarConfig({
          barraSuperior: barra, heroTitulo, heroBajada, seoTitulo, seoDesc, bloques,
        });
        setMensaje('Guardado. Ya se ve en la tienda.');
        router.refresh();
      } catch (err) {
        setMensaje(err instanceof Error ? err.message : 'No se pudo guardar');
      }
    });
  }

  return (
    <form onSubmit={guardar} className="mt-6 grid max-w-4xl gap-6">
      <section className="flex flex-col gap-5 border border-linea bg-white p-6">
        <h2 className="text-sm font-bold">Textos de la portada</h2>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Barra superior
          <input
            value={barra}
            onChange={(e) => setBarra(e.target.value)}
            className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Título del hero
          <input
            value={heroTitulo}
            onChange={(e) => setHeroTitulo(e.target.value)}
            className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Bajada del hero
          <textarea
            rows={2}
            value={heroBajada}
            onChange={(e) => setHeroBajada(e.target.value)}
            className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
          />
        </label>
      </section>

      <section className="border border-linea bg-white p-6">
        <h2 className="text-sm font-bold">Bloques de la portada</h2>
        <p className="mt-1 text-[13px] text-humo">Orden y visibilidad.</p>
        <ul className="mt-4 divide-y divide-linea border border-linea">
          {bloques.map((b, i) => (
            <li key={b.id} className="flex items-center justify-between gap-4 p-3.5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={b.visible}
                  onChange={() => setBloques(bloques.map((x, j) => (j === i ? { ...x, visible: !x.visible } : x)))}
                  className="size-4 accent-total-500"
                />
                <span className="text-sm font-semibold">{b.nombre}</span>
              </label>
              <span className="flex gap-1">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="rounded-sm border border-linea px-2.5 py-1 disabled:opacity-30">↑</button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === bloques.length - 1} aria-label="Bajar" className="rounded-sm border border-linea px-2.5 py-1 disabled:opacity-30">↓</button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-5 border border-linea bg-white p-6">
        <h2 className="text-sm font-bold">SEO de la portada</h2>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Título
          <input
            value={seoTitulo}
            onChange={(e) => setSeoTitulo(e.target.value)}
            className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Descripción
          <textarea
            rows={2}
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
            className="rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal"
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-sm bg-total-500 px-6 py-3.5 text-sm font-bold text-white hover:bg-total-600 disabled:opacity-60"
        >
          {pendiente ? 'Guardando…' : 'Guardar'}
        </button>
        {mensaje && <span className="text-sm text-humo">{mensaje}</span>}
      </div>
    </form>
  );
}
