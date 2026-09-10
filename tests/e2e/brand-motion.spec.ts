import { expect, test, type Page } from '@playwright/test'

function component(id: string, type: string, properties: Record<string, string>,
  bindings: Record<string, unknown> = {}, interactions: Record<string, string> = {},
  slots: Record<string, string[]> = {}, styles: Record<string, string> = {}) {
  return { id, type, properties, bindings, interactions, slots, styles }
}

const EVERYTHING = { target: 'EVERYTHING', reference: null, limit: 12, order: 'NEWEST' }

const homePage = (heroStyles: Record<string, string> = {}) => ({
  id: 'home', kind: 'HOME', path: '/', rootComponentId: 'hero-main',
  components: [
    component('hero-main', 'layout.hero',
      { heading: 'Confecciones Andinas', subheading: 'Prendas listas' },
      { collection: EVERYTHING }, {}, { actions: ['hero-action'] }, heroStyles),
    component('hero-action', 'action.link', { label: 'Ver colección' }, {}, { activate: 'catalogo' }),
  ],
})

const catalogPage = () => ({
  id: 'catalogo', kind: 'CATALOG', path: '/catalogo', rootComponentId: 'catalog-main',
  components: [component('catalog-main', 'catalog.grid', { heading: 'Toda la colección' },
    { collection: EVERYTHING }, {}, { actions: [] })],
})

type KeyframeSet = { name: string, frames: { offsets: string[], declarations: Record<string, string> }[] }
type Theme = {
  tokens: Record<string, string>
  rules: { media?: string, selector: string, declarations: Record<string, string> }[]
  keyframes?: KeyframeSet[]
}

/** Un movimiento ya canonico: el nombre llega acotado y los pasos normalizados. */
const APARECER: KeyframeSet = {
  name: 'abstractify-store-aparecer',
  frames: [
    { offsets: ['0%'], declarations: { opacity: '0', transform: 'translatey(8px)' } },
    { offsets: ['100%'], declarations: { opacity: '1' } },
  ],
}

const moving: Theme = {
  tokens: {},
  rules: [{ selector: '.abstractify-store .hero',
    declarations: { animation: 'abstractify-store-aparecer 600ms ease-out both', transform: 'rotate(-1deg)' } }],
  keyframes: [APARECER],
}

function projectWith(revisionId: string, number: number, theme: Theme,
  schemaVersion = 'project-document@1.5.0', heroStyles: Record<string, string> = {}) {
  return {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-09T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: revisionId, number, registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0', acceptedAt: '2026-09-09T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: number === 1 ? 'VERIFIED_TEMPLATE' : 'MANUAL_BATCH', basedOnRevisionId: null,
      document: {
        schemaVersion, registryVersion: 'textile-store@1.1.0',
        templateVersion: 'verified-textile-start@1.1.0', pages: [homePage(heroStyles), catalogPage()],
        blocks: [], blockInstances: [], theme,
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
      bindings: [{ name: 'collection', source: 'catalog.collection', required: true, targets: ['COLLECTION', 'CATEGORY', 'EVERYTHING'] }],
      interactions: [], constraints: ['TOP_LEVEL_ONLY'] },
    { type: 'action.link', properties: {
        label: { type: 'TEXT', required: true, minLength: 1, maxLength: 40 } },
      slots: {}, bindings: [], interactions: [{ name: 'activate', required: true }], constraints: [] },
    { type: 'catalog.grid', properties: {
        heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 } },
      slots: { actions: { allowedTypes: ['action.link'], minimum: 0, maximum: 2 } },
      bindings: [{ name: 'collection', source: 'catalog.collection', required: true, targets: ['COLLECTION', 'CATEGORY', 'EVERYTHING'] }],
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

function refusal(issues: string[]) {
  return {
    status: 422,
    json: {
      type: 'urn:abstractify:problem:semantic_validation_failed',
      title: 'SEMANTIC_VALIDATION_FAILED', status: 422, code: 'SEMANTIC_VALIDATION_FAILED',
      detail: 'La solicitud no cumple las reglas del proyecto.',
      correlationId: '11111111-2222-3333-4444-555555555555',
      recoveryAction: 'EDIT_REQUEST', operationId: null, issues,
    },
  }
}

async function route(page: Page, project: () => unknown,
  onAccept?: (body: Record<string, unknown>) => unknown, revisions: Record<string, unknown> = {}) {
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: publication }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects**', async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (path === '/api/v1/projects/42/revisions' && request.method() === 'POST') {
      return route.fulfill(await onAccept!(request.postDataJSON()) as Parameters<typeof route.fulfill>[0])
    }
    if (path === '/api/v1/projects/42/revisions') {
      return route.fulfill({ json: { items: [], nextCursor: null } })
    }
    const inspected = path.match(/\/revisions\/(\d+)$/)
    if (inspected && revisions[inspected[1]]) return route.fulfill({ json: revisions[inspected[1]] })
    if (path.endsWith('/readiness')) return route.fulfill({ status: 404, json: { code: 'RESOURCE_NOT_FOUND' } })
    return route.fulfill({ json: project() })
  })
}

