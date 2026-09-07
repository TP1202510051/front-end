import { platform } from './client'
import { isPublished } from './registry'
import { publicProblem, safeProblem } from './problems'
import type { components } from './schema'

export type ProjectSummary = components['schemas']['ProjectSummary']
export type ProjectPage = components['schemas']['ProjectPage']
export type StoreProject = components['schemas']['StoreProjectView']

function isProject(value: unknown): value is ProjectSummary {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && /^[1-9][0-9]*$/.test(item.id)
    && typeof item.name === 'string' && typeof item.createdAt === 'string'
    && (item.imageUrl == null || typeof item.imageUrl === 'string')
}

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringRecord(value: unknown): value is Record<string, string> {
  return record(value) && Object.values(value).every(item => typeof item === 'string')
}

/**
 * Una binding ya no es texto: es una eleccion con forma.
 *
 * <p>Se comprueba aqui por lo mismo que todo lo demas -lo que no tiene la forma que el contrato
 * promete no se pinta-, y ademas porque el Canvas la manda de vuelta al servidor: dejar pasar una
 * forma que no reconoce seria devolverle algo que no puede resolver.
 */
function bindingRecord(value: unknown): boolean {
  return record(value) && Object.values(value).every(item => record(item)
    && typeof item.target === 'string' && typeof item.limit === 'number'
    && typeof item.order === 'string'
    && (item.reference === undefined || item.reference === null || typeof item.reference === 'string'))
}

function slotsRecord(value: unknown): value is Record<string, string[]> {
  return record(value) && Object.values(value).every(item => Array.isArray(item)
    && item.every(child => typeof child === 'string'))
}

const DOCUMENT_SCHEMAS = ['project-document@1.0.0', 'project-document@1.1.0',
  'project-document@1.2.0', 'project-document@1.3.0', 'project-document@1.4.0']
const BLOCK_SCHEMAS = ['project-document@1.2.0', 'project-document@1.3.0', 'project-document@1.4.0']
/** Desde que el Theme existe, el esquema que lo estrena y los siguientes lo traen. */
const THEME_SCHEMAS = ['project-document@1.3.0', 'project-document@1.4.0']

/**
 * El Theme del documento, cuando el esquema dice que tiene que traerlo.
 *
 * <p>Misma regla que con los bloques: el esquema que lo estrena lo declara obligatorio, y uno
 * anterior nace sin el y se lee sin ninguno. Las reglas llegan ya acotadas desde el servidor, asi
 * que aqui solo se comprueba la forma; volver a decidir cual es segura seria abrir un segundo
 * criterio, y el que deja pasar de mas siempre gana.
 */
function themeValid(document: Record<string, unknown>): boolean {
  const theme = document.theme
  if (theme == null) return !THEME_SCHEMAS.includes(document.schemaVersion as string)
  if (!record(theme) || !stringRecord(theme.tokens) || !Array.isArray(theme.rules)) return false
  return theme.rules.every(rule => record(rule)
    && typeof rule.selector === 'string' && stringRecord(rule.declarations)
    && (rule.media === undefined || rule.media === null || typeof rule.media === 'string'))
}

/**
 * Los bloques del documento, cuando el esquema dice que tiene que traerlos.
 *
 * <p>El esquema que los estrenó los declara obligatorios, así que una respuesta que dice ser de ese
 * esquema y no los trae no es compatible y se rechaza. Los anteriores nacieron sin ellos y se leen
 * sin ninguno, que es exactamente lo que tenían: exigírselos dejaría sin abrir las revisiones que el
 * historial enseña. Uno anterior que sí los trae -porque ganó bloques después- también vale.
 */
function blockMetadataValid(document: Record<string, unknown>): boolean {
  const blocks = document.blocks
  const instances = document.blockInstances
  if (blocks == null && instances == null) return !BLOCK_SCHEMAS.includes(document.schemaVersion as string)
  return Array.isArray(blocks) && blocks.every(block => record(block)
    && typeof block.id === 'string' && typeof block.name === 'string'
    && typeof block.rootComponentId === 'string' && Array.isArray(block.components)
    && block.components.every(node => record(node) && typeof node.id === 'string'
      && typeof node.type === 'string' && stringRecord(node.properties)
      && bindingRecord(node.bindings) && slotsRecord(node.slots)))
    && Array.isArray(instances) && instances.every(instance => record(instance)
      && typeof instance.id === 'string' && typeof instance.blockId === 'string'
      && typeof instance.pageId === 'string' && typeof instance.rootComponentId === 'string'
      && typeof instance.detached === 'boolean' && stringRecord(instance.componentIds))
}

