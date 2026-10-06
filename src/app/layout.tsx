import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { ProveedorTienda } from '@/lib/tienda/contexto';
import { SITIO } from '@/lib/sitio';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: {
    default: `${SITIO.nombre} — Todo para tu casa`,
    template: `%s · ${SITIO.nombre}`,
  },
  description: SITIO.descripcion,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_PY',
    siteName: SITIO.nombre,
    title: `${SITIO.nombre} — Todo para tu casa`,
    description: SITIO.descripcion,
    url: SITIO.url,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#355DB4',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PY" className={`${archivo.variable} ${mono.variable}`}>
      <body className="font-sans">
        <ProveedorTienda>{children}</ProveedorTienda>
      </body>
    </html>
  );
}
