import { obtenerRubros } from '@/lib/catalogo/servicio';
import { BotonWhatsapp } from './BotonWhatsapp';
import { Encabezado } from './Encabezado';
import { Pie } from './Pie';

/**
 * Cabecera, pie y acceso a WhatsApp compartidos por todas las pantallas.
 *
 * Las categorías se resuelven acá, en el servidor, y bajan por props: así el
 * megamenú no tiene que pedirlas aparte en cada navegación.
 */
export async function Armazon({ children }: { children: React.ReactNode }) {
  const rubros = await obtenerRubros();

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
