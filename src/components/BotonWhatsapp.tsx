'use client';

import { useEffect, useState } from 'react';
import { ConsultarWhatsapp } from './ConsultarWhatsapp';

/**
 * Acceso flotante a WhatsApp.
 *
 * El brief prohíbe el botón verde grande de siempre: va chico y en azul Total,
 * manteniendo el ícono reconocible. Aparece recién pasado el hero y se esconde
 * sobre el pie, para no taparlos. Al tocarlo se elige con qué asesor hablar.
 */
export function BotonWhatsapp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const revisar = () => {
      const hero = document.querySelector('[data-hero]');
      const pie = document.querySelector('footer');
      const pasoElHero = !hero || hero.getBoundingClientRect().bottom <= 80;
      const enElPie = !!pie && pie.getBoundingClientRect().top < window.innerHeight + 40;
      setVisible(pasoElHero && !enElPie);
    };
    revisar();
    window.addEventListener('scroll', revisar, { passive: true });
    window.addEventListener('resize', revisar);
    return () => {
      window.removeEventListener('scroll', revisar);
      window.removeEventListener('resize', revisar);
    };
  }, []);

  return (
    <div
      className={`fixed right-5 bottom-5 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ConsultarWhatsapp
        mensaje="Hola Total, quiero hacer una consulta."
        alineacion="derecha"
        direccion="arriba"
        className="flex cursor-pointer items-center gap-2 rounded-full bg-total-500 py-2.5 pr-4 pl-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-total-600"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3.5 20.5l1.3-4.1A8.6 8.6 0 1 1 8 19.3z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M8.6 7.7c.25-.5.6-.55.9-.55h.55c.2 0 .4.1.5.35l.75 1.8c.1.22.05.48-.1.66l-.55.65c-.14.17-.15.4-.04.58.58.98 1.38 1.78 2.36 2.36.18.11.41.1.58-.04l.65-.55c.18-.15.44-.2.66-.1l1.8.75c.25.1.35.3.35.5v.55c0 .3-.05.65-.55.9-.6.35-1.55.5-2.5.15-2.5-.95-4.45-2.9-5.4-5.4-.35-.95-.2-1.9.15-2.5z" fill="#fff" />
        </svg>
        <span className="hidden sm:block">WhatsApp</span>
      </ConsultarWhatsapp>
    </div>
  );
}
