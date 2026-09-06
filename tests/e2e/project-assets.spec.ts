import { expect, test, type Page } from '@playwright/test'

const OWNED = 'a'.repeat(64)
const GONE = 'b'.repeat(64)

function component(id: string, type: string, properties: Record<string, string>,
  bindings: Record<string, string> = {}, interactions: Record<string, string> = {},
  slots: Record<string, string[]> = {}, styles: Record<string, string> = {}) {
  return { id, type, properties, bindings, interactions, slots, styles }
}

function page(id: string, kind: string, path: string, rootComponentId: string,
  components: ReturnType<typeof component>[]) {
  return { id, kind, path, rootComponentId, components }
}

const homePage = () => page('home', 'HOME', '/', 'hero-main', [
  component('hero-main', 'layout.hero',
    { heading: 'Confecciones Andinas', subheading: 'Prendas listas' },
    { collection: 'featured' }, {}, { actions: ['hero-action'] }),
  component('hero-action', 'action.link', { label: 'Ver colección' }, {}, { activate: 'catalogo' }),
])

const catalogPage = () => page('catalogo', 'CATALOG', '/catalogo', 'catalog-main', [
  component('catalog-main', 'catalog.grid', { heading: 'Toda la colección' },
    { collection: 'featured' }, {}, { actions: [] }),
])

function projectCiting(assetId: string | null) {
  const rules = assetId
    ? [{ selector: '.abstractify-store .hero', declarations: { 'background-image': `asset(${assetId})` } }]
    : []
  return {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-06T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: '9001', number: 2, registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0', acceptedAt: '2026-09-06T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: 'MANUAL_BATCH', basedOnRevisionId: null,
      document: {
        schemaVersion: 'project-document@1.3.0', registryVersion: 'textile-store@1.1.0',
        templateVersion: 'verified-textile-start@1.1.0',
        pages: [homePage(), catalogPage()], blocks: [], blockInstances: [],
        theme: { tokens: {}, rules },
      },
    },
  }
}

const publication = {
  registryVersion: 'textile-store@1.1.0',
  components: [
    { type: 'layout.hero', properties: {
        heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 },
        subheading: { type: 'TEXT', required: true, minLength: 1, maxLength: 160 } },
      slots: { actions: { allowedTypes: ['action.link'], minimum: 1, maximum: 1 } },
      bindings: [{ name: 'collection', source: 'catalog.collection', required: true }],
      interactions: [], constraints: ['TOP_LEVEL_ONLY'] },
    { type: 'action.link', properties: {
        label: { type: 'TEXT', required: true, minLength: 1, maxLength: 40 } },
      slots: {}, bindings: [], interactions: [{ name: 'activate', required: true }], constraints: [] },
    { type: 'catalog.grid', properties: {
        heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 } },
      slots: { actions: { allowedTypes: ['action.link'], minimum: 0, maximum: 2 } },
      bindings: [{ name: 'collection', source: 'catalog.collection', required: true }],
      interactions: [], constraints: ['TOP_LEVEL_ONLY'] },
  ],
  pages: [
    { kind: 'HOME', required: true, path: '/', rootTypes: ['layout.hero'] },
    { kind: 'CATALOG', required: true, path: '/catalogo', rootTypes: ['catalog.grid'] },
    { kind: 'CONTENT', required: false, path: null, rootTypes: ['content.section'] },
  ],
  template: { templateVersion: 'verified-textile-start@1.1.0', composition: {
    schemaVersion: 'registry-composition@1.0.0', registryVersion: 'textile-store@1.1.0',
    templateVersion: 'verified-textile-start@1.1.0', pages: [homePage(), catalogPage()],
  } },
}

function asset(id: string, alternativeText: string) {
  return {
    id, contentType: 'image/png', width: 1200, height: 600, bytes: 4096,
    alternativeText, digest: id,
    derivatives: [{ width: 360, height: 180, digest: 'c'.repeat(64), bytes: 512 }],
    uploadedAt: '2026-09-06T10:00:00',
  }
}

/** Un PNG diminuto de verdad: lo que se sirve tiene que ser una imagen, no un texto que lo diga. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64')

interface Options {
  assets?: ReturnType<typeof asset>[]
  citing?: string | null
  onUpload?: (request: { body: string | null }) => unknown
  contentStatus?: number
}

async function open(page: Page, options: Options = {}) {
  const assets = options.assets ?? []
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: publication }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))
  // Playwright resuelve la ultima ruta registrada primero, asi que la generica va antes que las
  // especificas: al reves se quedaria con las de assets por coincidir el prefijo.
  await page.route('**/api/v1/projects**', route => route.fulfill({ json: projectCiting(options.citing ?? null) }))
  await page.route('**/api/v1/projects/42/assets**', async route => {
    const request = route.request()
    if (request.method() === 'POST') {
      return route.fulfill(await options.onUpload!({ body: request.postData() }) as Parameters<typeof route.fulfill>[0])
    }
    if (request.method() === 'DELETE') return route.fulfill({ status: 204, body: '' })
    return route.fulfill({ json: assets })
  })
  // La de contenido va la ultima porque Playwright resuelve la ultima registrada primero: la de
  // listado tambien casa con /assets/<id>/content, y devolveria JSON donde se esperan bytes.
  await page.route('**/api/v1/projects/42/assets/*/content*', route => route.fulfill(
    (options.contentStatus ?? 200) === 200
      ? { status: 200, contentType: 'image/png', body: PNG }
      : { status: options.contentStatus!, contentType: 'application/problem+json',
          json: { code: 'RESOURCE_NOT_FOUND', correlationId: '11111111-2222-3333-4444-555555555555' } }))
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(panel(page)).toBeVisible()
}