async function open(page: Page, project: () => unknown,
  onAccept?: (body: Record<string, unknown>) => unknown, revisions: Record<string, unknown> = {}) {
  await route(page, project, onAccept, revisions)
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(editor(page)).toBeVisible()
}

const editor = (page: Page) => page.getByRole('region', { name: 'Tema del proyecto' })
const surface = (page: Page) => page.locator('.abstractify-store')
const sheetOf = async (page: Page) => (await surface(page).locator('style').textContent()) ?? ''

/**
 * Lo aceptado se pinta: el movimiento y el giro llegan a la superficie tal como el servidor los guardo.
 *
 * <p>Nada se interpreta aqui. El nombre del keyframe ya viene acotado y la regla ya cita ese nombre;
 * la SPA solo los escribe en la hoja, en el orden en que se leen a mano: primero el movimiento, luego
 * quien lo cita.
 */
test('an accepted keyframe set and its animation reach the store surface as they were stored', async ({ page }) => {
  await open(page, () => projectWith('9001', 2, moving))

  const sheet = await sheetOf(page)
  expect(sheet).toMatch(/@keyframes abstractify-store-aparecer \{[\s\S]*0% \{[\s\S]*transform: translatey\(8px\)/)
  expect(sheet).toMatch(/\.abstractify-store \.hero \{[\s\S]*animation: abstractify-store-aparecer 600ms ease-out both/)
  expect(sheet).toMatch(/transform: rotate\(-1deg\)/)
  expect(sheet.indexOf('@keyframes')).toBeLessThan(sheet.indexOf('.abstractify-store .hero'))
})

/**
 * Quien pide menos movimiento lo obtiene, sea cual sea la marca.
 *
 * <p>Es una regla de la superficie y no del documento: nadie la escribio y no es por proyecto. Va la
 * ultima y con !important porque tiene que ganar a lo que la marca declare.
 */
test('the surface always closes with the reduced-motion rule, after every brand declaration', async ({ page }) => {
  await open(page, () => projectWith('9001', 2, moving))

  const sheet = await sheetOf(page)
  expect(sheet.trimEnd()).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*animation-duration: 0\.001ms !important;[\s\S]*\}\s*\}$/)
  expect(sheet.lastIndexOf('.abstractify-store .hero')).toBeLessThan(sheet.indexOf('prefers-reduced-motion'))
})

/** Los movimientos declarados se ensenan, para citarlos eligiendo y no de memoria. */
test('the editor lists the keyframe sets the document declares and offers them for an animation', async ({ page }) => {
  await open(page, () => projectWith('9001', 2, moving))

  await expect(editor(page).getByLabel('Movimientos declarados'))
    .toContainText('abstractify-store-aparecer · 2 pasos')
  await editor(page).getByLabel('Propiedad').fill('animation')
  const options = editor(page).locator('datalist#movimientos-declarados option')
  await expect(options).toHaveCount(1)
  await expect(options.first()).toHaveAttribute('value', 'abstractify-store-aparecer')
  await expect(editor(page).getByLabel('Valor', { exact: true })).toHaveAttribute('list', 'movimientos-declarados')
})

/**
 * El CSS canonico que se ensena para editar lleva los movimientos, y se envia tal cual.
 *
 * <p>Es el recorrido real: se ve lo aceptado, se toca una linea y se guarda el texto que se estaba
 * viendo. Ese texto lleva los nombres ya acotados, y el servidor los reconoce como suyos.
 */
test('the canonical sheet shown for editing carries the keyframes and travels verbatim', async ({ page }) => {
  const sent: Record<string, unknown>[] = []
  await open(page, () => projectWith('9001', 2, moving), body => {
    sent.push(body)
    return { status: 201, json: projectWith('9002', 3, moving) }
  })

  const shown = await editor(page).getByLabel('CSS del proyecto').inputValue()
  expect(shown).toContain('@keyframes abstractify-store-aparecer {\n  0% {\n    opacity: 0;')
  expect(shown).toContain('animation: abstractify-store-aparecer 600ms ease-out both;')
  await editor(page).getByRole('button', { name: 'Guardar CSS' }).click()

  await expect.poll(() => sent.length).toBe(1)
  expect((sent[0].operations as unknown[])[0]).toMatchObject({ kind: 'SET_PROJECT_STYLES', css: shown })
})

