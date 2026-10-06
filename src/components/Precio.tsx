import { guaranies } from '@/lib/formato';

export function Precio({
  monto, anterior, tamano = 'normal',
}: { monto: number; anterior?: number; tamano?: 'normal' | 'grande' }) {
  const hayRebaja = typeof anterior === 'number' && anterior > monto;
  return (
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <span
        className={
          tamano === 'grande'
            ? 'text-3xl font-bold tracking-tight sm:text-4xl'
            : 'text-lg font-bold tracking-tight'
        }
      >
        {guaranies(monto)}
      </span>
      {hayRebaja && (
        <span className="text-sm text-humo line-through">{guaranies(anterior)}</span>
      )}
    </div>
  );
}
