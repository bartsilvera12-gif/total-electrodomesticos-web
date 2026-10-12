import Link from 'next/link';
import type { Banner } from '@/lib/home/portada';

/**
 * Franja de banners promocionales de la portada.
 *
 * Se cargan desde /admin/home. Si no hay ninguno activo no se renderiza nada:
 * la home queda igual que antes de que existiera esta sección.
 *
 * No toca el hero. El hero es la casa animada; esto es la franja de promos que
 * va abajo.
 */
export function BannersHome({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  return (
    <section
      aria-label="Promociones"
      className="border-b border-linea-suave bg-white"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        {/* Las clases van literales: Tailwind escanea el código fuente y no
            ve una clase armada por concatenación. */}
        <div className={grilla(banners.length)}>
          {banners.map((b) => (
            <Tarjeta key={b.id} banner={b} solo={banners.length === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function grilla(cantidad: number): string {
  if (cantidad === 1) return 'grid gap-4';
  if (cantidad === 2) return 'grid gap-4 sm:grid-cols-2';
  return 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';
}

function Tarjeta({ banner, solo }: { banner: Banner; solo: boolean }) {
  const contenido = (
    <>
      {banner.imagenUrl && (
        // Imagen de fondo por CSS: la URL es externa y arbitraria (la pega el
        // panel), y next/image en export estático exige dominios declarados.
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
          style={{ backgroundImage: `url("${banner.imagenUrl}")` }}
        />
      )}
      <span
        aria-hidden="true"
        className={
          banner.imagenUrl
            ? 'absolute inset-0 bg-gradient-to-r from-carbon/80 via-carbon/45 to-transparent'
            : 'absolute inset-0 bg-total-50'
        }
      />
      <span className="relative flex flex-col gap-1.5">
        <span
          className={`text-pretty text-xl font-bold leading-tight ${
            banner.imagenUrl ? 'text-white' : 'text-carbon'
          } ${solo ? 'sm:text-3xl' : ''}`}
        >
          {banner.titulo}
        </span>
        {banner.bajada && (
          <span
            className={`max-w-prose text-pretty text-sm leading-relaxed ${
              banner.imagenUrl ? 'text-white/85' : 'text-grafito'
            }`}
          >
            {banner.bajada}
          </span>
        )}
      </span>
    </>
  );

  const clases = `group relative flex min-h-[180px] flex-col justify-end overflow-hidden border border-linea p-6 ${
    solo ? 'sm:min-h-[260px]' : ''
  }`;

  if (!banner.enlace) {
    return <div className={clases}>{contenido}</div>;
  }

  const externo = /^https?:\/\//i.test(banner.enlace);

  if (externo) {
    return (
      <a
        href={banner.enlace}
        target="_blank"
        rel="noopener noreferrer"
        className={`${clases} transition-colors hover:border-carbon`}
      >
        {contenido}
      </a>
    );
  }

  return (
    <Link
      href={banner.enlace}
      className={`${clases} transition-colors hover:border-carbon`}
    >
      {contenido}
    </Link>
  );
}
