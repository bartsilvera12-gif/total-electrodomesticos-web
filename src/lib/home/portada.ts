import { supa, supaBuild } from '@/lib/supabase/cliente';

/**
 * Contenido editable de la portada: textos, qué bloques se muestran y en qué
 * orden, y los banners promocionales.
 *
 * Esto lo edita el panel en /admin/home y vive en `total.web_config` y
 * `total.web_banner`. Las dos tablas las lee cualquiera (son el contenido
 * público de la home), así que no hace falta sesión.
 *
 * REGLA: si la lectura falla o no hay fila, se devuelven los valores por
 * defecto, que son los textos con los que se diseñó la portada. La tienda
 * nunca queda en blanco por un problema de base.
 */

const sb = () => (typeof window === 'undefined' ? supaBuild() : supa());

/** Identificadores de los bloques de la home, en el orden con que se diseñó. */
export const BLOQUES_HOME = [
  'hero',
  'banners',
  'categorias',
  'espacios',
  'destacados',
  'beneficios',
  'ofertas',
  'marcas',
  'institucional',
] as const;

export type BloqueHome = (typeof BLOQUES_HOME)[number];

export interface Banner {
  id: string;
  titulo: string;
  bajada: string | null;
  imagenUrl: string | null;
  enlace: string | null;
}

export interface Portada {
  barraSuperior: string | null;
  heroTitulo: string;
  /** Parte del título que va en color. Puede ser vacía. */
  heroTituloColor: string;
  heroBajada: string;
  seoTitulo: string | null;
  seoDesc: string | null;
  /** Bloques visibles, ya ordenados. */
  bloques: BloqueHome[];
  banners: Banner[];
}

const HERO_TITULO = 'Todo para tu casa.';
const HERO_TITULO_COLOR = 'Todo en un solo lugar.';
const HERO_BAJADA =
  'Tecnología, electrodomésticos, muebles y productos para acompañar cada espacio de tu hogar.';

export const PORTADA_POR_DEFECTO: Portada = {
  barraSuperior: null,
  heroTitulo: HERO_TITULO,
  heroTituloColor: HERO_TITULO_COLOR,
  heroBajada: HERO_BAJADA,
  seoTitulo: null,
  seoDesc: null,
  bloques: [...BLOQUES_HOME],
  banners: [],
};

/**
 * Parte el título en dos: lo que va en negro y lo que va en color.
 *
 * Se marca con "|". Sin "|" se corta después del primer punto, que es como
 * está escrito el título original ("Todo para tu casa. Todo en un solo
 * lugar."). Si no hay ni "|" ni punto, va todo en negro.
 */
export function partirTitulo(titulo: string): { base: string; color: string } {
  const t = titulo.trim();
  if (!t) return { base: HERO_TITULO, color: HERO_TITULO_COLOR };

  const barra = t.indexOf('|');
  if (barra >= 0) {
    return {
      base: t.slice(0, barra).trim(),
      color: t.slice(barra + 1).trim(),
    };
  }

  const punto = t.indexOf('. ');
  if (punto >= 0) {
    return {
      base: t.slice(0, punto + 1).trim(),
      color: t.slice(punto + 2).trim(),
    };
  }

  return { base: t, color: '' };
}

interface FilaConfig {
  barra_superior: string | null;
  hero_titulo: string | null;
  hero_bajada: string | null;
  seo_titulo: string | null;
  seo_desc: string | null;
  bloques: Array<{ id?: string; visible?: boolean }> | null;
}

interface FilaBanner {
  id: string;
  titulo: string;
  bajada: string | null;
  imagen_url: string | null;
  enlace: string | null;
}

/** Deja solo los ids conocidos y visibles, en el orden que guardó el panel. */
function resolverBloques(guardados: FilaConfig['bloques']): BloqueHome[] {
  if (!Array.isArray(guardados) || guardados.length === 0) return [...BLOQUES_HOME];

  const conocidos = new Set<string>(BLOQUES_HOME);
  const vistos = new Set<string>();
  const orden: BloqueHome[] = [];

  for (const b of guardados) {
    const id = typeof b?.id === 'string' ? b.id : '';
    if (!conocidos.has(id) || vistos.has(id)) continue;
    vistos.add(id);
    if (b?.visible === false) continue;
    orden.push(id as BloqueHome);
  }

  // Un bloque que la config todavía no conoce (porque se agregó al sitio
  // después de la última vez que se guardó) se muestra igual, pero en el lugar
  // que le corresponde por diseño, no al final: si se agrega "banners" y la
  // config es vieja, la franja va debajo del hero y no pegada al pie.
  for (let i = 0; i < BLOQUES_HOME.length; i++) {
    const id = BLOQUES_HOME[i];
    if (vistos.has(id)) continue;

    // Se engancha después del bloque anterior que sí esté en la lista.
    let destino = 0;
    for (let j = i - 1; j >= 0; j--) {
      const pos = orden.indexOf(BLOQUES_HOME[j]);
      if (pos >= 0) {
        destino = pos + 1;
        break;
      }
    }
    orden.splice(destino, 0, id);
  }

  return orden;
}

export async function obtenerPortada(): Promise<Portada> {
  try {
    const [cfg, ban] = await Promise.all([
      sb()
        .from('web_config')
        .select('barra_superior, hero_titulo, hero_bajada, seo_titulo, seo_desc, bloques')
        .limit(1)
        .maybeSingle(),
      sb()
        .from('web_banner')
        .select('id, titulo, bajada, imagen_url, enlace')
        .eq('activo', true)
        .order('orden')
        .order('created_at'),
    ]);

    const c = (cfg.data ?? null) as FilaConfig | null;
    const titulo = partirTitulo(c?.hero_titulo ?? '');

    const banners: Banner[] = ((ban.data ?? []) as FilaBanner[]).map((b) => ({
      id: b.id,
      titulo: b.titulo,
      bajada: b.bajada,
      imagenUrl: b.imagen_url,
      enlace: b.enlace,
    }));

    return {
      barraSuperior: c?.barra_superior?.trim() || null,
      heroTitulo: titulo.base,
      heroTituloColor: titulo.color,
      heroBajada: c?.hero_bajada?.trim() || HERO_BAJADA,
      seoTitulo: c?.seo_titulo?.trim() || null,
      seoDesc: c?.seo_desc?.trim() || null,
      bloques: resolverBloques(c?.bloques ?? null),
      banners,
    };
  } catch {
    return PORTADA_POR_DEFECTO;
  }
}
