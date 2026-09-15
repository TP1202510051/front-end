import { expect, test } from '@playwright/test'

/**
 * El artefacto construido -el mismo dist/ que se identifica y se promueve- arranca: lee su
 * runtime-config.json, dibuja la pagina de entrada y, sin configuracion, lo dice. Los recorridos
 * del canvas corren contra el servidor e2e del mismo commit; esto es lo que prueba el artefacto.
 */
const configured = {
  apiBaseUrl: 'https://api.artifact.invalid',
  apiWsUrl: 'https://api.artifact.invalid/ws',
  firebase: {
    apiKey: 'artifact-smoke-key', authDomain: 'artifact.invalid', projectId: 'artifact-smoke',
    storageBucket: 'artifact.invalid', messagingSenderId: '000000000000', appId: '1:000000000000:web:artifact',
  },
}

test('the built artifact reads its installation configuration and shows the entry page', { tag: '@artifact' }, async ({ page }) => {
  await page.route('**/runtime-config.json', route => route.fulfill({ json: configured }))
  await page.goto('/login')
  await expect(page.getByRole('button', { name: /Google|Iniciar/i }).first()).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('the built artifact served without configuration says so instead of starting against nothing', { tag: '@artifact' }, async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('alert')).toContainText('Esta instalación no tiene identidad configurada')
})
