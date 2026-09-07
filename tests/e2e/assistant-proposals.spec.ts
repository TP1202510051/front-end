import { expect, test, type Page } from '@playwright/test'

const PROPOSAL = '3f2b7c1a-8d4e-4a6b-9c0d-1e2f3a4b5c6d'
const OPERATION = '7a1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e'

function projectAt(revisionId: string, number: number, heading: string, tokens: Record<string, string> = {}) {
  return {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-06T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: revisionId, number, registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0', acceptedAt: '2026-09-06T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: number === 1 ? 'VERIFIED_TEMPLATE' : 'MANUAL_BATCH',
      document: {
        schemaVersion: 'project-document@1.4.0', registryVersion: 'textile-store@1.1.0',
        templateVersion: 'verified-textile-start@1.1.0',
        theme: { tokens, rules: [] }, blocks: [], blockInstances: [],
        pages: [{ id: 'home', path: '/', kind: 'HOME', rootComponentId: 'hero-main', components: [
          { id: 'hero-main', type: 'layout.hero',
            properties: { heading, subheading: 'Prendas listas' },
            bindings: { collection: { target: 'EVERYTHING', reference: null, limit: 12, order: 'NEWEST' } },
            interactions: {}, slots: { actions: ['hero-action'] }, styles: {} },
          { id: 'hero-action', type: 'action.link', properties: { label: 'Ver colección' },
            bindings: {}, interactions: { activate: 'home' }, slots: {}, styles: {} },
        ] }],
      },
    },
  }
}

/** Una propuesta ya redactada, con la vista previa que dejaria. */
function drafted(overrides: Record<string, unknown> = {}) {
  return {
    proposalId: PROPOSAL, projectId: '42', state: 'DRAFTED',
    instruction: 'Pon el color primario en #1a2b3c', baseRevisionId: '9001',
    scope: 'PROJECT', scopePageId: null,
    modelSummary: 'cambiar el color primario a #1a2b3c',
    effects: ['Pone «color-primario» en #1a2b3c'], losses: [], refused: [],
    destructive: false,
    preview: projectAt('9001', 1, 'Mi tienda', { 'color-primario': '#1a2b3c' }).acceptedRevision.document,
    unavailable: null, acceptedRevisionId: null,
    createdAt: '2026-09-06T10:01:00', decidedAt: null,
    ...overrides,
  }
}

async function openCanvas(page: Page, routes: {
  proposal: () => unknown
  onPropose?: (body: unknown) => unknown | Promise<unknown>
  onAcceptance?: (body: unknown) => unknown | Promise<unknown>
  onRejection?: () => unknown
  project?: () => unknown
}) {
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: {
    registryVersion: 'textile-store@1.1.0',
    components: [{
      type: 'layout.hero',
      properties: {
        heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 },
        subheading: { type: 'TEXT', required: true, minLength: 1, maxLength: 160 },
      },
      slots: { actions: { allowedTypes: ['action.link'], minimum: 1, maximum: 1 } },
      bindings: [{ name: 'collection', source: 'catalog.collection', required: true,
        targets: ['COLLECTION', 'CATEGORY', 'EVERYTHING'] }],
      interactions: [], constraints: ['TOP_LEVEL_ONLY'],
    }, {
      type: 'action.link',
      properties: { label: { type: 'TEXT', required: true, minLength: 1, maxLength: 40 } },
      slots: {}, bindings: [], interactions: [{ name: 'activate', required: true }], constraints: [],
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
  } }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))

  // La generica primero: en Playwright gana la ultima que coincide, asi que las de propuesta
  // tienen que registrarse despues de la del proyecto o nunca les llegaria nada.
  await page.route('**/api/v1/projects**', route =>
    route.fulfill({ json: (routes.project ?? (() => projectAt('9001', 1, 'Mi tienda')))() }))

  await page.route('**/api/v1/projects/42/assistant/proposals**', async route => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    // Se espera el resultado: un manejador puede tardar a proposito -es lo que demuestra que el
    // Canvas no se congela- y pasarle una promesa a fulfill no cumple nada.
    if (pathname.endsWith('/acceptance')) {
      const outcome = await (routes.onAcceptance ?? (() => ({ status: 201, json: drafted({
        state: 'ACCEPTED', acceptedRevisionId: '9002', preview: null,
        unavailable: 'Ya está aceptada: lo que hizo está en el proyecto.',
      }) })))(request.postDataJSON())
      return route.fulfill(outcome as Parameters<typeof route.fulfill>[0])
    }
    if (pathname.endsWith('/rejection')) {
      const outcome = await (routes.onRejection ?? (() => ({ json: drafted({
        state: 'REJECTED', preview: null, unavailable: 'Se descartó.',
      }) })))()
      return route.fulfill(outcome as Parameters<typeof route.fulfill>[0])
    }
    if (request.method() === 'POST') {
      const outcome = await (routes.onPropose ?? (() => ({
        status: 202, json: { operationId: OPERATION, proposalId: PROPOSAL },
      })))(request.postDataJSON())
      return route.fulfill(outcome as Parameters<typeof route.fulfill>[0])
    }
    return route.fulfill({ json: routes.proposal() })
  })

  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(page.getByRole('heading', { name: 'Mi tienda' })).toBeVisible()
}

function assistant(page: Page) {
  return page.getByRole('region', { name: 'Asistente' })
}

