'use client';

import { useState, useTransition } from 'react';
import { borrarBanner, guardarBanner, reordenarBanners } from '@/lib/admin/acciones';
import type { BannerPanel } from '@/lib/admin/consultas';

/**
 * Banners de la portada.
 *
 * Es la franja de promos que va debajo del hero. Si no hay ninguno activo, la
 * franja no aparece en la tienda.
 *
 * El hero (la casa animada) no se toca desde acá: sus textos están arriba, en
 * "Textos de la portada".
 */

type Borrador = {
  id?: string;
  titulo: string;
  bajada: string;
  imagenUrl: string;
  enlace: string;
  activo: boolean;
};

const VACIO: Borrador = {
  titulo: '',
  bajada: '',
  imagenUrl: '',
  enlace: '',
  activo: true,
};

const entrada =
  'rounded-sm border border-[#c9ced8] px-3 py-2.5 text-[15px] font-normal';
const etiqueta = 'flex flex-col gap-1.5 text-[13px] font-semibold';

export function EditorBanners({ iniciales }: { iniciales: BannerPanel[] }) {
  const [lista, setLista] = useState<BannerPanel[]>(iniciales);
  const [editando, setEditando] = useState<Borrador | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  /** Banner esperando confirmación de borrado. */
  const [porBorrar, setPorBorrar] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  function avisar(e: unknown) {
    setMensaje(e instanceof Error ? e.message : 'No se pudo guardar');
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    const b = editando;
    if (!b.titulo.trim()) {
      setMensaje('El banner necesita un título.');
      return;
    }
    iniciar(async () => {
      setMensaje(null);
      try {
        const orden =
          lista.find((x) => x.id === b.id)?.orden ?? lista.length;
        const id = await guardarBanner({ ...b, orden });
        const fila: BannerPanel = {
          id,
          titulo: b.titulo.trim(),
          bajada: b.bajada.trim() || null,
          imagenUrl: b.imagenUrl.trim() || null,
          enlace: b.enlace.trim() || null,
          activo: b.activo,
          orden,
        };
        setLista((prev) =>
          prev.some((x) => x.id === id)
            ? prev.map((x) => (x.id === id ? fila : x))
            : [...prev, fila],
        );
        setEditando(null);
        setMensaje('Guardado. Ya se ve en la tienda.');
      } catch (err) {
        avisar(err);
      }
    });
  }

  function alternar(b: BannerPanel) {
    const antes = lista;
    // Optimista: si la base lo rechaza, se vuelve atrás.
    setLista((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, activo: !x.activo } : x)),
    );
    iniciar(async () => {
      setMensaje(null);
      try {
        await guardarBanner({
          id: b.id,
          titulo: b.titulo,
          bajada: b.bajada ?? '',
          imagenUrl: b.imagenUrl ?? '',
          enlace: b.enlace ?? '',
          activo: !b.activo,
          orden: b.orden,
        });
      } catch (err) {
        setLista(antes);
        avisar(err);
      }
    });
  }

  /**
   * Borrar pide confirmación en la propia página, no con el cuadro del
   * navegador. Chrome deja de mostrar esos diálogos cuando aparecen varios
   * seguidos —y en algunos navegadores embebidos no aparecen nunca—: ahí
   * `confirm()` devuelve false solo y el botón no hacía nada, sin aviso.
   */
  function borrar(b: BannerPanel) {
    const antes = lista;
    setLista((prev) => prev.filter((x) => x.id !== b.id));
    iniciar(async () => {
      setMensaje(null);
      try {
        await borrarBanner(b.id);
      } catch (err) {
        setLista(antes);
        avisar(err);
      }
    });
  }

  function mover(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= lista.length) return;
    const antes = lista;
    const copia = [...lista];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    setLista(copia.map((x, k) => ({ ...x, orden: k })));
    iniciar(async () => {
      setMensaje(null);
      try {
        await reordenarBanners(copia.map((x) => x.id));
      } catch (err) {
        setLista(antes);
        avisar(err);
      }
    });
  }

  return (
    <section className="flex flex-col gap-5 border border-linea bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">Banners de la portada</h2>
          <p className="mt-0.5 text-[13px] text-humo">
            La franja de promos debajo del hero. Sin banners activos, la franja
            no aparece.
          </p>
        </div>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando({ ...VACIO })}
            className="rounded-sm bg-carbon px-4 py-2 text-[13px] font-semibold text-white"
          >
            Agregar banner
          </button>
        )}
      </div>

      {mensaje && (
        <p className="rounded-sm bg-[#f1f2f4] px-4 py-3 text-sm">{mensaje}</p>
      )}

      {lista.length === 0 && !editando && (
        <p className="text-[13px] text-humo">Todavía no hay banners cargados.</p>
      )}

      {lista.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {lista.map((b, i) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-3 border border-linea px-3 py-2.5"
            >
              <span className="flex flex-col">
                <span className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0 || pendiente}
                    aria-label="Subir"
                    className="leading-none text-humo disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === lista.length - 1 || pendiente}
                    aria-label="Bajar"
                    className="leading-none text-humo disabled:opacity-30"
                  >
                    ▼
                  </button>
                </span>
              </span>

              {b.imagenUrl ? (
                // Imagen externa arbitraria: <img> y no next/image, que en
                // export estático exige declarar los dominios.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.imagenUrl}
                  alt=""
                  className="h-10 w-16 shrink-0 border border-linea object-cover"
                />
              ) : (
                <span className="flex h-10 w-16 shrink-0 items-center justify-center border border-linea bg-[#f1f2f4] text-[10px] text-humo">
                  sin foto
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">
                  {b.titulo}
                </span>
                <span className="block truncate text-[12px] text-humo">
                  {b.enlace || 'sin enlace'}
                </span>
              </span>

              <label className="flex shrink-0 items-center gap-1.5 text-[13px]">
                <input
                  type="checkbox"
                  checked={b.activo}
                  onChange={() => alternar(b)}
                  disabled={pendiente}
                />
                Activo
              </label>

              <button
                type="button"
                onClick={() =>
                  setEditando({
                    id: b.id,
                    titulo: b.titulo,
                    bajada: b.bajada ?? '',
                    imagenUrl: b.imagenUrl ?? '',
                    enlace: b.enlace ?? '',
                    activo: b.activo,
                  })
                }
                className="shrink-0 text-[13px] font-semibold underline"
              >
                Editar
              </button>
              {porBorrar === b.id ? (
                <span className="flex shrink-0 items-center gap-2 text-[13px]">
                  <span className="text-[#b42318]">¿Borrar?</span>
                  <button
                    type="button"
                    onClick={() => { setPorBorrar(null); borrar(b); }}
                    disabled={pendiente}
                    className="font-semibold text-[#b42318] underline disabled:opacity-40"
                  >
                    Sí, borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPorBorrar(null)}
                    className="text-[#667085] underline"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setPorBorrar(b.id)}
                  disabled={pendiente}
                  className="shrink-0 text-[13px] font-semibold text-[#b42318] underline disabled:opacity-40"
                >
                  Borrar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editando && (
        <form onSubmit={guardar} className="grid gap-4 border-t border-linea pt-5">
          <label className={etiqueta}>
            Título
            <input
              value={editando.titulo}
              onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
              className={entrada}
            />
          </label>

          <label className={etiqueta}>
            Bajada
            <input
              value={editando.bajada}
              onChange={(e) => setEditando({ ...editando, bajada: e.target.value })}
              className={entrada}
            />
          </label>

          <label className={etiqueta}>
            Dirección de la imagen
            <input
              value={editando.imagenUrl}
              onChange={(e) => setEditando({ ...editando, imagenUrl: e.target.value })}
              placeholder="https://…"
              className={entrada}
            />
            <span className="text-[12px] font-normal text-humo">
              Sin imagen el banner se muestra sobre fondo celeste.
            </span>
          </label>

          <label className={etiqueta}>
            Enlace
            <input
              value={editando.enlace}
              onChange={(e) => setEditando({ ...editando, enlace: e.target.value })}
              placeholder="/ofertas"
              className={entrada}
            />
            <span className="text-[12px] font-normal text-humo">
              Una ruta de la tienda («/ofertas») o una dirección completa.
              Vacío = el banner no se puede clickear.
            </span>
          </label>

          <label className="flex items-center gap-2 text-[13px] font-semibold">
            <input
              type="checkbox"
              checked={editando.activo}
              onChange={(e) => setEditando({ ...editando, activo: e.target.checked })}
            />
            Activo
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pendiente}
              className="rounded-sm bg-carbon px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {pendiente ? 'Guardando…' : 'Guardar banner'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(null);
                setMensaje(null);
              }}
              className="rounded-sm border border-[#c9ced8] px-5 py-2.5 text-[13px] font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
