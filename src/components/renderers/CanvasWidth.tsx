/** Los anchos que la tienda tiene que aguantar. */
export const WIDTHS = [360, 768, 1024, 1440] as const

interface CanvasWidthProps {
  width: number
  onWidth: (width: number) => void
}

/**
 * A qué ancho se está mirando la composición.
 *
 * <p>Acota el marco y ya está: lo que se dibuja dentro es el mismo documento, con los mismos
 * componentes verificados. No hay una versión móvil y otra de escritorio que puedan discrepar,
 * porque no hay dos fuentes.
 */
export function CanvasWidth({ width, onWidth }: CanvasWidthProps) {
  return (
    <div role="group" aria-label="Ancho del lienzo" className="flex gap-2 text-xs">
      {WIDTHS.map(candidate => (
        <button key={candidate} type="button" onClick={() => onWidth(candidate)}
          aria-pressed={candidate === width}
          className={`rounded-md border px-2 py-0.5 ${candidate === width ? 'font-semibold' : ''}`}>
          {candidate}
        </button>
      ))}
    </div>
  )
}
