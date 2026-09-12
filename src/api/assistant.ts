import { platform } from './client'
import { documentValid } from './projects'
import { publicProblem, safeProblem } from './problems'
import type { components } from './schema'
import { isUuid } from './validators'

export type AssistantState = 'PENDING' | 'DRAFTED' | 'ACCEPTED' | 'REJECTED' | 'FAILED' | 'CANCELLED'
export type AssistantOutcome = 'WORKING' | 'CHANGE_AVAILABLE' | 'CLARIFICATION_REQUIRED' | 'NO_CHANGE'
  | 'UNSUPPORTED' | 'STALE_CONTEXT' | 'CANCELLED' | 'FAILED' | 'ACCEPTED' | 'REJECTED'
export type AssistantProposal = components['schemas']['AssistantProposalView']
export type AssistantProposalReceipt = components['schemas']['AssistantProposalReceiptView']
export type AssistantScopeKind = 'PROJECT' | 'PAGE' | 'COMPONENT'

/**
 * A que apunta una instruccion: el proyecto entero, una pagina, o un componente de una pagina con
 * lo que cuelga de el. Un componente lleva su pagina porque las identidades de componente son de la
 * pagina y no del proyecto: el mismo nombre en dos paginas es dos componentes.
 */
export interface AssistantScope {
  kind: AssistantScopeKind
  pageId: string | null
  componentId: string | null
}

/** Los puntos del ciclo, escritos aqui para no fiarse de que el servidor mande uno de ellos. */
const STATES: AssistantState[] = ['PENDING', 'DRAFTED', 'ACCEPTED', 'REJECTED', 'FAILED', 'CANCELLED']
const OUTCOMES: AssistantOutcome[] = ['WORKING', 'CHANGE_AVAILABLE', 'CLARIFICATION_REQUIRED', 'NO_CHANGE',
  'UNSUPPORTED', 'STALE_CONTEXT', 'CANCELLED', 'FAILED', 'ACCEPTED', 'REJECTED']
const SCOPES: AssistantScopeKind[] = ['PROJECT', 'PAGE', 'COMPONENT']

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

/** La propuesta que se pidio, y no otra: la identidad de la respuesta es la de la ruta. */
function isProposal(value: unknown, proposalId: string): value is AssistantProposal {
  return isProposalShape(value) && value.proposalId.toLowerCase() === proposalId.toLowerCase()
}

/**
 * Lo que llega es una propuesta, y no se cree por venir del servidor.
 *
 * <p>Se comprueba lo mismo que en el resto del cliente: que el estado sea uno de los que existen y
 * que las listas sean listas de texto. Es lo unico que este panel lee para decidir que ensena, asi
 * que un campo raro aqui es una pantalla que miente sobre lo que se va a aceptar.
 */
function isProposalShape(value: unknown): value is AssistantProposal {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.proposalId === 'string'
    && typeof item.projectId === 'string'
    && typeof item.state === 'string' && STATES.includes(item.state as AssistantState)
    && typeof item.outcome === 'string' && OUTCOMES.includes(item.outcome as AssistantOutcome)
    && typeof item.instruction === 'string'
    && typeof item.baseRevisionId === 'string'
    && typeof item.scope === 'string' && SCOPES.includes(item.scope as AssistantScopeKind)
    && (item.scopePageId == null || typeof item.scopePageId === 'string')
    && (item.scopeComponentId == null || typeof item.scopeComponentId === 'string')
    && typeof item.destructive === 'boolean'
    && strings(item.effects) && strings(item.losses) && strings(item.refused)
    && (item.modelSummary == null || typeof item.modelSummary === 'string')
    && (item.unavailable == null || typeof item.unavailable === 'string')
    && (item.acceptedRevisionId == null || typeof item.acceptedRevisionId === 'string')
    // La vista previa es lo unico que va derecho al renderizador del Canvas, asi que es lo
    // ultimo que puede llegar sin comprobar. Se valida con el mismo validador que un
    // documento aceptado: con dos, se colaria por el lado que alguien olvide.
    && (item.preview == null || documentValid(item.preview))
}

export interface AssistantInstruction {
  instruction: string
  scope: AssistantScopeKind
  scopePageId?: string | null
  scopeComponentId?: string | null
  idempotencyKey: string
}

/** A que apuntaba una propuesta, tal como quedo grabado con ella. */
export function scopeOf(proposal: AssistantProposal): AssistantScope {
  return { kind: proposal.scope, pageId: proposal.scopePageId ?? null,
    componentId: proposal.scopeComponentId ?? null }
}

/** El alcance, dicho como lo leeria quien lo eligio. */
export function scopeShown(scope: AssistantScope): string {
  if (scope.kind === 'COMPONENT' && scope.pageId && scope.componentId) {
    return `el componente «${scope.componentId}» de la página «${scope.pageId}» y lo que cuelga de él`
  }
  if (scope.kind === 'PAGE' && scope.pageId) return `sólo la página «${scope.pageId}»`
  return 'todo el proyecto'
}

