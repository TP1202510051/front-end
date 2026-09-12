import type { AsyncOperation } from '@/api/operations'

/**
 * Lo que el monitor de operaciones cuenta al resto de la pantalla.
 *
 * <p>Hay una sola suscripcion al canal de operaciones, la del monitor, y una sola lectura REST por
 * senal nueva. Un panel que quiera seguir su operacion no abre otra conexion ni vuelve a preguntar:
 * escucha aqui la representacion durable que el monitor ya leyo, y si esta en directo el canal.
 * Lo que viaja es lo que REST devolvio -nunca lo que llego por el canal, que es solo identidad y
 * version-, asi que un panel no puede creerse una senal que el servidor no confirmo.
 */
export const operationStatusEvent = 'abstractify:operation-status'
export const operationChannelEvent = 'abstractify:operation-channel'

export interface OperationChannelNotice {
  live: boolean
}

let channelLive = false

/** Si el canal esta en directo ahora mismo, para quien llega despues del aviso. */
export function isOperationChannelLive(): boolean {
  return channelLive
}

export function announceOperationChannel(live: boolean) {
  channelLive = live
  window.dispatchEvent(new CustomEvent<OperationChannelNotice>(operationChannelEvent, { detail: { live } }))
}

export function announceOperationStatus(operation: AsyncOperation) {
  window.dispatchEvent(new CustomEvent<AsyncOperation>(operationStatusEvent, { detail: operation }))
}

export interface OperationFeedHandlers {
  onStatus: (operation: AsyncOperation) => void
  onChannel: (live: boolean) => void
}

export function followOperationFeed(handlers: OperationFeedHandlers): () => void {
  const status = (event: Event) => handlers.onStatus((event as CustomEvent<AsyncOperation>).detail)
  const channel = (event: Event) => handlers.onChannel((event as CustomEvent<OperationChannelNotice>).detail.live)
  window.addEventListener(operationStatusEvent, status)
  window.addEventListener(operationChannelEvent, channel)
  return () => {
    window.removeEventListener(operationStatusEvent, status)
    window.removeEventListener(operationChannelEvent, channel)
  }
}
