import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('authenticated textile entrepreneur can open the dashboard accessibly', async ({ page }) => {
  await page.route('**/api/v1/projects*', async (route) => {
    expect(route.request().headers().authorization).toBe('Bearer deterministic-e2e-token')
    await route.fulfill({
      body: JSON.stringify({ items: [], nextCursor: null }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard')

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByText('No hay proyectos disponibles.')).toBeVisible()

  const accessibilityScan = await new AxeBuilder({ page }).analyze()
  await test.info().attach('axe-results', {
    body: JSON.stringify(accessibilityScan, null, 2),
    contentType: 'application/json',
  })
  const criticalViolations = accessibilityScan.violations.filter(
    (violation) => violation.impact === 'critical',
  )

  expect(criticalViolations).toEqual([])
})

test('textile entrepreneur creates opens and reloads the initial Accepted revision', async ({ page }) => {
  let created = false
  let projectReads = 0
  const project = {
    id: '42', name: 'Confecciones del Sol', createdAt: '2026-09-02T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: '9001', number: 1, registryVersion: 'textile-store@1.0.0',
      templateVersion: 'verified-textile-start@1.0.0', acceptedAt: '2026-09-02T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: 'VERIFIED_TEMPLATE',
      document: {
        schemaVersion: 'project-document@1.0.0', registryVersion: 'textile-store@1.0.0',
        templateVersion: 'verified-textile-start@1.0.0', pages: [{ id: 'home', path: '/',
          rootComponentId: 'hero-main', components: [
            { id: 'hero-main', type: 'layout.hero', properties: { heading: 'Mi tienda persistida',
              subheading: 'Reabre exactamente la revisión aceptada' }, bindings: { collection: 'featured' },
              slots: { actions: ['hero-action'] } },
            { id: 'hero-action', type: 'action.link', properties: { label: 'Ver colección' }, bindings: {}, slots: {} },
          ] }],
      },
    },
  }
  await page.route('**/api/v1/projects**', route => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    if (request.method() === 'POST') {
      created = true
      return route.fulfill({ status: 201, json: project })
    }
    if (pathname === '/api/v1/projects/42') {
      projectReads += 1
      return route.fulfill({ json: project })
    }
    return route.fulfill({ json: { items: created ? [project] : [], nextCursor: null } })
  })
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: {
    registryVersion: 'textile-store@1.0.0',
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
      slots: {}, bindings: [], constraints: [],
    }],
    template: { templateVersion: 'verified-textile-start@1.0.0', composition: {
      schemaVersion: 'registry-composition@1.0.0', registryVersion: 'textile-store@1.0.0',
      templateVersion: 'verified-textile-start@1.0.0', pages: project.acceptedRevision.document.pages,
    } },
  } }))
  await page.route('**/windows/project/42', route => route.fulfill({ json: [] }))
  await page.route('**/categories/project/42', route => route.fulfill({ json: [] }))

  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Nuevo Proyecto' }).click()
  await page.getByPlaceholder('Nombre...').fill('Confecciones del Sol')
  await page.getByRole('button', { name: 'Aceptar', exact: true }).click()

  await expect(page).toHaveURL(/\/design-interface\/42\/Confecciones%20del%20Sol$/)
  await expect(page.getByText('Revisión aceptada 1')).toBeVisible()
  await expect(page.getByText('Mi tienda persistida')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Revisión aceptada 1')).toBeVisible()
  await expect(page.getByText('Mi tienda persistida')).toBeVisible()
  await page.goto('/dashboard')
  await expect(page.getByText('Confecciones del Sol', { exact: true })).toBeVisible()
  await page.getByText('Confecciones del Sol', { exact: true }).click()
  await expect(page).toHaveURL(/\/design-interface\/42\/Confecciones%20del%20Sol$/)
  await expect(page.getByText('Mi tienda persistida')).toBeVisible()
  expect(projectReads).toBeGreaterThanOrEqual(2)
})

test('denied project access is explicit and does not expose server details', async ({ page }) => {
  await page.route('**/api/v1/projects/42', route => route.fulfill({ status: 403, json: {
    detail: 'SECRET_POLICY_AND_ROLE', title: 'SECRET_POLICY_AND_ROLE',
  } }))
  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(page.getByRole('alert')).toContainText('No tienes permiso para realizar esta acción.')
  await expect(page.getByRole('button', { name: 'Volver a proyectos' })).toBeVisible()
  await expect(page.getByText('SECRET_POLICY_AND_ROLE', { exact: false })).toHaveCount(0)
})

