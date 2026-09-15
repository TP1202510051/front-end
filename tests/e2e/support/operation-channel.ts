export interface OperationSignal {
  operationId: string
  version: number
}

export interface OperationChannelHandlers {
  onConnected: () => void
  onSignal: (signal: OperationSignal) => void
  onDisconnected: () => void
  onAuthorizationExpired: () => void
}

/**
 * Las pruebas despachan senales sinteticas desde fuera; la aplicacion se monta despues de leer su
 * configuracion, asi que anuncian aqui cuando hay alguien escuchando y las pruebas esperan a eso.
 */
export const CHANNEL_OPEN_ATTRIBUTE = 'data-operation-channel'

export function subscribeToOperationChannel(handlers: OperationChannelHandlers): () => void {
  let active = true
  document.documentElement.setAttribute(CHANNEL_OPEN_ATTRIBUTE, 'open')
  const signal = (event: Event) => {
    if (active) handlers.onSignal((event as CustomEvent<OperationSignal>).detail)
  }
  const reconnect = () => { if (active) handlers.onConnected() }
  const expired = () => { if (active) handlers.onAuthorizationExpired() }
  const disconnect = () => { if (active) handlers.onDisconnected() }
  window.addEventListener('abstractify:e2e-operation-signal', signal)
  window.addEventListener('abstractify:e2e-operation-reconnect', reconnect)
  window.addEventListener('abstractify:e2e-operation-expired', expired)
  window.addEventListener('abstractify:e2e-operation-disconnect', disconnect)
  queueMicrotask(() => { if (active) handlers.onConnected() })
  return () => {
    active = false
    document.documentElement.removeAttribute(CHANNEL_OPEN_ATTRIBUTE)
    window.removeEventListener('abstractify:e2e-operation-signal', signal)
    window.removeEventListener('abstractify:e2e-operation-reconnect', reconnect)
    window.removeEventListener('abstractify:e2e-operation-expired', expired)
    window.removeEventListener('abstractify:e2e-operation-disconnect', disconnect)
  }
}
