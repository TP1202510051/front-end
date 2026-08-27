import createClient from 'openapi-fetch'
import { getAccessToken } from '@/auth/auth-session'
import { publicProblem, safeProblem } from './problems'
import type { paths } from './schema'

// Existing environments may end in /api for the legacy client. v1 paths are absolute contract paths.
const baseUrl = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/api\/?$/, '').replace(/\/$/, '')
export const platform = createClient<paths>({ baseUrl })
platform.use({
  async onRequest({ request }) {
    const token = await getAccessToken()
    if (!token) throw publicProblem(null, 401)
    request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
  async onResponse({ response }) {
    if (!response.ok) {
      const body: unknown = await response.clone().json().catch(() => null)
      throw publicProblem(body, response.status)
    }
    return response
  },
  onError({ error }) { throw safeProblem(error) },
})
