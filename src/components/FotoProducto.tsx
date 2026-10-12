/**
 * Foto de producto.
 *
 * Con `url` muestra la foto real; sin `url` muestra un marcador honesto con la
 * descripción, en vez de inventar una foto de stock que no corresponde al
 * artículo.
 *
 * La foto sale del ERP: se sube desde Inventario al bucket público
 * `productos-imagenes` y la URL la arma `urlPublicaImagen()`. También puede ser
 * una dirección externa pegada a mano en `imagen_url`.
 *
 * Se usa <img> y no next/image a propósito: el sitio es un export estático y
 * next/image exige declarar de antemano los dominios remotos, que acá son
 * arbitrarios (los pega quien carga el producto).
 */
export function FotoProducto({
  descripcion,
  url,
  className = '',
}: {
  descripcion: string;
  url?: string;
  className?: string;
}) {
  if (url) {
    return (
      <div className={`overflow-hidden bg-white ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={descripcion}
          loading="lazy"
          className="size-full object-contain"
        />
      </div>
    );
  }

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
