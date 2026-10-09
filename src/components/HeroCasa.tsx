'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ZONAS_HERO } from '@/lib/catalogo/mock';
import type { Rubro } from '@/lib/catalogo/tipos';
import { ConsultarWhatsapp } from './ConsultarWhatsapp';
import { Revelar } from './Revelar';

/**
 * "La casa Total": el hero.
 *
 * La geometría del logo —la casa con la T— se usa como sistema editorial, no
 * como dibujo. Cada zona es un universo del catálogo y responde al cursor.
 * Nada de carrusel de banners ni hero partido en dos.
 */

const PASO = 56;

/** Silueta de la casa */
const CASA = 'polygon(50% 0, 100% 33%, 100% 100%, 0 100%, 0 33%)';

/** Celdas del plano que titilan, en coordenadas de retícula */
const CELDAS = [
  [3, 2], [5, 1], [8, 3], [11, 2], [14, 1], [17, 4], [20, 2], [2, 6], [9, 7],
  [13, 6], [19, 8], [22, 5], [6, 9], [16, 10], [24, 3], [1, 10], [11, 10], [21, 11],
];

/**
 * Una habitación de la casa.
 *
 * Va fuera de HeroCasa a propósito. Declarada adentro, React la toma como un
 * tipo nuevo en cada render y desmonta las cinco zonas en cada cambio: los
 * elementos nacen ya en su valor final, no hay transición que correr y las
 * fotos parpadean.
 *
 * Lo que da vida al hero es que la zona activa CRECE: su flex-grow pasa de 1 a
 * 1.9 y empuja a las vecinas, con la fila entera creciendo a 1.25. Los valores
 * y las transiciones son los del diseño original.
 */
