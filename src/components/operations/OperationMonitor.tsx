import { useEffect, useRef, useState } from 'react'
import { getOperation, type AsyncOperation } from '@/api/operations'
import { safeProblem } from '@/api/problems'
import { downloadStoreExport, issueStoreExportDownload } from '@/api/store-exports'
import { useAuth } from '@/contexts/AuthContext'
import { clearKnownOperations, operationReceiptEvent, persistKnownOperations, readKnownOperations,
  type OperationReceiptNotice } from '@/realtime/known-operations'
import { subscribeToOperationChannel, type OperationSignal } from '@/realtime/operation-channel'
import { announceOperationChannel, announceOperationStatus } from '@/realtime/operation-feed'

const workLabels: Record<AsyncOperation['workType'], string> = {
  ASSISTANT_PROPOSAL: 'Propuesta del Assistant',
  STORE_EXPORT: 'Exportación de tienda',
}

const stateLabels: Record<AsyncOperation['state'], string> = {
  QUEUED: 'En espera', RUNNING: 'En progreso', SUCCEEDED: 'Completada',
  FAILED: 'No se completó', CANCELLED: 'Cancelada',
}

const stageLabels: Record<string, string> = {
  QUEUED: 'Preparando', RUNNING: 'Procesando', RETRY_WAIT: 'Esperando reintento', DRAFTING: 'Redactando',
  PREPARE: 'Preparando', BUILD: 'Construyendo', TEST: 'Probando', SMOKE: 'Comprobando el arranque',
  PACKAGE: 'Empaquetando', STORE: 'Guardando', VERIFY: 'Verificando integridad',
  SUCCEEDED: 'Finalizada', FAILED: 'No completada', CANCELLED: 'Cancelada',
}

export function OperationMonitor() {
  const { firebaseUser, idToken } = useAuth()
  const [operations, setOperations] = useState<Record<string, AsyncOperation>>({})
  const versions = useRef(new Map<string, number>())
  const known = useRef(new Set<string>())
  const [downloadProblem, setDownloadProblem] = useState<Record<string, string>>({})
  const [downloading, setDownloading] = useState<string | null>(null)

  const download = async (exportId: string) => {
    setDownloading(exportId)
    setDownloadProblem(current => ({ ...current, [exportId]: '' }))
    try {
      const reference = await issueStoreExportDownload(exportId)
      const archive = await downloadStoreExport(exportId, reference)
      const href = URL.createObjectURL(archive.blob)
      const anchor = document.createElement('a')
      anchor.href = href
      anchor.download = archive.filename
      anchor.click()
      URL.revokeObjectURL(href)
    } catch (error) {
      setDownloadProblem(current => ({ ...current, [exportId]: safeProblem(error).message }))
    } finally { setDownloading(null) }
  }

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
        // Lo que se cuenta al resto de la pantalla es lo que REST devolvio, ya comprobado y mas
        // nuevo que lo que se tenia: una senal por si sola no cuenta nada.
        announceOperationStatus(durable)
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
    // Una identidad caducada cierra la suscripcion en vez de degradarla: no se deja al cliente
    // reintentando cada cinco segundos con una credencial que ya no vale. Quien seguia una
    // operacion vuelve a preguntar por REST, que le contestara con la misma negativa; y con una
    // identidad nueva este efecto vuelve a correr y abre el canal otra vez.
    let unsubscribe: () => void = () => undefined
    const clearExpired = () => {
      known.current.clear()
      versions.current.clear()
      clearKnownOperations(actorId)
      setOperations({})
      unsubscribe()
      announceOperationChannel(false)
    }
    const acceptReceipt = (event: Event) => {
      const receipt = (event as CustomEvent<OperationReceiptNotice>).detail
      if (!receipt || receipt.actorId !== actorId) return
      known.current.add(receipt.operationId)
      persistKnown()
      void refresh(receipt.operationId)
    }
    window.addEventListener(operationReceiptEvent, acceptReceipt)
    unsubscribe = subscribeToOperationChannel({
      onConnected: () => {
        announceOperationChannel(true)
        for (const operationId of known.current) void refresh(operationId)
      },
      onSignal: acceptSignal,
      onDisconnected: () => announceOperationChannel(false),
      onAuthorizationExpired: clearExpired,
    })
    return () => {
      active = false
      window.removeEventListener(operationReceiptEvent, acceptReceipt)
      unsubscribe()
      announceOperationChannel(false)
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
            {operation.state === 'SUCCEEDED' && operation.resultReference?.type === 'store-export' && <>
              <button type="button" className="mt-2 rounded border border-white/30 px-3 py-1 text-sm"
                disabled={downloading === operation.resultReference.id}
                onClick={() => { void download(operation.resultReference!.id) }}>
                {downloading === operation.resultReference.id ? 'Preparando descarga…' : 'Descargar ZIP verificado'}
              </button>
              {downloadProblem[operation.resultReference.id] &&
                <p role="alert" className="mt-2 text-sm">{downloadProblem[operation.resultReference.id]}</p>}
            </>}
          </article>
        ))}
      </div>
    </section>
  )
}
