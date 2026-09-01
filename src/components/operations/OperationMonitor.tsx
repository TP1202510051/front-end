import { useEffect, useRef, useState } from 'react'
import { getOperation, type AsyncOperation } from '@/api/operations'
import { safeProblem } from '@/api/problems'
import { useAuth } from '@/contexts/AuthContext'
import { clearKnownOperations, operationReceiptEvent, persistKnownOperations, readKnownOperations,
  type OperationReceiptNotice } from '@/realtime/known-operations'
import { subscribeToOperationChannel, type OperationSignal } from '@/realtime/operation-channel'

const workLabels: Record<AsyncOperation['workType'], string> = {
  ASSISTANT_PROPOSAL: 'Propuesta del Assistant',
  STORE_EXPORT: 'Exportación de tienda',
}

const stateLabels: Record<AsyncOperation['state'], string> = {
  QUEUED: 'En espera', RUNNING: 'En progreso', SUCCEEDED: 'Completada',
  FAILED: 'No se completó', CANCELLED: 'Cancelada',
}

const stageLabels: Record<string, string> = {
  QUEUED: 'Preparando', RUNNING: 'Procesando', RETRY_WAIT: 'Esperando reintento',
  PREPARE: 'Preparando', BUILD: 'Procesando', STORE: 'Guardando',
  SUCCEEDED: 'Finalizada', FAILED: 'No completada', CANCELLED: 'Cancelada',
}

export function OperationMonitor() {
  const { firebaseUser, idToken } = useAuth()
  const [operations, setOperations] = useState<Record<string, AsyncOperation>>({})
  const versions = useRef(new Map<string, number>())
  const known = useRef(new Set<string>())

  useEffect(() => {
    const actorId = firebaseUser?.uid
    if (!actorId || !idToken) {
      known.current.clear()
      versions.current.clear()
      setOperations({})
      return
    }
    versions.current.clear()
    setOperations({})
    known.current = readKnownOperations(actorId)
    let active = true

    const persistKnown = () => persistKnownOperations(actorId, known.current)
    const forget = (operationId: string) => {
      known.current.delete(operationId)
      versions.current.delete(operationId)
      persistKnown()
      setOperations(current => {
        const next = { ...current }
        delete next[operationId]
        return next
      })
    }
    const refresh = async (operationId: string) => {
      try {
        const durable = await getOperation(operationId)
        if (!active) return
        const currentVersion = versions.current.get(operationId) ?? 0
        if (durable.version <= currentVersion) return
        versions.current.set(operationId, durable.version)
        setOperations(current => ({ ...current, [operationId]: durable }))
      } catch (error) {
        if (!active) return
        if (safeProblem(error).code === 'RESOURCE_NOT_FOUND') forget(operationId)
      }
    }
    const acceptSignal = (signal: OperationSignal) => {
      const currentVersion = versions.current.get(signal.operationId) ?? 0
      if (signal.version <= currentVersion) return
      known.current.add(signal.operationId)
      persistKnown()
      void refresh(signal.operationId)
    }
    const clearExpired = () => {
      known.current.clear()
      versions.current.clear()
      clearKnownOperations(actorId)
      setOperations({})
    }
    const acceptReceipt = (event: Event) => {
      const receipt = (event as CustomEvent<OperationReceiptNotice>).detail
      if (!receipt || receipt.actorId !== actorId) return
      known.current.add(receipt.operationId)
      persistKnown()
      void refresh(receipt.operationId)
    }
    window.addEventListener(operationReceiptEvent, acceptReceipt)
    const unsubscribe = subscribeToOperationChannel({
      onConnected: () => { for (const operationId of known.current) void refresh(operationId) },
      onSignal: acceptSignal,
      onAuthorizationExpired: clearExpired,
    })
    return () => {
      active = false
      window.removeEventListener(operationReceiptEvent, acceptReceipt)
      unsubscribe()
    }
  }, [firebaseUser?.uid, idToken])

  const visible = Object.values(operations).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  if (visible.length === 0) return null
  return (
    <section aria-label="Progreso de operaciones"
      className="fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-white/20 bg-slate-950 p-4 shadow-xl">
      <h2 className="font-semibold">Progreso de operaciones</h2>
      <div className="mt-3 space-y-3">
        {visible.map(operation => (
          <article key={operation.operationId} className="rounded border border-white/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <p>{workLabels[operation.workType]}</p>
              <p>{stateLabels[operation.state]}</p>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Etapa: {stageLabels[operation.stage] ?? stateLabels[operation.state]}
            </p>
            {operation.progress == null ? (
              <p role="status" className="mt-2 text-sm">Progreso en actualización</p>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <progress aria-label={`Progreso de ${workLabels[operation.workType]}`}
                  className="w-full" max={100} value={operation.progress} />
                <span>{operation.progress}%</span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
