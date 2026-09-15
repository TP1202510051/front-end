import { defineConfig, devices } from '@playwright/test'

// El artefacto construido, servido tal cual con `vite preview`: prueba que el dist/ identificado
// arranca y lee su runtime-config.json. Va en su propia configuracion porque necesita dist/ y los
// recorridos del canvas no; sin dist/ el servidor no contesta y la prueba no tendria que existir.
const PORT = 4174

export default defineConfig({
  testDir: './tests/artifact',
  timeout: 60_000,
  forbidOnly: Boolean(process.env.CI),
  reporter: [
    ['list'],
    ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME ?? 'release/playwright-artifact.json' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'artifact',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    reuseExistingServer: !process.env.CI,
    url: `http://127.0.0.1:${PORT}`,
  },
})