test('Actor A cannot open a Store project created by Actor B', async ({ page }) => {
  const owners = new Map<string, string>()
  let sequence = 70
  await page.route('**/api/v1/projects**', async route => {
    const request = route.request()
    const actor = request.headers().authorization?.replace('Bearer ', '') ?? ''
    const pathname = new URL(request.url()).pathname
    if (request.method() === 'POST') {
      const id = String(++sequence)
      owners.set(id, actor)
      return route.fulfill({ status: 201, json: storeProject(id, 'Proyecto de B') })
    }
    const id = pathname.match(/\/api\/v1\/projects\/(\d+)$/)?.[1]
    if (id) {
      if (owners.get(id) !== actor) return route.fulfill({ status: 404, json: { code: 'RESOURCE_NOT_FOUND' } })
      return route.fulfill({ json: storeProject(id, 'Proyecto de B') })
    }
    return route.fulfill({ json: { items: [], nextCursor: null } })
  })

  await page.goto('/dashboard')
  const projectId = await page.evaluate(async () => {
    localStorage.setItem('abstractify-e2e-token', 'actor-b-token')
    const modulePath = '/src/api/projects.ts'
    const client = await import(modulePath)
    return (await client.createStoreProject('Proyecto de B')).id
  })
  await page.evaluate(() => localStorage.setItem('abstractify-e2e-token', 'actor-a-token'))
  await page.goto(`/design-interface/${projectId}/Nombre%20no%20confiable`)
  await expect(page.getByRole('alert')).toContainText('El recurso no está disponible.')
  await expect(page.getByText('Proyecto de B', { exact: false })).toHaveCount(0)
  await expect(page.getByText('Nombre no confiable', { exact: false })).toHaveCount(0)
})

function storeProject(id: string, name: string) {
  return {
    id, name, createdAt: '2026-09-02T10:00:00', imageUrl: null,
    acceptedRevision: {
      id: '9001', number: 1, registryVersion: 'textile-store@1.0.0',
      templateVersion: 'verified-textile-start@1.0.0', acceptedAt: '2026-09-02T10:00:00',
      hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      origin: 'VERIFIED_TEMPLATE',
      document: { schemaVersion: 'project-document@1.0.0', registryVersion: 'textile-store@1.0.0',
        templateVersion: 'verified-textile-start@1.0.0', pages: [] },
    },
  }
}

for (const inaccessibleId of ['404', '99']) {
  test(`missing and foreign project ${inaccessibleId} share the same safe UI`, async ({ page }) => {
    await page.route(`**/api/v1/projects/${inaccessibleId}`, route => route.fulfill({
      status: 404,
      json: {
        code: 'RESOURCE_NOT_FOUND',
        detail: 'SECRET_OWNER_AND_DATABASE_DETAIL',
        title: 'SECRET_OWNER_AND_DATABASE_DETAIL',
        correlationId: 'b9ffcb8a-4250-40ae-9097-c9e3ca33e346',
        recoveryAction: 'ARBITRARY_UNTRUSTED_ACTION',
      },
    }))

    await page.goto(`/design-interface/${inaccessibleId}/Untrusted%20Project%20Name`)

    await expect(page.getByRole('alert')).toContainText('El recurso no está disponible.')
    await expect(page.getByRole('button', { name: 'Volver a proyectos' })).toBeVisible()
    await expect(page.getByText('SECRET_OWNER_AND_DATABASE_DETAIL', { exact: false })).toHaveCount(0)
    await expect(page.getByText('Untrusted Project Name', { exact: false })).toHaveCount(0)
  })
}

test('opening a project exposes an explicit loading state', async ({ page }) => {
  let releaseResponse: (() => void) | undefined
  const responseGate = new Promise<void>(resolve => { releaseResponse = resolve })
  await page.route('**/api/v1/projects/42', async route => {
    await responseGate
    await route.fulfill({ status: 404, json: { code: 'RESOURCE_NOT_FOUND' } })
  })

  await page.goto('/design-interface/42/Confecciones%20del%20Sol')
  await expect(page.getByRole('status')).toHaveText('Cargando proyecto…')
  releaseResponse?.()
  await expect(page.getByRole('alert')).toContainText('El recurso no está disponible.')
})

