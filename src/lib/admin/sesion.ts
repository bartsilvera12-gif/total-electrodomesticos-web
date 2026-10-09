import { clienteConSesion } from '@/lib/supabase/servidor';
import { clienteServidor } from '@/lib/supabase/cliente';

/**
 * Quién puede entrar al panel.
 *
 * No hay una tabla de administradores propia de la web: se reutiliza
 * `total.usuarios` del ERP. Quien administra el ERP administra la tienda, con
 * el mismo usuario y la misma contraseña. Un cliente de la tienda, que está en
 * `auth.users` pero no en `total.usuarios`, no pasa.
 */

const ROLES_PANEL = ['admin', 'super_admin'];

export interface Administrador {
  authUserId: string;
  email: string;
  nombre: string;
  rol: string;
  empresaId: string;
}

export async function obtenerAdministrador(): Promise<Administrador | null> {
  const sb = await clienteConSesion();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  // La consulta va con service role: `total.usuarios` tiene RLS del ERP y la
  // sesión del panel no la atraviesa hasta saber que es admin.
  const admin = clienteServidor();
  const { data, error } = await admin
    .from('usuarios')
    .select('auth_user_id, email, nombre, rol, empresa_id, activo')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  if (!data.activo) return null;
  if (!ROLES_PANEL.includes(String(data.rol))) return null;

  return {
    authUserId: data.auth_user_id,
    email: data.email ?? user.email ?? '',
    nombre: data.nombre ?? 'Administrador',
    rol: data.rol,
    empresaId: data.empresa_id,
  };
}

/** Id de la empresa. La instancia es monocliente, así que hay una sola. */
export async function empresaId(): Promise<string> {
  const sb = clienteServidor();
  const { data, error } = await sb.from('empresas').select('id').limit(1).maybeSingle();
  if (error || !data) throw new Error('No hay empresa cargada en el schema.');
  return data.id;
}
