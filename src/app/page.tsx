import { Armazon } from '@/components/Armazon';
import { FilaProductos } from '@/components/FilaProductos';
import { HeroCasa } from '@/components/HeroCasa';
import {
  Beneficios, Categorias, Espacios, Institucional, Marcas,
} from '@/components/SeccionesHome';
import { obtenerDestacados, obtenerMarcas, obtenerOfertas, obtenerRubros } from '@/lib/catalogo/servicio';

export default async function Home() {
  const [destacados, ofertas, rubros, marcas] = await Promise.all([
    obtenerDestacados(4),
    obtenerOfertas(4),
    obtenerRubros(),
    obtenerMarcas(),
  ]);

  return (
    <Armazon>
      <HeroCasa rubros={rubros} />
      <Categorias rubros={rubros} />
      <Espacios />
      <FilaProductos
        titulo="Elegidos de Total"
        productos={destacados}
        verTodo={{ href: '/productos', etiqueta: 'Ver todos los productos' }}
      />
      <Beneficios />
      <FilaProductos
        titulo="Oportunidades que vale la pena mirar"
        productos={ofertas}
        verTodo={{ href: '/ofertas', etiqueta: 'Ver todas las ofertas' }}
      />
      <Marcas marcas={marcas} />
      <Institucional />
    </Armazon>
  );
}