/**
 * Por que no se admitio algo, en palabras.
 *
 * <p>El servidor manda un codigo, dos puntos y una frase que ya dice que quedo fuera y donde. El
 * codigo se traduce y no se ensena tal cual: es el nombre de una clase de negativa, no algo que
 * quien lee tenga que descifrar. Un texto sin codigo -o con uno que este panel no conoce- se ensena
 * como llego, que es mejor que callarlo.
 */
const REFUSAL_CODES: Record<string, string> = {
  OUTSIDE_SCOPE: 'Fuera del alcance',
  BELONGS_TO_NO_PAGE: 'No está en ninguna página',
  SHARED_BEYOND_SCOPE: 'Compartido más allá del alcance',
  OVER_LIMIT: 'Por encima del límite',
}

export function refusalShown(refusal: string): string {
  const match = /^([A-Z][A-Z_]*): (.+)$/s.exec(refusal)
  if (!match) return refusal
  const [, code, text] = match
  return code in REFUSAL_CODES ? `${REFUSAL_CODES[code]}: ${text}` : refusal
}

/**
 * Pide una propuesta y vuelve enseguida.
 *
 * <p>Lo que contesta es un recibo: por donde seguir el trabajo y que propuesta va a nacer. Esperar
 * aqui a que el modelo termine dejaria el Canvas bloqueado por algo que puede tardar, y quien
 * escribio la instruccion sigue teniendo cosas que hacer mientras tanto.
 */
export async function proposeAssistantChange(projectId: string,
  instruction: AssistantInstruction): Promise<AssistantProposalReceipt> {
  try {
    const { data } = await platform.POST('/api/v1/projects/{projectId}/assistant/proposals', {
      params: { path: { projectId } },
      body: {
        instruction: instruction.instruction,
        scope: instruction.scope,
        scopePageId: instruction.scopePageId ?? undefined,
        scopeComponentId: instruction.scopeComponentId ?? undefined,
        idempotencyKey: instruction.idempotencyKey,
      },
      signal: AbortSignal.timeout(15_000),
    })
    const receipt = data as Record<string, unknown> | undefined
    if (!receipt || !isUuid(receipt.operationId) || !isUuid(receipt.proposalId)) {
      throw publicProblem(null)
    }
    return { operationId: receipt.operationId, proposalId: receipt.proposalId }
  } catch (error) { throw safeProblem(error) }
}

/**
 * Las propuestas del proyecto, de la mas reciente hacia atras, sin vista previa.
 *
 * <p>La lista es para elegir cual mirar, no para mirarlas todas: la vista previa se calcula al
 * abrir una, sobre lo que el proyecto es en ese momento. Cada elemento se comprueba como se
 * comprueba una propuesta sola; una lista con un elemento raro es una lista que miente entera.
 */
export const PROPOSAL_HISTORY_LIMIT = 20

export async function listAssistantProposals(projectId: string): Promise<AssistantProposal[]> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{projectId}/assistant/proposals', {
      params: { path: { projectId }, query: { limit: PROPOSAL_HISTORY_LIMIT } },
      signal: AbortSignal.timeout(15_000),
    })
    if (!Array.isArray(data) || !data.every(item => isProposalShape(item))) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/** Lee la propuesta y, con ella, la vista previa calculada sobre lo que el proyecto es ahora. */
export async function getAssistantProposal(projectId: string,
  proposalId: string): Promise<AssistantProposal> {
  try {
    const { data } = await platform.GET(
      '/api/v1/projects/{projectId}/assistant/proposals/{proposalId}', {
        params: { path: { projectId, proposalId } }, signal: AbortSignal.timeout(15_000),
      })
    if (!isProposal(data, proposalId)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/**
 * Acepta, y solo entonces cambia algo.
 *
 * <p>La clave la pone quien acepta para que un reintento tras una respuesta perdida devuelva la
 * revision que ya existe en vez de escribir una segunda igual.
 */
export async function acceptAssistantProposal(projectId: string, proposalId: string,
  idempotencyKey: string): Promise<AssistantProposal> {
  try {
    const { data } = await platform.POST(
      '/api/v1/projects/{projectId}/assistant/proposals/{proposalId}/acceptance', {
        params: { path: { projectId, proposalId } }, body: { idempotencyKey },
        signal: AbortSignal.timeout(20_000),
      })
    if (!isProposal(data, proposalId)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/** Descarta. No escribe revision: lo unico que cambia es que la propuesta queda dicha como tal. */
export async function rejectAssistantProposal(projectId: string,
  proposalId: string): Promise<AssistantProposal> {
  try {
    const { data } = await platform.POST(
      '/api/v1/projects/{projectId}/assistant/proposals/{proposalId}/rejection', {
        params: { path: { projectId, proposalId } }, signal: AbortSignal.timeout(15_000),
      })
    if (!isProposal(data, proposalId)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/** Cancela una redaccion pendiente y devuelve el resultado que gano cualquier carrera. */
export async function cancelAssistantProposal(projectId: string,
  proposalId: string): Promise<AssistantProposal> {
  try {
    const { data } = await platform.POST(
      '/api/v1/projects/{projectId}/assistant/proposals/{proposalId}/cancellation', {
      params: { path: { projectId, proposalId } }, signal: AbortSignal.timeout(15_000),
      })
    if (!isProposal(data, proposalId)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}
