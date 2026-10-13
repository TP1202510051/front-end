import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { reserveGeminiRun, stagingSettings } from '../tests/staging/safety.ts'

const configured = { STAGING_URL: 'https://staging.example.test', STAGING_EMAIL: 'author@example.test', STAGING_PASSWORD: 'synthetic',
  STAGING_STORE_URL: 'https://store.example.test', STAGING_ASSISTANT_MODEL: 'gemini', STAGING_GEMINI_RUN_LOCK: '/unused/test-lock' }

test('only Chrome is selected by default and Gemini cannot be selected for Edge', () => {
  assert.equal(stagingSettings({}).browser, 'chrome')
  assert.equal(stagingSettings({}).ready, false)
  assert.throws(() => stagingSettings({ ...configured, STAGING_BROWSER: 'edge' }), /Gemini requires Chrome/)
  assert.equal(stagingSettings({ ...configured, STAGING_BROWSER: 'edge', STAGING_ASSISTANT_MODEL: 'deterministic' }).browser, 'edge')
})

test('partial staging inputs, undeclared model and missing Gemini lock fail closed', () => {
  assert.throws(() => stagingSettings({ STAGING_URL: configured.STAGING_URL }), /STAGING_EMAIL/)
  assert.throws(() => stagingSettings({ ...configured, STAGING_ASSISTANT_MODEL: undefined }), /Declare/)
  assert.throws(() => stagingSettings({ ...configured, STAGING_GEMINI_RUN_LOCK: undefined }), /persistent/)
})

test('concurrent requests reserve at most one Gemini run, and a later retry remains refused', async t => {
  const root = await mkdtemp(join(tmpdir(), 'staging-gemini-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const file = join(root, 'candidate.started.json')
  const attempts = await Promise.allSettled([reserveGeminiRun(file, '123'), reserveGeminiRun(file, '123')])
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1)
  await assert.rejects(reserveGeminiRun(file, '123'), /already reserved/)
  assert.equal(JSON.parse(await readFile(file, 'utf8')).projectId, '123')
  assert.equal((await stat(file)).mode & 0o777, 0o600)
})
