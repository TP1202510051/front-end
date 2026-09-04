import type { OperationConflict } from '@/api/problems'

interface ConflictPanelProps {
  conflicts: OperationConflict[]
  onKeepMine: () => void
  onKeepAccepted: () => void
}

const propertyNames: Record<string, string> = {
  heading: 'el titular',
  subheading: 'el subtítulo',
  label: 'el texto del enlace',
}

/**
 * Lo que impidió que un cambio entrara, y qué se puede hacer al respecto.
 *
 * <p>Un conflicto de propiedad enseña el valor que el proyecto tiene ahora junto al que se quiso
 * poner: sin las dos cosas no hay decisión que tomar, sólo un reintento a ciegas.
 *
 * <p>Cuando el objetivo ya no está, o el sitio donde iba se movió, **no se ofrece rehacerlo**. Esa
 * ausencia no es un olvido: reenviarlo seria recrear en silencio algo que alguien quitó a propósito,
 * y lo que toca es mirar cómo quedó el proyecto.
 */
export function ConflictPanel({ conflicts, onKeepMine, onKeepAccepted }: ConflictPanelProps) {
  const onlyProperties = conflicts.every(conflict => conflict.kind === 'PROPERTY_CHANGED')

  return (
    <section aria-label="Conflicto con el proyecto"
      className="w-full max-w-3xl space-y-2 rounded-md border p-3 text-xs">
      <p role="alert">El proyecto cambió mientras editabas.</p>
      <ul className="space-y-1">
        {conflicts.map((conflict, index) => (
          <li key={`${conflict.componentId}-${conflict.property ?? index}`}>
            {conflict.kind === 'PROPERTY_CHANGED' && (
              <span>
                Ahora {propertyNames[conflict.property ?? ''] ?? conflict.property} dice
                {' '}<strong>{conflict.current}</strong>, y tú pusiste
                {' '}<strong>{conflict.attempted}</strong>.
              </span>
            )}
            {conflict.kind === 'TARGET_MISSING' && (
              <span>Lo que querías cambiar ya no está en el proyecto.</span>
            )}
            {conflict.kind === 'STRUCTURE_CHANGED' && (
              <span>El sitio donde iba se movió, así que la posición ya no significa lo mismo.</span>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        {onlyProperties && (
          <button type="button" onClick={onKeepMine} className="rounded-md border px-2 py-0.5">
            Mantener mi cambio
          </button>
        )}
        <button type="button" onClick={onKeepAccepted} className="rounded-md border px-2 py-0.5">
          Quedarme con lo aceptado
        </button>
      </div>
    </section>
  )
}
