import { defineConfig, devices } from '@playwright/test'

// Los recorridos de certificacion contra el staging real (front-end#90): no arrancan servidor
// alguno, van a STAGING_URL con una cuenta de prueba por correo y contrasena que crea el operador,
// y sin esas variables se saltan enteros en vez de fingir. Chrome bloquea; Edge se anade con
// --project=edge cuando el operador lo pide.
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
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
})
