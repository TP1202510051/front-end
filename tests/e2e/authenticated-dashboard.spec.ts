import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('authenticated textile entrepreneur can open the dashboard accessibly', async ({ page }) => {
  await page.route('**/projects/user', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
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
