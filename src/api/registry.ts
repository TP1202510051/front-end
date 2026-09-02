import { platform } from './client'
import { publicProblem, safeProblem } from './problems'
import { isRegistryPublication, type RegistryPublication } from '@/registry/publication'

export const REGISTRY_VERSION = 'textile-store@1.0.0'
export const TEMPLATE_VERSION = 'verified-textile-start@1.0.0'

export async function getRegistryPublication(): Promise<RegistryPublication> {
  try {
    const { data } = await platform.GET(
      '/api/v1/component-registries/{registryVersion}/templates/{templateVersion}',
      { params: { path: { registryVersion: REGISTRY_VERSION, templateVersion: TEMPLATE_VERSION } },
        signal: AbortSignal.timeout(15_000) },
    )
    if (!isRegistryPublication(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}
