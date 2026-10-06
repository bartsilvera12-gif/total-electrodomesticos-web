'use client';

import { useEffect } from 'react';

export default function Error({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-28 text-center">
      <h1 className="text-2xl font-bold tracking-tight">No pudimos cargar esta página</h1>
      <p className="text-grafito">
        Hubo un problema al traer la información. Probá de nuevo en unos segundos.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-sm bg-total-500 px-5 py-3 text-sm font-bold text-white hover:bg-total-600"
      >
        Intentar nuevamente
      </button>
    </div>
  );
}
