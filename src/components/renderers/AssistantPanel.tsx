import { useCallback, useEffect, useRef, useState } from 'react'
import {
  acceptAssistantProposal, cancelAssistantProposal, getAssistantProposal, listAssistantProposals,
  proposeAssistantChange, rejectAssistantProposal, refusalShown, scopeOf, scopeShown,
  PROPOSAL_HISTORY_LIMIT, type AssistantProposal, type AssistantScope, type AssistantScopeKind,
} from '@/api/assistant'
import { getStoreProject, listRevisions, type StoreProject } from '@/api/projects'
import { safeProblem } from '@/api/problems'
import { intentionKey, type ProjectDocument } from '@/canvas/intention'
import { useAuth } from '@/contexts/AuthContext'
import { registerOperationReceipt } from '@/realtime/known-operations'
import { followOperationFeed, isOperationChannelLive } from '@/realtime/operation-feed'

interface AssistantPanelProps {
  project: StoreProject
  /**
   * La revision aceptada de verdad, aunque se este inspeccionando otra: {@code project} trae la
   * que se mira, y "la actual" tiene que decirse de la cabecera y no de la inspeccionada.
   */
  headRevisionId: string
  /** La pagina abierta, para acotar la instruccion a ella o a uno de sus componentes. */
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

/**
 * El componente, como lo nombra el Canvas: por lo que dice y, entre parentesis, por su identidad,
 * que es la misma con la que una negativa lo nombra. Sin la identidad, dos secciones con el mismo
 * titulo serian indistinguibles y una negativa no se podria casar con lo que se eligio.
 */
function componentName(node: ProjectDocument['pages'][number]['components'][number]) {
  return `${node.properties.heading ?? node.properties.label ?? node.type} (${node.id})`
}

const SCOPE_CHOICES: readonly (readonly [AssistantScopeKind, string])[] = [
  ['PROJECT', 'Todo el proyecto'],
  ['PAGE', 'Sólo esta página'],
  ['COMPONENT', 'Sólo un componente de esta página'],
]

/**
 * Dos tablas para el mismo desenlace porque se lee en dos sitios distintos: en la lista, una
 * etiqueta corta junto a otras; en la propuesta abierta, una frase que dice que hacer. Las dos
 * son del panel; el servidor manda codigos y ninguno de los dos se ensena.
 */
const OUTCOME_LABEL: Record<AssistantProposal['outcome'], string> = {
  WORKING: 'Redactándose',
  CHANGE_AVAILABLE: 'Con cambios para decidir',
  CLARIFICATION_REQUIRED: 'Pide una aclaración',
  NO_CHANGE: 'Sin cambios',
  UNSUPPORTED: 'No aplicable',
  STALE_CONTEXT: 'Quedó obsoleta',
  CANCELLED: 'Cancelada',
  FAILED: 'No se pudo redactar',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Descartada',
}

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
 * escribio la instruccion, que sigue editando mientras tanto. Como se entera de que ya esta depende
 * de si el canal de operaciones esta en directo: si lo esta, cada senal nueva de su operacion es un
 * aviso de releer la propuesta por REST; si no lo esta -nunca se conecto, o se perdio-, se vuelve a
 * preguntar cada poco. Los dos caminos llegan al mismo desenlace porque el desenlace lo dice REST;
 * el canal solo dice cuando mirar, y el panel dice cual de los dos esta usando.
 *
 * <p>Nada de lo que se ve aqui ha tocado el proyecto. La vista previa se pinta pidiendole al Canvas
 * que ensene el documento propuesto -el mismo renderizador que dibuja lo aceptado, para que no haya
 * dos formas de pintar que puedan discrepar-, y la revision aceptada sigue siendo la que era hasta
 * que alguien acepta en voz alta.
 *
 * <p>Lo que una propuesta quita se lee aparte de lo que solo cambia. Una sola lista dejaria un
 * borrado escondido entre cambios de color, y esto es justo lo que hay que leer antes de aceptar.
 *
 * <p>A que apunta la instruccion -el proyecto, la pagina abierta, o un componente de ella- se elige
 * aqui y se ve antes de pedir, mientras se escribe y mientras se dicta. El componente se elige de
 * los de la pagina, nombrados como el Canvas los nombra, y no tecleando una identidad: lo que se
 * teclea mal apunta a otra cosa, y lo que se elige apunta a lo que se esta mirando.
 *
 * <p>El panel no conoce solo la ultima: lista las propuestas que el proyecto ya recibio, con su
 * desenlace y contra que revision se redactaron, y avisa cuando esa revision ya no es la ultima.
 * Abrir una la lee por su identidad -la vista previa se calcula entonces, sobre el proyecto de
 * ahora- y decidirla pasa por el mismo camino explicito que la mas reciente. Una que no se pudo
 * redactar se puede volver a pedir desde aqui; lo que se pide es una peticion nueva con la misma
 * instruccion y el mismo alcance, no la resurreccion de la fallida: la fallida queda dicha.
 */
export function AssistantPanel({ project, headRevisionId, pageId, onAccepted, onPreview, readOnly }: AssistantPanelProps) {
  const { firebaseUser } = useAuth()
  const [instruction, setInstruction] = useState('')
  const [scopeKind, setScopeKind] = useState<AssistantScopeKind>('PROJECT')
  const [componentId, setComponentId] = useState('')
  const [proposal, setProposal] = useState<AssistantProposal | null>(null)
  const [pending, setPending] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [showing, setShowing] = useState(false)
  const [watched, setWatched] = useState<string | null>(null)
  const [watchedOperation, setWatchedOperation] = useState<string | null>(null)
  const [live, setLive] = useState(() => isOperationChannelLive())
  const seenVersion = useRef(0)
  const watchedRef = useRef<string | null>(null)
  const [history, setHistory] = useState<AssistantProposal[]>([])
  const [historyProblem, setHistoryProblem] = useState<string | null>(null)
  const [revisionNumbers, setRevisionNumbers] = useState<Map<string, number>>(new Map())
  const [listening, setListening] = useState(false)
  const [speechMessage, setSpeechMessage] = useState<string | null>(null)
  const recognition = useRef<SpeechRecognition | null>(null)
  const [speechSupported] = useState(() => Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition))

