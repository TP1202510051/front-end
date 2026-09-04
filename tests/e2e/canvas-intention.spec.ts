import { expect, test, type Page } from '@playwright/test'

function projectAt(revisionId: string, number: number, heading: string) {
  return {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-03T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: revisionId, number, registryVersion: 'textile-store@1.0.0',
      templateVersion: 'verified-textile-start@1.0.0', acceptedAt: '2026-09-03T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: number === 1 ? 'VERIFIED_TEMPLATE' : 'MANUAL_BATCH',
      document: {
        schemaVersion: 'project-document@1.0.0', registryVersion: 'textile-store@1.0.0',
        templateVersion: 'verified-textile-start@1.0.0', pages: [{ id: 'home', path: '/',
          rootComponentId: 'hero-main', components: [
            { id: 'hero-main', type: 'layout.hero', properties: { heading,
              subheading: 'Prendas listas' }, bindings: { collection: 'featured' },
              slots: { actions: ['hero-action'] } },
            { id: 'hero-action', type: 'action.link', properties: { label: 'Ver colección' },
              bindings: {}, slots: {} },
          ] }],
      },
    },
  }
}

const problem = (code: string, status: number) => ({
  status,
  json: {
    type: `urn:abstractify:problem:${code.toLowerCase()}`, title: code, status, code,
    detail: code === 'CONFLICT'
      ? 'El estado cambió. Actualiza antes de volver a intentarlo.'
      : 'La solicitud no cumple las reglas del proyecto.',
    correlationId: '6f1d2a4e-1c3b-4a5d-9e7f-2b8c0d1e3f4a',
    recoveryAction: code === 'CONFLICT' ? 'REFRESH' : 'EDIT_REQUEST', operationId: null,
  },
})

async function openCanvas(page: Page, onRevisions: (body: unknown) => Promise<unknown> | unknown,
  read: () => unknown) {
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: {
    registryVersion: 'textile-store@1.0.0',
    components: [{
      type: 'layout.hero',
      properties: {
        heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 },
        subheading: { type: 'TEXT', required: true, minLength: 1, maxLength: 160 },
      },
      slots: { actions: { allowedTypes: ['action.link'], minimum: 1, maximum: 1 } },
      bindings: [{ name: 'collection', source: 'catalog.collection', required: true }],
      constraints: ['TOP_LEVEL_ONLY'],
    }, {
      type: 'action.link',
      properties: { label: { type: 'TEXT', required: true, minLength: 1, maxLength: 40 } },
      slots: {}, bindings: [], constraints: [],
    }],
    template: { templateVersion: 'verified-textile-start@1.0.0', composition: {
      schemaVersion: 'registry-composition@1.0.0', registryVersion: 'textile-store@1.0.0',
      templateVersion: 'verified-textile-start@1.0.0',
      pages: projectAt('9001', 1, 'Mi tienda').acceptedRevision.document.pages,
    } },
  } }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects**', async route => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    if (pathname === '/api/v1/projects/42/revisions' && request.method() === 'POST') {
      const outcome = await onRevisions(request.postDataJSON())
      return route.fulfill(outcome as Parameters<typeof route.fulfill>[0])
    }
    return route.fulfill({ json: read() })
  })
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()
}

/** El estado y el aviso son del control de edicion; la composicion la dibuja la vista. */
function canvasOf(page: Page) {
  return page.getByRole('region', { name: 'Canvas del proyecto' })
}

test('the change shows at once as pending and settles into the accepted revision', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  await openCanvas(page, async body => {
    sent = body as Record<string, unknown>
    await new Promise(resolve => setTimeout(resolve, 700))
    return { status: 201, json: projectAt('9002', 2, 'Tejidos del valle') }
  }, () => projectAt('9001', 1, 'Mi tienda'))

  await page.getByLabel('Titular de la portada').fill('Tejidos del valle')
  await page.getByRole('button', { name: 'Guardar' }).click()

  // Se ve antes de que el servidor conteste, y se ve que todavia no esta confirmado.
  await expect(page.getByRole('heading', { name: 'Tejidos del valle' })).toBeVisible()
  await expect(canvasOf(page).getByRole('status')).toHaveText('Cambio pendiente de confirmación…')

  await expect(canvasOf(page).getByRole('status')).toHaveText('Revisión aceptada 2')
  await expect(page.getByRole('heading', { name: 'Tejidos del valle' })).toBeVisible()
  expect(sent).toMatchObject({
    baseRevisionId: '9001',
    operations: [{ kind: 'SET_PROPERTY', pageId: 'home', componentId: 'hero-main',
      property: 'heading', value: 'Tejidos del valle' }],
  })
  expect(typeof (sent as unknown as { idempotencyKey: string }).idempotencyKey).toBe('string')
})

test('a rejected intention is taken back instead of being shown as accepted', async ({ page }) => {
  await openCanvas(page, () => problem('SEMANTIC_VALIDATION_FAILED', 422),
    () => projectAt('9001', 1, 'Mi tienda'))

  await page.getByLabel('Titular de la portada').fill('Titular que no cabe')
  await page.getByRole('button', { name: 'Guardar' }).click()

  await expect(canvasOf(page).getByRole('alert')).toHaveText('La solicitud no cumple las reglas del proyecto.')
  await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Titular que no cabe' })).toHaveCount(0)
  await expect(canvasOf(page).getByRole('status')).toHaveText('Revisión aceptada 1')
})

test('a stale base reconciles with whatever the project became', async ({ page }) => {
  let served = projectAt('9001', 1, 'Mi tienda')
  await openCanvas(page, () => {
    // Mientras se escribia, el proyecto avanzo por otro lado.
    served = projectAt('9003', 3, 'Escrito desde otra pestaña') as typeof served
    return problem('CONFLICT', 409)
  }, () => served)

  await page.getByLabel('Titular de la portada').fill('Mi intento')
  await page.getByRole('button', { name: 'Guardar' }).click()

  await expect(canvasOf(page).getByRole('alert'))
    .toHaveText('El estado cambió. Actualiza antes de volver a intentarlo.')
  await expect(page.getByRole('heading', { name: 'Escrito desde otra pestaña' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Mi intento' })).toHaveCount(0)
  await expect(canvasOf(page).getByRole('status')).toHaveText('Revisión aceptada 3')
})
