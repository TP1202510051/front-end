import { expect, test, type Page } from '@playwright/test'

const EVERYTHING = { target: 'EVERYTHING', reference: null, limit: 12, order: 'NEWEST' }

function component(id: string, type: string, properties: Record<string, string>,
  bindings: Record<string, unknown> = {}, interactions: Record<string, string> = {},
  slots: Record<string, string[]> = {}, styles: Record<string, string> = {}) {
  return { id, type, properties, bindings, interactions, slots, styles }
}

function page(id: string, kind: string, path: string, rootComponentId: string,
  components: ReturnType<typeof component>[]) {
  return { id, kind, path, rootComponentId, components }
}

const homePage = (binding: unknown = EVERYTHING) => page('home', 'HOME', '/', 'hero-main', [
  component('hero-main', 'layout.hero',
    { heading: 'Confecciones Andinas', subheading: 'Prendas listas' },
    { collection: binding }, {}, { actions: ['hero-action'] }),
  component('hero-action', 'action.link', { label: 'Ver colección' }, {}, { activate: 'catalogo' }),
])

const catalogPage = (binding: unknown = EVERYTHING) =>
  page('catalogo', 'CATALOG', '/catalogo', 'catalog-main', [
    component('catalog-main', 'catalog.grid', { heading: 'Toda la colección' },
      { collection: binding }, {}, { actions: [] }),
  ])

/**
 * Los objetivos que este registro de prueba admite.
 *
 * <p>A proposito no son los mismos que publica el registro de verdad: si el SPA los tuviera
 * escritos en vez de leerlos, esta prueba pasaria igualmente y no probaria nada.
 */
const CATALOG_TARGETS = ['COLLECTION', 'CATEGORY', 'EVERYTHING']

const publication = {
  registryVersion: 'textile-store@1.1.0',
  components: [
    { type: 'layout.hero', properties: {
        heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 },
        subheading: { type: 'TEXT', required: true, minLength: 1, maxLength: 160 } },
      slots: { actions: { allowedTypes: ['action.link'], minimum: 1, maximum: 1 } },
      bindings: [{ name: 'collection', source: 'catalog.collection', required: true, targets: CATALOG_TARGETS }],
      interactions: [], constraints: ['TOP_LEVEL_ONLY'] },
    { type: 'action.link', properties: {
        label: { type: 'TEXT', required: true, minLength: 1, maxLength: 40 } },
      slots: {}, bindings: [], interactions: [{ name: 'activate', required: true }], constraints: [] },
    { type: 'catalog.grid', properties: {
        heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 } },
      slots: { actions: { allowedTypes: ['action.link'], minimum: 0, maximum: 2 } },
      bindings: [{ name: 'collection', source: 'catalog.collection', required: true, targets: CATALOG_TARGETS }],
      interactions: [], constraints: ['TOP_LEVEL_ONLY'] },
  ],
  pages: [
    { kind: 'HOME', required: true, path: '/', rootTypes: ['layout.hero'] },
    { kind: 'CATALOG', required: true, path: '/catalogo', rootTypes: ['catalog.grid'] },
    { kind: 'CONTENT', required: false, path: null, rootTypes: ['content.section'] },
  ],
  template: { templateVersion: 'verified-textile-start@1.1.0', composition: {
    schemaVersion: 'registry-composition@1.0.0', registryVersion: 'textile-store@1.1.0',
    templateVersion: 'verified-textile-start@1.1.0',
    pages: [homePage(), catalogPage()],
  } },
}

function project(binding: unknown = EVERYTHING) {
  return {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-06T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: '9001', number: 2, registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0', acceptedAt: '2026-09-06T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: 'MANUAL_BATCH', basedOnRevisionId: null,
      document: {
        schemaVersion: 'project-document@1.4.0', registryVersion: 'textile-store@1.1.0',
        templateVersion: 'verified-textile-start@1.1.0',
        pages: [homePage(binding), catalogPage(binding)], blocks: [], blockInstances: [],
        theme: { tokens: {}, rules: [] },
      },
    },
  }
}

const soles = (amount: number) => ({ amount, currency: 'PEN' })

function product(id: string, name: string, media: string[] = []) {
  return {
    id, name, description: 'Prenda de demostracion', basePrice: soles(5990),
    status: 'ACTIVE', categoryId: null, media, variants: [],
    createdAt: '2026-09-06T10:00:00', updatedAt: '2026-09-06T10:00:00',
  }
}