  const decided = proposal?.state === 'ACCEPTED' || proposal?.state === 'REJECTED'
    || proposal?.state === 'CANCELLED'
  const drafted = proposal?.state === 'DRAFTED'
  const applicable = drafted && proposal.outcome === 'CHANGE_AVAILABLE'
  const disabled = pending || readOnly

  /**
   * La unica forma de releer la propuesta que se mira, venga el aviso de donde venga.
   *
   * <p>Tres caminos leen -el recibo, una senal del canal, el sondeo- y los tres pueden llegar
   * desordenados. Una lectura solo entra si sigue siendo la propuesta que se mira y si lo que hay
   * en pantalla no esta ya decidido: una lectura vieja que diga "redactando" no puede tapar el
   * desenlace que otra ya trajo, y una lectura de una propuesta anterior no puede pisar la nueva.
   */
  const reread = useCallback(async (proposalId: string) => {
    try {
      const next = await getAssistantProposal(project.id, proposalId)
      if (watchedRef.current !== proposalId) return
      setProposal(current => current != null && current.proposalId === next.proposalId
        && current.state !== 'PENDING' ? current : next)
    } catch (error) {
      if (watchedRef.current === proposalId) setProblem(safeProblem(error).message)
    }
  }, [project.id])

  // Con el canal en directo, cada senal de la operacion que redacta -ya leida por REST y mas nueva
  // que la anterior- es el aviso de releer la propuesta. Una senal de otra operacion no cambia
  // nada: no es la que se mira. Y lo que se lee es la propuesta por REST, nunca lo que la senal
  // trae, que es solo identidad y version.
  useEffect(() => followOperationFeed({
    onChannel: setLive,
    onStatus: operation => {
      if (operation.operationId !== watchedOperation || watched == null) return
      if (operation.version <= seenVersion.current) return
      seenVersion.current = operation.version
      void reread(watched)
    },
  }), [watchedOperation, watched, reread])

  // Sin canal en directo, mientras la propuesta se escribe se vuelve a preguntar. Se para en
  // cuanto deja de estar pendiente: seguir preguntando por algo que ya no va a cambiar es ruido
  // contra el servidor. Cual se vigila es estado y no una referencia: con una referencia, pedir una
  // segunda mientras la primera seguia pendiente dejaba vivo el intervalo de la primera, que
  // machacaba a la nueva.
  // Una propuesta anterior reabierta mientras se redacta no trae su operacion -la lista no la
  // dice-, asi que el canal no puede avisar por ella: se pregunta como si no hubiera canal.
  useEffect(() => {
    if (proposal?.state !== 'PENDING' || watched == null || (live && watchedOperation != null)) return
    const timer = setInterval(() => { void reread(watched) }, POLL_MS)
    return () => clearInterval(timer)
  }, [proposal?.state, watched, watchedOperation, live, reread])

