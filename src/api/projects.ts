import { platform } from './client'
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

function slotsRecord(value: unknown): value is Record<string, string[]> {
  return record(value) && Object.values(value).every(item => Array.isArray(item)
    && item.every(child => typeof child === 'string'))
}

function isStoreProject(value: unknown): value is StoreProject {
  if (!record(value)) return false
  const item = value
  if (!isProject(value) || !record(item.acceptedRevision)) return false
  const revision = item.acceptedRevision
  if (typeof revision.id !== 'string' || !/^[1-9][0-9]*$/.test(revision.id)
    || typeof revision.number !== 'number' || !Number.isSafeInteger(revision.number) || revision.number < 1
    || revision.registryVersion !== 'textile-store@1.0.0'
    || revision.templateVersion !== 'verified-textile-start@1.0.0'
    || typeof revision.acceptedAt !== 'string' || typeof revision.hash !== 'string'
    || !/^[0-9a-f]{64}$/.test(revision.hash) || !record(revision.document)) return false
  const document = revision.document
  return document.schemaVersion === 'project-document@1.0.0'
    && document.registryVersion === revision.registryVersion
    && document.templateVersion === revision.templateVersion
    && Array.isArray(document.pages) && document.pages.every((page: unknown) => record(page)
      && typeof page.id === 'string' && typeof page.path === 'string'
      && typeof page.rootComponentId === 'string' && Array.isArray(page.components)
      && page.components.every((component: unknown) => record(component) && typeof component.id === 'string'
        && typeof component.type === 'string' && stringRecord(component.properties)
        && stringRecord(component.bindings) && slotsRecord(component.slots)))
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
