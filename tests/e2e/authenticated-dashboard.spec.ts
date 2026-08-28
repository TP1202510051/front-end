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