  // La lista se relee cuando algo pudo cambiarla: al abrir el proyecto, y cada vez que la
  // propuesta que se mira cambia de punto -nace, se redacta, se decide-. Una respuesta que llega
  // tarde no pisa a la que llego despues: solo entra la de la ultima peticion.
  useEffect(() => {
    let active = true
    listAssistantProposals(project.id)
      .then(items => { if (active) { setHistory(items); setHistoryProblem(null) } })
      .catch(error => { if (active) setHistoryProblem(safeProblem(error).message) })
    return () => { active = false }
  }, [project.id, proposal?.proposalId, proposal?.state])

  // Las revisiones se nombran por su numero, como en el historial, y la propuesta solo trae la
  // identidad de la suya: la primera pagina del historial da el numero de las recientes, que son
  // contra las que se redacto casi todo. Una mas antigua se nombra por su identidad, que es
  // tambien un numero legible, antes que callarla.
  useEffect(() => {
    let active = true
    listRevisions(project.id)
      .then(page => { if (active) setRevisionNumbers(new Map(page.items.map(item => [item.id, item.number]))) })
      .catch(() => undefined)
    return () => { active = false }
  }, [project.id, headRevisionId])

  /** Contra que revision se redacto, dicho como en el historial, y si esa sigue siendo la ultima. */
  function draftedAgainst(earlier: AssistantProposal): string {
    const number = revisionNumbers.get(earlier.baseRevisionId)
    const named = `sobre la revisión ${number ?? earlier.baseRevisionId}`
    return earlier.baseRevisionId === headRevisionId ? `${named}, la actual`
      : `${named} — ya no es la última: el proyecto cambió desde entonces`
  }

  /** Empezar a mirar una propuesta: desde aqui, cada aviso -canal o sondeo- la relee. */
  function watch(proposalId: string, operationId: string | null) {
    seenVersion.current = 0
    watchedRef.current = proposalId
    setWatched(proposalId)
    setWatchedOperation(operationId)
  }

  // Lo que se ensena en el Canvas se retira al irse, o quedaria pintada una propuesta que ya nadie
  // esta mirando y quien edita creeria estar viendo lo aceptado.
  useEffect(() => () => onPreview(null), [onPreview])

  useEffect(() => () => recognition.current?.abort(), [])

  // Lo que se puede apuntar depende de la pagina abierta. Sin pagina solo queda el proyecto, y un
  // componente solo se puede elegir entre los que la pagina tiene: si se pidio un componente y la
  // pagina no tiene ninguno, lo que se apunta es la pagina, y la casilla marcada lo dice tambien.
  // Al cambiar de pagina se olvida el componente elegido: el mismo nombre en otra pagina seria
  // otro componente, y mandarlo apuntaria a algo que nadie eligio.
  const page = pageId
    ? project.acceptedRevision.document.pages.find(candidate => candidate.id === pageId) ?? null
    : null
  const components = page?.components ?? []
  const chosenComponent = components.find(node => node.id === componentId) ?? components[0] ?? null
  useEffect(() => setComponentId(''), [pageId])
  const shownKind: AssistantScopeKind = !page ? 'PROJECT'
    : scopeKind === 'COMPONENT' && !chosenComponent ? 'PAGE' : scopeKind
  const scope: AssistantScope = shownKind === 'COMPONENT' && page && chosenComponent
    ? { kind: 'COMPONENT', pageId: page.id, componentId: chosenComponent.id }
    : shownKind === 'PAGE' && page ? { kind: 'PAGE', pageId: page.id, componentId: null }
    : { kind: 'PROJECT', pageId: null, componentId: null }

  function show(next: boolean) {
    setShowing(next)
    onPreview(next && proposal?.preview ? (proposal.preview as ProjectDocument) : null)
  }

  async function ask(event: React.FormEvent) {
    event.preventDefault()
    await propose(instruction.trim(), scope)
  }

  /**
   * Volver a pedir lo que fallo es pedirlo otra vez, no revivir lo fallido.
   *
   * <p>Se manda la misma instruccion y el mismo alcance que quedaron grabados, con una clave de
   * idempotencia nueva: con la misma, el servidor devolveria la propuesta fallida que ya existe,
   * que es justo lo que no se quiere. La fallida sigue en la lista, dicha como tal.
   */
  async function retry(failed: AssistantProposal) {
    await propose(failed.instruction, scopeOf(failed))
  }

