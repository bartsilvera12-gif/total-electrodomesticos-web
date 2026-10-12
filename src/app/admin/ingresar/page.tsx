import type { Metadata } from 'next';
import { FormularioIngreso } from '@/components/admin/FormularioIngreso';

export const metadata: Metadata = {
  title: 'Panel · Ingresar',
  robots: { index: false, follow: false },
};

export default function IngresarAlPanel() {
  // Si ya hay sesión, el propio formulario manda al panel: en estático no hay
  // servidor que pueda redirigir antes de servir la página.
  return <FormularioIngreso />;
}
