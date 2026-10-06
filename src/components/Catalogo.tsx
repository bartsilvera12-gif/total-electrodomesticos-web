'use client';

import { useMemo, useState } from 'react';
import { FILTROS_DINAMICOS, MARCAS, PRODUCTOS, RUBROS } from '@/lib/catalogo/mock';
import { ETIQUETA_DISPONIBILIDAD } from '@/lib/catalogo/mock';
import type { Disponibilidad, Producto } from '@/lib/catalogo/tipos';
import { GrillaProductos } from './GrillaProductos';

const RANGOS: Array<{ id: string; etiqueta: string; min?: number; max?: number }> = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'a', etiqueta: 'Hasta Gs. 500.000', max: 500000 },
  { id: 'b', etiqueta: 'Gs. 500.000 a 2.000.000', min: 500000, max: 2000000 },
  { id: 'c', etiqueta: 'Gs. 2.000.000 a 4.000.000', min: 2000000, max: 4000000 },
  { id: 'd', etiqueta: 'Más de Gs. 4.000.000', min: 4000000 },
];

const DISPONIBILIDADES: Disponibilidad[] = ['disponible', 'ultimas', 'consultar', 'sin-stock'];

const ORDENES = [
  { id: 'relevancia', etiqueta: 'Relevancia' },
  { id: 'precio-asc', etiqueta: 'Menor precio' },
  { id: 'precio-desc', etiqueta: 'Mayor precio' },
  { id: 'nuevos', etiqueta: 'Novedades' },
] as const;

const normalizar = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Definida fuera del componente a propósito: declarada adentro, React la trata
 * como un tipo nuevo en cada render y vuelve a montar todos los controles.
 */
function Casilla({
  marcada, alCambiar, children,
}: { marcada: boolean; alCambiar: () => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
      <input type="checkbox" checked={marcada} onChange={alCambiar} className="size-4 accent-total-500" />
      <span>{children}</span>
    </label>
  );
}

const POR_PAGINA = 8;

