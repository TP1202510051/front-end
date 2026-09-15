import { expect, type Page } from '@playwright/test'

/**
 * Despacha un evento sintetico del canal de operaciones cuando la aplicacion ya escucha: se monta
 * despues de leer runtime-config.json, y un evento lanzado nada mas cargar la pagina se perderia.
 */
export async function dispatchChannelEvent(page: Page, type: string, detail?: unknown) {
  await page.locator('html[data-operation-channel="open"]').waitFor({ state: 'attached' })
  await page.evaluate(({ eventType, eventDetail }) => {
    window.dispatchEvent(eventDetail === undefined ? new Event(eventType) : new CustomEvent(eventType, { detail: eventDetail }))
  }, { eventType: type, eventDetail: detail })
}

/**
 * Despacha cuando ya no hay nadie escuchando -tras una expiracion de identidad- y lo afirma: lo
 * que se prueba es que la senal no tiene a quien llegar.
 */
export async function dispatchIntoClosedChannel(page: Page, type: string, detail?: unknown) {
  await expect(page.locator('html[data-operation-channel="open"]')).toHaveCount(0)
  await page.evaluate(({ eventType, eventDetail }) => {
    window.dispatchEvent(eventDetail === undefined ? new Event(eventType) : new CustomEvent(eventType, { detail: eventDetail }))
  }, { eventType: type, eventDetail: detail })
}
