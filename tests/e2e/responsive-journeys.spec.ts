import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { mockOwnStoreProject } from './support/store-project'

/** Los anchos que la decision de release exige medir (release-gates §9). */
const WIDTHS = [360, 768, 1024, 1440] as const

/**
 * La pagina entera cabe en el ancho: un desbordamiento horizontal accidental es contenido al
 * que no se llega, y a 360 px es lo primero que se rompe.
 */
async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(overflow.scrollWidth, `scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`)
    .toBeLessThanOrEqual(overflow.clientWidth)
}

/**
 * El control esencial del paso cabe entero en la ventana: un contenedor con scroll propio puede
 * esconder el desbordamiento al documento, pero no a quien tiene que pulsar el boton.
 */
async function expectWithinViewport(control: Locator) {
  await expect(control).toBeVisible()
  const box = await control.boundingBox()
  const viewport = control.page().viewportSize()
  expect(box, 'the control has a box').not.toBeNull()
  expect(box!.x, `${await control.evaluate(e => e.textContent)} starts inside`).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width, `${await control.evaluate(e => e.textContent)} ends inside ${viewport!.width}`)
    .toBeLessThanOrEqual(viewport!.width)
}

/**
 * axe y una captura del estado recorrido. Una violacion critica bloquea; el analisis completo y
 * la captura quedan adjuntos al informe como evidencia de lo evaluado, sin afirmar conformidad
 * de lo que no se vio.
 */
async function recordState(page: Page, state: string) {
  await test.info().attach(`screen-${state}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
  const scan = await new AxeBuilder({ page }).analyze()
  await test.info().attach(`axe-${state}`, { body: JSON.stringify(scan, null, 2), contentType: 'application/json' })
  // Critica o seria bloquea: el contraste que hace ilegible un texto es "serious" para axe y un
  // texto ilegible es un defecto material (release-gates s9). Lo moderado y menor queda adjunto.
  const blocking = scan.violations.filter(violation => violation.impact === 'critical' || violation.impact === 'serious')
  expect(blocking.map(violation => `${violation.impact} ${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`))
    .toEqual([])
}

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } })

    test(`the entrepreneur creates a project and reaches its accepted revision`, { tag: '@responsive' }, async ({ page }) => {
      await mockOwnStoreProject(page)

      await page.goto('/dashboard')
      await expect(page.getByText('No hay proyectos disponibles.')).toBeVisible()
      await expectNoHorizontalOverflow(page)
      await recordState(page, `dashboard-${width}`)

      await expectWithinViewport(page.getByRole('button', { name: 'Nuevo Proyecto' }))
      await page.getByRole('button', { name: 'Nuevo Proyecto' }).click()
      await page.getByPlaceholder('Nombre...').fill('Confecciones del Sol')
      await expectNoHorizontalOverflow(page)
      await expectWithinViewport(page.getByRole('button', { name: 'Aceptar', exact: true }))
      await page.getByRole('button', { name: 'Aceptar', exact: true }).click()

      await expect(page).toHaveURL(/\/design-interface\/42\//)
      await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()
      await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
        .toHaveText('Revisión aceptada 1')
      await expectWithinViewport(page.getByRole('heading', { name: 'Mi tienda' }))
      await expectNoHorizontalOverflow(page)
      await recordState(page, `canvas-${width}`)
    })

    test(`a manual edit of the cover is saved as the next accepted revision`, { tag: '@responsive' }, async ({ page }) => {
      await mockOwnStoreProject(page)
      await page.goto('/design-interface/42/Confecciones%20del%20Sol')
      await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()

      await expectWithinViewport(page.getByLabel('Titular de la portada'))
      await page.getByLabel('Titular de la portada').fill('Tejidos del valle')
      await expectWithinViewport(page.getByRole('button', { name: 'Guardar', exact: true }))
      await page.getByRole('button', { name: 'Guardar', exact: true }).click()

      await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
        .toHaveText('Revisión aceptada 2')
      await expectWithinViewport(page.getByRole('heading', { name: 'Tejidos del valle' }))
      await expectNoHorizontalOverflow(page)
      await recordState(page, `manual-edit-${width}`)
    })

    test(`the assistant proposal is asked for, read and accepted`, { tag: '@responsive' }, async ({ page }) => {
      await mockOwnStoreProject(page)
      await page.goto('/design-interface/42/Confecciones%20del%20Sol')
      await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()

      const assistant = page.getByRole('region', { name: 'Asistente' })
      await expectWithinViewport(assistant.getByLabel('Instrucción para el asistente'))
      await assistant.getByLabel('Instrucción para el asistente').fill('Pon el color primario en #1a2b3c')
      await expectWithinViewport(assistant.getByRole('button', { name: 'Pedir propuesta' }))
      await assistant.getByRole('button', { name: 'Pedir propuesta' }).click()
      await expect(assistant.getByText('Pone «color-primario» en #1a2b3c')).toBeVisible()
      await expectNoHorizontalOverflow(page)
      await recordState(page, `proposal-${width}`)

      await expectWithinViewport(assistant.getByRole('button', { name: 'Aceptar propuesta' }))
      await assistant.getByRole('button', { name: 'Aceptar propuesta' }).click()
      await expect(assistant.getByRole('status')).toContainText('Aceptada')
      await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
        .toHaveText('Revisión aceptada 2')
      await expectNoHorizontalOverflow(page)
    })
  })
}
