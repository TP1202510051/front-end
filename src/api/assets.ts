import { platform } from './client'
import { getAccessToken } from '@/auth/auth-session'
import { publicProblem, safeProblem } from './problems'
import type { components } from './schema'

export type ProjectAsset = components['schemas']['ProjectAssetView']
export type AssetDerivative = components['schemas']['AssetDerivativeView']

function isDerivative(value: unknown): value is AssetDerivative {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.width === 'number' && typeof item.height === 'number'
    && typeof item.digest === 'string' && typeof item.bytes === 'number'
}

function isAsset(value: unknown): value is ProjectAsset {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && /^[a-f0-9]{64}$/.test(item.id)
    && typeof item.contentType === 'string' && typeof item.width === 'number'
    && typeof item.height === 'number' && typeof item.bytes === 'number'
    && typeof item.alternativeText === 'string' && typeof item.digest === 'string'
    && typeof item.uploadedAt === 'string'
    && Array.isArray(item.derivatives) && item.derivatives.every(isDerivative)
}

export async function listAssets(projectId: string): Promise<ProjectAsset[]> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{projectId}/assets', {
      params: { path: { projectId } }, signal: AbortSignal.timeout(15_000),
    })
    if (!Array.isArray(data) || !data.every(isAsset)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/**
 * Sube un fichero, contando cuanto lleva subido.
 *
 * <p>Va por XMLHttpRequest y no por fetch porque fetch no cuenta lo que sube: solo sabe decir que
 * sigue en marcha. Una imagen de varios megas en una conexion lenta necesita algo mas que eso, y la
 * respuesta se juzga igual que cualquier otra -lo que no tiene la forma del contrato no se pinta-.
 */
export async function uploadAsset(
  projectId: string, file: File, alternativeText: string,
  onProgress?: (fraction: number) => void,
): Promise<ProjectAsset> {
  const token = await getAccessToken()
  if (!token) throw publicProblem(null, 401)
  const body = new FormData()
  body.append('file', file)
  body.append('alternativeText', alternativeText)

  const data = await new Promise<unknown>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', `${base()}/api/v1/projects/${projectId}/assets`)
    request.setRequestHeader('Authorization', `Bearer ${token}`)
    request.timeout = 30_000
    request.upload.addEventListener('progress', event => {
      if (event.lengthComputable && onProgress) onProgress(event.loaded / event.total)
    })
    const parsed = () => { try { return JSON.parse(request.responseText) as unknown } catch { return null } }
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) resolve(parsed())
      else reject(publicProblem(parsed(), request.status))
    })
    request.addEventListener('error', () => reject(safeProblem(new Error('network'))))
    request.addEventListener('timeout', () => reject(safeProblem(new Error('timeout'))))
    request.send(body)
  })
  if (!isAsset(data)) throw publicProblem(null)
  return data
}

export async function describeAsset(
  projectId: string, assetId: string, alternativeText: string,
): Promise<ProjectAsset> {
  try {
    const { data } = await platform.PATCH('/api/v1/projects/{projectId}/assets/{assetId}', {
      params: { path: { projectId, assetId } }, body: { alternativeText },
      signal: AbortSignal.timeout(15_000),
    })
    if (!isAsset(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function removeAsset(projectId: string, assetId: string): Promise<void> {
  try {
    await platform.DELETE('/api/v1/projects/{projectId}/assets/{assetId}', {
      params: { path: { projectId, assetId } }, signal: AbortSignal.timeout(15_000),
    })
  } catch (error) { throw safeProblem(error) }
}

/**
 * Los bytes de un asset, como URL local que el navegador puede pintar.
 *
 * <p>La ruta pide autorizacion, y un {@code <img src>} no manda cabeceras: por eso se traen aqui y se
 * envuelven en una URL de objeto. Lo que se pinta nunca es una direccion del servidor, de modo que
 * una imagen ajena no pueda aparecer por haber acertado un identificador.
 *
 * <p>Quien la pide se encarga de soltarla: una URL de objeto viva es memoria retenida.
 */
export async function readAssetObjectUrl(
  projectId: string, assetId: string, width?: number,
): Promise<string> {
  const token = await getAccessToken()
  if (!token) throw publicProblem(null, 401)
  const query = width === undefined ? '' : `?width=${width}`
  const response = await fetch(
    `${base()}/api/v1/projects/${projectId}/assets/${assetId}/content${query}`,
    { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20_000) },
  ).catch(error => { throw safeProblem(error) })
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    throw publicProblem(body, response.status)
  }
  const blob = await response.blob()
  // Solo imagenes: lo que el servidor diga que es otra cosa no se pinta, aunque haya llegado.
  if (!blob.type.startsWith('image/')) throw publicProblem(null)
  return URL.createObjectURL(blob)
}

function base(): string {
  return (import.meta.env.VITE_API_BASE_URL || window.location.origin)
    .replace(/\/api\/?$/, '').replace(/\/$/, '')
}
