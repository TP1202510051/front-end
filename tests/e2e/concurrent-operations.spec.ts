import { expect, test, type Page } from '@playwright/test'

function projectAt(revisionId: string, number: number, heading: string, subheading = 'Prendas listas',
  basedOnRevisionId: string | null = null) {
  return {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-04T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: revisionId, number, registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0', acceptedAt: '2026-09-04T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: number === 1 ? 'VERIFIED_TEMPLATE' : 'MANUAL_BATCH', basedOnRevisionId,
      document: {
        schemaVersion: 'project-document@1.0.0', registryVersion: 'textile-store@1.1.0',
        templateVersion: 'verified-textile-start@1.1.0', pages: [{ id: 'home', path: '/',
          kind: 'HOME', rootComponentId: 'hero-main', components: [
            { id: 'hero-main', type: 'layout.hero', properties: { heading, subheading },
              bindings: { collection: 'featured' }, interactions: {}, slots: { actions: ['hero-action'] } },
            { id: 'hero-action', type: 'action.link', properties: { label: 'Ver colección' },
              bindings: {}, interactions: { activate: 'home' }, slots: {} },
          ] }],
      },
    },
  }
}

function conflict(kind: string, property: string | null, attempted: string | null,
  current: string | null) {
  return {
    status: 409,
    json: {
      baseRevisionId: '9001', headRevisionId: '9002',
      conflicts: [{ kind, pageId: 'home', componentId: 'hero-main', property, attempted, current }],
    },
  }
}

const registry = {
  registryVersion: 'textile-store@1.1.0',
  components: [{
    type: 'layout.hero',
    properties: {
      heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 },
      subheading: { type: 'TEXT', required: true, minLength: 1, maxLength: 160 },
    },
    slots: { actions: { allowedTypes: ['action.link'], minimum: 1, maximum: 1 } },
    bindings: [{ name: 'collection', source: 'catalog.collection', required: true }],
    constraints: ['TOP_LEVEL_ONLY'],
  }, {
    type: 'action.link',
    properties: { label: { type: 'TEXT', required: true, minLength: 1, maxLength: 40 } },
    slots: {}, bindings: [], interactions: [{ name: 'activate', required: true }],
    constraints: [],
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

async function open(page: Page, onAccept: (body: Record<string, unknown>) => unknown,
  project: () => unknown) {
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: registry }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/api/v1/projects**', async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (path === '/api/v1/projects/42/revisions' && request.method() === 'POST') {
      return route.fulfill(await onAccept(request.postDataJSON()) as Parameters<typeof route.fulfill>[0])
    }
    if (path === '/api/v1/projects/42/revisions') {
      return route.fulfill({ json: { items: [], nextCursor: null } })
    }
    return route.fulfill({ json: project() })
  })
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  // Se espera a que el Canvas este listo y no a un titular concreto: cada caso abre el proyecto en
  // un estado distinto, y anclar el texto aqui ataria el ayudante a uno solo de ellos.
  await expect(page.getByLabel('Titular de la portada')).toBeVisible()
}

const canvas = (page: Page) => page.getByRole('region', { name: 'Canvas del proyecto' })

/** Reaplicar es exactamente lo contrario de interrumpir. */
test('an independent change that the server reapplied does not interrupt the entrepreneur',
  async ({ page }) => {
    await open(page,
      // El servidor lo reaplico sobre la revision 2, que no es la que el Canvas tenia delante.
      () => ({ status: 201, json: projectAt('9003', 3, 'Tejidos del valle', 'Prendas de la sierra', '9001') }),
      () => projectAt('9001', 1, 'Mi tienda'))

    await page.getByLabel('Titular de la portada').fill('Tejidos del valle')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(canvas(page).getByRole('status')).toHaveText('Revisión aceptada 3')
    await expect(page.getByRole('heading', { name: 'Tejidos del valle' })).toBeVisible()
    await expect(page.getByText('Prendas de la sierra'), 'Lo de la otra pestana sigue ahi').toBeVisible()
    await expect(canvas(page).getByRole('alert'), 'Reaplicar no interrumpe').toHaveCount(0)
  })

test('a same-property conflict shows what the project says now and both ways out', async ({ page }) => {
  const bases: string[] = []
  let attempts = 0
  await open(page, body => {
    bases.push(String(body.baseRevisionId))
    attempts += 1
    if (attempts === 1) return conflict('PROPERTY_CHANGED', 'heading', 'Lo que quise poner',
      'Lo que puso la otra')
    return { status: 201, json: projectAt('9003', 3, 'Lo que quise poner', 'Prendas listas', '9002') }
  }, () => projectAt('9002', 2, 'Lo que puso la otra'))

  await page.getByLabel('Titular de la portada').fill('Lo que quise poner')
  await page.getByRole('button', { name: 'Guardar' }).click()

  const clash = page.getByRole('region', { name: 'Conflicto con el proyecto' })
  await expect(clash.getByText('Lo que puso la otra'), 'Sin el valor de ahora no hay decision')
    .toBeVisible()
  await expect(clash.getByText('Lo que quise poner')).toBeVisible()

  await clash.getByRole('button', { name: 'Mantener mi cambio' }).click()

  await expect(canvas(page).getByRole('status')).toHaveText('Revisión aceptada 3')
  expect(bases[1], 'Reintentar a lo bruto contra la base vieja volveria a chocar').toBe('9002')
})

test('keeping the accepted value drops the draft and shows what the project has', async ({ page }) => {
  await open(page, () => conflict('PROPERTY_CHANGED', 'heading', 'Lo que quise poner',
    'Lo que puso la otra'), () => projectAt('9002', 2, 'Lo que puso la otra'))

  await page.getByLabel('Titular de la portada').fill('Lo que quise poner')
  await page.getByRole('button', { name: 'Guardar' }).click()
  await page.getByRole('region', { name: 'Conflicto con el proyecto' })
    .getByRole('button', { name: 'Quedarme con lo aceptado' }).click()

  await expect(page.getByRole('heading', { name: 'Lo que puso la otra' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Conflicto con el proyecto' })).toHaveCount(0)
})

/**
 * Lo borrado no se ofrece rehacer.
 *
 * <p>Que no haya boton de "mantener mi cambio" no es un olvido: es el criterio. Ofrecerlo seria
 * ofrecer recrear en silencio algo que alguien quito a proposito.
 */
test('a deleted target is reported and the client never offers to recreate it', async ({ page }) => {
  await open(page, () => conflict('TARGET_MISSING', null, null, null),
    () => projectAt('9002', 2, 'Lo que puso la otra'))

  await page.getByLabel('Titular de la portada').fill('Da igual lo que ponga')
  await page.getByRole('button', { name: 'Guardar' }).click()

  const clash = page.getByRole('region', { name: 'Conflicto con el proyecto' })
  await expect(clash).toBeVisible()
  await expect(clash.getByRole('button', { name: 'Mantener mi cambio' })).toHaveCount(0)
  await expect(clash.getByRole('button', { name: 'Quedarme con lo aceptado' })).toBeVisible()
})