/** Cada negativa dice que cambiar, sin repetir lo que se escribio ni el codigo crudo. */
test('each motion refusal is explained precisely and names its place', async ({ page }) => {
  const cases = [
    { issue: '$.styles[0].animation KEYFRAMES_UNKNOWN', text: /cita un movimiento que el proyecto no declara/i },
    { issue: '$.styles[0] KEYFRAMES_NAME_INVALID', text: /nombre del movimiento no vale/i },
    { issue: '$.styles[0] KEYFRAME_OFFSET_NOT_ALLOWED', text: /from, to o un porcentaje/i },
    { issue: '$.styles[1] KEYFRAMES_DUPLICATED', text: /Ya hay un movimiento con ese nombre/ },
    { issue: '$.styles[0].transform VALUE_NOT_ALLOWED', text: /Ese valor no se admite/ },
  ]
  for (const { issue, text } of cases) {
    await open(page, () => projectWith('9001', 2, { tokens: {}, rules: [], keyframes: [] }), () => refusal([issue]))
    await editor(page).getByLabel('CSS del proyecto').fill('.hero { animation: fantasma 1s }')
    await editor(page).getByRole('button', { name: 'Guardar CSS' }).click()

    const refused = editor(page).getByLabel('Reglas no admitidas')
    await expect(refused).toContainText(text)
    await expect(refused).toContainText(issue.slice(0, issue.lastIndexOf(' ')))
    await expect(refused).not.toContainText(issue.slice(issue.lastIndexOf(' ') + 1))
    await expect(refused).not.toContainText('fantasma')
  }
})

/**
 * Quitar un movimiento que un componente cita se niega, y la negativa dice que declaracion lo cita.
 *
 * <p>Es la misma proteccion que tiene un token en uso: sin ella la tienda dejaria de moverse sin
 * que nadie hubiera decidido que dejara de moverse. Decir donde esta la cita es lo que permite ir a
 * quitarla.
 */
test('removing a cited keyframe set is refused and the refusal points at the citing declaration', async ({ page }) => {
  await open(page,
    () => projectWith('9001', 2, moving, 'project-document@1.5.0', { animation: 'abstractify-store-aparecer 1s' }),
    () => refusal(['$.pages.home.components.hero-main.styles.animation KEYFRAMES_IN_USE']))

  await editor(page).getByLabel('CSS del proyecto').fill('.hero { color: red }')
  await editor(page).getByRole('button', { name: 'Guardar CSS' }).click()

  const refused = editor(page).getByLabel('Reglas no admitidas')
  await expect(refused).toContainText('$.pages.home.components.hero-main.styles.animation')
  await expect(refused).toContainText('Un componente todavía lo usa')
  // Y lo aceptado sigue en pantalla: la negativa no deja nada a medias.
  await expect.poll(() => sheetOf(page)).toMatch(/@keyframes abstractify-store-aparecer/)
})

/**
 * Inspeccionar una revision anterior ensena su movimiento sin ofrecer escribir encima.
 *
 * <p>Una revision aceptada es inmutable: lo que se ve es lo que se movia entonces, y la unica salida
 * es volver a la ultima.
 */
test('inspecting an earlier revision shows its motion read-only', async ({ page }) => {
  const still: Theme = { tokens: {}, rules: [], keyframes: [] }
  await open(page, () => projectWith('9002', 3, still), undefined,
    { '2': projectWith('9001', 2, moving) })

  await page.goto('/design-interface/42/Confecciones%20del%20Sol?revision=2')

  await expect(editor(page)).toContainText('Tema guardado en esta revisión. Vuelve a la última para editar.')
  await expect(editor(page).locator('pre')).toContainText('@keyframes abstractify-store-aparecer')
  await expect(editor(page).getByRole('button', { name: 'Guardar CSS' })).toHaveCount(0)
  await expect.poll(() => sheetOf(page)).toMatch(/animation: abstractify-store-aparecer 600ms/)
})

/**
 * Un documento anterior a los keyframes se abre sin ninguno; uno que dice ser del esquema que los
 * estrena y no los trae no es compatible y se rechaza entero.
 */
test('older documents open without keyframes and a new one that omits them is refused', async ({ page }) => {
  await open(page, () => projectWith('9001', 2, { tokens: {}, rules: [] }, 'project-document@1.4.0'))
  await expect(editor(page)).toContainText('Todavía no hay movimientos.')

  await page.route('**/api/v1/projects**', route => route.fulfill({
    json: projectWith('9001', 2, { tokens: {}, rules: [] }, 'project-document@1.5.0'),
  }))
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(page.getByRole('alert')).toContainText('La respuesta del servicio no es compatible.')
})

/**
 * Un nombre de movimiento que no tiene la forma acotada no se pinta.
 *
 * <p>Llega ya validado del servidor, y aqui solo se comprueba la forma: pero un nombre que no la tiene
 * acabaria escrito en una hoja de estilos sin que ningun selector lo hubiera acotado.
 */
test('a keyframe set whose name is not scoped is not believed', async ({ page }) => {
  await route(page, () => projectWith('9001', 2, {
    tokens: {}, rules: [], keyframes: [{ ...APARECER, name: 'spin' }],
  }))
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')

  await expect(page.getByRole('alert')).toContainText('La respuesta del servicio no es compatible.')
})
