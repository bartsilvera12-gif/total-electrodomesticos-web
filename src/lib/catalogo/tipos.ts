/**
 * Tipos del catálogo.
 *
 * Son el contrato entre la web y su fuente de datos. Hoy los sirve un mock;
 * mañana los va a servir el ERP. Mientras los campos se respeten, cambiar la
 * fuente no obliga a tocar ningún componente.
 *
 * El ERP es la fuente de verdad de precio, stock y código. La web solo manda
 * en lo editorial: imágenes, descripción comercial, destacados, SEO.
 */

/** Estado comercial. La lógica real de stock la define el ERP. */
export type Disponibilidad = 'disponible' | 'ultimas' | 'sin-stock' | 'consultar';

export interface Producto {
  id: string;
  /** IDART en el ERP */
  codigo: string;
  codigoBarras?: string;
  nombre: string;
  slug: string;
  marca: string;
  /** id del rubro */
  rubro: string;
  subcategoria: string;
  /** Specs cortas para la card, ya separadas */
  specs: string[];
  /** PRECIO_1 del ERP, en guaraníes */
  precio: number;
  /** Precio anterior. Solo si existe una promoción real: no inventar descuentos. */
  precioAnterior?: number;
  disponibilidad: Disponibilidad;
  /** Describe la foto mientras no haya imágenes cargadas */
  imagen: string;
  /** Foto real, cuando el panel ya la cargó */
  imagenUrl?: string;
  /** Fotos adicionales */
  galeria?: string[];
  garantiaMeses?: number;
  seoTitulo?: string;
  seoDescripcion?: string;
  /** Características, ficha técnica y garantía para la página de producto */
  fichaTecnica?: Array<{ etiqueta: string; valor: string }>;
  descripcion?: string;
  destacado?: boolean;
  nuevo?: boolean;
}

export interface Rubro {
  id: string;
  nombre: string;
  slug: string;
  subcategorias: string[];
  imagenUrl?: string;
  /** Peso en la grilla editorial de la home: 1 normal, 2 bloque grande */
  destaque?: number;
}

/** Un espacio de la casa, para quien sabe qué quiere equipar pero no en qué rubro buscar */
export interface Espacio {
  nombre: string;
  slug: string;
  foto?: string;
  descripcion: string;
  rubros: string[];
  atajos: Array<{ nombre: string; rubro: string }>;
}

/** Filtro técnico que solo aplica a ciertos rubros (pulgadas en TV, BTU en climatización) */
export interface FiltroDinamico {
  etiqueta: string;
  opciones: string[];
}

export interface ConsultaCatalogo {
  rubro?: string | null;
  subcategoria?: string | null;
  marcas?: string[];
  disponibilidad?: Disponibilidad[];
  precioMin?: number;
  precioMax?: number;
  soloOfertas?: boolean;
  /** Filtros técnicos elegidos, por etiqueta */
  tecnicos?: Record<string, string[]>;
  orden?: 'relevancia' | 'precio-asc' | 'precio-desc' | 'nuevos';
  busqueda?: string;
  pagina?: number;
  porPagina?: number;
}

export interface ResultadoCatalogo {
  productos: Producto[];
  total: number;
  pagina: number;
  porPagina: number;
  hayMas: boolean;
}
