import { useState } from 'react'
import { acceptRevision, getStoreProject, type StoreProject } from '@/api/projects'
import { safeProblem } from '@/api/problems'
import { intentionKey, outcomeIsUnknown, setPropertyOperation, withProperty,
  type Intention, type ProjectDocument } from '@/canvas/intention'

interface DocumentCanvasProps {
  project: StoreProject
  onAccepted: (project: StoreProject) => void
  /** El documento que hay que enseñar mientras la intención está pendiente, o null para el aceptado. */
  onPreview: (document: ProjectDocument | null) => void
}

type Saving =
  | { status: 'settled' }
  | { status: 'pending' }
  /** El servidor no llego a decir si la acepto; la intencion sigue viva con su clave. */
  | { status: 'unconfirmed', message: string }
  | { status: 'rejected', message: string }

/**
 * El control de una intención manual sobre la revisión abierta.
 *
 * <p>No dibuja la composición: de eso ya se encarga la vista que valida el documento contra el
 * registro. Lo que hace es aplicar el cambio sobre una copia y pedir que se enseñe esa copia, de
 * modo que se vea al momento y marcada como pendiente. Sólo deja de estarlo cuando vuelve una
 * revisión aceptada; si el servidor la rechaza, la copia se descarta -o se reconcilia con lo que el
 * proyecto sea ahora- y nunca se queda pintada como si hubiera entrado.
 *
 * <p>Sólo se edita texto. Insertar, quitar y mover existen en el contrato y en el servidor, pero
 * todavía no tienen gesto aquí.
 */
export function DocumentCanvas({ project, onAccepted, onPreview }: DocumentCanvasProps) {
  const [saving, setSaving] = useState<Saving>({ status: 'settled' })
  const [unconfirmed, setUnconfirmed] = useState<Intention | null>(null)

  const document = project.acceptedRevision.document
  const page = document.pages[0]
  const root = page?.components.find(component => component.id === page.rootComponentId)
  if (!page || !root) {
    return <section aria-label="Canvas del proyecto">
      <p role="alert">El proyecto no tiene una composición que editar.</p>
    </section>
  }

  async function attempt(intention: Intention) {
    // Primero se ve, y después se pregunta: eso es lo que hace que el Canvas responda.
    onPreview(withProperty(document, page!.id, root!.id, 'heading', intention.heading))
    setSaving({ status: 'pending' })

    try {
      const accepted = await acceptRevision(project.id, {
        baseRevisionId: project.acceptedRevision.id,
        idempotencyKey: intention.key,
        operations: [setPropertyOperation(page!.id, root!.id, 'heading', intention.heading)],
      })
      setUnconfirmed(null)
      setSaving({ status: 'settled' })
      onPreview(null)
      onAccepted(accepted)
    } catch (error) {
      const problem = safeProblem(error)
      onPreview(null)
      if (outcomeIsUnknown(problem.action)) {
        // Nadie sabe si llego a aceptarse. La intencion se guarda con su clave, de modo que
        // reintentarla traiga de vuelta la revision que ya exista en vez de escribir otra igual.
        setUnconfirmed(intention)
        setSaving({ status: 'unconfirmed', message: problem.message })
        return
      }
      setUnconfirmed(null)
      setSaving({ status: 'rejected', message: problem.message })
      // El proyecto avanzó por otro lado: se trae lo que hay, en vez de dejar la pantalla mintiendo.
      if (problem.action === 'REFRESH') {
        await getStoreProject(project.id).then(onAccepted).catch(() => undefined)
      }
    }
  }

  function save(heading: string) {
    const trimmed = heading.trim()
    if (!trimmed || trimmed === root!.properties.heading) return
    void attempt({ key: intentionKey(), heading: trimmed })
  }

  return (
    <section aria-label="Canvas del proyecto" className="w-full max-w-3xl space-y-2">
      <form
        className="flex gap-2"
        onSubmit={event => {
          event.preventDefault()
          const field = new FormData(event.currentTarget).get('heading')
          void save(typeof field === 'string' ? field : '')
        }}
      >
        <label className="sr-only" htmlFor="canvas-heading">Titular de la portada</label>
        <input
          id="canvas-heading"
          name="heading"
          defaultValue={root.properties.heading}
          key={root.properties.heading}
          maxLength={80}
          className="flex-1 rounded-md border px-3 py-2 text-[var(--dashboard-foreground)]"
        />
        <button type="submit" disabled={saving.status === 'pending'}
          className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60">
          Guardar
        </button>
      </form>

      <p role="status" className="text-xs text-[var(--dashboard-foreground)]">
        {saving.status === 'pending'
          ? 'Cambio pendiente de confirmación…'
          : `Revisión aceptada ${project.acceptedRevision.number}`}
      </p>
      {(saving.status === 'rejected' || saving.status === 'unconfirmed')
        && <p role="alert" className="text-xs">{saving.message}</p>}
      {saving.status === 'unconfirmed' && unconfirmed && (
        <button type="button" onClick={() => void attempt(unconfirmed)}
          className="rounded-md border px-3 py-1 text-xs">
          Reintentar
        </button>
      )}
    </section>
  )
}
