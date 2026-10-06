import type { Producto } from '@/lib/catalogo/tipos';
import { TarjetaProducto } from './TarjetaProducto';

export function GrillaProductos({ productos }: { productos: Producto[] }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-linea lg:grid-cols-4">
      {productos.map((p) => (
        <div key={p.id} className="bg-white">
          <TarjetaProducto producto={p} />
        </div>
      ))}
    </div>
  );
}

/** Esqueletos de carga con la misma silueta que la grilla real */
export function GrillaEsqueleto({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-linea lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="animate-pulso bg-white p-4">
          <div className="aspect-4/3 bg-total-50" />
          <div className="mt-4 h-3 w-1/3 bg-linea" />
          <div className="mt-2 h-4 w-4/5 bg-linea" />
          <div className="mt-2 h-3 w-2/3 bg-linea" />
          <div className="mt-4 h-6 w-1/2 bg-linea" />
        </div>
      ))}
    </div>
  );
}
