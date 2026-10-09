import { listarPedidos } from '@/lib/admin/consultas';
import { TablaPedidos } from '@/components/admin/TablaPedidos';

export const metadata = { title: 'Pedidos' };

export default async function PedidosPanel() {
  const pedidos = await listarPedidos();
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Pedidos web</h1>
      <p className="mt-1 text-sm text-humo">
        Los pedidos que entran por la tienda. El ERP los va a leer de acá cuando
        se integre el módulo de pedidos web.
      </p>
      <TablaPedidos pedidos={pedidos} />
    </>
  );
}
