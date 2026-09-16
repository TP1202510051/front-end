import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

/**
 * La certificacion en staging (front-end#90): los recorridos criticos contra el release desplegado
 * de verdad -identidad Firebase real, API y worker en Cloud Run, Pub/Sub, Cloud SQL, almacenamiento-,
 * con una cuenta de prueba y un proyecto nuevos. Ningun doble: si algo no esta, la prueba se salta
 * y lo dice, no lo finge. Lo que deja es un recibo adjunto al informe con lo que se observo.
 */
const url = process.env.STAGING_URL
const email = process.env.STAGING_EMAIL
const password = process.env.STAGING_PASSWORD
const storeUrl = process.env.STAGING_STORE_URL
/** La instruccion predeclarada de la corrida Gemini (TesisAoskaunto/release/staging/gemini-run.json). */
const instruction = process.env.STAGING_INSTRUCTION ?? 'Pon el color primario en #1b3a5c'

test.skip(!url || !email || !password, 'STAGING_URL, STAGING_EMAIL and STAGING_PASSWORD select the staging deployment; without them nothing is certified')
// Los recorridos se encadenan sobre el mismo proyecto: en serie, y el primero que falle para el resto.
test.describe.configure({ mode: 'serial' })

const receipt: Record<string, unknown> = { schema: 'staging-journeys-receipt@1', url }

async function signIn(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('nombre@empresa.com').fill(email!)
  await page.getByPlaceholder('********').fill(password!)
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test('the entrepreneur signs in with a real identity, creates a project and saves a manual edit', async ({ page }) => {
  await signIn(page)
  const name = `Certificación ${new Date().toISOString().slice(0, 16)}`
  await page.getByRole('button', { name: 'Nuevo Proyecto' }).click()
  await page.getByPlaceholder('Nombre...').fill(name)
  await page.getByRole('button', { name: 'Aceptar', exact: true }).click()
  await expect(page).toHaveURL(/\/design-interface\/\d+\//)
  receipt.projectId = page.url().match(/design-interface\/(\d+)/)?.[1]
  const canvas = page.getByRole('region', { name: 'Canvas del proyecto' })
  await expect(canvas.getByRole('status')).toHaveText('Revisión aceptada 1')

  await page.getByLabel('Titular de la portada').fill('Certificación en staging')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(canvas.getByRole('status')).toHaveText('Revisión aceptada 2', { timeout: 30_000 })
  // Persistencia: lo aceptado sobrevive a recargar y viene del servidor, no del estado local.
  await page.reload()
  await expect(canvas.getByRole('status')).toHaveText('Revisión aceptada 2')
  await expect(page.getByRole('heading', { name: 'Certificación en staging' })).toBeVisible()
  receipt.manualEdit = { revision: 2 }

  // El actor es la identidad verificada del token: un cuerpo que nombre a otro no cambia el dueno.
  // El token y el origen se toman de una peticion que la aplicacion hace de verdad.
  const [request] = await Promise.all([page.waitForRequest(candidate => candidate.url().includes('/api/v1/projects/')), page.reload()])
  const origin = new URL(request.url()).origin
  const forged = await page.request.post(`${origin}/api/v1/projects`, { headers: { authorization: request.headers().authorization ?? '' },
    data: { name: 'Proyecto de otro', actorId: 'someone-else', ownerId: 'someone-else' } })
  // Un 400 por campos desconocidos o un 201 a nombre del token: nunca un proyecto de "someone-else".
  const body = forged.ok() ? await forged.json() : null
  receipt.actorFromBody = { status: forged.status(), rejected: !forged.ok() || (body?.id !== undefined && !JSON.stringify(body).includes('someone-else')) }
  expect((receipt.actorFromBody as { rejected: boolean }).rejected).toBe(true)
})

test('the assistant drafts through the worker, progress reaches the canvas and acceptance becomes a revision', async ({ page }) => {
  await signIn(page)
  const id = receipt.projectId
  test.skip(!id, 'the project of the previous journey is needed')
  await page.goto(`/design-interface/${id}/certificacion`)
  const assistant = page.getByRole('region', { name: 'Asistente' })
  await assistant.getByLabel('Instrucción para el asistente').fill(instruction)
  await assistant.getByRole('button', { name: 'Pedir propuesta' }).click()
  // El progreso llega por el canal (Pub/Sub -> worker -> notificacion) y REST lo recupera.
  const monitor = page.getByRole('region', { name: 'Progreso de operaciones' })
  await expect(monitor).toBeVisible({ timeout: 60_000 })
  await expect(assistant.getByText('Lo que cambia')).toBeVisible({ timeout: 5 * 60_000 })
  await assistant.getByRole('button', { name: 'Aceptar propuesta' }).click()
  await expect(assistant.getByRole('status')).toContainText('Aceptada', { timeout: 60_000 })
  await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status')).toHaveText('Revisión aceptada 3')
  receipt.assistant = { instruction, acceptedRevision: 3 }
})

test('a reload after the proposal recovers the durable operation from REST, not from the channel', async ({ page }) => {
  await signIn(page)
  const id = receipt.projectId
  test.skip(!id, 'the project of the previous journey is needed')
  await page.goto(`/design-interface/${id}/certificacion`)
  const history = page.getByRole('list', { name: 'Propuestas anteriores' })
  await expect(history).toContainText('Aceptada', { timeout: 60_000 })
  receipt.recovery = { proposalsListedAfterReload: true }
})

test('an export of the accepted revision is generated, verified and downloaded through a short-lived link', async ({ page }) => {
  await signIn(page)
  const id = receipt.projectId
  test.skip(!id, 'the project of the previous journey is needed')
  await page.goto(`/design-interface/${id}/certificacion`)
  await page.getByRole('button', { name: /Generar tienda desde revisión \d+/ }).click()
  const monitor = page.getByRole('region', { name: 'Progreso de operaciones' })
  const download = page.waitForEvent('download', { timeout: 15 * 60_000 })
  await monitor.getByRole('button', { name: 'Descargar ZIP verificado' }).click({ timeout: 15 * 60_000 })
  const file = await download
  const bytes = await readFile(await file.path())
  receipt.export = { filename: file.suggestedFilename(), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }
  expect(bytes.length).toBeGreaterThan(10_000)
})

test('the reference store answers as a real deployment, not as a demo', async ({ page }) => {
  test.skip(!storeUrl, 'STAGING_STORE_URL selects the deployed textile-complete store')
  const response = await page.request.get(`${storeUrl!.replace(/\/$/, '')}/api/storefront/store`)
  expect(response.ok()).toBe(true)
  const store = await response.json()
  expect(store.mode).not.toBe('DEMO')
  await page.goto(storeUrl!)
  await expect(page.locator('#root')).not.toBeEmpty()
  receipt.store = { mode: store.mode }
})

/** Cada recorrido adjunta el recibo tal como va: el ultimo que corra deja el completo. */
test.afterEach(async () => {
  await test.info().attach('staging-receipt', { body: JSON.stringify(receipt, null, 2), contentType: 'application/json' })
})