const panel = (page: Page) => page.getByRole('region', { name: 'Medios del proyecto' })
const surface = (page: Page) => page.locator('.abstractify-store')
/** Sin reglas no hay <style>, y eso es un resultado valido: no una consulta que falla. */
const sheetOf = async (page: Page) => {
  const sheet = surface(page).locator('style')
  return (await sheet.count()) === 0 ? '' : (await sheet.first().textContent()) ?? ''
}

test('an owned asset lists with its identity, its size and the widths that exist', async ({ page }) => {
  await open(page, { assets: [asset(OWNED, 'Portada de la tienda')] })

  await expect(panel(page).getByText('Portada de la tienda')).toBeVisible()
  await expect(panel(page).getByText('image/png · 1200×600 · anchuras 360')).toBeVisible()
  // La identidad se puede copiar porque es lo que el CSS cita.
  await expect(panel(page).getByText(`asset(${OWNED})`)).toBeVisible()
})

/**
 * Lo que se pinta son los bytes que el servidor sirvio, no el fichero local.
 *
 * <p>La ruta pide autorizacion y un {@code <img src>} no manda cabeceras, asi que se traen y se
 * envuelven en una URL local. La direccion que acaba en el CSS nunca la escribio quien edita.
 */
test('a cited asset becomes local bytes in the surface stylesheet', async ({ page }) => {
  await open(page, { assets: [asset(OWNED, 'Portada')], citing: OWNED })

  await expect.poll(() => sheetOf(page)).toMatch(/background-image:\s*url\("blob:/)
  await expect.poll(() => sheetOf(page)).not.toMatch(/asset\(/)
  await expect(surface(page).getByRole('status')).toHaveCount(0)
})

/** Lo que falta se dice; lo que no se hace es pintar la tienda como si estuviera. */
test('a cited asset that is gone leaves a visible recoverable state', async ({ page }) => {
  await open(page, { assets: [], citing: GONE, contentStatus: 404 })

  await expect(surface(page).getByRole('status'))
    .toHaveText(/Una imagen del tema no está disponible/)
  // La regla que la citaba se cae entera, y solo ella: la tienda sigue pintandose.
  await expect.poll(() => sheetOf(page)).not.toMatch(/background-image/)
  await expect(page.getByRole('region', { name: 'Portada' })).toBeVisible()
})

test('each refusal says what to change, and they do not say the same thing', async ({ page }) => {
  const refusals = [
    { code: 'FORMAT_NOT_ALLOWED', text: /Solo PNG y JPEG/ },
    { code: 'TOO_LARGE', text: /máximo son 5 MB/ },
    { code: 'DIMENSIONS_NOT_ALLOWED', text: /mínimo son 16 píxeles/ },
    { code: 'CONTENT_TYPE_MISMATCH', text: /no es del tipo que dice ser/ },
  ]
  for (const refusal of refusals) {
    await open(page, {
      assets: [],
      onUpload: () => ({
        status: 422,
        json: {
          type: 'urn:abstractify:problem:semantic_validation_failed',
          title: 'SEMANTIC_VALIDATION_FAILED', status: 422, code: 'SEMANTIC_VALIDATION_FAILED',
          detail: 'La solicitud no cumple las reglas del proyecto.',
          correlationId: '11111111-2222-3333-4444-555555555555',
          recoveryAction: 'EDIT_REQUEST', operationId: null,
          issues: [`$.asset ${refusal.code}`],
        },
      }),
    })
    await panel(page).getByLabel('Imagen').setInputFiles({
      name: 'portada.png', mimeType: 'image/png', buffer: PNG,
    })
    await panel(page).getByLabel('Descripción').fill('Una portada')
    await panel(page).getByRole('button', { name: 'Subir imagen' }).click()

    await expect(panel(page).getByRole('alert')).toHaveText(refusal.text)
  }
})

test('an accepted upload shows what the server verified, not the local file', async ({ page }) => {
  let sent: string | null = null
  const listed: ReturnType<typeof asset>[] = []
  await open(page, {
    assets: listed,
    onUpload: request => {
      sent = request.body
      // Lo que se lista despues es lo que el servidor guardo, que es lo que el panel debe ensenar.
      listed.push(asset(OWNED, 'Una portada'))
      return { status: 201, json: asset(OWNED, 'Una portada') }
    },
  })
  await panel(page).getByLabel('Imagen').setInputFiles({
    name: 'portada.png', mimeType: 'image/png', buffer: PNG,
  })
  await panel(page).getByLabel('Descripción').fill('Una portada')
  await panel(page).getByRole('button', { name: 'Subir imagen' }).click()

  await expect.poll(() => sent).not.toBeNull()
  expect(sent).toContain('alternativeText')
  // Lo que se ensena viene del listado que el servidor devuelve, no del File local.
  await expect(panel(page).getByText('image/png · 1200×600 · anchuras 360')).toBeVisible()
})

test('an inspected revision does not offer to upload or retire', async ({ page }) => {
  await open(page, { assets: [asset(OWNED, 'Portada')] })
  await page.route('**/api/v1/projects/42/revisions/1', route =>
    route.fulfill({ json: projectCiting(null) }))
  await page.goto('/design-interface/42/Tienda?revision=1')

  await expect(panel(page).getByText('Portada')).toBeVisible()
  await expect(panel(page).getByRole('button', { name: 'Subir imagen' })).toHaveCount(0)
  await expect(panel(page).getByRole('button', { name: 'Retirar imagen' })).toHaveCount(0)
})
