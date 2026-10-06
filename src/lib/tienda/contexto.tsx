'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import type { Producto } from '@/lib/catalogo/tipos';
import { CLAVES, escribir, leer } from './almacenamiento';
import type {
  Cliente, Entrega, EstadoPago, LineaCarrito, Pedido, Sesion,
} from './tipos';

interface EstadoTienda {
  /** Arranca vacío. Se rehidrata del navegador después del montaje. */
  carrito: LineaCarrito[];
  favoritos: string[];
  sesion: Sesion | null;
  pedidos: Pedido[];
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
  salir: () => void;

  crearPedido: (datos: {
    productos: Producto[];
    cliente: Cliente;
    entrega: Entrega;
    estadoPago: EstadoPago;
  }) => Pedido;
}

const Contexto = createContext<EstadoTienda | null>(null);

/** W-000128 fue el último número del prototipo; seguimos desde ahí. */
const NUMERO_INICIAL = 128;

function siguienteNumero(): string {
  const ultimo = leer<number>(CLAVES.ultimoNumero, NUMERO_INICIAL);
  const proximo = ultimo + 1;
  escribir(CLAVES.ultimoNumero, proximo);
  return `W-${String(proximo).padStart(6, '0')}`;
}

export function ProveedorTienda({ children }: { children: ReactNode }) {
  const [carrito, setCarrito] = useState<LineaCarrito[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [listo, setListo] = useState(false);

  // Rehidratar una sola vez, ya en el cliente
  useEffect(() => {
    setCarrito(leer<LineaCarrito[]>(CLAVES.carrito, []));
    setFavoritos(leer<string[]>(CLAVES.favoritos, []));
    setSesion(leer<Sesion | null>(CLAVES.sesion, null));
    setPedidos(leer<Pedido[]>(CLAVES.pedidos, []));
    setListo(true);
  }, []);

  useEffect(() => { if (listo) escribir(CLAVES.carrito, carrito); }, [carrito, listo]);
  useEffect(() => { if (listo) escribir(CLAVES.favoritos, favoritos); }, [favoritos, listo]);
  useEffect(() => { if (listo) escribir(CLAVES.pedidos, pedidos); }, [pedidos, listo]);

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
    escribir(CLAVES.sesion, nueva);
  }, []);

  const salir = useCallback(() => {
    setSesion(null);
    escribir(CLAVES.sesion, null);
  }, []);

  const crearPedido = useCallback<EstadoTienda['crearPedido']>(
    ({ productos, cliente, entrega, estadoPago }) => {
      const porId = new Map(productos.map((p) => [p.id, p]));
      const lineas = carrito.flatMap((l) => {
        const p = porId.get(l.productoId);
        if (!p) return [];
        return [{
          productoId: p.id, nombre: p.nombre, marca: p.marca, codigo: p.codigo,
          precio: p.precio, cantidad: l.cantidad,
        }];
      });
      const subtotal = lineas.reduce((t, l) => t + l.precio * l.cantidad, 0);
      const pedido: Pedido = {
        numero: siguienteNumero(),
        fechaISO: new Date().toISOString(),
        lineas,
        subtotal,
        // El costo de envío se confirma según la dirección, así que todavía no suma
        total: subtotal,
        cliente,
        entrega,
        estado: estadoPago === 'aprobado' ? 'pagado' : 'pago-pendiente',
        estadoPago,
      };
      setPedidos((actual) => [pedido, ...actual]);
      setCarrito([]);
      return pedido;
    },
    [carrito],
  );

  const unidades = useMemo(
    () => carrito.reduce((t, l) => t + l.cantidad, 0),
    [carrito],
  );

  const valor = useMemo<EstadoTienda>(() => ({
    carrito, favoritos, sesion, pedidos, listo,
    agregar, cambiarCantidad, quitar, vaciarCarrito, unidades,
    alternarFavorito,
    esFavorito: (id: string) => favoritos.includes(id),
    ingresar, salir, crearPedido,
  }), [
    carrito, favoritos, sesion, pedidos, listo, unidades,
    agregar, cambiarCantidad, quitar, vaciarCarrito,
    alternarFavorito, ingresar, salir, crearPedido,
  ]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTienda(): EstadoTienda {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useTienda necesita estar dentro de <ProveedorTienda>');
  return ctx;
}
