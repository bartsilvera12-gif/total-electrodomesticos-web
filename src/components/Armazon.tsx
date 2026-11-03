import { obtenerRubros } from '@/lib/catalogo/servicio';
import { MarcoEnVivo } from './MarcoEnVivo';

/**
 * Cabecera, pie y acceso a WhatsApp compartidos por todas las pantallas.
 *
 * Las categorías se leen acá, en el build: eso es lo que queda escrito en el
 * HTML y lo que ve un buscador. `<MarcoEnVivo>` las vuelve a pedir en el
 * navegador, así que una categoría que se activa o se desactiva en el ERP se
 * ve sin rebuildear.
 */
export async function Armazon({ children }: { children: React.ReactNode }) {
  const rubros = await obtenerRubros();

  return <MarcoEnVivo inicial={rubros}>{children}</MarcoEnVivo>;
}
