'use client';

import { useCallback } from 'react';
import { obtenerMarcas, obtenerRubros } from './servicio';
import type { Rubro } from './tipos';
import { useDatos } from '@/lib/useDatos';

/**
 * Categorías y marcas, leídas de nuevo en el navegador.
 *
 * El sitio es un export estático: lo que una página `async` del servidor lee
 * queda congelado en el HTML del último build. Para los productos eso ya se
 * resuelve (`Catalogo` los pide en el navegador), pero las listas de
 * categorías y marcas seguían saliendo del build: el megamenú, el pie, la
 * página de Categorías y los filtros mostraban lo que existía el día que se
 * compiló.
 *
 * Se notó con la categoría PRUEBA: desactivada en el ERP y fuera de
 * `web_categoria_publica`, seguía apareciendo en /categorias, mientras que las
 * cinco categorías nuevas del catálogo no estaban.
 *
 * El dato del build se usa igual como valor inicial: es lo que lee un buscador
 * y lo que se ve mientras llega la respuesta, así no parpadea la pantalla.
 */
export function useRubrosVivos(inicial: Rubro[]): Rubro[] {
  const { datos } = useDatos(useCallback(() => obtenerRubros(), []), inicial);
  return datos;
}

export function useMarcasVivas(inicial: string[]): string[] {
  const { datos } = useDatos(useCallback(() => obtenerMarcas(), []), inicial);
  return datos;
}