interface Options {
  binding?: unknown
  categories?: { id: string, name: string }[]
  collections?: { id: string, name: string, productIds: string[] }[]
  products?: ReturnType<typeof product>[]
  resolution?: { products: ReturnType<typeof product>[], outcome: string }
  onResolve?: (url: string) => void
  onWrite?: (body: unknown) => void
  /** La pagina que se abre. La rejilla de catalogo vive en la suya, no en la portada. */
  opened?: string
}

const stamps = { createdAt: '2026-09-06T10:00:00', updatedAt: '2026-09-06T10:00:00' }

async function open(page: Page, options: Options = {}) {
  const catalogue = options.products ?? []
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: publication }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  // Playwright resuelve la ultima ruta registrada primero, asi que la generica va antes.
  await page.route('**/api/v1/projects**', async route => {
    if (route.request().method() === 'POST') {
      options.onWrite?.(route.request().postDataJSON())
      return route.fulfill({ status: 201, json: project(options.binding ?? EVERYTHING) })
    }
    return route.fulfill({ json: project(options.binding ?? EVERYTHING) })
  })
  await page.route('**/api/v1/projects/42/assets**', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects/42/products**', route => route.fulfill({
    json: { items: catalogue, nextCursor: null },
  }))
  await page.route('**/api/v1/projects/42/categories**', route => route.fulfill({
    json: (options.categories ?? []).map(item => ({ ...item, ...stamps })),
  }))
  await page.route('**/api/v1/projects/42/collections**', route => route.fulfill({
    json: (options.collections ?? []).map(item => ({ ...item, ...stamps })),
  }))
  await page.route('**/api/v1/projects/42/catalog/resolution**', route => {
    options.onResolve?.(route.request().url())
    return route.fulfill({ json: options.resolution ?? { products: [], outcome: 'EMPTY' } })
  })
  const opened = options.opened ? `?page=${options.opened}` : ''
  await page.goto(`/design-interface/42/Confecciones%20del%20Sol${opened}`)
  await expect(editor(page)).toBeVisible()
}

const editor = (page: Page) => page.getByRole('region', { name: 'Qué muestra cada sección' })
const organisation = (page: Page) => page.getByRole('region', { name: 'Organización del catálogo' })

/**
 * Solo se ofrece lo que el componente sabe ensenar.
 *
 * <p>Los objetivos salen del registro, no de una lista escrita en el Canvas. Ofrecer uno de mas
 * dejaria guardar una eleccion que el servidor va a rechazar, y quien edita se enteraria despues.
 */
test('the binding editor offers only the targets the registry approves', async ({ page }) => {
  await open(page, { collections: [{ id: '900001', name: 'Destacados', productIds: [] }] })

  const shows = editor(page).getByLabel('Muestra').first()
  await expect(shows.getByRole('option')).toHaveText(
    ['Una colección', 'Una categoría', 'Todo el catálogo'])
  // Una prenda suelta no esta: esta rejilla no sabe ensenarla.
  await expect(shows.getByRole('option', { name: 'Una prenda' })).toHaveCount(0)
})

/** Lo que se elige sale de lo que existe, no de un campo libre donde se pueda escribir cualquier cosa. */
test('what can be chosen comes from the catalogue and never from a free field', async ({ page }) => {
  await open(page, {
    collections: [{ id: '900001', name: 'Destacados', productIds: [] }],
    categories: [{ id: '900002', name: 'Prendas casuales' }],
  })

  const shows = editor(page).getByLabel('Muestra').first()
  await shows.selectOption('COLLECTION')
  await expect(editor(page).getByLabel('Cuál').first().getByRole('option'))
    .toHaveText(['Sin elegir', 'Destacados'])

  await shows.selectOption('CATEGORY')
  await expect(editor(page).getByLabel('Cuál').first().getByRole('option'))
    .toHaveText(['Sin elegir', 'Prendas casuales'])
})

