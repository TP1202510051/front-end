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
    proposalId: PROPOSAL, projectId: '42', state: 'DRAFTED', outcome: 'CHANGE_AVAILABLE',
    instruction: 'Pon el color primario en #1a2b3c', baseRevisionId: '9001',
    scope: 'PROJECT', scopePageId: null, scopeComponentId: null,
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
  onCancellation?: () => unknown
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
        state: 'ACCEPTED', outcome: 'ACCEPTED', acceptedRevisionId: '9002', preview: null,
        unavailable: 'Ya está aceptada: lo que hizo está en el proyecto.',
      }) })))(request.postDataJSON())
      return route.fulfill(outcome as Parameters<typeof route.fulfill>[0])
    }
    if (pathname.endsWith('/rejection')) {
      const outcome = await (routes.onRejection ?? (() => ({ json: drafted({
        state: 'REJECTED', outcome: 'REJECTED', preview: null, unavailable: 'Se descartó.',
      }) })))()
      return route.fulfill(outcome as Parameters<typeof route.fulfill>[0])
    }
    if (pathname.endsWith('/cancellation')) {
      const outcome = await (routes.onCancellation ?? (() => ({ json: drafted({
        state: 'CANCELLED', outcome: 'CANCELLED', preview: null,
        unavailable: 'Se canceló antes de terminar.',
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
    proposal: () => { asked += 1; return drafted({ state: 'PENDING', outcome: 'WORKING', preview: null, effects: [],
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

test('speech transcription stays editable and never submits until explicit confirmation', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  await page.addInitScript(() => {
    class FakeSpeechRecognition {
      lang = ''; continuous = false; interimResults = false; maxAlternatives = 1
      onstart: ((event: Event) => void) | null = null
      onend: ((event: Event) => void) | null = null
      onerror: ((event: Event) => void) | null = null
      onresult: ((event: Event) => void) | null = null
      start() { (window as unknown as { recognition: FakeSpeechRecognition }).recognition = this; this.onstart?.(new Event('start')) }
      stop() { this.onend?.(new Event('end')) }
      abort() { this.onend?.(new Event('end')) }
    }
    ;(window as unknown as { SpeechRecognition: typeof FakeSpeechRecognition }).SpeechRecognition = FakeSpeechRecognition
  })
  await openCanvas(page, {
    proposal: () => drafted(),
    onPropose: body => { sent = body as Record<string, unknown>; return {
      status: 202, json: { operationId: OPERATION, proposalId: PROPOSAL },
    } },
  })

  await assistant(page).getByRole('button', { name: 'Dictar instrucción' }).click()
  await page.evaluate(() => {
    const recognition = (window as unknown as { recognition: {
      onresult: ((event: unknown) => void) | null, onend: ((event: Event) => void) | null,
    } }).recognition
    recognition.onresult?.({ resultIndex: 0, results: {
      0: { 0: { transcript: 'Pon el color primario en azul', confidence: 1 }, length: 1, isFinal: true },
      length: 1,
    } })
    recognition.onend?.(new Event('end'))
  })

  const input = assistant(page).getByLabel('Instrucción para el asistente')
  await expect(input).toHaveValue('Pon el color primario en azul')
  expect(sent).toBeNull()
  await input.fill('Pon el color primario en #1a2b3c')
  expect(sent).toBeNull()
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()
  await expect.poll(() => sent).toMatchObject({ instruction: 'Pon el color primario en #1a2b3c' })
})

test('without browser speech recognition the complete text workflow remains available', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  await page.addInitScript(() => {
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  })
  await openCanvas(page, {
    proposal: () => drafted(),
    onPropose: body => { sent = body as Record<string, unknown>; return {
      status: 202, json: { operationId: OPERATION, proposalId: PROPOSAL },
    } },
  })

  await expect(assistant(page).getByText('El dictado no está disponible; puedes escribir la instrucción completa.'))
    .toBeVisible()
  await assistant(page).getByLabel('Instrucción para el asistente').fill('Pon el color primario en #abcdef')
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()
  await expect.poll(() => sent).toMatchObject({ instruction: 'Pon el color primario en #abcdef' })
})

test('a speech recognition failure preserves the instruction already typed', async ({ page }) => {
  await page.addInitScript(() => {
    class FailingSpeechRecognition {
      lang = ''; continuous = false; interimResults = false; maxAlternatives = 1
      onstart: ((event: Event) => void) | null = null
      onend: ((event: Event) => void) | null = null
      onerror: ((event: Event) => void) | null = null
      onresult: ((event: Event) => void) | null = null
      start() { this.onstart?.(new Event('start')); this.onerror?.(new Event('error')); this.onend?.(new Event('end')) }
      stop() { this.onend?.(new Event('end')) }
      abort() { this.onend?.(new Event('end')) }
    }
    ;(window as unknown as { SpeechRecognition: typeof FailingSpeechRecognition }).SpeechRecognition = FailingSpeechRecognition
  })
  await openCanvas(page, { proposal: () => drafted() })
  const input = assistant(page).getByLabel('Instrucción para el asistente')
  await input.fill('Texto que debe conservarse')

  await assistant(page).getByRole('button', { name: 'Dictar instrucción' }).click()

  await expect(input).toHaveValue('Texto que debe conservarse')
  await expect(assistant(page).getByText('No se pudo completar el dictado. La instrucción escrita sigue disponible.'))
    .toBeVisible()
})

test('a pending assistant request can be cancelled without changing the accepted revision', async ({ page }) => {
  let cancelled = false
  await openCanvas(page, {
    proposal: () => drafted({ state: 'PENDING', outcome: 'WORKING', preview: null, effects: [],
      modelSummary: null, unavailable: 'Todavía se está redactando.' }),
    onCancellation: () => {
      cancelled = true
      return { json: drafted({ state: 'CANCELLED', outcome: 'CANCELLED', preview: null,
        effects: [], modelSummary: null, unavailable: 'Se canceló antes de terminar.' }) }
    },
  })

  await assistant(page).getByLabel('Instrucción para el asistente').fill('Pon el color primario en #1a2b3c')
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()
  await assistant(page).getByRole('button', { name: 'Cancelar solicitud' }).click()

  await expect(assistant(page).getByRole('status')).toContainText('Solicitud cancelada')
  expect(cancelled).toBe(true)
  await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
    .toHaveText('Revisión aceptada 1')
})

for (const stable of [
  ['CLARIFICATION_REQUIRED', 'Necesito una aclaración antes de proponer cambios.'],
  ['NO_CHANGE', 'La instrucción no produciría cambios.'],
  ['UNSUPPORTED', 'No puedo aplicar esa instrucción de forma segura.'],
  ['STALE_CONTEXT', 'El proyecto cambió desde que se redactó. Pide una propuesta nueva.'],
] as const) {
  test(`assistant outcome ${stable[0]} is shown without an applicable change`, async ({ page }) => {
    await openCanvas(page, { proposal: () => drafted({ outcome: stable[0], preview: null,
      effects: [], losses: [], destructive: false, unavailable: 'Detalle seguro.' }) })

    await assistant(page).getByLabel('Instrucción para el asistente').fill('Una instrucción')
    await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()

    await expect(assistant(page).getByText(stable[1])).toBeVisible()
    await expect(assistant(page).getByRole('button', { name: 'Aceptar propuesta' })).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
      .toHaveText('Revisión aceptada 1')
  })
}

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
        outcome: 'ACCEPTED', preview: null,
        unavailable: 'Ya está aceptada: lo que hizo está en el proyecto.' }) }
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
      return { json: drafted({ state: 'REJECTED', outcome: 'REJECTED', preview: null,
        unavailable: 'Se descartó.' }) }
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

/**
 * Cada resultado estable se enseña tal cual y ninguno ofrece aceptar.
 *
 * <p>Es lo que separa "no se pudo" de "no se hizo": el SPA no interpreta la frase del modelo, pinta
 * el resultado que el backend fija. Y ninguno de estos deja un boton que escriba una revision, que
 * es la mitad que de verdad importa.
 */
for (const outcome of [
  { name: 'CLARIFICATION_REQUIRED', shown: 'Necesito una aclaración antes de proponer cambios.' },
  { name: 'NO_CHANGE', shown: 'La instrucción no produciría cambios.' },
  { name: 'UNSUPPORTED', shown: 'No puedo aplicar esa instrucción de forma segura.' },
  { name: 'STALE_CONTEXT', shown: 'El proyecto cambió desde que se redactó. Pide una propuesta nueva.' },
]) {
  test(`a ${outcome.name} proposal shows its outcome and offers nothing to accept`, async ({ page }) => {
    await openCanvas(page, {
      proposal: () => drafted({
        outcome: outcome.name, effects: [], losses: [], destructive: false,
        operations: [], preview: null,
        modelSummary: 'lo que el modelo dijo, que no es lo que se pinta',
      }),
    })

    await assistant(page).getByLabel('Instrucción para el asistente').fill('Ponlo más chévere')
    await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()

    await expect(assistant(page).getByText(outcome.shown)).toBeVisible()
    await expect(assistant(page).getByRole('button', { name: 'Aceptar propuesta' })).toHaveCount(0)
    await expect(assistant(page).getByRole('button', { name: 'Ver la propuesta en el Canvas' })).toHaveCount(0)
    // Y el proyecto sigue donde estaba: ninguno de estos caminos escribe nada.
    await expect(page.getByRole('region', { name: 'Canvas del proyecto' }).getByRole('status'))
      .toHaveText('Revisión aceptada 1')
  })
}

/**
 * El alcance se elige entre lo que hay -proyecto, pagina abierta, un componente de ella- y el
 * componente se elige por su nombre, no tecleando una identidad. Lo elegido se ve antes de pedir,
 * y viaja tal cual: pagina y componente van con la instruccion.
 */
test('an instruction can be aimed at one component of the open page and the aim is visible before sending', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  await openCanvas(page, {
    proposal: () => drafted({ scope: 'COMPONENT', scopePageId: 'home', scopeComponentId: 'hero-action',
      instruction: 'Cambia la etiqueta a «Ver todo»',
      effects: ['Cambia «label» del componente «hero-action» en «home»'], preview: null }),
    onPropose: body => { sent = body as Record<string, unknown>; return {
      status: 202, json: { operationId: OPERATION, proposalId: PROPOSAL },
    } },
  })
  await page.getByRole('region', { name: 'Páginas del proyecto' }).getByRole('button', { name: 'Abrir /', exact: true }).click()

  const aim = assistant(page).getByLabel('Alcance de la instrucción')
  await expect(aim).toHaveText('Apuntando a: todo el proyecto')
  await assistant(page).getByLabel('Sólo esta página').check()
  await expect(aim).toHaveText('Apuntando a: sólo la página «home»')
  await assistant(page).getByLabel('Sólo un componente de esta página').check()
  await assistant(page).getByLabel('Componente elegido').selectOption({ label: 'Ver colección (hero-action)' })
  await expect(aim).toHaveText('Apuntando a: el componente «hero-action» de la página «home» y lo que cuelga de él')

  await assistant(page).getByLabel('Instrucción para el asistente').fill('Cambia la etiqueta a «Ver todo»')
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()

  await expect.poll(() => sent).toMatchObject({ scope: 'COMPONENT', scopePageId: 'home', scopeComponentId: 'hero-action' })
  // Y la propuesta leida dice a que apuntaba, con las mismas palabras.
  await expect(assistant(page).getByLabel('Alcance de la propuesta'))
    .toHaveText('Apuntada a: el componente «hero-action» de la página «home» y lo que cuelga de él')
})

test('the aim stays visible while dictating', async ({ page }) => {
  await page.addInitScript(() => {
    class IdleSpeechRecognition {
      lang = ''; continuous = false; interimResults = false; maxAlternatives = 1
      onstart: ((event: Event) => void) | null = null
      onend: ((event: Event) => void) | null = null
      onerror: ((event: Event) => void) | null = null
      onresult: ((event: Event) => void) | null = null
      start() { this.onstart?.(new Event('start')) }
      stop() { this.onend?.(new Event('end')) }
      abort() { this.onend?.(new Event('end')) }
    }
    ;(window as unknown as { SpeechRecognition: typeof IdleSpeechRecognition }).SpeechRecognition = IdleSpeechRecognition
  })
  await openCanvas(page, { proposal: () => drafted() })
  await page.getByRole('region', { name: 'Páginas del proyecto' }).getByRole('button', { name: 'Abrir /', exact: true }).click()
  await assistant(page).getByLabel('Sólo un componente de esta página').check()

  await assistant(page).getByRole('button', { name: 'Dictar instrucción' }).click()

  await expect(assistant(page).getByRole('button', { name: 'Escuchando…' })).toBeVisible()
  await expect(assistant(page).getByLabel('Alcance de la instrucción'))
    .toHaveText('Apuntando a: el componente «hero-main» de la página «home» y lo que cuelga de él')
})

/**
 * Una negativa por alcance dice que quedo fuera y donde, con el codigo traducido a palabras. Lo
 * que llega del servidor ya viene sin la forma interna de la operacion; aqui se comprueba que el
 * panel tampoco la anade y que el codigo no se ensena en crudo.
 */
test('a refusal caused by scope says what fell outside and where', async ({ page }) => {
  await openCanvas(page, { proposal: () => drafted({
    scope: 'COMPONENT', scopePageId: 'home', scopeComponentId: 'hero-action',
    effects: ['Cambia «label» del componente «hero-action» en «home»'],
    refused: [
      'OUTSIDE_SCOPE: Cambia «heading» del componente «hero-main» en «home» queda fuera del componente «hero-action» de la página «home»',
      'BELONGS_TO_NO_PAGE: Pone «color-primario» en #123456 no vive en ninguna página; sólo una instrucción sobre el proyecto entero lo alcanza',
    ],
  }) })

  await assistant(page).getByLabel('Instrucción para el asistente').fill('Cambia varias cosas')
  await assistant(page).getByRole('button', { name: 'Pedir propuesta' }).click()

  const refused = assistant(page).getByRole('list', { name: 'Lo que no se admitió' })
  await expect(refused.getByRole('listitem')).toHaveCount(2)
  await expect(refused).toContainText('Fuera del alcance: Cambia «heading» del componente «hero-main» en «home» queda fuera del componente «hero-action» de la página «home»')
  await expect(refused).toContainText('No está en ninguna página: Pone «color-primario» en #123456')
  await expect(refused).not.toContainText('OUTSIDE_SCOPE')
  await expect(refused).not.toContainText('BELONGS_TO_NO_PAGE')
  await expect(refused).not.toContainText('SetProperty')
})
