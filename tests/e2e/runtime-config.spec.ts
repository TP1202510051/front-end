import { expect, test } from '@playwright/test'

/**
 * El mismo artefacto sirve para la aceptacion local, staging y la evidencia (front-end#89): el
 * entorno no se hornea en el build sino que se lee de /runtime-config.json al arrancar. Sin ese
 * fichero -como aqui, en el servidor de desarrollo- se usa lo que Vite inyecto.
 */
test('the artifact takes its API origin from runtime-config.json when one is served', async ({ page }) => {
  const asked: string[] = []
  await page.route('**/runtime-config.json', route => route.fulfill({ json: {
    apiBaseUrl: 'https://runtime.example',
    apiWsUrl: 'https://runtime.example/ws',
  } }))
  await page.route('https://runtime.example/api/v1/projects*', route => {
    asked.push(route.request().url())
    return route.fulfill({ json: { items: [], nextCursor: null } })
  })

  await page.goto('/dashboard')
  await expect(page.getByText('No hay proyectos disponibles.')).toBeVisible()
  expect(asked[0]).toMatch(/^https:\/\/runtime\.example\/api\/v1\/projects/)
})

test('without runtime-config.json the build-time origin still answers', async ({ page }) => {
  let asked = ''
  await page.route('**/api/v1/projects*', route => {
    asked = route.request().url()
    return route.fulfill({ json: { items: [], nextCursor: null } })
  })
  await page.goto('/dashboard')
  await expect(page.getByText('No hay proyectos disponibles.')).toBeVisible()
  expect(asked).toMatch(/^http:\/\/127\.0\.0\.1:4173\/api\/v1\/projects/)
})

test('a malformed runtime-config.json is refused and named instead of half applied', async ({ page }) => {
  await page.route('**/runtime-config.json', route => route.fulfill({ json: { apiBaseUrl: 42 } }))
  await page.goto('/dashboard')
  await expect(page.getByRole('alert')).toContainText('La configuración de esta instalación no es válida.')
})

test('a served configuration without identity leaves the installation unconfigured, not half working', async ({ page }) => {
  await page.route('**/runtime-config.json', route => route.fulfill({ json: { firebase: { apiKey: '' } } }))
  await page.goto('/dashboard')
  await expect(page.getByRole('alert')).toContainText('Esta instalación no tiene identidad configurada')
})

test('a configuration file that is not JSON is invalid rather than ignored', async ({ page }) => {
  await page.route('**/runtime-config.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{not json' }))
  await page.goto('/dashboard')
  await expect(page.getByRole('alert')).toContainText('La configuración de esta instalación no es válida.')
})
