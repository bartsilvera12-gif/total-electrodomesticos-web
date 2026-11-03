'use client';

import type { Rubro } from '@/lib/catalogo/tipos';
import { useRubrosVivos } from '@/lib/catalogo/useCatalogoVivo';
import { BotonWhatsapp } from './BotonWhatsapp';
import { Encabezado } from './Encabezado';
import { Pie } from './Pie';

/**
 * Cabecera y pie con las categorías al día.
 *
 * Existe por el export estático: `Armazon` las lee en el build y quedan
 * escritas en el HTML, así que el megamenú y el pie mostraban las categorías
 * del día que se compiló. Acá se vuelven a pedir en el navegador.
 *
 * `children` baja ya renderizado desde el servidor; esto solo lo envuelve.
 */
export function MarcoEnVivo({
  inicial,
  children,
}: {
  inicial: Rubro[];
  children: React.ReactNode;
}) {
  const rubros = useRubrosVivos(inicial);

  return (
    // `overflow-x-clip`: el cajon del carrito es `fixed` y, cerrado, queda
    // corrido a la derecha fuera de la pantalla. Aun asi sumaba area
    // deslizable, y en celular la pagina entera se movia para los costados.
    // `clip` corta ese excedente sin romper el `sticky` del encabezado, que es
    // lo que si rompe `overflow-x: hidden`.
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <Encabezado rubros={rubros} />
      <main className="flex-1">{children}</main>
      <Pie rubros={rubros} />
      <BotonWhatsapp />
    </div>
  );
}
