/** Estados de un pedido web. La equivalencia con los estados del ERP se define en la integración. */
export type EstadoPedido =
  | 'recibido' | 'pago-pendiente' | 'pagado' | 'preparando'
  | 'listo' | 'entregado' | 'cancelado';

/** Resultados que devuelve PagoPar */
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';

export interface LineaCarrito {
  productoId: string;
  cantidad: number;
}

export interface Cliente {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  correo: string;
}

export interface Entrega {
  modo: 'envio' | 'retiro';
  direccion?: string;
  ciudad?: string;
  referencia?: string;
}

export interface LineaPedido {
  productoId: string;
  nombre: string;
  marca: string;
  codigo: string;
  /** Precio congelado al momento de la compra */
  precio: number;
  cantidad: number;
}

export interface Pedido {
  numero: string;
  fechaISO: string;
  lineas: LineaPedido[];
  subtotal: number;
  total: number;
  cliente: Cliente;
  entrega: Entrega;
  estado: EstadoPedido;
  estadoPago: EstadoPago;
}

export interface Sesion {
  nombre: string;
  apellido: string;
  correo: string;
  documento?: string;
  telefono?: string;
}

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  recibido: 'Recibido',
  'pago-pendiente': 'Pago pendiente',
  pagado: 'Pagado',
  preparando: 'Preparando',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

/** Los pasos que ve el cliente en el seguimiento, en orden */
export const PASOS_PEDIDO: EstadoPedido[] = [
  'recibido', 'pagado', 'preparando', 'listo', 'entregado',
];
