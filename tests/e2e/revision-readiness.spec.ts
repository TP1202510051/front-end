import { expect, test, type Page } from '@playwright/test'

const HASH = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

function component(id: string, type: string, properties: Record<string, string>,
  bindings: Record<string, unknown> = {}, interactions: Record<string, string> = {},
  slots: Record<string, string[]> = {}) {
  return { id, type, properties, bindings, interactions, slots, styles: {} }
}

const EVERYTHING = { target: 'EVERYTHING', reference: null, limit: 12, order: 'NEWEST' }

const homePage = {
  id: 'home', kind: 'HOME', path: '/', rootComponentId: 'hero-main',
  components: [
    component('hero-main', 'layout.hero',
      { heading: 'Confecciones Andinas', subheading: 'Prendas listas' },
      { collection: EVERYTHING }, {}, { actions: ['hero-action'] }),
    component('hero-action', 'action.link', { label: 'Ver colección' }, {}, { activate: 'catalogo' }),
  ],
}

const catalogPage = {
  id: 'catalogo', kind: 'CATALOG', path: '/catalogo', rootComponentId: 'catalog-main',
  components: [component('catalog-main', 'catalog.grid', { heading: 'Toda la colección' },
    { collection: EVERYTHING }, {}, { actions: [] })],
}

const project = {
  id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-08T10:00:00', imageUrl: null,
  acceptedRevision: {
    id: '9001', number: 4, registryVersion: 'textile-store@1.1.0',
    templateVersion: 'verified-textile-start@1.1.0', acceptedAt: '2026-09-08T10:00:00',
    hash: HASH, origin: 'MANUAL_BATCH', basedOnRevisionId: null,
    document: {
      schemaVersion: 'project-document@1.4.0', registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0',
      pages: [homePage, catalogPage], blocks: [], blockInstances: [], theme: { tokens: {}, rules: [] },
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
    templateVersion: 'verified-textile-start@1.1.0', pages: [homePage, catalogPage],
  } },
}

interface Requirement {
  code: string
  area: string
  pageId?: string | null
  componentId?: string | null
}

function level(missing: Requirement[] = []) {
  return {
    reached: missing.length === 0,
    missing: missing.map(item => ({
      code: item.code, area: item.area,
      pageId: item.pageId ?? null, componentId: item.componentId ?? null,
    })),
  }
}

function readiness(levels: { editable?: Requirement[]; previewable?: Requirement[]; exportable?: Requirement[] }) {
  return {
    revisionId: '9001', revisionNumber: 4, hash: HASH,
    schemaVersion: 'project-document@1.4.0', registryVersion: 'textile-store@1.1.0',
    templateVersion: 'verified-textile-start@1.1.0',
    editable: level(levels.editable), previewable: level(levels.previewable),
    exportable: level(levels.exportable),
  }
}

interface Options {
  readiness?: unknown
  status?: number
  onReadiness?: (url: string) => void
}

async function open(page: Page, options: Options = {}) {
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: publication }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects**', route => route.fulfill({ json: project }))
  await page.route('**/api/v1/projects/42/assets**', route => route.fulfill({ json: [] }))
  // Playwright resuelve la ultima ruta registrada primero, asi que esta va despues de la generica.
  await page.route('**/api/v1/projects/42/revisions/*/readiness', route => {
    options.onReadiness?.(route.request().url())
    if (options.status) {
      return route.fulfill({ status: options.status, contentType: 'application/problem+json',
        json: { code: 'RESOURCE_NOT_FOUND', correlationId: '11111111-2222-3333-4444-555555555555' } })
    }
    return route.fulfill({ json: options.readiness ?? readiness({}) })
  })
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(panel(page)).toBeVisible()
}

const panel = (page: Page) => page.getByRole('region', { name: 'Estado de la revisión' })
const gate = (page: Page) => panel(page).getByTestId('export-gate')

/**
 * Los tres niveles se ensenan por separado y con su propio veredicto.
 *
 * <p>Es lo que impide que "no lista" tape tres arreglos distintos: quien tiene la tienda ve que
 * puede seguir editando y viendo, y que lo que no puede todavia es entregarla.
 */
test('the three levels are shown apart, never collapsed into one status', async ({ page }) => {
  await open(page, { readiness: readiness({
    exportable: [{ code: 'BINDING_UNCHOSEN', area: 'CATALOG', pageId: 'catalogo', componentId: 'catalog-main' }],
  }) })

  await expect(panel(page).getByLabel('Editable')).toContainText('Editable: sí')
  await expect(panel(page).getByLabel('Previsualizable')).toContainText('Previsualizable: sí')
  await expect(panel(page).getByLabel('Exportable')).toContainText('Exportable: todavía no')
})

