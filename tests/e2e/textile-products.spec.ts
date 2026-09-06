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

const project = {
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
      theme: { tokens: {}, rules: [] },
    },
  },
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

const soles = (amount: number) => ({ amount, currency: 'PEN' })

function variant(id: string, sku: string, size: string, color: string,
  options: { stock?: number, apart?: number, status?: string } = {}) {
  return {
    id, sku, size, color,
    price: soles(options.apart ?? 5990),
    pricedApart: options.apart !== undefined,
    status: options.status ?? 'ACTIVE',
    stock: options.stock ?? 12,
  }
}

function product(id: string, name: string,
  options: { variants?: ReturnType<typeof variant>[], status?: string, amount?: number } = {}) {
  return {
    id, name, description: 'Prenda de demostracion',
    basePrice: soles(options.amount ?? 5990),
    status: options.status ?? 'ACTIVE',
    variants: options.variants ?? [],
    createdAt: '2026-09-06T10:00:00', updatedAt: '2026-09-06T10:00:00',
  }
}

interface Listing {
  after?: string | null
  items: ReturnType<typeof product>[]
  nextCursor: string | null
}

interface Options {
  pages?: Listing[]
  /**
   * Que contesta el servidor a una escritura, y en que queda el catalogo despues.
   *
   * <p>{@code replace} deja decir lo segundo, porque el panel vuelve a listar despues de escribir y
   * lo que lea entonces tiene que ser el estado nuevo.
   */
  onWrite?: (request: { method: string, url: string, body: unknown },
    replace: (listing: Listing) => void) => unknown
}

function refusal(code: string) {
  return {
    status: 422,
    contentType: 'application/problem+json',
    json: {
      code: 'SEMANTIC_VALIDATION_FAILED', message: 'No se pudo guardar',
      correlationId: '11111111-2222-3333-4444-555555555555',
      issues: [`$.catalog ${code}`],
    },
  }
}

async function open(page: Page, options: Options = {}) {
  // Indexadas por el cursor que las pide, no por el orden de llegada: StrictMode monta dos veces y
  // un fixture que reparte por turnos entregaria la segunda pagina en el arranque. El servidor de
  // verdad tampoco cuenta llamadas, contesta a lo que le preguntan.
  const listings = new Map<string | null, Listing>()
  for (const listing of options.pages ?? [{ items: [], nextCursor: null }]) {
    listings.set(listing.after ?? null, listing)
  }
  const replace = (listing: Listing) => listings.set(listing.after ?? null, listing)
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: publication }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))
  // Playwright resuelve la ultima ruta registrada primero, asi que la generica del proyecto va
  // antes que las especificas: al reves se quedaria con la de productos por coincidir el prefijo.
  await page.route('**/api/v1/projects**', route => route.fulfill({ json: project }))
  await page.route('**/api/v1/projects/42/assets**', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects/42/products**', async route => {
    const request = route.request()
    if (request.method() !== 'GET') {
      const answer = await options.onWrite?.({
        method: request.method(), url: request.url(), body: request.postDataJSON() as unknown,
      }, replace)
      return route.fulfill((answer ?? { json: null }) as Parameters<typeof route.fulfill>[0])
    }
    const after = new URL(request.url()).searchParams.get('after')
    const listing = listings.get(after) ?? { items: [], nextCursor: null }
    return route.fulfill({ json: { items: listing.items, nextCursor: listing.nextCursor } })
  })
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(panel(page)).toBeVisible()
}

const panel = (page: Page) => page.getByRole('region', { name: 'Catálogo de la tienda' })

test('a product lists with its price, its variants and what it has in stock', async ({ page }) => {
  await open(page, { pages: [{ items: [product('7001', 'Polo de algodon', {
    variants: [variant('8001', 'POLO-S-BLA', 'S', 'Blanco', { stock: 12 }),
      variant('8002', 'POLO-L-BLA', 'L', 'Blanco', { stock: 3, apart: 6490 })],
  })], nextCursor: null }] })

  await expect(panel(page).getByText('Polo de algodon')).toBeVisible()
  await expect(panel(page).getByText('PEN 59,90 · 2 variantes · 15 en stock')).toBeVisible()
  // La variante que hereda y la que cobra aparte se distinguen mirando, no adivinando.
  await expect(panel(page).getByText('POLO-S-BLA · S · Blanco · PEN 59,90 (precio de la prenda) · 12 en stock'))
    .toBeVisible()
  await expect(panel(page).getByText('POLO-L-BLA · L · Blanco · PEN 64,90 (precio propio) · 3 en stock'))
    .toBeVisible()
})

