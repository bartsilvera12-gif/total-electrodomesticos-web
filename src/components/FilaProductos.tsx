import Link from 'next/link';
import type { Producto } from '@/lib/catalogo/tipos';
import { TarjetaProducto } from './TarjetaProducto';

export function FilaProductos({
  titulo, bajada, productos, verTodo,
}: {
  titulo: string;
  bajada?: string;
  productos: Producto[];
  verTodo?: { href: string; etiqueta: string };
}) {
  if (!productos.length) return null;
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[clamp(26px,3vw,38px)] leading-tight font-bold tracking-tight">
            {titulo}
          </h2>
          {bajada && <p className="mt-2 text-grafito">{bajada}</p>}
        </div>
        {verTodo && (
          <Link href={verTodo.href} className="text-sm font-semibold text-total-500 hover:underline">
            {verTodo.etiqueta} →
          </Link>
        )}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-px bg-linea lg:grid-cols-4">
        {productos.map((p) => (
          <div key={p.id} className="bg-white">
            <TarjetaProducto producto={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
