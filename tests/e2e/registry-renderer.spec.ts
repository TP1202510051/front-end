import { expect, test } from '@playwright/test'

const publication = {
  registryVersion: 'textile-store@1.1.0',
  components: [{
    type: 'layout.hero',
    properties: {
      heading: { type: 'TEXT', required: true, minLength: 1, maxLength: 80 },
      subheading: { type: 'TEXT', required: true, minLength: 1, maxLength: 160 },
    },
    slots: { actions: { allowedTypes: ['action.link'], minimum: 1, maximum: 1 } },
    bindings: [{ name: 'collection', source: 'catalog.collection', required: true }],
    interactions: [], constraints: ['TOP_LEVEL_ONLY'],
  }, {
    type: 'action.link',
    properties: { label: { type: 'TEXT', required: true, minLength: 1, maxLength: 40 } },
    slots: {}, bindings: [], interactions: [{ name: 'activate', required: true }],
    constraints: [],
  }],
  pages: [
    { kind: 'HOME', required: true, path: '/', rootTypes: ['layout.hero'] },
  ],
  template: {
    templateVersion: 'verified-textile-start@1.1.0',
    composition: {
      schemaVersion: 'registry-composition@1.0.0',
      registryVersion: 'textile-store@1.1.0',
      templateVersion: 'verified-textile-start@1.1.0',
      pages: [{
        id: 'home', kind: 'HOME', path: '/', rootComponentId: 'hero-main',
        components: [{
          id: 'hero-main', type: 'layout.hero',
          properties: { heading: 'Confecciones Andinas', subheading: 'Prendas listas para acompañarte cada día' },
          bindings: { collection: 'featured' }, interactions: {}, slots: { actions: ['hero-action'] },
        }, {
          id: 'hero-action', type: 'action.link', properties: { label: 'Ver colección' },
          bindings: {}, interactions: { activate: 'home' }, slots: {},
        }],
      }],
    },
  },
}

test('renders the verified template deterministically from typed registry data', async ({ page }) => {
  await page.route('**/api/v1/component-registries/**', route => {
    expect(route.request().headers().authorization).toBe('Bearer deterministic-e2e-token')
    return route.fulfill({ json: publication })
  })
  await page.goto('/verified-template')

  await expect(page.getByRole('heading', { name: 'Confecciones Andinas' })).toBeVisible()
  await expect(page.getByText('Prendas listas para acompañarte cada día')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver colección' })).toHaveAttribute('href', '/')
})

test('invalid registry properties produce a useful validation state', async ({ page }) => {
  const invalid = structuredClone(publication)
  delete invalid.template.composition.pages[0].components[1].properties.label
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: invalid }))

  await page.goto('/verified-template')

  await expect(page.getByRole('alert')).toHaveText('Al template le falta una propiedad requerida.')
  await expect(page.getByRole('heading', { name: 'Confecciones Andinas' })).toHaveCount(0)
})

test('incompatible registry data fails closed before rendering', async ({ page }) => {
  const incompatible = structuredClone(publication)
  const heading = incompatible.components[0].properties.heading as { maxLength?: number }
  delete heading.maxLength
  await page.route('**/api/v1/component-registries/**', route => route.fulfill({ json: incompatible }))

  await page.goto('/verified-template')

  await expect(page.getByRole('alert')).toHaveText('No se pudo cargar el template verificado.')
  await expect(page.getByRole('heading', { name: 'Confecciones Andinas' })).toHaveCount(0)
})
