import { useState } from 'react'
import { acceptRevision, getStoreProject, type StoreProject } from '@/api/projects'
import { RevisionConflictProblem, safeProblem } from '@/api/problems'
import { ConflictPanel } from '@/components/renderers/ConflictPanel'
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
  const [clash, setClash] = useState<RevisionConflictProblem | null>(null)
  const [disputed, setDisputed] = useState<Intention | null>(null)

  const document = project.acceptedRevision.document
  const page = document.pages[0]
  const root = page?.components.find(component => component.id === page.rootComponentId)
  if (!page || !root) {
    return <section aria-label="Canvas del proyecto">
      <p role="alert">El proyecto no tiene una composición que editar.</p>
    </section>
  }

  async function attempt(intention: Intention, base: string) {
    // Primero se ve, y después se pregunta: eso es lo que hace que el Canvas responda.
    onPreview(withProperty(document, page!.id, root!.id, 'heading', intention.heading))
    setSaving({ status: 'pending' })

    try {
      const accepted = await acceptRevision(project.id, {
        baseRevisionId: base,
        idempotencyKey: intention.key,
        operations: [setPropertyOperation(page!.id, root!.id, 'heading', intention.heading)],
      })
      setUnconfirmed(null)
      setClash(null)
      setSaving({ status: 'settled' })
      onPreview(null)
      onAccepted(accepted)
    } catch (error) {
      const problem = safeProblem(error)
      onPreview(null)
      if (problem instanceof RevisionConflictProblem) {
        // El servidor ya intento reaplicarlo y no pudo. Quien decide es quien edita, y para eso
        // necesita ver contra que se choco: el panel lo ensena y ofrece las salidas que hay.
        setUnconfirmed(null)
        setDisputed(intention)
        setClash(problem)
        setSaving({ status: 'settled' })
        return
      }
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
    void attempt({ key: intentionKey(), heading: trimmed }, project.acceptedRevision.id)
  }

  /**
   * Insistir con el cambio propio, ahora sobre la cabecera de verdad.
   *
   * <p>Con clave nueva, porque ya no es la misma intencion: la anterior se escribio contra una
   * revision que quedo atras, y reenviarla igual volveria a chocar contra lo mismo.
   */
  async function keepMine() {
    const intention = disputed
    if (!intention) return
    setClash(null)
    try {
      const fresh = await getStoreProject(project.id)
      onAccepted(fresh)
      await attempt({ key: intentionKey(), heading: intention.heading },
        fresh.acceptedRevision.id)
    } catch (error) {
      setSaving({ status: 'rejected', message: safeProblem(error).message })
    }
  }

  /** Dejar de disputar: se descarta el borrador y se mira lo que el proyecto tiene. */
  async function keepAccepted() {
    setClash(null)
    setDisputed(null)
    onPreview(null)
    await getStoreProject(project.id).then(onAccepted).catch(() => undefined)
  }

  return (
    <>
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
        <button type="button"
          onClick={() => void attempt(unconfirmed, project.acceptedRevision.id)}
          className="rounded-md border px-3 py-1 text-xs">
          Reintentar
        </button>
      )}
    </section>
    {clash && <ConflictPanel conflicts={clash.conflicts}
      onKeepMine={() => void keepMine()} onKeepAccepted={() => void keepAccepted()} />}
    </>
  )
}
