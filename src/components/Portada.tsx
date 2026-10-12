'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { BannersHome } from './BannersHome';
import { FilaProductos } from './FilaProductos';
import { HeroCasa } from './HeroCasa';
import { Beneficios, Categorias, Espacios, Institucional, Marcas } from './SeccionesHome';
import {
  obtenerDestacados, obtenerMarcas, obtenerOfertas, obtenerRubros,
} from '@/lib/catalogo/servicio';
import { obtenerPortada, type BloqueHome, type Portada as Config } from '@/lib/home/portada';
import type { Producto, Rubro } from '@/lib/catalogo/tipos';

export interface DatosPortada {
  destacados: Producto[];
  ofertas: Producto[];
  rubros: Rubro[];
  marcas: string[];
  config: Config;
}

/**
 * Portada.
 *
 * Se dibuja con los datos del build (eso es lo que ve un buscador en el HTML)
 * y vuelve a consultar en el navegador apenas carga. Así, lo que se marca en el
 * ERP —destacados, ofertas, categorías— aparece sin tener que rebuildear y
 * publicar el sitio.
 *
 * Mientras tanto se sigue viendo la versión del build, no un cargando: si la
 * consulta falla, la portada queda como estaba.
 */
export function Portada({ inicial }: { inicial: DatosPortada }) {
  const [d, setD] = useState<DatosPortada>(inicial);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const [destacados, ofertas, rubros, marcas, config] = await Promise.all([
          obtenerDestacados(4),
          obtenerOfertas(4),
          obtenerRubros(),
          obtenerMarcas(),
          obtenerPortada(),
        ]);
        if (vigente) setD({ destacados, ofertas, rubros, marcas, config });
      } catch {
        // Se queda con lo del build.
      }
    })();
    return () => { vigente = false; };
  }, []);

  const bloques: Record<BloqueHome, ReactNode> = {
    hero: (
      <HeroCasa
        rubros={d.rubros}
        titulo={d.config.heroTitulo}
        tituloColor={d.config.heroTituloColor}
        bajada={d.config.heroBajada}
      />
    ),
    banners: <BannersHome banners={d.config.banners} />,
    categorias: <Categorias rubros={d.rubros} />,
    espacios: <Espacios />,
    destacados: (
      <FilaProductos
        titulo="Elegidos de Total"
        productos={d.destacados}
        verTodo={{ href: '/productos', etiqueta: 'Ver todos los productos' }}
      />
    ),
    beneficios: <Beneficios />,
    ofertas: (
      <FilaProductos
        titulo="Oportunidades que vale la pena mirar"
        productos={d.ofertas}
        verTodo={{ href: '/ofertas', etiqueta: 'Ver todas las ofertas' }}
      />
    ),
    marcas: <Marcas marcas={d.marcas} />,
    institucional: <Institucional />,
  };

  return (
    <>
      {d.config.bloques.map((id) => (
        <Fragmento key={id}>{bloques[id]}</Fragmento>
      ))}
    </>
  );
}

/** Envoltorio sin marcado: solo para poder darle `key` a cada bloque. */
function Fragmento({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
