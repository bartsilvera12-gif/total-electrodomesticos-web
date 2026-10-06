import type { Metadata } from 'next';
import { Panel } from '@/components/admin/Panel';

export const metadata: Metadata = {
  title: 'Panel web',
  robots: { index: false, follow: false },
};

export default function PaginaAdmin() {
  return <Panel />;
}