/**
 * El precio sale en centimos enteros.
 *
 * <p>Es lo unico que impide que un precio cambie por el camino: un decimal en JSON lo lee el
 * navegador como flotante, y 59,90 deja de ser 59,90 en cuanto se guarda y se vuelve a guardar.
 */
test('a created product sends its price in whole minor units', async ({ page }) => {
  const sent: unknown[] = []
  await open(page, { onWrite: request => { sent.push(request.body); return { status: 201, json: product('7001', 'Casaca') } } })

  await panel(page).getByLabel('Nombre de la prenda').fill('Casaca ligera')
  await panel(page).getByLabel('Descripción').fill('Tejido ligero')
  await panel(page).getByLabel('Precio base', { exact: true }).fill('129.90')
  await panel(page).getByRole('button', { name: 'Añadir prenda' }).click()

  await expect.poll(() => sent.length).toBe(1)
  expect(sent[0]).toEqual({
    name: 'Casaca ligera', description: 'Tejido ligero',
    basePrice: { amount: 12990, currency: 'PEN' },
  })
})

/** Sin precio propio se manda nulo, que es lo que quiere decir "cobra el de la prenda". */
test('a variant that inherits the price says so with a null', async ({ page }) => {
  const sent: unknown[] = []
  await open(page, {
    pages: [{ items: [product('7001', 'Polo de algodon')], nextCursor: null }],
    onWrite: request => { sent.push(request.body); return { status: 201, json: product('7001', 'Polo de algodon') } },
  })

  await panel(page).getByLabel('SKU nuevo').fill('POLO-M-AZU')
  await panel(page).getByLabel('Talla nueva').fill('M')
  await panel(page).getByLabel('Color nuevo').fill('Azul')
  await panel(page).getByLabel('Stock inicial').fill('7')
  await panel(page).getByRole('button', { name: 'Añadir variante' }).click()

  await expect.poll(() => sent.length).toBe(1)
  expect(sent[0]).toEqual({ sku: 'POLO-M-AZU', size: 'M', color: 'Azul', price: null, stock: 7 })
})

/**
 * Cada rechazo dice que cambiar, y no todos se cambian igual.
 *
 * <p>Un SKU repetido se arregla eligiendo otro codigo; una talla repetida se arregla editando la
 * variante que ya existe. Con un solo mensaje para los dos habria que probar cual era.
 */
test('a repeated sku and a repeated size are explained differently', async ({ page }) => {
  await open(page, {
    pages: [{ items: [product('7001', 'Polo de algodon')], nextCursor: null }],
    onWrite: () => refusal('SKU_ALREADY_USED'),
  })

  await panel(page).getByLabel('SKU nuevo').fill('REPETIDO')
  await panel(page).getByLabel('Talla nueva').fill('M')
  await panel(page).getByLabel('Color nuevo').fill('Azul')
  await panel(page).getByRole('button', { name: 'Añadir variante' }).click()

  await expect(panel(page).getByRole('alert'))
    .toHaveText('Ese SKU ya está en uso en esta tienda. Elige otro código.')
})

test('a repeated size and colour points at the variant that already exists', async ({ page }) => {
  await open(page, {
    pages: [{ items: [product('7001', 'Polo de algodon')], nextCursor: null }],
    onWrite: () => refusal('VARIANT_ALREADY_EXISTS'),
  })

  await panel(page).getByLabel('SKU nuevo').fill('OTRO')
  await panel(page).getByLabel('Talla nueva').fill('M')
  await panel(page).getByLabel('Color nuevo').fill('Azul')
  await panel(page).getByRole('button', { name: 'Añadir variante' }).click()

  await expect(panel(page).getByRole('alert'))
    .toHaveText('Ya existe esa talla en ese color. Edita la que hay en vez de repetirla.')
})

/** Retirar no borra: la prenda se sigue viendo, marcada, porque una venta pasada la nombra. */
test('withdrawing a product leaves it visible and marked instead of gone', async ({ page }) => {
  await open(page, {
    pages: [{ items: [product('7001', 'Polo de algodon')], nextCursor: null }],
    onWrite: (request, replace) => {
      const archived = product('7001', 'Polo de algodon', { status: 'ARCHIVED' })
      replace({ items: [archived], nextCursor: null })
      return { json: archived }
    },
  })

  await panel(page).getByRole('button', { name: 'Retirar prenda' }).click()

  await expect(panel(page).getByText('· retirada')).toBeVisible()
  await expect(panel(page).getByText('Polo de algodon')).toBeVisible()
  // Ya no se ofrece: no admite variantes nuevas ni se puede retirar dos veces.
  await expect(panel(page).getByRole('button', { name: 'Retirar prenda' })).toHaveCount(0)
})

