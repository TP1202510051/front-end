import type { User } from 'firebase/auth'

type AuthSessionObserver = (user: User | null) => void | Promise<void>

const authenticatedEntrepreneur = {
  displayName: 'Empresaria Demo',
  email: 'empresaria@example.test',
  getIdToken: async () => globalThis.localStorage?.getItem('abstractify-e2e-token') ?? 'deterministic-e2e-token',
  photoURL: null,
  uid: 'entrepreneur-e2e',
} as User

export function observeAuthSession(observer: AuthSessionObserver) {
  void observer(authenticatedEntrepreneur)
  return () => undefined
}

export async function getAccessToken(): Promise<string> {
  return authenticatedEntrepreneur.getIdToken()
}
