import { useEffect, useRef, useState } from 'react'
import {
  acceptAssistantProposal, cancelAssistantProposal, getAssistantProposal, proposeAssistantChange,
  rejectAssistantProposal,
  type AssistantProposal,
} from '@/api/assistant'
import { getStoreProject, type StoreProject } from '@/api/projects'
import { safeProblem } from '@/api/problems'
import { intentionKey, type ProjectDocument } from '@/canvas/intention'

interface AssistantPanelProps {
  project: StoreProject
  /** La pagina abierta, para acotar la instruccion a ella cuando quien escribe lo pide. */
  pageId: string | null
  onAccepted: (project: StoreProject) => void
  /** El documento que hay que ensenar mientras se mira la propuesta, o null para el aceptado. */
  onPreview: (document: ProjectDocument | null) => void
  readOnly: boolean
}

const fieldStyle = 'w-full rounded border border-slate-400 bg-transparent px-2 py-1'
const buttonStyle = 'rounded border border-slate-400 px-3 py-1 disabled:opacity-50'

/** Cada cuanto se vuelve a preguntar mientras el modelo escribe. */
const POLL_MS = 1200

const OUTCOME_MESSAGE = {
  CLARIFICATION_REQUIRED: 'Necesito una aclaración antes de proponer cambios.',
  NO_CHANGE: 'La instrucción no produciría cambios.',
  UNSUPPORTED: 'No puedo aplicar esa instrucción de forma segura.',
  STALE_CONTEXT: 'El proyecto cambió desde que se redactó. Pide una propuesta nueva.',
} as const

/**
 * El asistente: se le escribe, propone, y quien edita decide.
 *
 * <p>Pedir contesta enseguida con un recibo. Lo que tarde el modelo no puede tener bloqueado a quien
 * escribio la instruccion, que sigue editando mientras tanto; por eso esto no espera a la propuesta
 * sino que pregunta por ella hasta que esta.
 *
 * <p>Nada de lo que se ve aqui ha tocado el proyecto. La vista previa se pinta pidiendole al Canvas
 * que ensene el documento propuesto -el mismo renderizador que dibuja lo aceptado, para que no haya
 * dos formas de pintar que puedan discrepar-, y la revision aceptada sigue siendo la que era hasta
 * que alguien acepta en voz alta.
 *
 * <p>Lo que una propuesta quita se lee aparte de lo que solo cambia. Una sola lista dejaria un
 * borrado escondido entre cambios de color, y esto es justo lo que hay que leer antes de aceptar.
 */
