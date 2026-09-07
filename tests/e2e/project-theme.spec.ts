import { expect, test, type Page } from '@playwright/test'

function component(id: string, type: string, properties: Record<string, string>,
  bindings: Record<string, unknown> = {}, interactions: Record<string, string> = {},
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
    { collection: { target: 'EVERYTHING', reference: null, limit: 12, order: 'NEWEST' } }, {}, { actions: ['hero-action'] }),
  component('hero-action', 'action.link', { label: 'Ver colección' }, {}, { activate: 'catalogo' }),
])

const catalogPage = () => page('catalogo', 'CATALOG', '/catalogo', 'catalog-main', [
  component('catalog-main', 'catalog.grid', { heading: 'Toda la colección' },
    { collection: { target: 'EVERYTHING', reference: null, limit: 12, order: 'NEWEST' } }, {}, { actions: [] }),
])

type Theme = {
  tokens: Record<string, string>
  rules: { media?: string, selector: string, declarations: Record<string, string> }[]
}

function projectWith(revisionId: string, number: number, theme: Theme,
  pages: ReturnType<typeof page>[] = [homePage(), catalogPage()]) {
  return {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-05T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: revisionId, number, registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0', acceptedAt: '2026-09-05T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: number === 1 ? 'VERIFIED_TEMPLATE' : 'MANUAL_BATCH', basedOnRevisionId: null,
      document: {
        schemaVersion: 'project-document@1.3.0', registryVersion: 'textile-store@1.1.0',
        templateVersion: 'verified-textile-start@1.1.0', pages,
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

async function open(page: Page, project: () => unknown,
  onAccept?: (body: Record<string, unknown>) => unknown) {
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
    return route.fulfill({ json: project() })
  })
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(editor(page)).toBeVisible()
}

const editor = (page: Page) => page.getByRole('region', { name: 'Tema del proyecto' })
const surface = (page: Page) => page.locator('.abstractify-store')
/** Un <style> no tiene texto visible, asi que se mira su contenido y no lo que se ve. */
const sheetOf = async (page: Page) => (await surface(page).locator('style').textContent()) ?? ''

const brand: Theme = {
  tokens: { 'color-marca': '#1b3a5c' },
  rules: [{ selector: '.abstractify-store .hero', declarations: { color: 'var(--color-marca)' } }],
}

test('a theme token and a stylesheet travel as typed Project operations', async ({ page }) => {
  const sent: Record<string, unknown>[] = []
  await open(page, () => projectWith('9001', 2, brand), body => {
    sent.push(body)
    return { status: 201, json: projectWith('9002', 3, brand) }
  })
  await editor(page).getByLabel('Nombre del token').fill('color-marca')
  await editor(page).getByLabel('Valor del token').fill('#1B3A5C')
  await editor(page).getByRole('button', { name: 'Guardar token' }).click()
  await expect.poll(() => sent.length).toBe(1)
  expect((sent[0].operations as unknown[])[0]).toMatchObject({
    kind: 'SET_THEME_TOKEN', property: 'color-marca', value: '#1B3A5C',
  })
  // Una operacion del proyecto entero no lleva pagina.
  expect((sent[0].operations as Record<string, unknown>[])[0].pageId).toBeUndefined()

  await editor(page).getByLabel('CSS del proyecto').fill('.hero { color: var(--color-marca) }')
  await editor(page).getByRole('button', { name: 'Guardar CSS' }).click()
  await expect.poll(() => sent.length).toBe(2)
  expect((sent[1].operations as unknown[])[0]).toMatchObject({
    kind: 'SET_PROJECT_STYLES', css: '.hero { color: var(--color-marca) }',
  })
})

/**
 * Lo aceptado es lo canonico, y es lo que se ve.
 *
 * <p>El editor reescribe la hoja desde lo que el servidor guardo, no desde lo que se tecleo: si
 * enseñara el texto original, se seguiria editando algo que el proyecto ya no tiene.
 */
test('the accepted stylesheet is what the editor shows and the surface applies', async ({ page }) => {
  await open(page, () => projectWith('9003', 4, brand))
  await expect(editor(page).getByLabel('CSS del proyecto'))
    .toHaveValue('.abstractify-store .hero {\n  color: var(--color-marca);\n}')

  await expect(surface(page)).toHaveAttribute('style', /--color-marca:\s*#1b3a5c/)
  await expect.poll(() => sheetOf(page)).toMatch(/\.abstractify-store \.hero/)

  // Reabrir da lo mismo: lo canonico quedo escrito y no se recalcula al leer.
  await page.reload()
  await expect(editor(page)).toBeVisible()
  await expect.poll(() => sheetOf(page)).toMatch(/\.abstractify-store \.hero/)
})

test('a width media query and an instance override both reach the surface', async ({ page }) => {
  const responsive: Theme = {
    tokens: {},
    rules: [{ media: '(min-width: 768px)', selector: '.abstractify-store .hero',
      declarations: { 'font-size': '2rem' } }],
  }
  const home = homePage()
  home.components[0].styles = { 'border-radius': '12px' }
  await open(page, () => projectWith('9004', 5, responsive, [home, catalogPage()]))

  await expect.poll(() => sheetOf(page)).toMatch(/@media \(min-width: 768px\)/)
  // El estilo propio va despues del CSS del proyecto: con la misma especificidad gana el ultimo.
  await expect.poll(() => sheetOf(page)).toMatch(/data-component-id="hero-main"[\s\S]*border-radius/)
  await expect(surface(page).locator('[data-component-id="hero-main"]')).toBeVisible()
})

/**
 * Lo que no se admite se explica por su sitio, y no puede teñir lo que rodea al Canvas.
 */
test('refused rules are explained precisely and never leak into the surrounding SPA', async ({ page }) => {
  await open(page, () => projectWith('9005', 6, { tokens: {}, rules: [] }), () => ({
    status: 422,
    json: {
      type: 'urn:abstractify:problem:semantic_validation_failed',
      title: 'SEMANTIC_VALIDATION_FAILED', status: 422, code: 'SEMANTIC_VALIDATION_FAILED',
      detail: 'La solicitud no cumple las reglas del proyecto.',
      correlationId: '2b0f2c3e-4d5a-4e6f-8a9b-0c1d2e3f4a5b',
      recoveryAction: 'EDIT_REQUEST',
      operationId: null,
      issues: [
        '$.styles[0] SELECTOR_NOT_ALLOWED',
        '$.styles[1].background VALUE_NOT_ALLOWED',
        // Lo que no tiene forma de sitio y codigo no se pinta, venga de donde venga.
        '$.styles[2] url(javascript:alert(1))',
      ],
    },
  }))
  await editor(page).getByLabel('CSS del proyecto').fill('html { color: red }')
  await editor(page).getByRole('button', { name: 'Guardar CSS' }).click()

  const refused = editor(page).getByRole('list', { name: 'Reglas no admitidas' })
  await expect(refused.getByText(/\$\.styles\[0\]: Ese selector no se admite/)).toBeVisible()
  await expect(refused.getByText(/\$\.styles\[1\]\.background: Ese valor no se admite/)).toBeVisible()
  await expect(refused.getByText(/javascript/)).toHaveCount(0)
  await expect(editor(page).getByRole('alert')).toBeVisible()

  // Nada se pinto: no hay hoja, y el documento sigue siendo el aceptado.
  await expect(surface(page).locator('style')).toHaveCount(0)
  await expect(page.locator('body > style')).toHaveCount(0)
})

test('an inspected revision shows its theme without offering to write over it', async ({ page }) => {
  await open(page, () => projectWith('9006', 7, { tokens: {}, rules: [] }))
  await page.route('**/api/v1/projects/42/revisions/4', route =>
    route.fulfill({ json: projectWith('9003', 4, brand) }))
  await page.goto('/design-interface/42/Tienda?revision=4')

  await expect(editor(page).getByText('Tema guardado en esta revisión. Vuelve a la última para editar.')).toBeVisible()
  await expect(editor(page).getByRole('button', { name: 'Guardar CSS' })).toHaveCount(0)
  await expect(editor(page).getByRole('button', { name: 'Guardar token' })).toHaveCount(0)
  await expect.poll(() => sheetOf(page)).toMatch(/\.abstractify-store \.hero/)
})

/**
 * Un choque del Theme es un choque, no una respuesta incompatible.
 *
 * <p>El Theme es del proyecto entero, asi que su conflicto no nombra pagina. Exigirla degradaba el
 * caso a "actualiza la aplicacion", que le decia a la empresaria que el problema era suyo cuando lo
 * que habia era una decision que tomar.
 */
test('a theme conflict is offered as a decision, not as an incompatible response', async ({ page }) => {
  await open(page, () => projectWith('9007', 8, brand), () => ({
    status: 409,
    json: {
      baseRevisionId: '9007', headRevisionId: '9008',
      conflicts: [{
        kind: 'PROPERTY_CHANGED', pageId: null, componentId: null,
        property: 'color-marca', attempted: '#000000', current: '#1b3a5c',
      }],
    },
  }))
  await editor(page).getByLabel('Nombre del token').fill('color-marca')
  await editor(page).getByLabel('Valor del token').fill('#000000')
  await editor(page).getByRole('button', { name: 'Guardar token' }).click()

  await expect(editor(page).getByRole('alert')).toHaveText(/cambió esto mientras lo editabas/)
  await expect(editor(page).getByRole('alert')).not.toHaveText(/Actualiza la aplicación/)
})
