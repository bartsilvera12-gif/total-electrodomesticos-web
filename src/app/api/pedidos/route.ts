import { NextResponse } from 'next/server';
import { clienteServidor } from '@/lib/supabase/cliente';
import { obtenerProductosPorId } from '@/lib/catalogo/servicio';
import { clienteConSesion } from '@/lib/supabase/servidor';

/**
 * Alta de pedidos desde la tienda.
 *
 * Los precios se recalculan acá contra el catálogo, no se toman del cuerpo de
 * la request. Si confiáramos en lo que manda el navegador, cualquiera podría
 * comprar al precio que quisiera.
 *
 * Por eso tampoco hay policy de INSERT en `web_pedido`: el único camino es este.
 */
export async function POST(req: Request) {
  try {
    const cuerpo = await req.json();
    const lineas: Array<{ productoId: string; cantidad: number }> = cuerpo.lineas ?? [];
    if (!lineas.length) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    const { cliente, entrega, estadoPago } = cuerpo;
    if (!cliente?.nombre || !cliente?.correo) {
      return NextResponse.json({ error: 'Faltan los datos del cliente.' }, { status: 400 });
    }

    // Precio y disponibilidad reales, del catálogo
    const productos = await obtenerProductosPorId(lineas.map((l) => l.productoId));
    const porId = new Map(productos.map((p) => [p.id, p]));

    const items = lineas.flatMap((l) => {
      const p = porId.get(l.productoId);
      if (!p) return [];
      const cantidad = Math.max(1, Math.floor(Number(l.cantidad) || 1));
      return [{
        producto_id: p.id,
        nombre: p.nombre,
        marca: p.marca,
        sku: p.codigo,
        precio: p.precio,
        cantidad,
      }];
    });

    if (!items.length) {
      return NextResponse.json(
        { error: 'Los productos del carrito ya no están disponibles.' },
        { status: 409 },
      );
    }

    const subtotal = items.reduce((t, i) => t + i.precio * i.cantidad, 0);
    const sb = clienteServidor();

    const { data: empresa } = await sb.from('empresas').select('id').limit(1).maybeSingle();
    if (!empresa) {
      return NextResponse.json({ error: 'No hay empresa configurada.' }, { status: 500 });
    }

    // Si compró con sesión, el pedido queda atado a su usuario para que lo vea
    // en Mi cuenta desde cualquier dispositivo.
    const conSesion = await clienteConSesion();
    const { data: { user } } = await conSesion.auth.getUser();

    const { data: numero } = await sb.rpc('web_siguiente_numero_pedido');

    const { data: pedido, error } = await sb.from('web_pedido').insert({
      empresa_id: empresa.id,
      numero: numero ?? `W-${Date.now()}`,
      auth_user_id: user?.id ?? null,
      cliente,
      entrega,
      subtotal,
      // El envío se confirma según la dirección, así que todavía no suma
      total: subtotal,
      estado: estadoPago === 'aprobado' ? 'pagado' : 'pago-pendiente',
      estado_pago: estadoPago === 'aprobado' ? 'aprobado' : 'pendiente',
    }).select('id, numero').single();

    if (error) throw new Error(error.message);

    const { error: errItems } = await sb.from('web_pedido_item')
      .insert(items.map((i) => ({ ...i, pedido_id: pedido.id })));
    if (errItems) throw new Error(errItems.message);

    return NextResponse.json({ numero: pedido.numero, total: subtotal });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: `No se pudo registrar el pedido: ${msg}` }, { status: 500 });
  }
}
