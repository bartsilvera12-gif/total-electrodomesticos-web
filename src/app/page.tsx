import { Armazon } from '@/components/Armazon';
import { Portada } from '@/components/Portada';
import { obtenerDestacados, obtenerMarcas, obtenerOfertas, obtenerRubros } from '@/lib/catalogo/servicio';
import { obtenerPortada } from '@/lib/home/portada';

/**
 * Portada.
 *
 * Acá se leen los datos en el build: eso es lo que queda escrito en el HTML y
 * lo que ve un buscador. `<Portada>` los vuelve a pedir en el navegador, así
 * que lo que se marca en el ERP se ve sin rebuildear.
 *
 * Qué bloques se muestran, en qué orden, los textos del hero y los banners se
 * editan desde /admin/home.
 */
export default async function Home() {
  const [destacados, ofertas, rubros, marcas, config] = await Promise.all([
    obtenerDestacados(4),
    obtenerOfertas(4),
    obtenerRubros(),
    obtenerMarcas(),
    obtenerPortada(),
  ]);

  return (
    <Armazon>
      <Portada inicial={{ destacados, ofertas, rubros, marcas, config }} />
    </Armazon>
  );
}
