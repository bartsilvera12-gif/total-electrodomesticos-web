import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerAdministrador } from '@/lib/admin/sesion';
import { FormularioIngreso } from '@/components/admin/FormularioIngreso';

export const metadata: Metadata = {
  title: 'Panel · Ingresar',
  robots: { index: false, follow: false },
};

export default async function IngresarAlPanel() {
  if (await obtenerAdministrador()) redirect('/admin');
  return <FormularioIngreso />;
}
