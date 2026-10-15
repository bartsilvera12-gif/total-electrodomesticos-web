'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DetalleProducto } from '@/components/DetalleProducto';
import { useDatos } from '@/lib/useDatos';
import {
  obtenerProductoPorSlug, obtenerRelacionados, obtenerRubro,
} from '@/lib/catalogo/servicio';

/**
 * Ficha de un producto que todavía no tiene su HTML generado.
 *
 * El sitio es estático: `generateStaticParams` crea una página por producto en
 * cada build. Un producto que se publica desde el ERP después del último build
 * no tendría página y daría 404 hasta el próximo deploy.
 *
 * Para que no haya que deployar por cada producto, el .htaccess manda acá
 * cualquier /producto/<slug>/ que no exista en disco, con el slug en la query,
 * y esta página lo resuelve contra Supabase en el navegador.
 *
 * Las páginas generadas siguen existiendo y tienen prioridad: son las que
 * traen el HTML completo y los datos estructurados para los buscadores. Esto
 * es la red de contención, no el camino principal. Conviene rebuildear cada
 * tanto para que los productos nuevos también se indexen.
 */

/**
 * Saca el slug de la URL.
 *
 * El .htaccess reescribe /producto/<slug>/ hacia esta pagina pasando el slug
 * como query, PERO esa reescritura es interna de Apache: el navegador sigue
 * viendo /producto/<slug>/ y `location.search` llega vacio. Por eso el slug se
 * lee del pathname, y la query queda solo como respaldo para entrar directo a
 * /producto/ver/?slug=algo.
 */
function slugDeLaUrl(buscado: string | null, segmento: string): string {
  if (buscado) return buscado;
  if (typeof window === "undefined") return "";
  const partes = window.location.pathname.split("/").filter(Boolean);
  const i = partes.indexOf(segmento);
  const s = i >= 0 ? partes[i + 1] : "";
  // /producto/ver/ es esta misma pagina: ahi no hay slug que valga.
  return !s || s === "ver" ? "" : decodeURIComponent(s);
}

function Ficha() {
  const slug = slugDeLaUrl(useSearchParams().get('slug'), 'producto');

  const { datos, cargando, error } = useDatos(
    useCallback(async () => {
      if (!slug) return null;
      const producto = await obtenerProductoPorSlug(slug);
      if (!producto) return null;
      const [relacionados, rubro] = await Promise.all([
        obtenerRelacionados(producto, 4),
        obtenerRubro(producto.rubro),
      ]);
      return { producto, relacionados, rubro };
    }, [slug]),
    null,
  );

  // La página generada trae su <title> desde el build; esta se resuelve
  // después, así que el título se pone cuando llega el producto.
  useEffect(() => {
    if (datos?.producto) {
      document.title = `${datos.producto.marca} ${datos.producto.nombre} · Total Electrodomésticos`;
    }
  }, [datos]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-24 text-center text-sm text-humo">
        Cargando producto…
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-24 text-center">
        <p className="text-lg font-semibold">No encontramos ese producto.</p>
        <p className="mt-2 text-sm text-humo">
          Puede que ya no esté publicado o que la dirección esté mal escrita.
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-block rounded-full bg-total-500 px-6 py-3 text-[15px] font-semibold text-white"
        >
          Ver todos los productos
        </Link>
      </div>
    );
  }

  return (
    <DetalleProducto
      producto={datos.producto}
      relacionados={datos.relacionados}
      rubro={datos.rubro}
    />
  );
}

export function FichaPorSlug() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-6 py-24 text-center text-sm text-humo">
          Cargando producto…
        </div>
      }
    >
      <Ficha />
    </Suspense>
  );
}