/** Cada requisito dice que hacer y lleva a donde se hace. Uno sin sitio no se puede resolver. */
test('every failing requirement says what to do and links to where it is done', async ({ page }) => {
  await open(page, { readiness: readiness({
    previewable: [{ code: 'COMPOSITION_INVALID', area: 'PAGES', pageId: 'catalogo' }],
    exportable: [
      { code: 'COMPOSITION_INVALID', area: 'PAGES', pageId: 'catalogo' },
      { code: 'ASSET_MISSING', area: 'ASSETS', pageId: 'home', componentId: 'hero-main' },
      { code: 'BINDING_TARGET_MISSING', area: 'CATALOG', pageId: 'catalogo', componentId: 'catalog-main' },
    ],
  }) })

  const exportable = panel(page).getByLabel('Exportable')
  await expect(exportable).toContainText('falta una página obligatoria')
  await expect(exportable).toContainText('usa una imagen que ya no está en el proyecto')
  await expect(exportable).toContainText('muestra algo del catálogo que ya no existe')
  await expect(exportable.getByRole('link', { name: 'Ir a las páginas' }))
    .toHaveAttribute('href', '#readiness-paginas')
  await expect(exportable.getByRole('link', { name: 'Ir a los medios' }))
    .toHaveAttribute('href', '#readiness-medios')
  await expect(exportable.getByRole('link', { name: 'Ir al catálogo' }))
    .toHaveAttribute('href', '#readiness-catalogo')
  // Y cada destino existe de verdad; un enlace a un ancla que no esta no lleva a ninguna parte.
  for (const anchor of ['readiness-paginas', 'readiness-medios', 'readiness-catalogo', 'readiness-tema']) {
    await expect(page.locator(`#${anchor}`)).toHaveCount(1)
  }
})

/** El enlace de un requisito que nombra pagina la abre, no deja a medias el paso que hace falta. */
test('following a requirement that names a page opens that page', async ({ page }) => {
  await open(page, { readiness: readiness({
    exportable: [{ code: 'BINDING_TARGET_MISSING', area: 'CATALOG', pageId: 'catalogo', componentId: 'catalog-main' }],
  }) })

  await panel(page).getByRole('link', { name: 'Ir al catálogo' }).click()

  await expect.poll(() => new URL(page.url()).searchParams.get('page')).toBe('catalogo')
})

/**
 * Un requisito que no se arregla desde aqui lo dice, en vez de fingir un destino.
 *
 * <p>Una forma de documento que esta version no conoce no tiene panel que abrir. Enlazarla a
 * cualquier sitio para que todos los requisitos tengan enlace llevaria a una pantalla donde no hay
 * nada que tocar; quedarse callada dejaria pensando que el enlace falta.
 */
test('a requirement with nowhere to go says so instead of inventing a link', async ({ page }) => {
  await open(page, { readiness: readiness({
    editable: [{ code: 'DOCUMENT_SCHEMA_UNSUPPORTED', area: 'PROJECT' }],
    previewable: [{ code: 'DOCUMENT_SCHEMA_UNSUPPORTED', area: 'PROJECT' }],
    exportable: [{ code: 'DOCUMENT_SCHEMA_UNSUPPORTED', area: 'PROJECT' }],
  }) })

  const editable = panel(page).getByLabel('Editable')
  await expect(editable).toContainText('versión posterior de Abstractify')
  await expect(editable).toContainText('Esto no se resuelve desde aquí.')
  await expect(editable.getByRole('link')).toHaveCount(0)
})

/** Un componente nombrado se ensena: una pagina con doce secciones no dice por si sola en cual. */
test('a requirement that names a component says which one', async ({ page }) => {
  await open(page, { readiness: readiness({
    exportable: [{ code: 'ASSET_MISSING', area: 'ASSETS', pageId: 'home', componentId: 'hero-main' }],
  }) })

  await expect(panel(page).getByLabel('Exportable'))
    .toContainText('Página «home» · componente «hero-main»')
})

/** Nada de dentro llega a la pantalla: ni rutas de validacion ni codigos crudos. */
test('a requirement never shows the code or the path the server used to find it', async ({ page }) => {
  await open(page, { readiness: readiness({
    previewable: [{ code: 'COMPOSITION_INVALID', area: 'PAGES', pageId: 'catalogo' }],
  }) })

  await expect(panel(page)).not.toContainText('COMPOSITION_INVALID')
  await expect(panel(page)).not.toContainText('$.pages')
})

test('the control to generate stays closed while the revision is not exportable', async ({ page }) => {
  await open(page, { readiness: readiness({
    exportable: [{ code: 'ASSET_MISSING', area: 'ASSETS', pageId: 'home', componentId: 'hero-main' }],
  }) })

  await expect(gate(page).getByRole('button', { name: 'Generar tienda' })).toBeDisabled()
  await expect(gate(page)).toContainText('todavía no se puede entregar')
})