export function Catalogo({
  titulo, bajada, rubroFijo, marcaFija, soloOfertasFijo, soloNuevosFijo, busquedaInicial,
}: {
  titulo: string;
  bajada?: string;
  rubroFijo?: string;
  marcaFija?: string;
  soloOfertasFijo?: boolean;
  soloNuevosFijo?: boolean;
  busquedaInicial?: string;
}) {
  const [subcategoria, setSubcategoria] = useState<string | null>(null);
  const [marcas, setMarcas] = useState<string[]>(marcaFija ? [marcaFija] : []);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [rango, setRango] = useState('todos');
  const [soloOfertas, setSoloOfertas] = useState(Boolean(soloOfertasFijo));
  const [tecnicos, setTecnicos] = useState<Record<string, string[]>>({});
  const [orden, setOrden] = useState<(typeof ORDENES)[number]['id']>('relevancia');
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const rubro = rubroFijo ? RUBROS.find((r) => r.id === rubroFijo) : null;
  // Filtros técnicos: solo los que aplican al rubro que se está mirando
  const filtrosTecnicos = rubroFijo ? (FILTROS_DINAMICOS[rubroFijo] ?? []) : [];

  const resultado = useMemo(() => {
    let items = PRODUCTOS.slice();
    if (rubroFijo) items = items.filter((p) => p.rubro === rubroFijo);
    if (soloNuevosFijo) items = items.filter((p) => p.nuevo);
    if (subcategoria) items = items.filter((p) => p.subcategoria === subcategoria);
    if (marcas.length) items = items.filter((p) => marcas.includes(p.marca));
    if (disponibilidad.length) items = items.filter((p) => disponibilidad.includes(p.disponibilidad));
    if (soloOfertas) items = items.filter((p) => p.precioAnterior && p.precioAnterior > p.precio);

    const r = RANGOS.find((x) => x.id === rango);
    if (r?.min !== undefined) items = items.filter((p) => p.precio > r.min!);
    if (r?.max !== undefined) items = items.filter((p) => p.precio <= r.max!);

    const activos = Object.entries(tecnicos).filter(([, v]) => v.length);
    if (activos.length) {
      items = items.filter((p) => {
        const texto = normalizar([p.nombre, ...p.specs].join(' '));
        return activos.every(([, valores]) => valores.some((v) => texto.includes(normalizar(v))));
      });
    }

    if (busquedaInicial?.trim()) {
      const n = normalizar(busquedaInicial);
      items = items.filter((p) =>
        [p.nombre, p.marca, p.subcategoria, p.codigo, p.specs.join(' ')]
          .some((c) => normalizar(c).includes(n)));
    }

    if (orden === 'precio-asc') items.sort((a, b) => a.precio - b.precio);
    else if (orden === 'precio-desc') items.sort((a, b) => b.precio - a.precio);
    else if (orden === 'nuevos') items.sort((a, b) => Number(b.nuevo ?? 0) - Number(a.nuevo ?? 0));

    return items;
  }, [rubroFijo, soloNuevosFijo, subcategoria, marcas, disponibilidad, soloOfertas, rango, tecnicos, orden, busquedaInicial]);

  const mostrados: Producto[] = resultado.slice(0, visibles);

  const alternar = <T,>(lista: T[], valor: T, set: (v: T[]) => void) =>
    set(lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);

  const hayFiltros =
    Boolean(subcategoria) || disponibilidad.length > 0 || rango !== 'todos'
    || Object.values(tecnicos).some((v) => v.length)
    || (marcas.length > 0 && !marcaFija)
    || (soloOfertas && !soloOfertasFijo);

  const limpiar = () => {
    setSubcategoria(null);
    setMarcas(marcaFija ? [marcaFija] : []);
    setDisponibilidad([]);
    setRango('todos');
    setTecnicos({});
    setSoloOfertas(Boolean(soloOfertasFijo));
    setVisibles(POR_PAGINA);
  };

  const filtros = (
    <div className="flex flex-col gap-7">
      {rubro && (
        <section>
          <h3 className="mb-2 font-mono text-[11px] tracking-widest text-humo uppercase">Subcategoría</h3>
          <div className="flex flex-col">
            <Casilla marcada={!subcategoria} alCambiar={() => setSubcategoria(null)}>Todas</Casilla>
            {rubro.subcategorias.map((s) => (
              <Casilla key={s} marcada={subcategoria === s} alCambiar={() => setSubcategoria(subcategoria === s ? null : s)}>
                {s}
              </Casilla>
            ))}
          </div>
        </section>
      )}

      {!marcaFija && (
        <section>
          <h3 className="mb-2 font-mono text-[11px] tracking-widest text-humo uppercase">Marca</h3>
          <div className="flex max-h-56 flex-col overflow-y-auto">
            {MARCAS.map((m) => (
              <Casilla key={m} marcada={marcas.includes(m)} alCambiar={() => alternar(marcas, m, setMarcas)}>
                {m}
              </Casilla>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 font-mono text-[11px] tracking-widest text-humo uppercase">Precio</h3>
        <div className="flex flex-col">
          {RANGOS.map((r) => (
            <label key={r.id} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
              <input
                type="radio"
                name="rango-precio"
                checked={rango === r.id}
                onChange={() => setRango(r.id)}
                className="size-4 accent-total-500"
              />
              <span>{r.etiqueta}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-mono text-[11px] tracking-widest text-humo uppercase">Disponibilidad</h3>
        <div className="flex flex-col">
          {DISPONIBILIDADES.map((d) => (
            <Casilla key={d} marcada={disponibilidad.includes(d)} alCambiar={() => alternar(disponibilidad, d, setDisponibilidad)}>
              {ETIQUETA_DISPONIBILIDAD[d]}
            </Casilla>
          ))}
        </div>
      </section>

      {!soloOfertasFijo && (
        <section>
          <Casilla marcada={soloOfertas} alCambiar={() => setSoloOfertas(!soloOfertas)}>
            Solo ofertas
          </Casilla>
        </section>
      )}

      {/* Filtros técnicos: pulgadas en TV, BTU en climatización, etc. */}
      {filtrosTecnicos.map((f) => (
        <section key={f.etiqueta}>
          <h3 className="mb-2 font-mono text-[11px] tracking-widest text-humo uppercase">{f.etiqueta}</h3>
          <div className="flex flex-col">
            {f.opciones.map((o) => {
              const actuales = tecnicos[f.etiqueta] ?? [];
              return (
                <Casilla
                  key={o}
                  marcada={actuales.includes(o)}
                  alCambiar={() =>
                    setTecnicos({
                      ...tecnicos,
                      [f.etiqueta]: actuales.includes(o)
                        ? actuales.filter((x) => x !== o)
                        : [...actuales, o],
                    })}
                >
                  {o}
                </Casilla>
              );
            })}
          </div>
        </section>
      ))}

      {hayFiltros && (
        <button
          type="button"
          onClick={limpiar}
          className="self-start rounded-sm border border-carbon px-4 py-2.5 text-sm font-semibold hover:bg-carbon hover:text-white"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <header className="mb-8">
        <h1 className="text-[clamp(28px,3.5vw,42px)] font-bold tracking-tight">{titulo}</h1>
        {bajada && <p className="mt-2 text-grafito">{bajada}</p>}
      </header>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          {filtros}
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-linea pb-4">
            <p className="text-sm text-humo">
              {resultado.length === 0
                ? 'Sin resultados'
                : `Estás viendo ${mostrados.length} de ${resultado.length} producto${resultado.length === 1 ? '' : 's'}`}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPanelAbierto(true)}
                className="rounded-sm border border-linea px-4 py-2 text-sm font-semibold lg:hidden"
              >
                Filtros
              </button>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-humo">Ordenar</span>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as typeof orden)}
                  className="rounded-sm border border-linea px-3 py-2 text-sm"
                >
                  {ORDENES.map((o) => (
                    <option key={o.id} value={o.id}>{o.etiqueta}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {resultado.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-lg font-semibold">No encontramos productos con esos filtros.</p>
              <p className="max-w-sm text-sm text-humo">
                Probá quitando alguno o escribinos y te ayudamos a encontrarlo.
              </p>
              <button
                type="button"
                onClick={limpiar}
                className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <GrillaProductos productos={mostrados} />
              {visibles < resultado.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibles((v) => v + POR_PAGINA)}
                    className="rounded-sm border border-carbon px-6 py-3 text-sm font-bold hover:bg-carbon hover:text-white"
                  >
                    Cargar más productos
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* En mobile los filtros van en un panel, no apilados arriba de la grilla */}
      {panelAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-carbon/40" onClick={() => setPanelAbierto(false)} role="presentation" />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filtros</h2>
              <button type="button" onClick={() => setPanelAbierto(false)} aria-label="Cerrar filtros" className="text-2xl leading-none">
                ×
              </button>
            </div>
            {filtros}
            <button
              type="button"
              onClick={() => setPanelAbierto(false)}
              className="mt-6 w-full rounded-sm bg-total-500 px-5 py-3.5 text-sm font-bold text-white"
            >
              Ver {resultado.length} producto{resultado.length === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
