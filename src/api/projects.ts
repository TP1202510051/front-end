import { platform } from './client'
import { publicProblem, safeProblem } from './problems'
import type { components } from './schema'

export type ProjectSummary = components['schemas']['ProjectSummary']
export type ProjectPage = components['schemas']['ProjectPage']

function isProject(value: unknown): value is ProjectSummary {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && /^[1-9][0-9]*$/.test(item.id)
    && typeof item.name === 'string' && typeof item.createdAt === 'string'
    && (item.imageUrl == null || typeof item.imageUrl === 'string')
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

export async function createStoreProject(name: string): Promise<ProjectSummary> {
  try {
    const { data } = await platform.POST('/api/v1/projects', { body: { name }, signal: AbortSignal.timeout(15_000) })
    if (!isProject(data)) throw publicProblem(null)
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