/** La eleccion se guarda como una operacion con su forma, no como un texto. */
test('choosing a collection is saved as a typed operation', async ({ page }) => {
  const sent: unknown[] = []
  await open(page, {
    collections: [{ id: '900001', name: 'Destacados', productIds: [] }],
    onWrite: body => sent.push(body),
  })

  await editor(page).getByLabel('Muestra').first().selectOption('COLLECTION')
  await editor(page).getByLabel('Cuál').first().selectOption('900001')
  await editor(page).getByLabel('Orden').first().selectOption('CURATED')
  await editor(page).getByRole('button', { name: 'Guardar qué muestra' }).first().click()

  await expect.poll(() => sent.length).toBe(1)
  const batch = sent[0] as { operations: Record<string, unknown>[] }
  expect(batch.operations[0]).toMatchObject({
    kind: 'SET_BINDING', pageId: 'home', componentId: 'hero-main', property: 'collection',
    binding: { target: 'COLLECTION', reference: '900001', order: 'CURATED' },
  })
})

/**
 * El orden curado solo se ofrece sobre una coleccion.
 *
 * <p>Es el orden que alguien escribio a mano, y solo una coleccion lo tiene. Ofrecerlo sobre una
 * categoria seria prometer un orden que nadie decidio.
 */
test('the curated order is offered only where a curated order exists', async ({ page }) => {
  await open(page, { categories: [{ id: '900002', name: 'Prendas casuales' }] })

  await editor(page).getByLabel('Muestra').first().selectOption('CATEGORY')
  await expect(editor(page).getByLabel('Orden').first()
    .getByRole('option', { name: 'El orden que decidí' })).toHaveCount(0)
})

/** El Canvas ensena lo que el servidor resuelve, y por eso pregunta en vez de mirar el documento. */
test('the canvas shows what the server resolved and asks it for that', async ({ page }) => {
  const asked: string[] = []
  await open(page, {
    binding: { target: 'COLLECTION', reference: '900001', limit: 6, order: 'CURATED' },
    resolution: { products: [product('7001', 'Polo de algodon'), product('7002', 'Casaca ligera')],
      outcome: 'SHOWING' },
    onResolve: url => asked.push(url),
    opened: 'catalogo',
  })

  await expect(page.getByText('Polo de algodon').first()).toBeVisible()
  await expect.poll(() => asked.length).toBeGreaterThan(0)
  // La eleccion viaja entera en la pregunta: sin esto el servidor resolveria otra cosa.
  expect(asked[0]).toContain('scope=COLLECTION')
  expect(asked[0]).toContain('reference=900001')
  expect(asked[0]).toContain('order=CURATED')
})

/**
 * No ensenar nada no es una sola cosa, y cada una se dice distinto.
 *
 * <p>En la pagina se ven igual y se arreglan de tres maneras: eligiendo, volviendo a crear lo que
 * se borro, o anadiendo mercancia. Sin distinguirlas quien edita tiene que probar.
 */
test('each way of showing nothing says which one it is', async ({ page }) => {
  await open(page, { resolution: { products: [], outcome: 'UNCHOSEN' }, opened: 'catalogo' })
  await expect(page.getByText('Todavía no has elegido qué muestra esta sección.').first()).toBeVisible()
})

test('a chosen target that is gone says so instead of looking empty', async ({ page }) => {
  await open(page, {
    binding: { target: 'COLLECTION', reference: '900009', limit: 12, order: 'CURATED' },
    resolution: { products: [], outcome: 'MISSING' }, opened: 'catalogo',
  })
  await expect(page.getByText('Lo que esta sección mostraba ya no está en la tienda. Elige otra cosa.')
    .first()).toBeVisible()
})

test('a chosen target with nothing to offer reads differently again', async ({ page }) => {
  await open(page, {
    binding: { target: 'COLLECTION', reference: '900001', limit: 12, order: 'CURATED' },
    resolution: { products: [], outcome: 'EMPTY' }, opened: 'catalogo',
  })
  await expect(page.getByText('Lo que elegiste no tiene prendas que ofrecer ahora mismo.')
    .first()).toBeVisible()
})

/** Una categoria clasifica y una coleccion cura: se dicen distinto porque son cosas distintas. */
test('categories and collections are presented as the different things they are', async ({ page }) => {
  await open(page, {
    categories: [{ id: '900002', name: 'Prendas casuales' }],
    collections: [{ id: '900001', name: 'Destacados', productIds: ['7001'] }],
    products: [product('7001', 'Polo de algodon')],
  })

  await expect(organisation(page).getByText('Clasifican: cada prenda pertenece a una sola.')).toBeVisible()
  await expect(organisation(page)
    .getByText('Curan: una prenda está en las que haga falta, en el orden que elijas.')).toBeVisible()
  await expect(organisation(page).getByText('Destacados · 1 prendas')).toBeVisible()
})
