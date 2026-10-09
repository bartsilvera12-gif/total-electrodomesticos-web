import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { obtenerAdministrador } from '@/lib/admin/sesion';
import { ArmazonPanel } from '@/components/admin/ArmazonPanel';

export const metadata: Metadata = {
  title: { default: 'Panel web', template: '%s · Panel web' },
  robots: { index: false, follow: false },
};

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const ruta = (await headers()).get('x-pathname') ?? '';
  // El login es la única pantalla del panel sin sesión
  if (ruta.endsWith('/admin/ingresar')) return <>{children}</>;

  const admin = await obtenerAdministrador();
  if (!admin) redirect('/admin/ingresar');

  return <ArmazonPanel admin={admin}>{children}</ArmazonPanel>;
}
