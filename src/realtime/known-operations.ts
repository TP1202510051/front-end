import { isUuid } from '@/api/validators'

export const operationReceiptEvent = 'abstractify:operation-receipt'

export interface OperationReceiptNotice {
  actorId: string
  operationId: string
}

function storageKey(actorId: string) {
  return `abstractify.operation-monitor.${actorId}`
}

export function readKnownOperations(actorId: string): Set<string> {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(storageKey(actorId)) ?? '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter(isUuid) : [])
  } catch {
    sessionStorage.removeItem(storageKey(actorId))
    return new Set()
  }
}

export function persistKnownOperations(actorId: string, operations: Set<string>) {
  sessionStorage.setItem(storageKey(actorId), JSON.stringify([...operations]))
}

export function clearKnownOperations(actorId: string) {
  sessionStorage.removeItem(storageKey(actorId))
}

/** Operation-starting REST flows call this as soon as their durable receipt is accepted. */
export function registerOperationReceipt(actorId: string, operationId: string): boolean {
  if (!actorId || !isUuid(operationId)) return false
  const known = readKnownOperations(actorId)
  known.add(operationId)
  persistKnownOperations(actorId, known)
  window.dispatchEvent(new CustomEvent<OperationReceiptNotice>(operationReceiptEvent, {
    detail: { actorId, operationId },
  }))
  return true
}
