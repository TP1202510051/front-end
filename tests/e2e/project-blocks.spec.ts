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
/** La página abierta, dibujada desde el registro: es donde se ve lo que una edición cambió. */
const rendered = (page: Page) => page.getByRole('region', { name: 'Contenido' })

test('an accepted component can become a named Project block', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  await open(page, () => projectWith('9001', 1, [homePage(), catalogPage()]), body => {
    sent = body
    return { status: 201, json: projectWith('9002', 2, [homePage(), catalogPage()]) }
  })
  const blocks = page.getByRole('region', { name: 'Bloques del proyecto' })
  await blocks.getByLabel('Nombre del bloque').fill('Portada compartida')
  await blocks.getByRole('button', { name: 'Crear bloque' }).click()
  await expect.poll(() => sent).not.toBeNull()
  expect((sent as unknown as { operations: unknown[] }).operations).toEqual([
    expect.objectContaining({ kind: 'CREATE_BLOCK', pageId: 'home', componentId: 'hero-main', name: 'Portada compartida' }),
  ])
})

function linkedProject(detached = false, heading = 'Quiénes somos', number = 3) {
  const first = contentPage()
  first.components[0].properties.heading = heading
  const second = structuredClone(first)
  second.id = 'equipo'; second.path = '/equipo'
  second.rootComponentId = 'copy:seccion'; second.components[0].id = 'copy:seccion'
  // Una página sin instancias, que es donde colocar un bloque como raíz no destruye nada.
  const free = structuredClone(first)
  free.id = 'contacto'; free.path = '/contacto'
  free.rootComponentId = 'seccion-contacto'; free.components[0].id = 'seccion-contacto'
  const project = projectWith(String(9000 + number), number,
    [homePage(), catalogPage(), first, second, free])
  return { ...project, acceptedRevision: { ...project.acceptedRevision, document: {
    ...project.acceptedRevision.document,
    blocks: [{ id: 'about', name: 'Nuestra historia', rootComponentId: 'seccion', components: first.components }],
    blockInstances: [
      { id: 'original', blockId: 'about', pageId: 'historia', rootComponentId: 'seccion', componentIds: { seccion: 'seccion' }, detached: false },
      { id: 'copy', blockId: 'about', pageId: 'equipo', rootComponentId: 'copy:seccion', componentIds: { seccion: 'copy:seccion' }, detached },
    ],
  } } }
}

