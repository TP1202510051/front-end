import { expect, test, type Page } from '@playwright/test'

function component(id: string, type: string, properties: Record<string, string>,
  bindings: Record<string, string> = {}, interactions: Record<string, string> = {},
  slots: Record<string, string[]> = {}) {
  return { id, type, properties, bindings, interactions, slots }
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

const contentPage = () => page('historia', 'CONTENT', '/historia', 'seccion', [
  component('seccion', 'content.section',
    { heading: 'Quiénes somos', body: 'Tejemos desde 1998 en Arequipa.' }, {}, {}, { actions: [] }),
])

function projectWith(revisionId: string, number: number, pages: ReturnType<typeof page>[]) {
  return {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-04T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: revisionId, number, registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0', acceptedAt: '2026-09-04T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: number === 1 ? 'VERIFIED_TEMPLATE' : 'MANUAL_BATCH', basedOnRevisionId: null,
      document: {
        schemaVersion: 'project-document@1.1.0', registryVersion: 'textile-store@1.1.0',
        templateVersion: 'verified-textile-start@1.1.0', pages,
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
    { type: 'content.section', properties: {
        heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 },
        body: { type: 'TEXT', required: true, minLength: 1, maxLength: 600 } },
      slots: { actions: { allowedTypes: ['action.link'], minimum: 0, maximum: 1 } },
      bindings: [], interactions: [], constraints: ['TOP_LEVEL_ONLY'] },
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
  await expect(pages(page)).toBeVisible()
}

const pages = (page: Page) => page.getByRole('region', { name: 'Páginas del proyecto' })
const canvas = (page: Page) => page.getByRole('region', { name: 'Canvas del proyecto' })

test('the pages a store must have are listed and cannot be taken away', async ({ page }) => {
  await open(page, () => projectWith('9001', 1, [homePage(), catalogPage()]))

  await expect(pages(page).getByRole('listitem')).toHaveCount(2)
  await expect(pages(page).getByText('/catalogo · obligatoria')).toBeVisible()
  // Quitar una obligatoria no se ofrece: el registro dice cuales lo son.
  await expect(pages(page).getByRole('button', { name: 'Quitar /catalogo' })).toHaveCount(0)
  await expect(pages(page).getByRole('button', { name: 'Quitar /historia' })).toHaveCount(0)
})

test('opening a page shows that page and its own components', async ({ page }) => {
  await open(page, () => projectWith('9002', 2, [homePage(), catalogPage(), contentPage()]))

  await pages(page).getByRole('button', { name: 'Abrir /historia' }).click()

  await expect(page).toHaveURL(/\?page=historia$/)
  await expect(page.getByRole('heading', { name: 'Quiénes somos' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Confecciones Andinas' })).toHaveCount(0)
})

test('a content page is added as a typed operation the registry can accept', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  await open(page, () => projectWith('9001', 1, [homePage(), catalogPage()]), body => {
    sent = body
    return { status: 201, json: projectWith('9002', 2, [homePage(), catalogPage(), contentPage()]) }
  })

  await pages(page).getByLabel('Ruta de la página nueva').fill('/historia')
  await pages(page).getByLabel('Título de la página nueva').fill('Quiénes somos')
  await pages(page).getByRole('button', { name: 'Añadir página' }).click()

  await expect(pages(page).getByRole('listitem')).toHaveCount(3)
  const operations = (sent as unknown as { operations: Record<string, unknown>[] }).operations
  expect(operations[0]).toMatchObject({ kind: 'ADD_PAGE', pageKind: 'CONTENT', path: '/historia' })
  expect((operations[0].component as Record<string, string>).type)
    .toBe('content.section')
})

test('reordering a page emits the typed move and never touches the components', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  await open(page, () => projectWith('9002', 2, [homePage(), catalogPage(), contentPage()]), body => {
    sent = body
    return { status: 201, json: projectWith('9003', 3, [homePage(), contentPage(), catalogPage()]) }
  })

  await pages(page).getByRole('button', { name: 'Subir /historia' }).click()

  const operations = (sent as unknown as { operations: Record<string, unknown>[] }).operations
  expect(operations).toHaveLength(1)
  expect(operations[0]).toMatchObject({ kind: 'MOVE_PAGE', pageId: 'historia', index: 1 })
})

test('removing a content page emits the typed removal', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  await open(page, () => projectWith('9002', 2, [homePage(), catalogPage(), contentPage()]), body => {
    sent = body
    return { status: 201, json: projectWith('9003', 3, [homePage(), catalogPage()]) }
  })

  await pages(page).getByRole('button', { name: 'Quitar /historia' }).click()

  const operations = (sent as unknown as { operations: Record<string, unknown>[] }).operations
  expect(operations[0]).toMatchObject({ kind: 'REMOVE_PAGE', pageId: 'historia' })
})

/**
 * Un enlace lleva a donde dice su interaccion.
 *
 * <p>Antes el renderizador escribia un destino fijo a mano, que es codigo disfrazado de contenido.
 * Ahora sale del documento: la interaccion nombra una pagina y la ruta se lee de ella.
 */
test('a link points where its declared interaction says, not at a hardcoded anchor', async ({ page }) => {
  await open(page, () => projectWith('9001', 1, [homePage(), catalogPage()]))

  await expect(page.getByRole('link', { name: 'Ver colección' })).toHaveAttribute('href', '/catalogo')
})

test('the canvas stays usable at every declared width', async ({ page }) => {
  await open(page, () => projectWith('9001', 1, [homePage(), catalogPage()]))

  for (const width of ['360', '768', '1024', '1440']) {
    await page.getByRole('group', { name: 'Ancho del lienzo' })
      .getByRole('button', { name: width }).click()
    await expect(page.getByRole('heading', { name: 'Confecciones Andinas' })).toBeVisible()
    await expect(canvas(page).getByRole('status')).toBeVisible()
    // Nada de esto ejecuta fuente generada: se dibuja desde el documento.
    await expect(page.locator('script[data-generated]')).toHaveCount(0)
  }
})
