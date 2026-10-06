import Link from 'next/link';
import { Armazon } from '@/components/Armazon';

export default function NoEncontrado() {
  return (
    <Armazon>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-28 text-center">
        <p className="font-mono text-[11px] tracking-widest text-total-500 uppercase">
          Página no encontrada
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Esta página no existe</h1>
        <p className="text-grafito">
          Puede que el producto ya no esté publicado o que el enlace haya cambiado.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link href="/productos" className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600">
            Ver productos
          </Link>
          <Link href="/" className="rounded-sm border border-carbon px-5 py-3 text-sm font-bold hover:bg-carbon hover:text-white">
            Ir al inicio
          </Link>
        </div>
      </div>
    </Armazon>
  );
}
