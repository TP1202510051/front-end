import type { Page } from '@playwright/test'

export const PROPOSAL = '3f2b7c1a-8d4e-4a6b-9c0d-1e2f3a4b5c6d'
export const OPERATION = '7a1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e'

/** Un proyecto con su revision aceptada: la portada del template verificado con un titular. */
export function projectAt(revisionId: string, number: number, heading: string, tokens: Record<string, string> = {}) {
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

/** La publicacion del registro verificado que dibuja ese proyecto. */
export function registryPublication() {
  return {
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
  }
}

/** Una propuesta ya redactada por el asistente, con la vista previa que dejaria. */
export function drafted(overrides: Record<string, unknown> = {}) {
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

function operationSucceeded() {
  return {
    operationId: OPERATION, workType: 'ASSISTANT_PROPOSAL', state: 'SUCCEEDED', stage: 'SUCCEEDED',
    progress: 100, version: 3, createdAt: '2026-09-06T10:01:00Z', startedAt: '2026-09-06T10:01:01Z',
    updatedAt: '2026-09-06T10:01:05Z', finishedAt: '2026-09-06T10:01:05Z',
    resultReference: { type: 'assistant-proposal', id: PROPOSAL },
    failureCode: null, availableActions: ['REFRESH_STATUS'],
  }
}

/**
 * El recorrido critico de la plataforma con el backend simulado: un proyecto propio, su registro,
 * su historial y un asistente que redacta y acepta una propuesta. Devuelve el proyecto servido,
 * que avanza de revision cuando se acepta.
 */
export async function mockOwnStoreProject(page: Page) {
  const state = { served: projectAt('9001', 1, 'Mi tienda'), created: false }
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: registryPublication() }))
  await page.route('**/api/v1/operations/**', route => route.fulfill({ json: operationSucceeded() }))
  await page.route('**/api/v1/projects**', route => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    if (request.method() === 'POST') {
      state.created = true
      return route.fulfill({ status: 201, json: state.served })
    }
    if (pathname === '/api/v1/projects') {
      return route.fulfill({ json: { items: state.created ? [state.served] : [], nextCursor: null } })
    }
    return route.fulfill({ json: state.served })
  })
  // Despues de la generica, porque en Playwright gana la ultima ruta que coincide.
  await page.route('**/api/v1/projects/42/revisions**', route => {
    const request = route.request()
    // Una edicion manual: la tanda llega y la revision avanza con el titular pedido.
    if (request.method() === 'POST') {
      const heading = (request.postDataJSON() as { operations: { value?: string }[] }).operations[0]?.value ?? 'Mi tienda'
      state.served = projectAt('9002', 2, heading)
      return route.fulfill({ status: 201, json: state.served })
    }
    return route.fulfill({ json: { items: [{
      id: '9001', number: 1, parentId: null, origin: 'VERIFIED_TEMPLATE', actorId: 'entrepreneur-e2e',
      registryVersion: 'textile-store@1.1.0', templateVersion: 'verified-textile-start@1.1.0',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', acceptedAt: '2026-09-06T10:00:00',
    }], nextCursor: null } })
  })
  await page.route('**/api/v1/projects/42/assistant/proposals**', route => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    if (pathname.endsWith('/acceptance')) {
      state.served = projectAt('9002', 2, 'Mi tienda', { 'color-primario': '#1a2b3c' })
      return route.fulfill({ status: 201, json: drafted({ state: 'ACCEPTED', outcome: 'ACCEPTED',
        acceptedRevisionId: '9002', preview: null,
        unavailable: 'Ya está aceptada: lo que hizo está en el proyecto.' }) })
    }
    if (request.method() === 'POST') return route.fulfill({ status: 202, json: { operationId: OPERATION, proposalId: PROPOSAL } })
    if (pathname.endsWith('/assistant/proposals')) return route.fulfill({ json: [] })
    return route.fulfill({ json: drafted() })
  })
  return state
}