test('submitting an instruction answers at once and leaves the Canvas usable', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  let asked = 0
  // La peticion no contesta hasta que la prueba lo permite: asi el "sigue usable" se comprueba con
  // la peticion demostrablemente en vuelo, y no en una ventana de tiempo que podria haberse cerrado.
  let answer: () => void = () => undefined
  const inFlight = new Promise<void>(resolve => { answer = resolve })

  await openCanvas(page, {
    proposal: () => { asked += 1; return drafted({ state: 'PENDING', preview: null, effects: [],
      modelSummary: null, unavailable: 'Todavía se está redactando.' }) },
    onPropose: async body => {
      sent = body as Record<string, unknown>
      await inFlight
      return { status: 202, json: { operationId: OPERATION, proposalId: PROPOSAL } }
    },
  })

  await assistant(page).getByLabel('Instrucción para el asistente').fill('Pon el color primario en #1a2b3c')
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()
  await expect.poll(() => sent).not.toBeNull()

  // Con la peticion en vuelo, el Canvas sigue respondiendo: escribir no lo congela.
  await page.getByLabel('Titular de la portada').fill('Sigo editando')
  await expect(page.getByLabel('Titular de la portada')).toHaveValue('Sigo editando')
  answer()

  await expect(assistant(page).getByRole('status')).toHaveText('Todavía se está redactando.')

  // Y tampoco durante el sondeo, que es la espera larga: se sigue pudiendo escribir mientras
  // pregunta, y sigue preguntando -no se quedo colgado en la primera respuesta-.
  await expect.poll(() => asked, { timeout: 6000 }).toBeGreaterThan(1)
  await page.getByLabel('Titular de la portada').fill('Y sigo editando')
  await expect(page.getByLabel('Titular de la portada')).toHaveValue('Y sigo editando')
  expect(sent).toMatchObject({ instruction: 'Pon el color primario en #1a2b3c', scope: 'PROJECT' })
  expect(typeof (sent as unknown as { idempotencyKey: string }).idempotencyKey).toBe('string')
})

test('the proposal shows what it would do and what it would leave, without accepting it', async ({ page }) => {
  await openCanvas(page, { proposal: () => drafted() })

  await assistant(page).getByLabel('Instrucción para el asistente').fill('Pon el color primario en #1a2b3c')
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()

  await expect(assistant(page).getByText('Pone «color-primario» en #1a2b3c')).toBeVisible()
  // El efecto visual se ve en el Canvas, con el mismo renderizador que pinta lo aceptado.
  await expect(page.getByRole('button', { name: 'Ver la propuesta en el Canvas' })).toBeVisible()
  await page.getByRole('button', { name: 'Ver la propuesta en el Canvas' }).click()
  await expect(assistant(page).getByRole('status')).toContainText('Estás viendo la propuesta')

  // Y nada de esto ha tocado la revisión aceptada.
  await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
    .toHaveText('Revisión aceptada 1')
})

test('a proposal that removes something says so apart from what it merely changes', async ({ page }) => {
  await openCanvas(page, { proposal: () => drafted({
    instruction: 'Quita la pagina catalogo',
    modelSummary: 'quitar la pagina catalogo',
    effects: [], destructive: true,
    losses: ['Quita la página «catalogo» y todo lo que tiene dentro'],
  }) })

  await assistant(page).getByLabel('Instrucción para el asistente').fill('Quita la pagina catalogo')
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()

  const losses = assistant(page).getByRole('list', { name: 'Lo que se pierde' })
  await expect(losses).toContainText('Quita la página «catalogo»')
  await expect(assistant(page).getByRole('alert'))
    .toContainText('Esta propuesta quita cosas del proyecto.')
})

test('accepting goes through the paired lifecycle and the project keeps the change', async ({ page }) => {
  let accepted: Record<string, unknown> | null = null
  let served = projectAt('9001', 1, 'Mi tienda')
  await openCanvas(page, {
    proposal: () => drafted(),
    project: () => served,
    onAcceptance: body => {
      accepted = body as Record<string, unknown>
      served = projectAt('9002', 2, 'Mi tienda', { 'color-primario': '#1a2b3c' }) as typeof served
      return { status: 201, json: drafted({ state: 'ACCEPTED', acceptedRevisionId: '9002',
        preview: null, unavailable: 'Ya está aceptada: lo que hizo está en el proyecto.' }) }
    },
  })

  await assistant(page).getByLabel('Instrucción para el asistente').fill('Pon el color primario en #1a2b3c')
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()
  await expect(assistant(page).getByText('Pone «color-primario» en #1a2b3c')).toBeVisible()

  await assistant(page).getByRole('button', { name: 'Aceptar propuesta' }).click()

  await expect(assistant(page).getByRole('status')).toContainText('Aceptada')
  expect(typeof (accepted as unknown as { idempotencyKey: string }).idempotencyKey).toBe('string')
  // Persistencia: el proyecto que se relee ya trae el token, y la revisión avanzó.
  await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
    .toHaveText('Revisión aceptada 2')
  await expect(page.getByRole('region', { name: 'Tema del proyecto' }))
    .toContainText('color-primario: #1a2b3c')
})

test('rejecting leaves the accepted revision exactly as it was', async ({ page }) => {
  let rejected = false
  await openCanvas(page, {
    proposal: () => drafted(),
    onRejection: () => {
      rejected = true
      return { json: drafted({ state: 'REJECTED', preview: null, unavailable: 'Se descartó.' }) }
    },
  })

  await assistant(page).getByLabel('Instrucción para el asistente').fill('Pon el color primario en #1a2b3c')
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()
  await expect(assistant(page).getByText('Pone «color-primario» en #1a2b3c')).toBeVisible()

  await assistant(page).getByRole('button', { name: 'Descartar propuesta' }).click()

  await expect(assistant(page).getByRole('status')).toContainText('Descartada')
  expect(rejected).toBe(true)
  // Ausencia de efectos: ni la revisión avanzó ni el tema recibió nada.
  await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
    .toHaveText('Revisión aceptada 1')
  await expect(page.getByRole('region', { name: 'Tema del proyecto' })).toContainText('Todavía no hay tokens.')
})
