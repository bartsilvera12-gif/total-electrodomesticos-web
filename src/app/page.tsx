import type { ReactNode } from 'react';
import { Armazon } from '@/components/Armazon';
import { BannersHome } from '@/components/BannersHome';
import { FilaProductos } from '@/components/FilaProductos';
import { HeroCasa } from '@/components/HeroCasa';
import {
  Beneficios, Categorias, Espacios, Institucional, Marcas,
} from '@/components/SeccionesHome';
import { obtenerDestacados, obtenerMarcas, obtenerOfertas, obtenerRubros } from '@/lib/catalogo/servicio';
import { obtenerPortada, type BloqueHome } from '@/lib/home/portada';

/**
 * Portada.
 *
 * Qué bloques se muestran, en qué orden, los textos del hero y los banners se
 * editan desde /admin/home (tablas `web_config` y `web_banner`). Si no hay
 * nada guardado, `obtenerPortada()` devuelve los valores con los que se diseñó
 * la página: la home queda exactamente igual.
 */
export default async function Home() {
  const [destacados, ofertas, rubros, marcas, portada] = await Promise.all([
    obtenerDestacados(4),
    obtenerOfertas(4),
    obtenerRubros(),
    obtenerMarcas(),
    obtenerPortada(),
  ]);

  const bloques: Record<BloqueHome, ReactNode> = {
    hero: (
      <HeroCasa
        rubros={rubros}
        titulo={portada.heroTitulo}
        tituloColor={portada.heroTituloColor}
        bajada={portada.heroBajada}
      />
    ),
    banners: <BannersHome banners={portada.banners} />,
    categorias: <Categorias rubros={rubros} />,
    espacios: <Espacios />,
    destacados: (
      <FilaProductos
        titulo="Elegidos de Total"
        productos={destacados}
        verTodo={{ href: '/productos', etiqueta: 'Ver todos los productos' }}
      />
    ),
    beneficios: <Beneficios />,
    ofertas: (
      <FilaProductos
        titulo="Oportunidades que vale la pena mirar"
        productos={ofertas}
        verTodo={{ href: '/ofertas', etiqueta: 'Ver todas las ofertas' }}
      />
    ),
    marcas: <Marcas marcas={marcas} />,
    institucional: <Institucional />,
  };

  return (
    <Armazon>
      {portada.bloques.map((id) => (
        <Fragmento key={id}>{bloques[id]}</Fragmento>
      ))}
    </Armazon>
  );
}

/** Envoltorio sin marcado: solo para poder darle `key` a cada bloque. */
function Fragmento({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
