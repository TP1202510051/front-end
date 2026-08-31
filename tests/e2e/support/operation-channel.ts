export interface OperationSignal {
  operationId: string
  version: number
}

export interface OperationChannelHandlers {
  onConnected: () => void
  onSignal: (signal: OperationSignal) => void
  onAuthorizationExpired: () => void
}

export function subscribeToOperationChannel(handlers: OperationChannelHandlers): () => void {
  let active = true
  const signal = (event: Event) => {
    if (active) handlers.onSignal((event as CustomEvent<OperationSignal>).detail)
  }
  const reconnect = () => { if (active) handlers.onConnected() }
  const expired = () => { if (active) handlers.onAuthorizationExpired() }
  window.addEventListener('abstractify:e2e-operation-signal', signal)
  window.addEventListener('abstractify:e2e-operation-reconnect', reconnect)
  window.addEventListener('abstractify:e2e-operation-expired', expired)
  queueMicrotask(() => { if (active) handlers.onConnected() })
  return () => {
    active = false
    window.removeEventListener('abstractify:e2e-operation-signal', signal)
    window.removeEventListener('abstractify:e2e-operation-reconnect', reconnect)
    window.removeEventListener('abstractify:e2e-operation-expired', expired)
  }
}
