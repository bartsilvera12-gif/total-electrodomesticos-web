'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { CLAVES, escribir, leer } from './almacenamiento';
import type { LineaCarrito, Sesion } from './tipos';

interface EstadoTienda {
  /** Arranca vacío. Se rehidrata del navegador después del montaje. */
  carrito: LineaCarrito[];
  favoritos: string[];
  sesion: Sesion | null;
  /** false hasta que se leyó el almacenamiento, para no parpadear en el render del servidor */
  listo: boolean;

  agregar: (productoId: string, cantidad?: number) => void;
  cambiarCantidad: (productoId: string, cantidad: number) => void;
  quitar: (productoId: string) => void;
  vaciarCarrito: () => void;
  unidades: number;

  alternarFavorito: (productoId: string) => void;
  esFavorito: (productoId: string) => boolean;

  ingresar: (sesion: Sesion) => void;
  salir: () => Promise<void>;
}

const Contexto = createContext<EstadoTienda | null>(null);

/**
 * El carrito y los favoritos siguen en el navegador a propósito: son de este
 * dispositivo y no hace falta cuenta para armarlos. La sesión y los pedidos sí
 * viven en el servidor.
 */
function navegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function ProveedorTienda({ children }: { children: ReactNode }) {
  const [carrito, setCarrito] = useState<LineaCarrito[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);

  // El carrito y los favoritos, del navegador. La sesión, de Supabase.
  useEffect(() => {
    setCarrito(leer<LineaCarrito[]>(CLAVES.carrito, []));
    setFavoritos(leer<string[]>(CLAVES.favoritos, []));

    const sb = navegador();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const m = (user.user_metadata ?? {}) as Record<string, string>;
        setSesion({
          nombre: m.nombre || user.email?.split('@')[0] || 'Cliente',
          apellido: m.apellido ?? '',
          correo: user.email ?? '',
          documento: m.documento,
          telefono: m.telefono,
        });
      }
      setListo(true);
    });

    // Si inicia o cierra sesión en otra pestaña, acá se entera
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      if (!s) setSesion(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (listo) escribir(CLAVES.carrito, carrito); }, [carrito, listo]);
  useEffect(() => { if (listo) escribir(CLAVES.favoritos, favoritos); }, [favoritos, listo]);

  const agregar = useCallback((productoId: string, cantidad = 1) => {
    setCarrito((actual) => {
      const linea = actual.find((l) => l.productoId === productoId);
      if (!linea) return [...actual, { productoId, cantidad }];
      return actual.map((l) =>
        l.productoId === productoId ? { ...l, cantidad: l.cantidad + cantidad } : l);
    });
  }, []);

  const cambiarCantidad = useCallback((productoId: string, cantidad: number) => {
    if (cantidad < 1) return;
    setCarrito((actual) =>
      actual.map((l) => (l.productoId === productoId ? { ...l, cantidad } : l)));
  }, []);

  const quitar = useCallback((productoId: string) => {
    setCarrito((actual) => actual.filter((l) => l.productoId !== productoId));
  }, []);

  const vaciarCarrito = useCallback(() => setCarrito([]), []);

  const alternarFavorito = useCallback((productoId: string) => {
    setFavoritos((actual) =>
      actual.includes(productoId)
        ? actual.filter((id) => id !== productoId)
        : [...actual, productoId]);
  }, []);

  const ingresar = useCallback((nueva: Sesion) => {
    setSesion(nueva);
  }, []);

  const salir = useCallback(async () => {
    await navegador().auth.signOut();
    setSesion(null);
  }, []);

  const unidades = useMemo(
    () => carrito.reduce((t, l) => t + l.cantidad, 0),
    [carrito],
  );

  const valor = useMemo<EstadoTienda>(() => ({
    carrito, favoritos, sesion, listo,
    agregar, cambiarCantidad, quitar, vaciarCarrito, unidades,
    alternarFavorito,
    esFavorito: (id: string) => favoritos.includes(id),
    ingresar, salir,
  }), [
    carrito, favoritos, sesion, listo, unidades,
    agregar, cambiarCantidad, quitar, vaciarCarrito,
    alternarFavorito, ingresar, salir,
  ]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTienda(): EstadoTienda {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useTienda necesita estar dentro de <ProveedorTienda>');
  return ctx;
}