  async function propose(text: string, aim: AssistantScope) {
    setPending(true); setProblem(null); show(false)
    try {
      const receipt = await proposeAssistantChange(project.id, {
        instruction: text,
        scope: aim.kind,
        scopePageId: aim.pageId,
        scopeComponentId: aim.componentId,
        idempotencyKey: intentionKey(),
      })
      watch(receipt.proposalId, receipt.operationId)
      // El recibo durable se apunta en el monitor antes de fiarse del canal: asi la operacion se
      // recupera por REST tras una reconexion aunque su senal se haya perdido por el camino.
      if (firebaseUser?.uid) registerOperationReceipt(firebaseUser.uid, receipt.operationId)
      await reread(receipt.proposalId)
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

  /**
   * Abrir una anterior es leerla por su identidad, como se lee la ultima: la vista previa se
   * calcula ahora, sobre el proyecto de ahora, y si ya no cabe el servidor lo dice como obsoleta.
   */
  async function open(earlier: AssistantProposal) {
    setPending(true); setProblem(null); show(false)
    // La lista no trae la operacion; si es la que ya se seguia, se conserva la que se tenia.
    watch(earlier.proposalId, earlier.proposalId === watchedRef.current ? watchedOperation : null)
    try { await reread(earlier.proposalId) }
    finally { setPending(false) }
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
      {page && <fieldset className="space-y-1">
        <legend className="font-semibold">Alcance</legend>
        {SCOPE_CHOICES.map(([kind, label]) => <label key={kind} className="flex items-center gap-2">
          <input type="radio" name="assistant-scope" value={kind} checked={shownKind === kind}
            disabled={disabled || (kind === 'COMPONENT' && components.length === 0)}
            onChange={() => setScopeKind(kind)} />
          {label}
        </label>)}
        {shownKind === 'COMPONENT' && chosenComponent && <label className="block">Componente elegido
          <select className={fieldStyle} value={chosenComponent.id} disabled={disabled}
            onChange={event => setComponentId(event.target.value)}>
            {components.map(node => <option key={node.id} value={node.id}>{componentName(node)}</option>)}
          </select>
        </label>}
      </fieldset>}
      {/* Se dice antes de pedir, escribiendo o dictando, para que nunca salga apuntada a otra cosa
          que la que se esta mirando. */}
      <p aria-label="Alcance de la instrucción">Apuntando a: {scopeShown(scope)}</p>
      <button type="submit" className={buttonStyle} disabled={disabled || !instruction.trim()}>
        Pedir propuesta
      </button>
    </form>}

    {readOnly && <p>Estás viendo una revisión anterior. Vuelve a la última para pedirle algo.</p>}

    {proposal?.state === 'PENDING' && <div className="flex flex-wrap items-center gap-2">
      <p role="status">{proposal.unavailable}</p>
      <p aria-label="Seguimiento de la redacción">
        {live ? 'Siguiendo la redacción en directo.' : 'Consultando la redacción periódicamente.'}
      </p>
      {!readOnly && <button type="button" className={buttonStyle} disabled={pending}
        onClick={() => void cancel()}>Cancelar solicitud</button>}
    </div>}
    {proposal?.state === 'FAILED' && <p role="alert">No se pudo redactar. Vuelve a pedirlo.</p>}

    {proposal && <p aria-label="Alcance de la propuesta">Apuntada a: {scopeShown(scopeOf(proposal))}</p>}
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
        {proposal.refused.map(refusal => <li key={refusal}>{refusalShown(refusal)}</li>)}
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

    {(history.length > 0 || historyProblem) && <>
      <h3 className="font-semibold">Propuestas anteriores</h3>
      {historyProblem && <p role="alert">{historyProblem}</p>}
      <ul aria-label="Propuestas anteriores" className="space-y-2">
        {history.map(earlier => {
          const opened = earlier.proposalId === proposal?.proposalId
          return <li key={earlier.proposalId} className="rounded border border-slate-600 p-2">
            <p className="italic">«{earlier.instruction}»</p>
            <p>{OUTCOME_LABEL[earlier.outcome]} · {draftedAgainst(earlier)}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {opened
                ? <span aria-current="true">Se está viendo</span>
                : <button type="button" className={buttonStyle} disabled={pending}
                    onClick={() => void open(earlier)}>Abrir</button>}
              {earlier.state === 'FAILED' && !readOnly && <button type="button" className={buttonStyle}
                disabled={disabled} onClick={() => void retry(earlier)}>Volver a pedir</button>}
            </div>
          </li>
        })}
      </ul>
      {history.length >= PROPOSAL_HISTORY_LIMIT && <p>Se muestran las {PROPOSAL_HISTORY_LIMIT} más recientes.</p>}
    </>}
  </section>
}
