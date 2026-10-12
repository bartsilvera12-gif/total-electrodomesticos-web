'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Carga datos en el navegador.
 *
 * Sin servidor, la pantalla se dibuja primero y pide después; esto da el estado
 * de carga y el `recargar` para refrescar tras guardar.
 *
 * Lo usa el panel y también la ficha de producto que se resuelve en el
 * navegador, por eso vive acá y no en lib/admin.
 */
export function useDatos<T>(cargar: () => Promise<T>, inicial: T) {
  const [datos, setDatos] = useState<T>(inicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    cargar()
      .then((d) => { if (vigente) setDatos(d); })
      .catch((e) => { if (vigente) setError(e instanceof Error ? e.message : 'No se pudo cargar'); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [cargar]);

  useEffect(() => recargar(), [recargar]);

  return { datos, cargando, error, recargar };
}
