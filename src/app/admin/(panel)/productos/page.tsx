'use client';

import { useCallback, useState } from 'react';
import { listarProductos } from '@/lib/admin/consultas';
import { useDatos } from '@/lib/useDatos';
import { TablaProductos } from '@/components/admin/TablaProductos';

const VACIO = { productos: [], total: 0 };

export default function ProductosPanel() {
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const { datos, cargando, error, recargar } = useDatos(
    useCallback(() => listarProductos({ busqueda, pagina }), [busqueda, pagina]),
    VACIO,
  );

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
      <p className="mt-1 text-sm text-humo">
        El nombre, el precio y el stock salen del ERP y no se editan acá. Lo que
        se administra es qué se publica, la descripción comercial, la ficha y el SEO.
      </p>
      <TablaProductos
        productos={datos.productos}
        total={datos.total}
        pagina={pagina}
        busqueda={busqueda}
        cargando={cargando}
        errorCarga={error}
        alBuscar={(q) => { setBusqueda(q); setPagina(1); }}
        alPaginar={setPagina}
        alRecargar={recargar}
      />
    </>
  );
}
