import { ETIQUETA_DISPONIBILIDAD } from '@/lib/catalogo/mock';
import type { Disponibilidad } from '@/lib/catalogo/tipos';

const ESTILO: Record<Disponibilidad, string> = {
  disponible: 'bg-total-100 text-total-600',
  ultimas: 'bg-carbon text-white',
  'sin-stock': 'bg-[#f1f2f4] text-[#5d626b]',
  consultar: 'border border-carbon bg-white text-carbon',
};

/** La disponibilidad real la va a definir el ERP; acá solo se la muestra. */
export function EstadoStock({ estado }: { estado: Disponibilidad }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wide ${ESTILO[estado]}`}
    >
      {ETIQUETA_DISPONIBILIDAD[estado]}
    </span>
  );
}

export const sePuedeComprar = (estado: Disponibilidad) =>
  estado === 'disponible' || estado === 'ultimas';
