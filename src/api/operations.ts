import { platform } from './client'
import { publicProblem, safeProblem } from './problems'
import type { components } from './schema'
import { isOffsetTimestamp, isUuid, stableCodePattern } from './validators'

export type AsyncOperation = components['schemas']['AsyncOperationView']

function isOperation(value: unknown, operationId: string): value is AsyncOperation {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  if (!isUuid(item.operationId)
    || item.operationId.toLowerCase() !== operationId.toLowerCase()
    || (item.workType !== 'ASSISTANT_PROPOSAL' && item.workType !== 'STORE_EXPORT')
    || typeof item.state !== 'string' || !['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED'].includes(item.state)
    || typeof item.stage !== 'string' || !stableCodePattern.test(item.stage)
    || typeof item.version !== 'number' || !Number.isSafeInteger(item.version) || item.version < 1
    || !isOffsetTimestamp(item.createdAt) || !isOffsetTimestamp(item.updatedAt)
    || (item.startedAt != null && !isOffsetTimestamp(item.startedAt)) || (item.finishedAt != null && !isOffsetTimestamp(item.finishedAt))
    || (item.progress != null && (typeof item.progress !== 'number' || !Number.isInteger(item.progress) || item.progress < 0 || item.progress > 100))
    || (item.failureCode != null && (typeof item.failureCode !== 'string' || !stableCodePattern.test(item.failureCode)))
    || !Array.isArray(item.availableActions) || !item.availableActions.every(action => action === 'REFRESH_STATUS')) return false
  if (item.resultReference != null) {
    if (typeof item.resultReference !== 'object') return false
    const reference = item.resultReference as Record<string, unknown>
    if (typeof reference.type !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(reference.type)
      || typeof reference.id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(reference.id)) return false
  }
  return true
}

/** REST is authoritative. This read does not imply execution, retry, cancellation or a progress percentage. */
export async function getOperation(operationId: string): Promise<AsyncOperation> {
  try {
    if (!isUuid(operationId)) throw publicProblem({ code: 'BAD_REQUEST' })
    const { data } = await platform.GET('/api/v1/operations/{id}', {
      params: { path: { id: operationId } }, signal: AbortSignal.timeout(15_000),
    })
    if (!isOperation(data, operationId)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}
