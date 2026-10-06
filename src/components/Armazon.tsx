import { BotonWhatsapp } from './BotonWhatsapp';
import { Encabezado } from './Encabezado';
import { Pie } from './Pie';

/** Cabecera, pie y acceso a WhatsApp compartidos por todas las pantallas de la tienda */
export function Armazon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Encabezado />
      <main className="flex-1">{children}</main>
      <Pie />
      <BotonWhatsapp />
    </div>
  );
}
