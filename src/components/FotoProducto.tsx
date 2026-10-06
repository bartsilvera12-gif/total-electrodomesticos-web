/**
 * Marcador de foto de producto.
 *
 * El catálogo todavía no tiene imágenes cargadas. En vez de inventar fotos de
 * stock que no corresponden al artículo, se muestra un marcador honesto con la
 * descripción. Cuando el panel web permita subir imágenes, esto pasa a ser un
 * next/image contra la foto real.
 */
export function FotoProducto({
  descripcion, className = '',
}: { descripcion: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-total-50 p-4 text-center ${className}`}
      role="img"
      aria-label={`Foto pendiente: ${descripcion}`}
    >
      <span className="font-mono text-[11px] leading-relaxed tracking-wide text-total-400">
        foto: {descripcion}
      </span>
    </div>
  );
}
