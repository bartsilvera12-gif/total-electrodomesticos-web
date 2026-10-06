'use client';

/**
 * Persistencia del lado del cliente.
 *
 * Mientras no haya base de datos, el carrito, la sesión y los pedidos viven en
 * localStorage. Es deliberadamente la única capa que sabe esto: cuando se cree
 * el schema, se reimplementan estas funciones contra la API y el resto queda igual.
 *
 * Todo acceso va envuelto en try/catch porque en ventana privada, con el
 * almacenamiento bloqueado o durante el render del servidor, esto no existe.
 */

const PREFIJO = 'total:';

export function leer<T>(clave: string, porDefecto: T): T {
  if (typeof window === 'undefined') return porDefecto;
  try {
    const crudo = window.localStorage.getItem(PREFIJO + clave);
    return crudo ? (JSON.parse(crudo) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function escribir(clave: string, valor: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento la sesión dura lo que dura la pestaña. No es motivo para romper.
  }
}

export function borrar(clave: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PREFIJO + clave);
  } catch {
    /* ídem */
  }
}

export const CLAVES = {
  carrito: 'carrito',
  sesion: 'sesion',
  pedidos: 'pedidos',
  favoritos: 'favoritos',
  ultimoNumero: 'ultimo-numero-pedido',
} as const;
