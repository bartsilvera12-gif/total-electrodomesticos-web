'use client';

import { useEffect, useRef } from 'react';

/**
 * Entrada de las secciones al entrar en pantalla.
 *
 * Los hijos marcados con data-revelar-item entran escalonados; si no hay
 * ninguno, entra el bloque entero. Respeta prefers-reduced-motion: si está
 * activo no observa nada y el contenido queda visible desde el arranque.
 */
export function Revelar({
  children, className = '',
}: { children: React.ReactNode; className?: string }) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const objetivos = el.querySelectorAll<HTMLElement>('[data-revelar-item]');
    const lista = objetivos.length ? Array.from(objetivos) : [el];
    lista.forEach((t) => { t.style.opacity = '0'; });

    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          obs.unobserve(e.target);
          lista.forEach((t, i) => {
            t.style.opacity = '';
            t.animate(
              [
                { opacity: 0, transform: 'translateY(28px)' },
                { opacity: 1, transform: 'none' },
              ],
              {
                duration: 750,
                delay: Math.min(i, 8) * 70,
                easing: 'cubic-bezier(.2,.7,.2,1)',
                fill: 'backwards',
              },
            );
          });
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return <div ref={caja} className={className}>{children}</div>;
}
