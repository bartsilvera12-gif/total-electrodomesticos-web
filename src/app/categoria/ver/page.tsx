import { Armazon } from '@/components/Armazon';
import { ListadoPorSlug } from '@/components/ListadoPorSlug';

/**
 * Categoría que todavía no tiene su HTML generado.
 *
 * De servidor por la misma razón que /producto/ver: `Armazon` hace un await
 * para el menú y dentro de un componente cliente eso entra en bucle.
 */
export default function CategoriaPorSlug() {
  return (
    <Armazon>
      <ListadoPorSlug />
    </Armazon>
  );
}