export function AssistantPanel({ project, pageId, onAccepted, onPreview, readOnly }: AssistantPanelProps) {
  const [instruction, setInstruction] = useState('')
  const [scopedToPage, setScopedToPage] = useState(false)
  const [proposal, setProposal] = useState<AssistantProposal | null>(null)
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [showing, setShowing] = useState(false)
  const [watched, setWatched] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [speechMessage, setSpeechMessage] = useState<string | null>(null)
  const recognition = useRef<SpeechRecognition | null>(null)
  const [speechSupported] = useState(() => Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition))

  const decided = proposal?.state === 'ACCEPTED' || proposal?.state === 'REJECTED'
    || proposal?.state === 'CANCELLED'
  const drafted = proposal?.state === 'DRAFTED'
  const applicable = drafted && proposal.outcome === 'CHANGE_AVAILABLE'
  const disabled = pending || readOnly

  // Mientras la propuesta se escribe, se vuelve a preguntar. Se para en cuanto deja de estar
  // pendiente: seguir preguntando por algo que ya no va a cambiar es ruido contra el servidor.
  // Cual se vigila es estado y no una referencia: con una referencia, pedir una segunda mientras
  // la primera seguia pendiente dejaba vivo el intervalo de la primera, que machacaba a la nueva.
  useEffect(() => {
    if (proposal?.state !== 'PENDING' || watched == null) return
    let live = true
    const timer = setInterval(() => {
      void getAssistantProposal(project.id, watched)
        .then(next => { if (live) setProposal(next) })
        .catch(error => { if (live) setProblem(safeProblem(error).message); clearInterval(timer) })
    }, POLL_MS)
    return () => { live = false; clearInterval(timer) }
  }, [proposal?.state, watched, project.id])

  // Lo que se ensena en el Canvas se retira al irse, o quedaria pintada una propuesta que ya nadie
  // esta mirando y quien edita creeria estar viendo lo aceptado.
  useEffect(() => () => onPreview(null), [onPreview])

  useEffect(() => () => recognition.current?.abort(), [])

  function show(next: boolean) {
    setShowing(next)
    onPreview(next && proposal?.preview ? (proposal.preview as ProjectDocument) : null)
  }

  async function ask(event: React.FormEvent) {
    event.preventDefault()
    setPending(true); setProblem(null); show(false)
    try {
      const receipt = await proposeAssistantChange(project.id, {
        instruction: instruction.trim(),
        scope: scopedToPage && pageId ? 'PAGE' : 'PROJECT',
        scopePageId: scopedToPage ? pageId : null,
        idempotencyKey: intentionKey(),
      })
      setWatched(receipt.proposalId)
      setProposal(await getAssistantProposal(project.id, receipt.proposalId))
    } catch (error) {
      setProblem(safeProblem(error).message)
    } finally { setPending(false) }
  }

  function dictate() {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    setSpeechMessage(null)
    const next = new SpeechRecognition()
    recognition.current = next
    next.lang = 'es-PE'
    next.continuous = false
    next.interimResults = false
    next.maxAlternatives = 1
    next.onstart = () => setListening(true)
    next.onresult = event => {
      let transcript = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) transcript += event.results[index][0].transcript
      }
      if (transcript.trim()) {
        setInstruction(transcript.trim())
        setSpeechMessage('Transcripción lista. Revísala y pulsa “Pedir propuesta” para enviarla.')
      }
    }
    next.onerror = () => {
      setListening(false)
      setSpeechMessage('No se pudo completar el dictado. La instrucción escrita sigue disponible.')
    }
    next.onend = () => setListening(false)
    try { next.start() }
    catch { setListening(false); setSpeechMessage('No se pudo iniciar el dictado. Puedes seguir escribiendo.') }
  }

  async function cancel() {
    if (!proposal) return
    setPending(true); setProblem(null); show(false)
    try { setProposal(await cancelAssistantProposal(project.id, proposal.proposalId)) }
    catch (error) { setProblem(safeProblem(error).message) }
    finally { setPending(false) }
  }

  async function decide(accepting: boolean) {
    if (!proposal) return
    setPending(true); setProblem(null); show(false)
    try {
      const decidedProposal = accepting
        ? await acceptAssistantProposal(project.id, proposal.proposalId, intentionKey())
        : await rejectAssistantProposal(project.id, proposal.proposalId)
      setProposal(decidedProposal)
      // Solo aceptar mueve el proyecto. Releerlo tras rechazar pediria lo mismo que ya se tiene.
      if (accepting) await getStoreProject(project.id).then(onAccepted).catch(() => undefined)
    } catch (error) {
      setProblem(safeProblem(error).message)
    } finally { setPending(false) }
  }

  return <section aria-label="Asistente"
    className="w-full max-w-3xl space-y-3 rounded border border-slate-500 p-3 text-sm text-[var(--dashboard-foreground)]">
    <h2 className="font-semibold">Asistente</h2>

    {!readOnly && <form className="space-y-2" onSubmit={event => void ask(event)}>
      <label className="block">Instrucción para el asistente
        <textarea className={fieldStyle} rows={2} value={instruction} disabled={disabled}
          maxLength={2000} onChange={event => setInstruction(event.target.value)} />
      </label>
      {speechSupported ? <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={buttonStyle} disabled={disabled || listening}
          onClick={dictate}>{listening ? 'Escuchando…' : 'Dictar instrucción'}</button>
        <span>El dictado sólo rellena el texto; revísalo antes de enviarlo.</span>
      </div> : <p>El dictado no está disponible; puedes escribir la instrucción completa.</p>}
      {speechMessage && <p role="status">{speechMessage}</p>}
      {pageId && <label className="flex items-center gap-2">
        <input type="checkbox" checked={scopedToPage} disabled={disabled}
          onChange={event => setScopedToPage(event.target.checked)} />
        Sólo sobre esta página
      </label>}
      <button type="submit" className={buttonStyle} disabled={disabled || !instruction.trim()}>
        Pedir propuesta
      </button>
    </form>}

    {readOnly && <p>Estás viendo una revisión anterior. Vuelve a la última para pedirle algo.</p>}

    {proposal?.state === 'PENDING' && <div className="flex flex-wrap items-center gap-2">
      <p role="status">{proposal.unavailable}</p>
      {!readOnly && <button type="button" className={buttonStyle} disabled={pending}
        onClick={() => void cancel()}>Cancelar solicitud</button>}
    </div>}
    {proposal?.state === 'FAILED' && <p role="alert">No se pudo redactar. Vuelve a pedirlo.</p>}

    {proposal?.modelSummary && !decided && <p className="italic">«{proposal.modelSummary}»</p>}

    {drafted && proposal.effects.length > 0 && <>
      <h3 className="font-semibold">Lo que cambia</h3>
      <ul aria-label="Lo que cambia" className="list-disc space-y-1 pl-5">
        {proposal.effects.map(effect => <li key={effect}>{effect}</li>)}
      </ul>
    </>}

    {drafted && proposal.destructive && <>
      <p role="alert">Esta propuesta quita cosas del proyecto. Léelo antes de aceptar.</p>
      <h3 className="font-semibold">Lo que se pierde</h3>
      <ul aria-label="Lo que se pierde" className="list-disc space-y-1 pl-5">
        {proposal.losses.map(loss => <li key={loss}>{loss}</li>)}
      </ul>
    </>}

    {drafted && proposal.refused.length > 0 && <>
      <h3 className="font-semibold">Lo que no se admitió</h3>
      <ul aria-label="Lo que no se admitió" className="list-disc space-y-1 pl-5">
        {proposal.refused.map(refusal => <li key={refusal}>{refusal}</li>)}
      </ul>
    </>}

    {drafted && proposal.outcome in OUTCOME_MESSAGE && <p role="status">
      {OUTCOME_MESSAGE[proposal.outcome as keyof typeof OUTCOME_MESSAGE]}
    </p>}

    {applicable && proposal.preview && <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={buttonStyle} disabled={pending}
        onClick={() => show(!showing)}>
        {showing ? 'Volver a lo aceptado' : 'Ver la propuesta en el Canvas'}
      </button>
      {showing && <span role="status">Estás viendo la propuesta, no lo aceptado.</span>}
    </div>}

    {applicable && !readOnly && <div className="flex flex-wrap gap-2">
      <button type="button" className={buttonStyle} disabled={pending || !proposal.preview}
        onClick={() => void decide(true)}>Aceptar propuesta</button>
      <button type="button" className={buttonStyle} disabled={pending}
        onClick={() => void decide(false)}>Descartar propuesta</button>
    </div>}

    {proposal?.state === 'ACCEPTED' && <p role="status">
      Aceptada: la revisión {proposal.acceptedRevisionId} recoge lo que proponía.
    </p>}
    {proposal?.state === 'REJECTED' && <p role="status">
      Descartada. El proyecto quedó exactamente como estaba.
    </p>}
    {proposal?.state === 'CANCELLED' && <p role="status">
      Solicitud cancelada. No se aplicó ningún cambio.
    </p>}

    {problem && <p role="alert">{problem}</p>}
  </section>
}
