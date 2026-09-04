import { platform } from './client'
import { publicProblem, safeProblem } from './problems'
import { isRegistryPublication, type RegistryPublication } from '@/registry/publication'

export const REGISTRY_VERSION = 'textile-store@1.1.0'
export const TEMPLATE_VERSION = 'verified-textile-start@1.1.0'

/** Las publicaciones que el registro sirve. La ultima es con la que nacen los proyectos nuevos. */
export const PUBLISHED = [
  { registryVersion: 'textile-store@1.0.0', templateVersion: 'verified-textile-start@1.0.0' },
  { registryVersion: 'textile-store@1.1.0', templateVersion: 'verified-textile-start@1.1.0' },
] as const

export function isPublished(registryVersion: unknown, templateVersion: unknown): boolean {
  return PUBLISHED.some(published => published.registryVersion === registryVersion
    && published.templateVersion === templateVersion)
}


export async function getRegistryPublication(
  registryVersion = REGISTRY_VERSION,
  templateVersion = TEMPLATE_VERSION,
): Promise<RegistryPublication> {
  try {
    const { data } = await platform.GET(
      '/api/v1/component-registries/{registryVersion}/templates/{templateVersion}',
      { params: { path: { registryVersion, templateVersion } },
        signal: AbortSignal.timeout(15_000) },
    )
    if (!isRegistryPublication(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}
