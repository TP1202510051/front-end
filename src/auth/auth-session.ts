import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/firebase'

export type AuthSessionObserver = (user: User | null) => void | Promise<void>

export function observeAuthSession(observer: AuthSessionObserver) {
  return onAuthStateChanged(auth, observer)
}

export async function getAccessToken(): Promise<string | null> {
  return auth.currentUser ? auth.currentUser.getIdToken() : null
}
