import { useEffect, useState } from 'react'
import { listRevisions, type RevisionSummary } from '@/api/projects'
import { safeProblem } from '@/api/problems'

interface RevisionHistoryPanelProps {
  projectId: string
  /** Cambia cuando se acepta una revisión, para que el historial deje de estar desfasado. */
  acceptedRevisionId: string
  /** El número que se está inspeccionando, o null cuando se mira la cabecera. */
  inspecting: number | null
  onInspect: (number: number | null) => void
}

const originNames: Record<string, string> = {
  VERIFIED_TEMPLATE: 'Plantilla verificada',
  MANUAL_BATCH: 'Cambio manual',
  ASSISTANT_PROPOSAL: 'Propuesta del asistente',
  IMPORT: 'Importación',
  MIGRATION: 'Migración',
}

/**
 * El historial del proyecto, de la más reciente hacia atrás.
 *
 * <p>Cada entrada dice de dónde nació y de cuál desciende. El documento no viaja aquí: verlo es
 * abrir esa revisión, y entonces la vista pasa a enseñarla.
 *
 * <p>Se recarga cuando cambia la revisión aceptada. Un historial que no se entera de que acaba de
 * aceptarse un cambio es peor que no tenerlo, porque parece al día.
 */
export function RevisionHistoryPanel({
  projectId, acceptedRevisionId, inspecting, onInspect,
}: RevisionHistoryPanelProps) {
  const [items, setItems] = useState<RevisionSummary[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setProblem(null)
    listRevisions(projectId)
      .then(page => {
        if (!active) return
        setItems(page.items)
        setCursor(page.nextCursor ?? null)
      })
      .catch(error => { if (active) setProblem(safeProblem(error).message) })
    return () => { active = false }
  }, [projectId, acceptedRevisionId])

  async function more() {
    if (!cursor) return
    try {
      const page = await listRevisions(projectId, cursor)
      setItems(current => [...current, ...page.items])
      setCursor(page.nextCursor ?? null)
    } catch (error) { setProblem(safeProblem(error).message) }
  }

  return (
    <section aria-label="Historial de revisiones" className="w-full max-w-3xl space-y-2 text-xs">
      <h2 className="text-[var(--dashboard-foreground)]">Historial</h2>
      {problem && <p role="alert">{problem}</p>}
      <ul className="space-y-1">
        {items.map(revision => (
          <li key={revision.id} className="flex items-center gap-3">
            <span className="text-[var(--dashboard-foreground)]">
              Revisión {revision.number} · {originNames[revision.origin] ?? revision.origin}
              {revision.parentId ? '' : ' · sin anterior'}
            </span>
            {inspecting === revision.number
              ? <span aria-current="true">Se está viendo</span>
              : <button type="button" onClick={() => onInspect(revision.number)}
                  className="rounded-md border px-2 py-0.5">
                  Ver revisión {revision.number}
                </button>}
          </li>
        ))}
      </ul>
      {cursor && <button type="button" onClick={() => void more()}
        className="rounded-md border px-2 py-0.5">Ver más antiguas</button>}
      {inspecting !== null && <button type="button" onClick={() => onInspect(null)}
        className="rounded-md border px-2 py-0.5">Volver a la última</button>}
    </section>
  )
}