test('shared editing shows affected pages and detachment requires an explicit decision', async ({ page }) => {
  let project = linkedProject()
  const requests: Record<string, unknown>[] = []
  await open(page, () => project, body => {
    requests.push(body)
    const operation = (body.operations as Record<string, unknown>[])[0]
    project = operation.kind === 'SET_BLOCK_PROPERTY'
      ? linkedProject(false, 'Nuestra gente', 4) : linkedProject(true, 'Nuestra gente', 5)
    return { status: 201, json: project }
  })
  await pages(page).getByRole('button', { name: 'Abrir /equipo' }).click()
  const blocks = page.getByRole('region', { name: 'Bloques del proyecto' })
  await expect(blocks.getByText('Vinculada: Nuestra historia')).toBeVisible()
  await expect(blocks.getByText('Páginas vinculadas: /historia, /equipo')).toBeVisible()
  await blocks.getByLabel('Titular compartido').fill('Nuestra gente')
  await blocks.getByRole('button', { name: 'Guardar titular compartido' }).click()
  await expect(rendered(page).getByRole('heading', { name: 'Nuestra gente', exact: true })).toBeVisible()
  expect(requests).toHaveLength(1)
  expect((requests[0].operations as unknown[])[0]).toMatchObject({
    kind: 'SET_BLOCK_PROPERTY', instanceId: 'copy', componentId: 'copy:seccion', property: 'heading', value: 'Nuestra gente',
  })
  await blocks.getByRole('button', { name: 'Desvincular instancia' }).click()
  const dialog = page.getByRole('dialog', { name: 'Desvincular instancia' })
  // La consecuencia se ve antes de confirmar, y con nombres: qué deja de compartirse y qué no.
  await expect(dialog.getByText(/en \/equipo conservará su contenido actual/)).toBeVisible()
  await expect(dialog.getByText(/Seguirá compartida en \/historia/)).toBeVisible()
  expect(requests).toHaveLength(1)
  await dialog.getByRole('button', { name: 'Cancelar' }).click()
  await blocks.getByRole('button', { name: 'Desvincular instancia' }).click()
  await dialog.getByRole('button', { name: 'Confirmar desvinculación' }).click()
  await expect(blocks.getByText('Desvinculada: Nuestra historia')).toBeVisible()
  await page.reload()
  await expect(blocks.getByText('Desvinculada: Nuestra historia')).toBeVisible()
})
test('placing a block uses an explicit compatible destination on the opened page', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  const project = linkedProject()
  await open(page, () => project, body => { sent = body; return { status: 201, json: project } })
  await pages(page).getByRole('button', { name: 'Abrir /contacto' }).click()
  const blocks = page.getByRole('region', { name: 'Bloques del proyecto' })
  await blocks.getByLabel('Bloque para colocar').selectOption('about')
  await blocks.getByLabel('Destino del bloque').selectOption('root')
  await expect(blocks.getByText(/Reemplaza la composición actual de esta página/)).toBeVisible()
  await blocks.getByRole('button', { name: 'Colocar bloque' }).click()
  await expect.poll(() => sent).not.toBeNull()
  expect((sent as unknown as { operations: unknown[] }).operations[0]).toMatchObject({
    kind: 'INSTANTIATE_BLOCK', pageId: 'contacto', blockId: 'about', index: 0,
  })
})
test('a page that already holds an instance is not offered as a whole-page destination', async ({ page }) => {
  await open(page, () => linkedProject())
  await pages(page).getByRole('button', { name: 'Abrir /equipo' }).click()
  const blocks = page.getByRole('region', { name: 'Bloques del proyecto' })
  // Ofrecerlo sería ofrecer un rechazo: el servidor no deja darle otra raíz a una página ocupada.
  await expect(blocks.getByLabel('Destino del bloque')).toBeDisabled()
  await expect(blocks.getByLabel('Destino del bloque').getByRole('option')).toHaveCount(0)
  await expect(blocks.getByText(/ya tiene una instancia/)).toBeVisible()
  await expect(blocks.getByRole('button', { name: 'Colocar bloque' })).toBeDisabled()
})
test('history keeps the inspected revision while opening another page', async ({ page }) => {
  await open(page, () => linkedProject(true, 'Actual', 5))
  await page.route('**/api/v1/projects/42/revisions/3', route => route.fulfill({ json: linkedProject() }))
  await page.goto('/design-interface/42/Tienda?revision=3&page=historia')
  await expect(page.getByText('Viendo la revisión 3. Vuelve a la última para editar.')).toBeVisible()
  await pages(page).getByRole('button', { name: 'Abrir /equipo' }).click()
  await expect(page).toHaveURL(/revision=3/)
  const blocks = page.getByRole('region', { name: 'Bloques del proyecto' })
  await expect(blocks.getByText('Vinculada: Nuestra historia')).toBeVisible()
  await expect(blocks.getByRole('button', { name: 'Desvincular instancia' })).toHaveCount(0)
  await expect(pages(page).getByRole('button', { name: 'Quitar /equipo' })).toBeDisabled()
})
test('an uncertain block request retries the same accepted intention', async ({ page }) => {
  const requests: Record<string, unknown>[] = []
  await open(page, () => linkedProject(), body => {
    requests.push(body)
    return requests.length === 1
      ? { status: 503, json: { code: 'DEPENDENCY_UNAVAILABLE' } }
      : { status: 201, json: linkedProject(false, 'Nueva historia', 4) }
  })
  await pages(page).getByRole('button', { name: 'Abrir /historia' }).click()
  const blocks = page.getByRole('region', { name: 'Bloques del proyecto' })
  await blocks.getByLabel('Titular compartido').fill('Nueva historia')
  await blocks.getByRole('button', { name: 'Guardar titular compartido' }).click()
  await expect(blocks.getByRole('alert')).toBeVisible()
  await expect(blocks.getByRole('button', { name: 'Desvincular instancia' })).toBeDisabled()
  await blocks.getByRole('button', { name: 'Reintentar operación de bloque' }).click()
  await expect(rendered(page).getByRole('heading', { name: 'Nueva historia', exact: true })).toBeVisible()
  expect(requests).toHaveLength(2)
  expect(requests[1]).toEqual(requests[0])
})
test('detached content can be edited locally without changing the shared definition', async ({ page }) => {
  let sent: Record<string, unknown> | null = null
  await open(page, () => linkedProject(true), body => {
    sent = body
    const accepted = linkedProject(true)
    accepted.acceptedRevision.document.pages[3].components[0].properties.heading = 'Nuestro equipo local'
    return { status: 201, json: accepted }
  })
  await pages(page).getByRole('button', { name: 'Abrir /equipo' }).click()
  const blocks = page.getByRole('region', { name: 'Bloques del proyecto' })
  await blocks.getByLabel('Titular de esta instancia').fill('Nuestro equipo local')
  await blocks.getByRole('button', { name: 'Guardar titular de esta instancia' }).click()
  await expect(rendered(page).getByRole('heading', { name: 'Nuestro equipo local', exact: true })).toBeVisible()
  expect((sent as unknown as { operations: unknown[] }).operations[0]).toMatchObject({
    kind: 'SET_PROPERTY', pageId: 'equipo', componentId: 'copy:seccion', property: 'heading', value: 'Nuestro equipo local',
  })
})