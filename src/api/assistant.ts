import { platform } from './client'
import { documentValid } from './projects'
import { publicProblem, safeProblem } from './problems'
import type { components } from './schema'
import { isUuid } from './validators'

export type AssistantProposal = components['schemas']['AssistantProposalView']
export type AssistantProposalReceipt = components['schemas']['AssistantProposalReceiptView']

/** Los puntos del ciclo, escritos aqui para no fiarse de que el servidor mande uno de ellos. */
const STATES = ['PENDING', 'DRAFTED', 'ACCEPTED', 'REJECTED', 'FAILED']

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

/**
 * Lo que llega es una propuesta, y no se cree por venir del servidor.
 *
 * <p>Se comprueba lo mismo que en el resto del cliente: que el estado sea uno de los que existen y
 * que las listas sean listas de texto. Es lo unico que este panel lee para decidir que ensena, asi
 * que un campo raro aqui es una pantalla que miente sobre lo que se va a aceptar.
 */
function isProposal(value: unknown, proposalId: string): value is AssistantProposal {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.proposalId === 'string'
    && item.proposalId.toLowerCase() === proposalId.toLowerCase()
    && typeof item.projectId === 'string'
    && typeof item.state === 'string' && STATES.includes(item.state)
    && typeof item.instruction === 'string'
    && typeof item.baseRevisionId === 'string'
    && (item.scope === 'PROJECT' || item.scope === 'PAGE')
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
  scope: 'PROJECT' | 'PAGE'
  scopePageId?: string | null
  idempotencyKey: string
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