function Zona({
  z, activa, alActivar, rubros, centrado = false,
}: {
  z: (typeof ZONAS_HERO)[number];
  activa: boolean;
  alActivar: () => void;
  rubros: Rubro[];
  centrado?: boolean;
}) {
  const rubro = rubros.find((r) => r.id === z.rubro);
  // El techo no crece: es un triángulo, agrandarlo deforma la casa
  const crece = activa && z.id !== 'clima' ? 1.9 : 1;

  return (
    <Link
      href={rubro ? `/categoria/${rubro.slug}` : '/productos'}
      onMouseEnter={alActivar}
      onFocus={alActivar}
      aria-label={z.titulo}
      className="group relative min-w-0 overflow-hidden"
      style={{ flex: `${crece} 1 0`, transition: 'flex-grow .7s cubic-bezier(.2,.7,.2,1)' }}
    >
      <Image
        src={z.foto}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 55vw"
        priority={z.id === 'living'}
        className="object-cover"
        style={{
          transform: `scale(${activa ? 1.06 : 1})`,
          filter: `brightness(${activa ? 1 : 0.78})`,
          transition: 'transform 1.4s cubic-bezier(.2,.7,.2,1), filter .5s',
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-carbon/80 via-carbon/10 to-transparent" />
      <div
        className={`absolute bottom-4 flex flex-col gap-2 text-white ${
          centrado ? 'inset-x-[25%] items-center text-center' : 'inset-x-5'
        }`}
      >
        <span className="font-mono text-[11px] tracking-widest opacity-85">
          {z.ambiente.toUpperCase()}
        </span>
        <span
          className="leading-none font-bold tracking-tight"
          style={{ fontSize: activa ? '30px' : '20px', transition: 'font-size .5s' }}
        >
          {z.titulo}
        </span>
        {rubro && (
          <div
            className={`flex flex-wrap gap-1.5 overflow-hidden ${centrado ? 'justify-center' : ''}`}
            style={{
              opacity: activa ? 1 : 0,
              transform: `translateY(${activa ? '0' : '8px'})`,
              maxHeight: activa ? '120px' : '0px',
              transition: 'opacity .45s .1s, transform .45s .1s, max-height .5s',
            }}
          >
            {rubro.subcategorias.map((sub) => (
              <span
                key={sub}
                className="rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-semibold text-carbon"
              >
                {sub}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function HeroCasa({ rubros }: { rubros: Rubro[] }) {
  const [zona, setZona] = useState<string>('living');
  const seccion = useRef<HTMLElement>(null);

  const activa = ZONAS_HERO.find((z) => z.id === zona) ?? ZONAS_HERO[1];
  const filaA = zona === 'living' || zona === 'cocina' ? 1.25 : 1;
  const filaB = zona === 'tecno' || zona === 'dorm' ? 1.25 : 1;
  const rubroDe = (id: string) => rubros.find((r) => r.id === id);

  // El cursor ilumina la retícula y deja un halo. Se guarda en variables CSS
  // para no re-renderizar React en cada movimiento del mouse.
  const seguirCursor = (e: React.MouseEvent) => {
    const el = seccion.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const reticula = (color: string) =>
    `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;

  return (
    <section
      ref={seccion}
      data-hero
      onMouseMove={seguirCursor}
      className="relative overflow-hidden border-b border-linea-suave bg-total-50"
    >
      {/* Plano doméstico: líneas estructurales, no una casita dibujada */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: reticula('#dfe6f3'),
          backgroundSize: `${PASO}px ${PASO}px`,
          maskImage: 'radial-gradient(ellipse 85% 75% at 60% 45%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 60% 45%, #000 30%, transparent 100%)',
        }}
      />

      {/* Celdas sueltas que se encienden y se apagan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 motion-reduce:hidden"
        style={{
          maskImage: 'radial-gradient(ellipse 85% 75% at 60% 45%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 60% 45%, #000 30%, transparent 100%)',
        }}
      >
        {CELDAS.map(([cx, cy], i) => (
          <span
            key={`${cx}-${cy}`}
            className="animate-titilar absolute block bg-total-200"
            style={{
              left: cx * PASO, top: cy * PASO, width: PASO - 1, height: PASO - 1,
              animationDelay: `${(i % 9) * 0.55}s`,
              animationDuration: `${4 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* La retícula se marca más fuerte alrededor del cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 motion-reduce:hidden"
        style={{
          backgroundImage: reticula('#9fb3dd'),
          backgroundSize: `${PASO}px ${PASO}px`,
          maskImage: 'radial-gradient(260px circle at var(--mx, -999px) var(--my, -999px), #000, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(260px circle at var(--mx, -999px) var(--my, -999px), #000, transparent 75%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 motion-reduce:hidden"
        style={{
          background:
            'radial-gradient(520px circle at var(--mx, -999px) var(--my, -999px), rgba(53,93,180,.08), transparent 70%)',
        }}
      />

      <Revelar className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-6 pt-7 pb-14 lg:grid-cols-[5fr_7fr] lg:gap-14">
        <div data-revelar-item className="flex flex-col gap-5">
          <p className="font-mono text-xs tracking-[0.14em] text-total-500">
            TOTAL ELECTRODOMÉSTICOS
          </p>
          <h1 className="text-[clamp(40px,5vw,76px)] leading-[0.98] font-bold tracking-[-0.035em] text-balance">
            Todo para tu casa.{' '}
            <span className="text-total-500">Todo en un solo lugar.</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-grafito text-pretty">
            Tecnología, electrodomésticos, muebles y productos para acompañar cada
            espacio de tu hogar.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/productos"
              className="rounded-full bg-total-500 px-6 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-total-600"
            >
              Explorar productos
            </Link>
            <Link
              href="/categorias"
              className="rounded-full border border-carbon px-6 py-4 text-[15px] font-semibold transition-colors hover:bg-carbon hover:text-white"
            >
              Ver categorías
            </Link>
          </div>
          <ConsultarWhatsapp className="cursor-pointer self-start text-sm font-semibold text-total-500 hover:underline">
            Consultar por WhatsApp
          </ConsultarWhatsapp>
          <p className="hidden text-[13px] text-humo lg:block">
            <span className="mr-1.5 inline-block size-2 rounded-full bg-total-500 align-middle" />
            Estás viendo <strong>{activa.ambiente}</strong> · {activa.titulo}. Recorré la casa con el cursor.
          </p>
        </div>

        {/* La casa: marco azul recortado, con las habitaciones adentro */}
        <div
          data-revelar-item
          className="relative hidden lg:block"
          style={{ height: 'clamp(520px, 46vw, 660px)' }}
        >
          <div className="absolute top-[7%] right-[16%] h-[20%] w-[6%] bg-total-500" />

          <div
            className="absolute inset-0 flex flex-col gap-[5px] bg-total-500 p-[5px]"
            style={{ clipPath: CASA }}
          >
            <div className="flex shrink-0 basis-[calc(33%-5px)] gap-[5px]">
              <Zona rubros={rubros} z={ZONAS_HERO[0]} activa={zona === ZONAS_HERO[0].id} alActivar={() => setZona(ZONAS_HERO[0].id)} centrado />
            </div>
            <div
              className="flex min-h-0 gap-[5px]"
              style={{ flex: `${filaA} 1 0`, transition: 'flex-grow .7s cubic-bezier(.2,.7,.2,1)' }}
            >
              <Zona rubros={rubros} z={ZONAS_HERO[1]} activa={zona === ZONAS_HERO[1].id} alActivar={() => setZona(ZONAS_HERO[1].id)} />
              <Zona rubros={rubros} z={ZONAS_HERO[2]} activa={zona === ZONAS_HERO[2].id} alActivar={() => setZona(ZONAS_HERO[2].id)} />
            </div>
            <div
              className="flex min-h-0 gap-[5px]"
              style={{ flex: `${filaB} 1 0`, transition: 'flex-grow .7s cubic-bezier(.2,.7,.2,1)' }}
            >
              <Zona rubros={rubros} z={ZONAS_HERO[3]} activa={zona === ZONAS_HERO[3].id} alActivar={() => setZona(ZONAS_HERO[3].id)} />
              <Zona rubros={rubros} z={ZONAS_HERO[4]} activa={zona === ZONAS_HERO[4].id} alActivar={() => setZona(ZONAS_HERO[4].id)} />
            </div>
          </div>

          {/*
            La línea del techo.

            Las paredes y el piso muestran el azul del padding, pero la diagonal
            no: el recorte pasa justo por el borde de la foto y no deja nada. Se
            dibuja encima en vez de achicar la casa. El trazo va centrado en la
            línea y el mismo recorte se come la mitad de afuera, así que adentro
            quedan los 5px que tiene el resto. non-scaling-stroke mantiene el
            grosor parejo aunque el viewBox se estire.
          */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full"
            style={{ clipPath: CASA }}
          >
            <polyline
              points="0,33 50,0 100,33"
              fill="none"
              stroke="#355DB4"
              strokeWidth="10"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* En mobile no se comprime la casa: se recorre como carrusel de universos */}
        <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 lg:hidden">
          {ZONAS_HERO.map((z) => {
            const rubro = rubroDe(z.rubro);
            return (
              <Link
                key={z.id}
                href={rubro ? `/categoria/${rubro.slug}` : '/productos'}
                className="relative aspect-[3/4] w-[70vw] shrink-0 snap-start overflow-hidden sm:w-64"
              >
                <Image src={z.foto} alt="" fill sizes="70vw" className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-carbon/85 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <span className="font-mono text-[10px] tracking-widest opacity-85">
                    {z.ambiente.toUpperCase()}
                  </span>
                  <span className="block text-xl font-bold tracking-tight">{z.titulo}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Revelar>
    </section>
  );
}
