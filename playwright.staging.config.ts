import { defineConfig, devices } from '@playwright/test'
import { stagingSettings } from './tests/staging/safety'

const { browser } = stagingSettings(process.env)

// Los recorridos de certificacion contra el staging real (front-end#90): no arrancan servidor
// alguno, van a STAGING_URL con una cuenta de prueba por correo y contrasena que crea el operador,
// y sin configurar staging se saltan enteros. Una configuracion parcial falla antes de arrancar.
// STAGING_BROWSER selecciona un solo navegador; Edge requiere el modelo determinista.
export default defineConfig({
  testDir: './tests/staging',
  timeout: 15 * 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME ?? 'release/playwright-staging.json' }],
  ],
  use: {
    baseURL: process.env.STAGING_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: browser, use: { ...devices[browser === 'chrome' ? 'Desktop Chrome' : 'Desktop Edge'], channel: browser === 'chrome' ? 'chrome' : 'msedge' } },
  ],
})
