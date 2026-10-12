'use client';

import { supa } from '@/lib/supabase/cliente';

/**
 * Quién administra la tienda.
 *
 * No hay una tabla de administradores propia de la web: se reutiliza
 * `total.usuarios` del ERP. Quien administra el ERP administra la tienda, con
 * el mismo usuario y la misma contraseña.
 *
 * Esto es presentación: lo que de verdad frena a un cliente de la tienda es el
 * RLS (`total.es_admin_web()`). Aunque alguien se saltee esta pantalla, la base
 * no le deja escribir nada.
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
  const sb = supa();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data, error } = await sb
    .from('usuarios')
    .select('auth_user_id, email, nombre, rol, empresa_id, activo')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error || !data || !data.activo) return null;
  if (!ROLES_PANEL.includes(String(data.rol))) return null;

  return {
    authUserId: data.auth_user_id ?? user.id,
    email: data.email ?? user.email ?? '',
    nombre: data.nombre ?? 'Administrador',
    rol: data.rol,
    empresaId: data.empresa_id,
  };
}

/** La instancia es monocliente: hay una sola empresa. */
export async function empresaId(): Promise<string> {
  const { data, error } = await supa().from('empresas').select('id').limit(1).maybeSingle();
  if (error || !data) throw new Error('No hay empresa cargada en el schema.');
  return data.id;
}
