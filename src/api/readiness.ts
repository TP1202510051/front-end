import { platform } from './client'
import { publicProblem, safeProblem } from './problems'
import type { components } from './schema'

export type RevisionReadiness = components['schemas']['RevisionReadinessView']
export type ValidationLevel = components['schemas']['ValidationLevelView']
export type MissingRequirement = components['schemas']['MissingRequirementView']

/**
 * Los codigos que esta version sabe explicar, y las areas a las que sabe llevar.
 *
 * <p>Se enumeran en vez de aceptar cualquier cadena porque cada uno se convierte en una frase y en
 * un enlace. Uno que no estuviera se quedaria sin frase y sin sitio a donde ir, que es exactamente
 * la forma de ensenar un requisito que nadie puede resolver.
 */
const CODES = ['DOCUMENT_SCHEMA_UNSUPPORTED', 'PUBLICATION_UNAVAILABLE', 'COMPOSITION_INVALID',
  'ASSET_MISSING', 'BINDING_TARGET_MISSING', 'BINDING_UNCHOSEN']
const AREAS = ['PROJECT', 'PAGES', 'THEME', 'ASSETS', 'CATALOG']

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isRequirement(value: unknown): value is MissingRequirement {
  if (!record(value)) return false
  return typeof value.code === 'string' && CODES.includes(value.code)
    && typeof value.area === 'string' && AREAS.includes(value.area)
    && (value.pageId == null || typeof value.pageId === 'string')
    && (value.componentId == null || typeof value.componentId === 'string')
    // Un componente sin su pagina no se puede abrir: dos paginas distintas pueden tener nodos que
    // se llamen igual, asi que el enlace llevaria a cualquiera de los dos.
    && (value.componentId == null || typeof value.pageId === 'string')
}

/**
 * Un nivel solo vale si lo que dice de si mismo concuerda con lo que le falta.
 *
 * <p>Es la comprobacion que sostiene la puerta de exportacion. Sin ella bastaria una respuesta que
 * dijera {@code reached: true} llevando requisitos para que la SPA abriera el control, y quien
 * pinta no tiene forma de saber cual de los dos campos es el que manda.
 */
function isLevel(value: unknown): value is ValidationLevel {
  if (!record(value)) return false
  if (typeof value.reached !== 'boolean' || !Array.isArray(value.missing)) return false
  if (!value.missing.every(isRequirement)) return false
  return value.reached === (value.missing.length === 0)
}

function isReadiness(value: unknown): value is RevisionReadiness {
  if (!record(value)) return false
  return typeof value.revisionId === 'string' && /^[1-9][0-9]*$/.test(value.revisionId)
    && typeof value.revisionNumber === 'number' && Number.isSafeInteger(value.revisionNumber)
    && value.revisionNumber >= 1
    && typeof value.hash === 'string' && /^[0-9a-f]{64}$/.test(value.hash)
    && typeof value.schemaVersion === 'string' && typeof value.registryVersion === 'string'
    && typeof value.templateVersion === 'string'
    && isLevel(value.editable) && isLevel(value.previewable) && isLevel(value.exportable)
}

/**
 * Que puede una revision aceptada exacta.
 *
 * <p>Se pide por numero de revision y no por proyecto porque es de la revision: preguntarlo del
 * proyecto contestaria sobre la cabecera del momento, y quien esta decidiendo si exportar mira una
 * revision concreta que no tiene por que ser esa.
 *
 * <p>Una respuesta que no cumple el contrato se rechaza entera en vez de leer lo que se entienda.
 * Es la direccion segura: sin informe la puerta de exportacion se queda cerrada, mientras que
 * quedarse con la mitad podria abrirla sobre requisitos que esta version no supo leer.
 */
export async function getRevisionReadiness(id: string, revisionNumber: string): Promise<RevisionReadiness> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{id}/revisions/{number}/readiness', {
      params: { path: { id, number: revisionNumber } }, signal: AbortSignal.timeout(15_000),
    })
    if (!isReadiness(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}