/** La pagina siguiente se pide, no se adivina, y el boton desaparece cuando ya no hay mas. */
test('a second page is asked for and appended', async ({ page }) => {
  await open(page, {
    pages: [
      { items: [product('7002', 'Casaca ligera')], nextCursor: '7002' },
      { after: '7002', items: [product('7001', 'Polo de algodon')], nextCursor: null },
    ],
  })

  await expect(panel(page).getByText('Casaca ligera')).toBeVisible()
  await panel(page).getByRole('button', { name: 'Ver más prendas' }).click()

  await expect(panel(page).getByText('Polo de algodon')).toBeVisible()
  await expect(panel(page).getByText('Casaca ligera')).toBeVisible()
  await expect(panel(page).getByRole('button', { name: 'Ver más prendas' })).toHaveCount(0)
})

/**
 * El catalogo de otra tienda no se pinta.
 *
 * <p>El servidor contesta lo ajeno igual que lo que no existe, asi que aqui tampoco se distinguen:
 * un mensaje distinto para cada caso convertiria un identificador en una forma de averiguar que hay
 * al otro lado.
 */
test('a foreign catalogue reads the same as one that is not there', async ({ page }) => {
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: publication }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects**', route => route.fulfill({ json: project }))
  await page.route('**/api/v1/projects/42/assets**', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects/42/products**', route => route.fulfill({
    status: 404, contentType: 'application/problem+json',
    json: { code: 'RESOURCE_NOT_FOUND', message: 'No encontrado',
      correlationId: '11111111-2222-3333-4444-555555555555', issues: [] },
  }))
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')

  await expect(panel(page)).toBeVisible()
  await expect(panel(page).getByText('Polo de algodon')).toHaveCount(0)
  // Y se explica, en vez de ensenar lo que el servidor dijo tal cual.
  await expect(panel(page).getByRole('alert')).toHaveText('Esa prenda ya no está en la tienda.')
})

/**
 * La talla y el color de una variante se corrigen, no solo se miran.
 *
 * <p>Son sus atributos comerciales -lo que la hace ser esa prenda y no otra- y se teclean, asi que
 * se escriben mal. Sin poder editarlos, arreglar una errata obligaria a retirar la variante y
 * crearla de nuevo, perdiendo por el camino su historia.
 */
test('the size and the colour of a variant can be corrected', async ({ page }) => {
  const sent: unknown[] = []
  await open(page, {
    pages: [{ items: [product('7001', 'Polo de algodon', {
      variants: [variant('8001', 'POLO-S-BLA', 'S', 'Blnaco')],
    })], nextCursor: null }],
    onWrite: (request, replace) => {
      sent.push(request.body)
      const fixed = product('7001', 'Polo de algodon', {
        variants: [variant('8001', 'POLO-S-BLA', 'S', 'Blanco')],
      })
      replace({ items: [fixed], nextCursor: null })
      return { json: fixed }
    },
  })

  await panel(page).getByLabel('Color', { exact: true }).fill('Blanco')
  await panel(page).getByRole('button', { name: 'Guardar variante' }).click()

  await expect.poll(() => sent.length).toBe(1)
  expect(sent[0]).toEqual({ sku: 'POLO-S-BLA', size: 'S', color: 'Blanco', price: null, stock: 12 })
  await expect(panel(page).getByText('POLO-S-BLA · S · Blanco · PEN 59,90 (precio de la prenda) · 12 en stock'))
    .toBeVisible()
})

/** La descripcion de la prenda se edita; antes se reenviaba igual que llego. */
test('the product description is editable and not just carried along', async ({ page }) => {
  const sent: unknown[] = []
  await open(page, {
    pages: [{ items: [product('7001', 'Polo de algodon')], nextCursor: null }],
    onWrite: (request, replace) => {
      sent.push(request.body)
      const edited = product('7001', 'Polo de algodon')
      replace({ items: [edited], nextCursor: null })
      return { json: edited }
    },
  })

  await panel(page).getByLabel('Descripción de la prenda').fill('Algodon pima peinado')
  await panel(page).getByRole('button', { name: 'Guardar prenda' }).click()

  await expect.poll(() => sent.length).toBe(1)
  expect(sent[0]).toEqual({
    name: 'Polo de algodon', description: 'Algodon pima peinado',
    basePrice: { amount: 5990, currency: 'PEN' },
  })
})
