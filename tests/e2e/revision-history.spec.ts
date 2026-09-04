import { expect, test, type Page } from '@playwright/test'

export function projectAt(revisionId: string, number: number, heading: string) {
  return {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-03T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: revisionId, number, registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0', acceptedAt: '2026-09-03T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: number === 1 ? 'VERIFIED_TEMPLATE' : 'MANUAL_BATCH',
      document: {
        schemaVersion: 'project-document@1.0.0', registryVersion: 'textile-store@1.1.0',
        templateVersion: 'verified-textile-start@1.1.0', pages: [{ id: 'home', path: '/',
          kind: 'HOME', rootComponentId: 'hero-main', components: [
            { id: 'hero-main', type: 'layout.hero', properties: { heading,
              subheading: 'Prendas listas' }, bindings: { collection: 'featured' }, interactions: {},
              slots: { actions: ['hero-action'] } },
            { id: 'hero-action', type: 'action.link', properties: { label: 'Ver colección' },
              bindings: {}, interactions: { activate: 'home' }, slots: {} },
          ] }],
      },
    },
  }
}

function summary(id: string, number: number, parentId: string | null) {
  return {
    id, number, parentId, origin: number === 1 ? 'VERIFIED_TEMPLATE' : 'MANUAL_BATCH',
    actorId: 'demo-textile-a-v1', registryVersion: 'textile-store@1.1.0',
    templateVersion: 'verified-textile-start@1.1.0',
    hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    acceptedAt: '2026-09-03T10:00:00',
  }
}

const registry = {
  registryVersion: 'textile-store@1.1.0',
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
    slots: {}, bindings: [], interactions: [{ name: 'activate', required: true }],
    constraints: [],
  }],
  pages: [
    { kind: 'HOME', required: true, path: '/', rootTypes: ['layout.hero'] },
    { kind: 'CATALOG', required: true, path: '/catalogo', rootTypes: ['catalog.grid'] },
    { kind: 'CONTENT', required: false, path: null, rootTypes: ['content.section'] },
  ],
  template: { templateVersion: 'verified-textile-start@1.1.0', composition: {
    schemaVersion: 'registry-composition@1.0.0', registryVersion: 'textile-store@1.1.0',
    templateVersion: 'verified-textile-start@1.1.0',
    pages: projectAt('9001', 1, 'Mi tienda').acceptedRevision.document.pages,
  } },
}

interface Backend {
  onAccept?: (body: Record<string, unknown>) => Promise<unknown> | unknown
  project: () => unknown
  history?: (before: string | null) => unknown
  revision?: (number: string) => unknown
}

async function open(page: Page, backend: Backend) {
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: registry }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    if (path === '/api/v1/projects/42/revisions' && request.method() === 'POST') {
      const outcome = await backend.onAccept!(request.postDataJSON())
      return route.fulfill(outcome as Parameters<typeof route.fulfill>[0])
    }
    if (path === '/api/v1/projects/42/revisions' && backend.history) {
      return route.fulfill({ json: backend.history(url.searchParams.get('before')) })
    }
    const exact = path.match(/^\/api\/v1\/projects\/42\/revisions\/(\d+)$/)
    if (exact && backend.revision) return route.fulfill({ json: backend.revision(exact[1]) })
    return route.fulfill({ json: backend.project() })
  })
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
}

const canvas = (page: Page) => page.getByRole('region', { name: 'Canvas del proyecto' })

/**
 * El reintento es lo que hace util la idempotencia.
 *
 * <p>Cuando el servidor no llega a contestar, nadie sabe si acepto. Volver a enviar con una clave
 * nueva escribiria una segunda revision con el mismo cambio; volver con la misma trae de vuelta la
 * que ya existe.
 */
