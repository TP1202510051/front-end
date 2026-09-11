import { platform } from './client'
import { publicProblem, safeProblem } from './problems'
import type { components } from './schema'
import { isOffsetTimestamp, isUuid } from './validators'

export type StoreExportReceipt = components['schemas']['StoreExportReceiptView']
export type StoreExportDownload = components['schemas']['StoreExportDownloadView']
export interface StoreExportArchive { blob: Blob; filename: string }

const identifier = /^[1-9][0-9]{0,18}$/
const tokenPattern = /^[A-Za-z0-9_-]{43}$/
// El nombre lo pone el servidor, pero solo con la forma que el servidor promete: un nombre libre
// acabaria en el disco de la empresaria tal cual llego.
const attachmentPattern = /^attachment; filename="(generated-store-r[1-9][0-9]{0,18}\.zip)"$/

export async function requestStoreExport(projectId: string, revisionNumber: number,
  idempotencyKey: string): Promise<StoreExportReceipt> {
  try {
    if (!identifier.test(projectId) || !Number.isSafeInteger(revisionNumber) || revisionNumber < 1) {
      throw publicProblem({ code: 'BAD_REQUEST' })
    }
    const { data } = await platform.POST('/api/v1/projects/{projectId}/revisions/{revisionNumber}/exports', {
      params: { path: { projectId, revisionNumber: String(revisionNumber) } },
      body: { idempotencyKey }, signal: AbortSignal.timeout(15_000),
    })
    if (!data || !isUuid(data.operationId) || !isUuid(data.exportId)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/**
 * La referencia solo vale si apunta a donde este mismo cliente iria por su cuenta.
 *
 * <p>Se acepta unicamente la ruta de archivo de esa misma exportacion, en este mismo origen y con un
 * token de la forma prometida. Cualquier otra cosa -otro dominio, otra exportacion, un token raro-
 * no es una referencia a seguir, por muy bien formada que venga.
 */
function referenceToken(exportId: string, reference: string): string | null {
  const url = new URL(reference, window.location.origin)
  const token = url.searchParams.get('token') ?? ''
  const trusted = isUuid(exportId) && url.origin === window.location.origin
    && url.pathname === `/api/v1/store-exports/${exportId}/archive` && tokenPattern.test(token)
  return trusted ? token : null
}

export async function issueStoreExportDownload(exportId: string): Promise<StoreExportDownload> {
  try {
    if (!isUuid(exportId)) throw publicProblem({ code: 'BAD_REQUEST' })
    const { data } = await platform.POST('/api/v1/store-exports/{exportId}/download-reference', {
      params: { path: { exportId } }, signal: AbortSignal.timeout(15_000),
    })
    if (!data || typeof data.url !== 'string' || !isOffsetTimestamp(data.expiresAt)
      || referenceToken(exportId, data.url) === null) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function downloadStoreExport(exportId: string, reference: StoreExportDownload): Promise<StoreExportArchive> {
  try {
    const token = referenceToken(exportId, reference.url)
    if (token === null) throw publicProblem({ code: 'BAD_REQUEST' })
    const { data, response } = await platform.GET('/api/v1/store-exports/{exportId}/archive', {
      params: { path: { exportId }, query: { token } }, parseAs: 'blob', signal: AbortSignal.timeout(120_000),
    })
    const filename = attachmentPattern.exec(response.headers.get('content-disposition') ?? '')?.[1]
    if (!(data instanceof Blob) || data.size === 0 || !filename) throw publicProblem(null)
    return { blob: data, filename }
  } catch (error) { throw safeProblem(error) }
}
