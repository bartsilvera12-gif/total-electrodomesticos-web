import Image from 'next/image';
import Link from 'next/link';
import { ESPACIOS, LOGOS_MARCA, MARCAS, RUBROS } from '@/lib/catalogo/mock';
import { BENEFICIOS, SITIO } from '@/lib/sitio';
import { slugificar } from '@/lib/formato';
import { Revelar } from './Revelar';

/**
 * Categorías.
 *
 * Composición editorial: los bloques tienen distinto peso según jerarquía, no
 * son doce cards iguales ni un bento de cuadrados al azar.
 */
export function Categorias() {
  const destacados = ['tv', 'clima', 'cocina', 'refri', 'cel', 'dorm'];
  const rubros = destacados
    .map((id) => RUBROS.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16">
      <Revelar>
      <h2 className="max-w-xl text-[clamp(26px,3vw,38px)] leading-tight font-bold tracking-tight">
        Todo empieza por lo que necesitás.
      </h2>
      <p className="mt-2 text-grafito">Recorré el catálogo por rubro o por espacio de la casa.</p>

      <div className="mt-8 grid gap-px bg-linea md:grid-cols-3 md:grid-rows-2">
        {rubros.map((r, i) => (
          <Link
            key={r.id}
            href={`/categoria/${r.slug}`}
            data-revelar-item
            className={`group flex min-h-44 flex-col justify-between bg-white p-6 transition-colors hover:bg-total-50 ${
              i === 0 ? 'md:col-span-2 md:row-span-2 md:min-h-96' : ''
            }`}
          >
            <div>
              <h3 className={`font-bold tracking-tight ${i === 0 ? 'text-3xl' : 'text-xl'}`}>
                {r.nombre}
              </h3>
              <p className="mt-2 text-sm text-humo">{r.subcategorias.join(' · ')}</p>
            </div>
            <span className="mt-6 text-sm font-semibold text-total-500 group-hover:underline">
              Ver productos →
            </span>
          </Link>
        ))}
      </div>

      <Link href="/categorias" className="mt-6 inline-block text-sm font-semibold text-total-500 hover:underline">
        Ver todas las categorías →
      </Link>
      </Revelar>
    </section>
  );
}

/** Para quien sabe qué espacio quiere equipar, aunque no sepa en qué rubro buscar */
export function Espacios() {
  return (
    <section className="border-y border-linea bg-total-50">
      <Revelar className="mx-auto max-w-[1400px] px-6 py-16">
        <h2 className="text-[clamp(26px,3vw,38px)] leading-tight font-bold tracking-tight">
          ¿Qué querés equipar?
        </h2>
        <p className="mt-2 text-grafito">
          Elegí un espacio de tu casa y te mostramos lo que lo completa.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ESPACIOS.map((e) => (
            <Link
              key={e.slug}
              href={`/espacio/${e.slug}`}
              data-revelar-item
              className="group relative flex min-h-56 flex-col justify-end overflow-hidden bg-white p-5"
            >
              {e.foto ? (
                <>
                  <Image
                    src={e.foto}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-carbon/85 via-carbon/30 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-total-500" />
              )}
              <div className="relative text-white">
                <h3 className="text-2xl font-bold tracking-tight">{e.nombre}</h3>
                <p className="mt-1 text-sm opacity-90">{e.descripcion}</p>
              </div>
            </Link>
          ))}
        </div>
      </Revelar>
    </section>
  );
}

export function Marcas() {
  const fila = [...MARCAS, ...MARCAS];
  return (
    <section className="overflow-hidden border-y border-linea py-14">
      <div className="mx-auto max-w-[1400px] px-6">
        <h2 className="text-xl font-bold tracking-tight">Marcas que encontrás en Total</h2>
        <p className="mt-1 text-sm text-humo">Tocá una marca para ver sus productos.</p>
      </div>
      <div className="mt-8 flex w-max animate-marquee gap-12 px-6">
        {fila.map((m, i) => {
          const logo = LOGOS_MARCA[m];
          return (
            <Link
              key={`${m}-${i}`}
              href={`/marca/${slugificar(m)}`}
              aria-label={m}
              className="flex h-12 w-28 shrink-0 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
            >
              {logo ? (
                <Image src={logo.src} alt={m} width={110} height={logo.alto} className="max-h-8 w-auto object-contain" />
              ) : (
                <span className="text-sm font-bold tracking-widest uppercase">{m}</span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Banda dividida por líneas, no cuatro cards con iconos */
export function Beneficios() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-14">
      <Revelar className="grid divide-y divide-linea border-y border-linea sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {BENEFICIOS.map((b) => (
          <div key={b.titulo} data-revelar-item className="px-0 py-6 sm:px-6">
            <h3 className="text-base font-bold">{b.titulo}</h3>
            <p className="mt-1.5 text-sm text-humo">{b.texto}</p>
          </div>
        ))}
      </Revelar>
    </section>
  );
}

export function Institucional() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-16">
      <Revelar className="grid gap-10 border border-linea p-8 md:grid-cols-2 md:p-12">
        <div>
          <h2 className="text-[clamp(24px,2.5vw,32px)] font-bold tracking-tight">
            Total para tu hogar
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-grafito">
            Electrodomésticos, tecnología, muebles y descanso en una misma tienda.
            Si tenés dudas sobre un producto, escribinos y te ayudamos a elegir.
          </p>
        </div>
        <div className="md:justify-self-end">
          <h3 className="text-sm font-bold">Seguinos en Total</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a href={SITIO.instagram} target="_blank" rel="noopener noreferrer" className="text-grafito hover:text-total-500">
              Instagram @total_electrodomesticos
            </a>
            <a href={SITIO.facebook} target="_blank" rel="noopener noreferrer" className="text-grafito hover:text-total-500">
              Facebook
            </a>
            <a href={`mailto:${SITIO.correo}`} className="break-all text-grafito hover:text-total-500">
              {SITIO.correo}
            </a>
          </div>
        </div>
      </Revelar>
    </section>
  );
}