test('retrying an unanswered save reuses its identity and shows the original acceptance', async ({ page }) => {
  const keys: string[] = []
  let attempts = 0
  await open(page, {
    project: () => projectAt('9001', 1, 'Mi tienda'),
    onAccept: body => {
      keys.push(String(body.idempotencyKey))
      attempts += 1
      // La primera se queda sin respuesta; la segunda encuentra la revision ya aceptada.
      if (attempts === 1) return { status: 503, json: problem('DEPENDENCY_UNAVAILABLE', 503) }
      return { status: 201, json: projectAt('9002', 2, 'Tejidos del valle') }
    },
  })
  await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()

  await page.getByLabel('Titular de la portada').fill('Tejidos del valle')
  await page.getByRole('button', { name: 'Guardar' }).click()
  await expect(canvas(page).getByRole('alert'))
    .toHaveText('El servicio no está disponible temporalmente.')
  await expect(canvas(page).getByRole('status')).toHaveText('Revisión aceptada 1')

  await page.getByRole('button', { name: 'Reintentar' }).click()

  await expect(canvas(page).getByRole('status')).toHaveText('Revisión aceptada 2')
  await expect(page.getByRole('heading', { name: 'Tejidos del valle' })).toBeVisible()
  expect(keys).toHaveLength(2)
  expect(keys[0]).not.toHaveLength(0)
  expect(keys[1], 'El reintento viaja con la identidad de la intencion, no con una nueva')
    .toBe(keys[0])
})

/** Un rechazo si es una respuesta: la intencion se resuelve y no queda nada que reintentar. */
test('a refused save leaves nothing to retry', async ({ page }) => {
  await open(page, {
    project: () => projectAt('9001', 1, 'Mi tienda'),
    onAccept: () => ({ status: 422, json: problem('SEMANTIC_VALIDATION_FAILED', 422) }),
  })
  await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()

  await page.getByLabel('Titular de la portada').fill('No cabe')
  await page.getByRole('button', { name: 'Guardar' }).click()

  await expect(canvas(page).getByRole('alert'))
    .toHaveText('La solicitud no cumple las reglas del proyecto.')
  await expect(page.getByRole('button', { name: 'Reintentar' })).toHaveCount(0)
})

/** Volver no es recordar: lo que se abre es lo que el servidor tenga ahora. */
test('reopening shows the backend head and not a stale local snapshot', async ({ page }) => {
  let served = projectAt('9001', 1, 'Mi tienda')
  await open(page, { project: () => served })
  await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()

  // El proyecto avanzo por otro lado mientras esta pantalla estaba abierta.
  served = projectAt('9003', 3, 'Escrito desde otro sitio')
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Escrito desde otro sitio' })).toBeVisible()
  await expect(canvas(page).getByRole('status')).toHaveText('Revisión aceptada 3')
  await expect(page.getByRole('heading', { name: 'Mi tienda' })).toHaveCount(0)
})

test('history pages backwards and an inspected revision survives a reload', async ({ page }) => {
  await open(page, {
    project: () => projectAt('9003', 3, 'La ultima'),
    history: before => before === '2'
      ? { items: [summary('9001', 1, null)], nextCursor: null }
      : { items: [summary('9003', 3, '9002'), summary('9002', 2, '9001')], nextCursor: '2' },
    revision: number => projectAt('900' + number, Number(number),
      number === '1' ? 'Como empezo' : 'La del medio'),
  })
  const history = page.getByRole('region', { name: 'Historial de revisiones' })
  await expect(history.getByText('Revisión 3 · Cambio manual')).toBeVisible()
  await expect(history.getByText('Revisión 1')).toHaveCount(0)

  await history.getByRole('button', { name: 'Ver más antiguas' }).click()
  await expect(history.getByText('Revisión 1 · Plantilla verificada · sin anterior')).toBeVisible()

  await history.getByRole('button', { name: 'Ver revisión 1' }).click()
  await expect(page).toHaveURL(/\?revision=1$/)
  await expect(page.getByRole('heading', { name: 'Como empezo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Guardar' }),
    'Una revision pasada se mira, no se edita').toHaveCount(0)

  await page.reload()

  await expect(page.getByRole('heading', { name: 'Como empezo' }))
    .toBeVisible()
  await expect(page.getByRole('heading', { name: 'La ultima' })).toHaveCount(0)
})

function problem(code: string, status: number) {
  const detail: Record<string, string> = {
    DEPENDENCY_UNAVAILABLE: 'El servicio no está disponible temporalmente.',
    SEMANTIC_VALIDATION_FAILED: 'La solicitud no cumple las reglas del proyecto.',
  }
  const recovery: Record<string, string> = {
    DEPENDENCY_UNAVAILABLE: 'RETRY_LATER', SEMANTIC_VALIDATION_FAILED: 'EDIT_REQUEST',
  }
  return {
    type: `urn:abstractify:problem:${code.toLowerCase()}`, title: code, status, code,
    detail: detail[code], correlationId: '6f1d2a4e-1c3b-4a5d-9e7f-2b8c0d1e3f4a',
    recoveryAction: recovery[code], operationId: null,
  }
}
