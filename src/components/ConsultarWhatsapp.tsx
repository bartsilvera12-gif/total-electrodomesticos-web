'use client';

import { useEffect, useRef, useState } from 'react';
import { linkWhatsapp } from '@/lib/formato';
import { ASESORES } from '@/lib/sitio';

/**
 * Consulta por WhatsApp con dos líneas de atención.
 *
 * Como hay más de un asesor, el enlace no puede ir directo: abre un selector
 * chico y recién ahí se elige. Si algún día queda un solo número, el componente
 * se salta el selector solo y vuelve a ser un enlace común.
 */
export function ConsultarWhatsapp({
  mensaje, children, className = '',
  alineacion = 'izquierda', direccion = 'abajo',
}: {
  mensaje?: string;
  children: React.ReactNode;
  className?: string;
  alineacion?: 'izquierda' | 'derecha';
  /** 'arriba' solo para el botón flotante, que vive pegado al borde inferior */
  direccion?: 'arriba' | 'abajo';
}) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alClickear = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('mousedown', alClickear);
    window.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('mousedown', alClickear);
      window.removeEventListener('keydown', alTeclear);
    };
  }, [abierto]);

  // Con un solo número no tiene sentido preguntar nada
  if (ASESORES.length === 1) {
    return (
      <a
        href={linkWhatsapp(ASESORES[0].numero, mensaje)}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <div ref={caja} className="relative inline-block">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className={className}
      >
        {children}
      </button>

      {abierto && (
        <div
          role="menu"
          className={`absolute z-50 w-60 overflow-hidden rounded-md border border-linea bg-white shadow-xl ${
            direccion === 'arriba' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${alineacion === 'derecha' ? 'right-0' : 'left-0'}`}
        >
          <p className="border-b border-linea bg-total-50 px-4 py-2.5 text-[11px] font-semibold tracking-wide text-total-600 uppercase">
            ¿Con quién querés hablar?
          </p>
          {ASESORES.map((a) => (
            <a
              key={a.numero}
              role="menuitem"
              href={linkWhatsapp(a.numero, mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setAbierto(false)}
              className="flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-total-50"
            >
              <span>
                <span className="block text-sm font-semibold text-carbon">{a.etiqueta}</span>
                <span className="block font-mono text-[12px] text-humo">{a.local}</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#355DB4" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/** Los dos números como lista de enlaces, para el pie y el encabezado */
export function LineasWhatsapp({ className = '' }: { className?: string }) {
  return (
    <>
      {ASESORES.map((a) => (
        <a
          key={a.numero}
          href={linkWhatsapp(a.numero)}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {a.etiqueta} · {a.local}
        </a>
      ))}
    </>
  );
}
