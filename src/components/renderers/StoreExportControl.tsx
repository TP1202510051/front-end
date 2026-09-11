import { useRef, useState } from 'react'
import { requestStoreExport } from '@/api/store-exports'
import { publicProblem, safeProblem } from '@/api/problems'
import { intentionKey } from '@/canvas/intention'
import { useAuth } from '@/contexts/AuthContext'
import { registerOperationReceipt } from '@/realtime/known-operations'

/**
 * Pide la generacion de la revision exacta que hay en pantalla y se queda con su recibo.
 *
 * <p>La revision la elige el panel, no este control: llega como numero exacto y viaja tal cual,
 * para que lo que se exporta sea lo que la empresaria estaba mirando y no lo ultimo que se acepto
 * mientras decidia.
 *
 * <p>La clave de idempotencia es una por intencion. Se acuna la primera vez y se conserva mientras
 * la peticion no haya llegado: un reintento tras un corte reproduce la misma exportacion en lugar
 * de encargar una segunda. Solo cuando el servidor devuelve el recibo se olvida, porque volver a
 * pulsar entonces si es querer otra.
 */
export function StoreExportControl({ projectId, revisionNumber }: {
  projectId: string
  revisionNumber: number
}) {
  const { firebaseUser } = useAuth()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const intention = useRef<string | null>(null)

  const request = async () => {
    if (!firebaseUser?.uid || pending) return
    setPending(true)
    setMessage(null)
    try {
      intention.current ??= intentionKey()
      const receipt = await requestStoreExport(projectId, revisionNumber, intention.current)
      if (!registerOperationReceipt(firebaseUser.uid, receipt.operationId)) throw publicProblem(null)
      intention.current = null
      setMessage('La exportación quedó en marcha. Puedes salir de esta revisión mientras se completa.')
    } catch (error) {
      setMessage(safeProblem(error).message)
    } finally { setPending(false) }
  }

  return <div className="space-y-2">
    <button type="button" disabled={pending || !firebaseUser}
      className="rounded border border-slate-400 px-3 py-1 disabled:opacity-50"
      onClick={() => { void request() }}>
      {pending ? 'Solicitando…' : `Generar tienda desde revisión ${revisionNumber}`}
    </button>
    {message && <p role="status">{message}</p>}
  </div>
}
