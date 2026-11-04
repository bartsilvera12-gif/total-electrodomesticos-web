/**
 * Características del producto: texto libre <-> `ficha`.
 *
 * En el panel se escriben como texto libre, una por renglón, porque cada tipo
 * de producto tiene las suyas (una licuadora: potencia y capacidad; una silla:
 * material y medidas). Se guardan en la misma columna `ficha` de siempre, así
 * no hubo que tocar la base ni las vistas.
 *
 * Un renglón con dos puntos se separa en etiqueta y valor ("Potencia: 600 W");
 * uno sin dos puntos queda entero como valor ("Apta para lavavajillas").
 */

export interface LineaFicha { etiqueta: string; valor: string }

/** Cómo se muestra una característica en la tienda. */
export function lineaDeFicha({ etiqueta, valor }: LineaFicha): string {
  const e = etiqueta.trim();
  const v = valor.trim();
  return e && v ? `${e}: ${v}` : e || v;
}

/** Lo guardado, como lo ve la clienta en el campo de texto. */
export function textoDeFicha(ficha: LineaFicha[]): string {
  return ficha.map(lineaDeFicha).filter(Boolean).join('\n');
}

/** Lo escrito en el campo, listo para guardar. */
export function fichaDeTexto(texto: string): LineaFicha[] {
  return texto
    .split('\n')
    // Viñetas que se pegan de otro lado: "- ", "• ", "* "
    .map((l) => l.replace(/^\s*[-•*·]\s+/, '').trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(':');
      if (i <= 0) return { etiqueta: '', valor: l };
      const etiqueta = l.slice(0, i).trim();
      const valor = l.slice(i + 1).trim();
      return valor ? { etiqueta, valor } : { etiqueta: '', valor: etiqueta };
    });
}