function isStoreProject(value: unknown): value is StoreProject {
  if (!record(value)) return false
  const item = value
  if (!isProject(value) || !record(item.acceptedRevision)) return false
  const revision = item.acceptedRevision
  if (typeof revision.id !== 'string' || !/^[1-9][0-9]*$/.test(revision.id)
    || typeof revision.number !== 'number' || !Number.isSafeInteger(revision.number) || revision.number < 1
    || !isPublished(revision.registryVersion, revision.templateVersion)
    || typeof revision.acceptedAt !== 'string' || typeof revision.hash !== 'string'
    || !/^[0-9a-f]{64}$/.test(revision.hash) || typeof revision.origin !== 'string'
    || !['VERIFIED_TEMPLATE', 'MANUAL_BATCH', 'ASSISTANT_PROPOSAL', 'IMPORT', 'MIGRATION']
      .includes(revision.origin)
    || !record(revision.document)) return false
  const document = revision.document
  // Las formas publicadas del documento. Rechazar una anterior dejaria sin abrir las revisiones
  // que se aceptaron con ella, que son justo las que el historial ensena.
  return DOCUMENT_SCHEMAS.includes(document.schemaVersion as string) && blockMetadataValid(document)
    && themeValid(document)
    && document.registryVersion === revision.registryVersion
    && document.templateVersion === revision.templateVersion
    && Array.isArray(document.pages) && document.pages.every((page: unknown) => record(page)
      && typeof page.id === 'string' && typeof page.path === 'string'
      && typeof page.rootComponentId === 'string' && Array.isArray(page.components)
      && page.components.every((component: unknown) => record(component) && typeof component.id === 'string'
        && typeof component.type === 'string' && stringRecord(component.properties)
        && bindingRecord(component.bindings) && slotsRecord(component.slots)))
}

export async function listProjects(after?: string): Promise<ProjectPage> {
  try {
    const { data } = await platform.GET('/api/v1/projects', { params: { query: { after, limit: 20 } }, signal: AbortSignal.timeout(15_000) })
    if (!data || !Array.isArray(data.items) || !data.items.every(isProject)
      || (data.nextCursor != null && (typeof data.nextCursor !== 'string'
        || !/^[1-9][0-9]*$/.test(data.nextCursor) || data.nextCursor === after || data.items.length === 0))) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function createStoreProject(name: string): Promise<StoreProject> {
  try {
    const { data } = await platform.POST('/api/v1/projects', { body: { name }, signal: AbortSignal.timeout(15_000) })
    if (!isStoreProject(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function getStoreProject(id: string): Promise<StoreProject> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{id}', {
      params: { path: { id } }, signal: AbortSignal.timeout(15_000),
    })
    if (!isStoreProject(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export type OperationBatch = components['schemas']['OperationBatchInput']
export type RevisionHistory = components['schemas']['RevisionHistoryView']
export type RevisionSummary = components['schemas']['RevisionSummaryView']

function isRevisionSummary(value: unknown): value is RevisionSummary {
  if (!record(value)) return false
  return typeof value.id === 'string' && /^[1-9][0-9]*$/.test(value.id)
    && typeof value.number === 'number' && Number.isSafeInteger(value.number) && value.number >= 1
    && (value.parentId == null || typeof value.parentId === 'string')
    && typeof value.origin === 'string'
    && ['VERIFIED_TEMPLATE', 'MANUAL_BATCH', 'ASSISTANT_PROPOSAL', 'IMPORT', 'MIGRATION']
      .includes(value.origin)
    && typeof value.actorId === 'string'
    && isPublished(value.registryVersion, value.templateVersion)
    && typeof value.hash === 'string' && /^[0-9a-f]{64}$/.test(value.hash)
    && typeof value.acceptedAt === 'string'
}

/**
 * Una pagina del historial, de la mas reciente hacia atras.
 *
 * <p>`before` es el numero por debajo del cual seguir leyendo. Se rechaza un cursor que no avanza,
 * porque un cliente que lo repita se quedaria pidiendo la misma pagina para siempre.
 */
export async function listRevisions(id: string, before?: string): Promise<RevisionHistory> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{id}/revisions', {
      params: { path: { id }, query: { before, limit: 20 } }, signal: AbortSignal.timeout(15_000),
    })
    if (!data || !Array.isArray(data.items) || !data.items.every(isRevisionSummary)
      || (data.nextCursor != null && (typeof data.nextCursor !== 'string'
        || !/^[1-9][0-9]*$/.test(data.nextCursor) || data.nextCursor === before
        || data.items.length === 0))) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/** Una revision concreta por su numero, con su documento completo. */
export async function getRevision(id: string, number: string): Promise<StoreProject> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{id}/revisions/{number}', {
      params: { path: { id, number } }, signal: AbortSignal.timeout(15_000),
    })
    if (!isStoreProject(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/**
 * Lleva una intención manual completa y espera la revisión que produjo.
 *
 * <p>La respuesta se valida igual que cualquier otra: una revisión que no cumple el contrato no
 * puede pasar por aceptada, porque el Canvas la tomaría por verdad del servidor.
 */
export async function acceptRevision(id: string, batch: OperationBatch): Promise<StoreProject> {
  try {
    const { data } = await platform.POST('/api/v1/projects/{id}/revisions', {
      params: { path: { id } }, body: batch, signal: AbortSignal.timeout(15_000),
    })
    if (!isStoreProject(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function renameStoreProject(id: string, name: string): Promise<void> {
  try {
    const { data } = await platform.PATCH('/api/v1/projects/{id}', { params: { path: { id } }, body: { name }, signal: AbortSignal.timeout(15_000) })
    if (!isProject(data)) throw publicProblem(null)
  } catch (error) { throw safeProblem(error) }
}

export async function deleteStoreProject(id: string): Promise<void> {
  try {
    await platform.DELETE('/api/v1/projects/{id}', { params: { path: { id } }, signal: AbortSignal.timeout(15_000) })
  } catch (error) { throw safeProblem(error) }
}
