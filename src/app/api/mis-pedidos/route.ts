import { NextResponse } from 'next/server';
import { clienteServidor } from '@/lib/supabase/cliente';
import { clienteConSesion } from '@/lib/supabase/servidor';

/**
 * Pedidos del cliente que está mirando.
 *
 * Con sesión devuelve los suyos. Sin sesión, acepta un número de pedido suelto:
 * es el caso de quien compró como invitado y vuelve desde la confirmación.
 */
export async function GET(req: Request) {
  const numero = new URL(req.url).searchParams.get('numero');
  const sb = clienteServidor();

  const COLUMNAS = 'id, numero, created_at, cliente, entrega, subtotal, total, estado, estado_pago, web_pedido_item(*)';

  try {
    if (numero) {
      const { data, error } = await sb.from('web_pedido')
        .select(COLUMNAS).eq('numero', numero).maybeSingle();
      if (error) throw new Error(error.message);
      return NextResponse.json({ pedidos: data ? [data] : [] });
    }

    const conSesion = await clienteConSesion();
    const { data: { user } } = await conSesion.auth.getUser();
    if (!user) return NextResponse.json({ pedidos: [] });

    const { data, error } = await sb.from('web_pedido')
      .select(COLUMNAS).eq('auth_user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ pedidos: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
