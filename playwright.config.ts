import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --mode e2e --host 127.0.0.1 --port 4173 --strictPort',
    env: {
      VITE_API_BASE_URL: 'http://127.0.0.1:4173',
      VITE_FIREBASE_API_KEY: 'deterministic-e2e-key',
      VITE_FIREBASE_APP_ID: 'deterministic-e2e-app',
      VITE_FIREBASE_AUTH_DOMAIN: 'abstractify-e2e.invalid',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
      VITE_FIREBASE_PROJECT_ID: 'abstractify-e2e',
      VITE_FIREBASE_STORAGE_BUCKET: 'abstractify-e2e.invalid',
    },
    reuseExistingServer: !process.env.CI,
    url: 'http://127.0.0.1:4173',
  },
})