test('paged project list preserves the first page and uses the server cursor', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => {
    const after = new URL(route.request().url()).searchParams.get('after')
    const item = { id: after ? '900003' : '900001', name: after ? 'Segunda tienda' : 'Primera tienda',
      createdAt: '2026-08-27T12:00:00', imageUrl: null }
    return route.fulfill({ json: { items: [item], nextCursor: after ? null : '900001' } })
  })
  await page.goto('/dashboard')
  await expect(page.getByText('Primera tienda', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Cargar más proyectos' }).click()
  await expect(page.getByText('Segunda tienda', { exact: true })).toBeVisible()
  await expect(page.getByText('Primera tienda', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cargar más proyectos' })).toHaveCount(0)
})

for (const scenario of [
  { status: 401, code: 'AUTHENTICATION_REQUIRED', message: 'Inicia sesión nuevamente para continuar.', action: 'Iniciar sesión' },
  { status: 503, code: 'DEPENDENCY_UNAVAILABLE', message: 'El servicio no está disponible temporalmente.', action: 'Reintentar' },
  { status: 500, code: 'INTERNAL_ERROR', message: 'No se pudo completar la solicitud.', action: 'Copiar referencia de soporte' },
  { status: 500, code: 'UNRECOGNIZED_CODE', message: 'La respuesta del servicio no es compatible. Actualiza la aplicación.', action: 'Actualizar' },
]) {
  test(`safe recovery for ${scenario.code}`, async ({ page }) => {
    await page.route('**/api/v1/projects*', route => route.fulfill({ status: scenario.status, json: {
      code: scenario.code, detail: 'SECRET_PROVIDER_TOKEN_AND_STACKTRACE', title: 'SECRET_PROVIDER_TOKEN_AND_STACKTRACE',
      correlationId: 'b9ffcb8a-4250-40ae-9097-c9e3ca33e346', recoveryAction: 'ARBITRARY_UNTRUSTED_ACTION',
    } }))
    await page.goto('/dashboard')
    await expect(page.getByRole('alert').filter({ hasText: scenario.message })).toBeVisible()
    await expect(page.getByRole('button', { name: scenario.action, exact: true })).toBeVisible()
    await expect(page.getByText('SECRET_PROVIDER_TOKEN_AND_STACKTRACE', { exact: false })).toHaveCount(0)
    if (scenario.code === 'DEPENDENCY_UNAVAILABLE') {
      await page.unroute('**/api/v1/projects*')
      await page.route('**/api/v1/projects*', route => route.fulfill({ json: { items: [], nextCursor: null } }))
      await page.getByRole('button', { name: scenario.action, exact: true }).click()
      await expect(page.getByText('No hay proyectos disponibles.')).toBeVisible()
    }
  })
}

test('incompatible success payload stays within safe recovery UI', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => route.fulfill({ json: {
    items: [{ id: 900001, name: { unexpected: 'shape' }, userId: 'OTHER_OWNER' }], nextCursor: null,
  } }))
  await page.goto('/dashboard')
  await expect(page.getByText('La respuesta del servicio no es compatible. Actualiza la aplicación.')).toBeVisible()
  await expect(page.getByText('OTHER_OWNER')).toHaveCount(0)
})

test('network failures never render raw transport text', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => route.abort('failed'))
  await page.goto('/dashboard')
  await expect(page.getByText('No se pudo conectar. Comprueba tu conexión e inténtalo nuevamente.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible()
})

for (const method of ['POST', 'PATCH']) {
  test(`${method} incompatible success requires refresh, never mutation retry`, async ({ page }) => {
    let mutationBody = '{invalid json'
    const mutations: string[] = []
    await page.route('**/api/v1/projects**', route => {
      if (route.request().method() === 'GET') return route.fulfill({ json: { items: [], nextCursor: null } })
      mutations.push(route.request().method())
      return route.fulfill({ status: 200, contentType: 'application/json', body: mutationBody })
    })
    await page.goto('/dashboard')
    for (const body of ['{invalid json', '{}']) {
      mutationBody = body
      const problem = await page.evaluate(async (verb) => {
        const modulePath = '/src/api/projects.ts'
        const client = await import(modulePath)
        try {
          if (verb === 'POST') await client.createStoreProject('Nombre')
          else await client.renameStoreProject('900001', 'Nombre')
          return { unexpectedSuccess: true }
        } catch (error) {
          if (error instanceof Error && 'code' in error && 'action' in error) return { code: error.code, action: error.action }
          throw error
        }
      }, method)
      expect(problem).toEqual({ code: 'CONTRACT_MISMATCH', action: 'REFRESH' })
    }
    expect(mutations).toEqual([method, method])
  })
}
