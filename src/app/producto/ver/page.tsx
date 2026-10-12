import { Armazon } from '@/components/Armazon';
import { FichaPorSlug } from '@/components/FichaPorSlug';

/**
 * Ficha de un producto que todavía no tiene su HTML generado.
 *
 * El .htaccess manda acá cualquier /producto/<slug>/ que no exista en disco,
 * con el slug en la query. Ver el comentario de FichaPorSlug.
 *
 * Esta página es de servidor a propósito: `Armazon` lee las categorías del
 * menú con un await, y dentro de un componente cliente ese await se vuelve a
 * disparar en cada render (bucle infinito de consultas). El trabajo de
 * navegador vive en FichaPorSlug, que sí es cliente.
 */
export default function ProductoPorSlug() {
  return (
    <Armazon>
      <FichaPorSlug />
    </Armazon>
  );
}
