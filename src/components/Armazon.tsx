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
    <div className="flex min-h-dvh flex-col">
      <Encabezado rubros={rubros} />
      <main className="flex-1">{children}</main>
      <Pie rubros={rubros} />
      <BotonWhatsapp />
    </div>
  );
}
