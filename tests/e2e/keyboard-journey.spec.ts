import { expect, test, type Page } from '@playwright/test'
import { mockOwnStoreProject } from './support/store-project'

/**
 * El recorrido critico sin raton: crear el proyecto y guardar una edicion solo con Tab, Enter y
 * el teclado. Es la parte automatizable de la revision manual de accesibilidad (release-gates §9);
 * foco visible, contraste y anuncios siguen en la lista de comprobacion manual.
 */

/**
 * Tabula hasta que el foco llegue al control -por su texto, o por su id cuando no tiene texto-,
 * con un tope para que un ciclo no cuelgue.
 */
async function tabTo(page: Page, control: string, by: 'text' | 'id' = 'text') {
  for (let presses = 0; presses < 40; presses += 1) {
    const focused = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null
      return { text: element?.textContent?.trim() ?? '', id: element?.id ?? '' }
    })
    if ((by === 'text' ? focused.text : focused.id) === control) return
    await page.keyboard.press('Tab')
  }
  throw new Error(`Tab never reached ${control}`)
}

test('the entrepreneur creates a project and saves a manual edit by keyboard alone', { tag: '@keyboard' }, async ({ page }) => {
  await mockOwnStoreProject(page)
  await page.goto('/dashboard')
  await expect(page.getByText('No hay proyectos disponibles.')).toBeVisible()

  await tabTo(page, 'Nuevo Proyecto')
  await page.keyboard.press('Enter')
  // El dialogo toma el foco: escribir ya escribe el nombre, sin buscar el campo con el raton.
  const name = page.getByPlaceholder('Nombre...')
  await expect(name).toBeFocused()
  await page.keyboard.type('Confecciones del Sol')
  await tabTo(page, 'Aceptar')
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/design-interface\/42\//)
  await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()

  await tabTo(page, 'canvas-heading', 'id')
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Tejidos del valle')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
    .toHaveText('Revisión aceptada 2')
  await expect(page.getByRole('heading', { name: 'Tejidos del valle' })).toBeVisible()
  // El foco sigue donde estaba: guardar no lo tira al principio del documento.
  await expect(page.getByLabel('Titular de la portada')).toBeFocused()
})
