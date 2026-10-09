'use client';

import { useEffect, useState } from 'react';
import type { Producto } from './tipos';

/**
 * Resuelve productos por id contra la base.
 *
 * El carrito y los favoritos guardan solo ids en el navegador. Los datos se
 * piden cada vez a propósito: el precio y el stock los manda el ERP y pueden
 * haber cambiado desde que el producto entró al carrito.
 */
export function useProductos(ids: string[]): { productos: Producto[]; cargando: boolean } {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const clave = ids.slice().sort().join(',');

  useEffect(() => {
    if (!clave) {
      setProductos([]);
      return;
    }
    let vigente = true;
    setCargando(true);
    fetch(`/api/productos?ids=${encodeURIComponent(clave)}`)
      .then((r) => (r.ok ? r.json() : { productos: [] }))
      .then((d) => { if (vigente) setProductos(d.productos ?? []); })
      .catch(() => { if (vigente) setProductos([]); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [clave]);

  return { productos, cargando };
}