test('an exportable exact revision starts one durable export and registers its receipt', async ({ page }) => {
  const operationId = '936a89df-0d03-4ea5-a446-821a9e3ec194'
  let requested: { url: string; body: unknown; authorization?: string } | null = null
  await open(page, { readiness: readiness({}) })
  await page.route('**/api/v1/projects/42/revisions/4/exports', async route => {
    requested = { url: route.request().url(), body: route.request().postDataJSON(),
      authorization: route.request().headers().authorization }
    await route.fulfill({ status: 202, json: {
      operationId, exportId: '936a89df-0d03-4ea5-a446-821a9e3ec294',
    } })
  })
  await page.route(`**/api/v1/operations/${operationId}`, route => route.fulfill({ json: {
    operationId, workType: 'STORE_EXPORT', state: 'QUEUED', stage: 'QUEUED', progress: null,
    version: 1, createdAt: '2026-09-10T20:00:00Z', startedAt: null,
    updatedAt: '2026-09-10T20:00:00Z', finishedAt: null, resultReference: null,
    failureCode: null, availableActions: ['CANCEL', 'REFRESH_STATUS'],
  } }))
  await gate(page).getByRole('button', { name: 'Generar tienda desde revisión 4' }).click()

  await expect(page.getByRole('region', { name: 'Progreso de operaciones' })).toContainText('Exportación de tienda')
  expect(requested).not.toBeNull()
  expect(requested!.url).toContain('/api/v1/projects/42/revisions/4/exports')
  expect(requested!.authorization).toBe('Bearer deterministic-e2e-token')
  expect(requested!.body).toMatchObject({ idempotencyKey: expect.stringMatching(/^[0-9a-f-]{36}$/) })
})

/**
 * Inspeccionando una revision anterior, nunca se ensena el veredicto de la cabecera.
 *
 * <p>Mientras la revision inspeccionada se abre, lo unico que hay cargado es la cabecera. Pintar ya
 * el panel enseñaria el veredicto de otra revision bajo el numero equivocado, que es exactamente la
 * confusion que este panel existe para evitar.
 */
test('inspecting an earlier revision never reports the head by mistake', async ({ page }) => {
  const asked: string[] = []
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: publication }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects**', route => route.fulfill({ json: project }))
  await page.route('**/api/v1/projects/42/revisions/2', route => route.fulfill({ json: {
    ...project,
    acceptedRevision: { ...project.acceptedRevision, id: '9000', number: 2 },
  } }))
  await page.route('**/api/v1/projects/42/revisions/*/readiness', route => {
    asked.push(route.request().url())
    return route.fulfill({ json: { ...readiness({}), revisionId: '9000', revisionNumber: 2 } })
  })

  await page.goto('/design-interface/42/Confecciones%20del%20Sol?revision=2')

  await expect(panel(page)).toBeVisible()
  await expect(panel(page).getByRole('heading')).toHaveText('Estado de la revisión 2')
  expect(asked.every(url => url.includes('/revisions/2/readiness'))).toBe(true)
})

/** Se pregunta por la revision que se esta mirando, no por el proyecto. */
test('readiness is asked for the exact accepted revision on screen', async ({ page }) => {
  const asked: string[] = []
  await open(page, { onReadiness: url => asked.push(url) })

  await expect.poll(() => asked.length).toBeGreaterThan(0)
  expect(asked[0]).toContain('/api/v1/projects/42/revisions/4/readiness')
})

/**
 * Sin informe la puerta se queda cerrada.
 *
 * <p>Es la direccion segura: una respuesta que no llego no puede leerse como permiso para entregar
 * una tienda.
 */
test('a readiness that cannot be read leaves the gate shut and says so', async ({ page }) => {
  await open(page, { status: 404 })

  await expect(panel(page).getByRole('alert')).toBeVisible()
  await expect(gate(page).getByRole('button', { name: 'Generar tienda' })).toBeDisabled()
  await expect(gate(page)).toContainText('Todavía no se sabe')
})

/**
 * Un nivel que se contradice a si mismo no se cree.
 *
 * <p>Decir que se alcanzo llevando requisitos pendientes es exactamente la respuesta con la que se
 * podria abrir el control por error, asi que se rechaza entera en vez de elegir a cual de los dos
 * campos hacer caso.
 */
test('a level that claims to be reached while naming requirements is not believed', async ({ page }) => {
  await open(page, { readiness: {
    ...readiness({}),
    exportable: { reached: true, missing: [
      { code: 'ASSET_MISSING', area: 'ASSETS', pageId: 'home', componentId: 'hero-main' }] },
  } })

  await expect(panel(page).getByRole('alert')).toBeVisible()
  await expect(gate(page).getByRole('button', { name: 'Generar tienda' })).toBeDisabled()
})
