import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Panel web', template: '%s · Panel web' },
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
