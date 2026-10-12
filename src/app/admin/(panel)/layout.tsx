import { Guardia } from '@/components/admin/Guardia';

/**
 * Grupo de rutas: envuelve las pantallas del panel con el control de entrada,
 * pero deja afuera a /admin/ingresar. Los paréntesis no aparecen en la URL.
 */
export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return <Guardia>{children}</Guardia>;
}
