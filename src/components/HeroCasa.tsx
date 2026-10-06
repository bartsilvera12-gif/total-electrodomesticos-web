'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { RUBROS, ZONAS_HERO } from '@/lib/catalogo/mock';
import { ConsultarWhatsapp } from './ConsultarWhatsapp';

/**
 * "La casa Total": el hero.
 *
 * La geometría del logo —la casa con la T— se usa como sistema editorial, no
 * como dibujo. Cada zona de la casa es un universo del catálogo y responde al
 * cursor. Nada de carrusel de banners ni hero partido en dos.
 *
 * El alto mira el ancho y el alto disponibles, para que la casa no se corte
 * contra el borde inferior en monitores anchos pero bajos.
 */
export function HeroCasa() {
  const [zona, setZona] = useState<string>('living');
  const activa = ZONAS_HERO.find((z) => z.id === zona) ?? ZONAS_HERO[1];
  const rubroDe = (id: string) => RUBROS.find((r) => r.id === id);

  const Zona = ({
    z, className = '', centrado = false,
  }: { z: (typeof ZONAS_HERO)[number]; className?: string; centrado?: boolean }) => {
    const rubro = rubroDe(z.rubro);
    const esActiva = zona === z.id;
    return (
      <Link
        href={rubro ? `/categoria/${rubro.slug}` : '/productos'}
        onMouseEnter={() => setZona(z.id)}
        onFocus={() => setZona(z.id)}
        aria-label={z.titulo}
        className={`group relative overflow-hidden ${className}`}
      >
        <Image
          src={z.foto}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority={z.id === 'living'}
          className="object-cover transition-[transform,filter] duration-1000 ease-out"
          style={{
            transform: esActiva ? 'scale(1.06)' : 'scale(1)',
            filter: esActiva ? 'brightness(1)' : 'brightness(0.72)',
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-carbon/80 via-carbon/10 to-transparent" />
        <div
          className={`absolute bottom-4 flex flex-col gap-1.5 text-white ${
            centrado ? 'inset-x-[25%] items-center text-center' : 'inset-x-5'
          }`}
        >
          <span className="font-mono text-[11px] tracking-widest opacity-85">
            {z.ambiente.toUpperCase()}
          </span>
          <span
            className="leading-none font-bold tracking-tight transition-all duration-500"
            style={{ fontSize: esActiva ? '28px' : '20px' }}
          >
            {z.titulo}
          </span>
          {esActiva && rubro && (
            <div className={`mt-1 flex flex-wrap gap-1.5 ${centrado ? 'justify-center' : ''}`}>
              {rubro.subcategorias.slice(0, 3).map((s) => (
                <span key={s} className="rounded-full bg-white/95 px-3 py-1 text-[12px] font-semibold text-carbon">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <section
      data-hero
      className="relative overflow-hidden border-b border-linea-suave bg-total-50"
    >
      {/* Plano doméstico: líneas estructurales, no una casita dibujada */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(#dfe6f3 1px, transparent 1px), linear-gradient(90deg, #dfe6f3 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 85% 75% at 60% 45%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 60% 45%, #000 30%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-6 pt-7 pb-14 lg:grid-cols-[5fr_7fr] lg:gap-14">
        <div className="flex flex-col gap-5">
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
          <ConsultarWhatsapp className="cursor-pointer text-sm font-semibold text-total-500 hover:underline">
            Consultar por WhatsApp
          </ConsultarWhatsapp>
          <p className="hidden text-[13px] text-humo lg:block">
            <span className="mr-1.5 inline-block size-2 rounded-full bg-total-500 align-middle" />
            Estás viendo <strong>{activa.ambiente}</strong> · {activa.titulo}. Recorré la casa con el cursor.
          </p>
        </div>

        {/* La casa: techo recortado y habitaciones. Solo en pantallas grandes. */}
        <div
          className="relative hidden lg:block"
          style={{ height: 'clamp(480px, min(46vw, 100vh - 230px), 660px)' }}
        >
          <div className="absolute top-[7%] right-[16%] h-[20%] w-[6%] bg-total-500" />
          <div
            className="absolute inset-0 flex flex-col gap-[5px] bg-total-500 p-[5px]"
            style={{ clipPath: 'polygon(50% 0, 100% 33%, 100% 100%, 0 100%, 0 33%)' }}
          >
            <div className="flex basis-[33%] gap-[5px]">
              <Zona z={ZONAS_HERO[0]} className="flex-1" centrado />
            </div>
            <div className="flex flex-1 gap-[5px]">
              <Zona z={ZONAS_HERO[1]} className="flex-[3]" />
              <Zona z={ZONAS_HERO[2]} className="flex-[2]" />
            </div>
            <div className="flex flex-1 gap-[5px]">
              <Zona z={ZONAS_HERO[3]} className="flex-[2]" />
              <Zona z={ZONAS_HERO[4]} className="flex-[3]" />
            </div>
          </div>
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
      </div>
    </section>
  );
}
