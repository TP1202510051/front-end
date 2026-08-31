import { expect, test } from '@playwright/test'

const operationId = '936a89df-0d03-4ea5-a446-821a9e3ec111'
const queued = {
  operationId, workType: 'ASSISTANT_PROPOSAL', state: 'QUEUED', stage: 'QUEUED', progress: null,
  version: 1, createdAt: '2026-08-28T00:00:00Z', startedAt: null, updatedAt: '2026-08-28T00:00:00Z',
  finishedAt: null, resultReference: null, failureCode: null, availableActions: ['CANCEL', 'REFRESH_STATUS'],
}

async function emitOperationSignal(page: import('@playwright/test').Page, version: number, id = operationId) {
  await page.evaluate(({ operationId: signalledId, operationVersion }) => {
    window.dispatchEvent(new CustomEvent('abstractify:e2e-operation-signal', {
      detail: { operationId: signalledId, version: operationVersion },
    }))
  }, { operationId: id, operationVersion: version })
}

async function registerOperationReceipt(page: import('@playwright/test').Page, id = operationId) {
  await page.evaluate((receiptId) => window.dispatchEvent(new CustomEvent('abstractify:operation-receipt', {
    detail: { actorId: 'entrepreneur-e2e', operationId: receiptId },
  })), id)
}

test('authenticated client recovers the durable operation without assuming invented progress', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => route.fulfill({ json: { items: [], nextCursor: null } }))
  let requested = false
  await page.route('**/api/v1/operations/**', route => {
    requested = true
    expect(route.request().headers().authorization).toBe('Bearer deterministic-e2e-token')
    expect(route.request().url()).toContain(operationId)
    return route.fulfill({ json: queued })
  })
  await page.goto('/dashboard')
  const recovered = await page.evaluate(async (id) => {
    const path = '/src/api/operations.ts'
    const { getOperation } = await import(/* @vite-ignore */ path)
    return getOperation(id)
  }, operationId)
  expect(requested).toBe(true)
  expect(recovered).toEqual(queued)
})

test('authenticated client requests cancellation and trusts the returned durable state', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => route.fulfill({ json: { items: [], nextCursor: null } }))
  const cancelled = { ...queued, state: 'CANCELLED', stage: 'CANCELLED', version: 2,
    finishedAt: '2026-08-28T00:01:00Z', updatedAt: '2026-08-28T00:01:00Z',
    availableActions: ['START_NEW_OPERATION', 'REFRESH_STATUS'] }
  await page.route('**/api/v1/operations/**/cancellation', route => {
    expect(route.request().method()).toBe('POST')
    expect(route.request().headers().authorization).toBe('Bearer deterministic-e2e-token')
    return route.fulfill({ json: cancelled })
  })
  await page.goto('/dashboard')
  const result = await page.evaluate(async (id) => {
    const path = '/src/api/operations.ts'
    const { cancelOperation } = await import(/* @vite-ignore */ path)
    return cancelOperation(id)
  }, operationId)
  expect(result).toEqual(cancelled)
})

test('foreign and missing operations use safe not-found recovery without server text', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => route.fulfill({ json: { items: [], nextCursor: null } }))
  await page.route('**/api/v1/operations/**', route => route.fulfill({ status: 404, json: {
    code: 'RESOURCE_NOT_FOUND', detail: 'PRIVATE_OWNER_AND_PROMPT', recoveryAction: 'EXECUTE_UNTRUSTED',
  } }))
  await page.goto('/dashboard')
  const result = await page.evaluate(async (id) => {
    const path = '/src/api/operations.ts'
    const { getOperation } = await import(/* @vite-ignore */ path)
    try { await getOperation(id); return null } catch (error) {
      const problem = error as { code: string; action: string; message: string }
      return { code: problem.code, action: problem.action, message: problem.message }
    }
  }, operationId)
  expect(result).toEqual({ code: 'RESOURCE_NOT_FOUND', action: 'RETURN_TO_PROJECTS', message: 'El recurso no está disponible.' })
})

test('incompatible operation data cannot become a displayed state or executable action', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => route.fulfill({ json: { items: [], nextCursor: null } }))
  let response: unknown = {}
  await page.route('**/api/v1/operations/**', route => route.fulfill({ json: response }))
  await page.goto('/dashboard')
  for (const invalid of [{}, { ...queued, operationId: 'another-id' }, { ...queued, version: 0 },
    { ...queued, version: Number.MAX_SAFE_INTEGER + 1 }, { ...queued, state: 'INVENTED' },
    { ...queued, progress: 101 }, { ...queued, availableActions: ['EXECUTE_SCRIPT'] },
    { ...queued, failureCode: 'Provider error with SECRET' }, { ...queued, updatedAt: 'not-a-time' },
    { ...queued, updatedAt: '2026-02-30T00:00:00Z' },
    { ...queued, resultReference: { type: 'export', id: 'https://untrusted.invalid' } }]) {
    response = invalid
    const code = await page.evaluate(async (id) => {
      const path = '/src/api/operations.ts'
      const { getOperation } = await import(/* @vite-ignore */ path)
      try { await getOperation(id); return 'accepted' } catch (error) { return (error as { code: string }).code }
    }, operationId)
    expect(code).toBe('CONTRACT_MISMATCH')
  }
})

