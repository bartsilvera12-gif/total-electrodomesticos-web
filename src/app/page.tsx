import { Armazon } from '@/components/Armazon';
import { FilaProductos } from '@/components/FilaProductos';
import { HeroCasa } from '@/components/HeroCasa';
import {
  Beneficios, Categorias, Espacios, Institucional, Marcas,
} from '@/components/SeccionesHome';
import { obtenerDestacados, obtenerOfertas } from '@/lib/catalogo/servicio';

export default async function Home() {
  const [destacados, ofertas] = await Promise.all([
    obtenerDestacados(4),
    obtenerOfertas(4),
  ]);

  return (
    <Armazon>
      <HeroCasa />
      <Categorias />
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
      <Marcas />
      <Institucional />
    </Armazon>
  );
}
