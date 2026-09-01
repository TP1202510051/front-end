import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getAccessToken } from '@/auth/auth-session'
import { isUuid } from '@/api/validators'

export interface OperationSignal {
  operationId: string
  version: number
}

export interface OperationChannelHandlers {
  onConnected: () => void
  onSignal: (signal: OperationSignal) => void
  onAuthorizationExpired: () => void
}

function parseSignal(message: IMessage): OperationSignal | null {
  try {
    const value = JSON.parse(message.body) as Record<string, unknown>
    if (!isUuid(value.operationId) || typeof value.version !== 'number'
      || !Number.isSafeInteger(value.version) || value.version < 1) return null
    return { operationId: value.operationId, version: value.version }
  } catch {
    return null
  }
}

/** Browser transport exposes subscription only; business commands have no WebSocket interface. */
export function subscribeToOperationChannel(handlers: OperationChannelHandlers): () => void {
  const client = new Client({
    webSocketFactory: () => new SockJS(import.meta.env.VITE_API_WS_URL) as WebSocket,
    reconnectDelay: 5_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
  })
  client.beforeConnect = async () => {
    const token = await getAccessToken()
    if (!token) {
      handlers.onAuthorizationExpired()
      throw new Error('Realtime identity is unavailable')
    }
    client.connectHeaders = { Authorization: `Bearer ${token}` }
  }
  client.onConnect = () => {
    client.subscribe('/user/queue/operations', message => {
      const signal = parseSignal(message)
      if (signal) handlers.onSignal(signal)
    })
    handlers.onConnected()
  }
  client.onStompError = () => handlers.onAuthorizationExpired()
  client.activate()
  return () => { void client.deactivate() }
}