test('visible progress stays monotonic and REST reconstructs gaps and reconnects', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => route.fulfill({ json: { items: [], nextCursor: null } }))
  let durable = { ...queued, state: 'RUNNING', stage: 'PREPARE', progress: 10, version: 2,
    startedAt: '2026-08-28T00:00:10Z', updatedAt: '2026-08-28T00:00:10Z' }
  let reads = 0
  await page.route('**/api/v1/operations/**', route => {
    reads += 1
    return route.fulfill({ json: durable })
  })
  await page.goto('/dashboard')

  await emitOperationSignal(page, 2)
  const monitor = page.getByRole('region', { name: 'Progreso de operaciones' })
  await expect(monitor.getByRole('progressbar')).toHaveAttribute('value', '10')
  await expect(monitor).not.toContainText('PREPARE')

  durable = { ...durable, stage: 'BUILD', progress: 70, version: 5,
    updatedAt: '2026-08-28T00:00:20Z' }
  await emitOperationSignal(page, 5)
  await expect(monitor.getByRole('progressbar')).toHaveAttribute('value', '70')
  expect(reads).toBe(2)

  await emitOperationSignal(page, 4)
  await page.waitForTimeout(200)
  expect(reads).toBe(2)
  await expect(monitor.getByRole('progressbar')).toHaveAttribute('value', '70')

  durable = { ...durable, stage: 'STORE', progress: 90, version: 6,
    updatedAt: '2026-08-28T00:00:30Z' }
  await page.evaluate(() => window.dispatchEvent(new Event('abstractify:e2e-operation-reconnect')))
  await expect(monitor.getByRole('progressbar')).toHaveAttribute('value', '90')
  expect(reads).toBe(3)
})

test('a remembered command receipt recovers after reconnect without any notification', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => route.fulfill({ json: { items: [], nextCursor: null } }))
  let reads = 0
  await page.route('**/api/v1/operations/**', route => {
    reads += 1
    return route.fulfill({ json: { ...queued, state: 'RUNNING', stage: 'PRIVATE_PROVIDER_STAGE',
      progress: 35, version: 3, startedAt: '2026-08-28T00:00:10Z', updatedAt: '2026-08-28T00:00:20Z' } })
  })
  await page.goto('/dashboard')

  await registerOperationReceipt(page)
  const monitor = page.getByRole('region', { name: 'Progreso de operaciones' })
  await expect(monitor.getByRole('progressbar')).toHaveAttribute('value', '35')
  await expect(monitor).not.toContainText('PRIVATE_PROVIDER_STAGE')
  expect(reads).toBe(1)

  await page.reload()
  await expect(monitor.getByRole('progressbar')).toHaveAttribute('value', '35')
  expect(reads).toBe(2)
})

test('authorization expiry clears progress and a foreign signal discloses nothing', async ({ page }) => {
  await page.route('**/api/v1/projects*', route => route.fulfill({ json: { items: [], nextCursor: null } }))
  let own = true
  await page.route('**/api/v1/operations/**', route => own
    ? route.fulfill({ json: { ...queued, state: 'RUNNING', stage: 'BUILD', progress: 50, version: 2,
      startedAt: '2026-08-28T00:00:10Z', updatedAt: '2026-08-28T00:00:10Z' } })
    : route.fulfill({ status: 404, json: { code: 'RESOURCE_NOT_FOUND', detail: 'FOREIGN_PRIVATE_PROJECT' } }))
  await page.goto('/dashboard')

  await emitOperationSignal(page, 2)
  const monitor = page.getByRole('region', { name: 'Progreso de operaciones' })
  await expect(monitor).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new Event('abstractify:e2e-operation-expired')))
  await expect(monitor).not.toBeVisible()

  own = false
  const foreignId = '936a89df-0d03-4ea5-a446-821a9e3ec999'
  await emitOperationSignal(page, 1, foreignId)
  await expect(monitor).not.toBeVisible()
  await expect(page.locator('body')).not.toContainText(foreignId)
  await expect(page.locator('body')).not.toContainText('FOREIGN_PRIVATE_PROJECT')
})
