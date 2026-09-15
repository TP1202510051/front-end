import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { axeSummary, playwrightSummary, unsanitized, writeEvidence } from './evidence-summary.mjs'

const axe = (violations) => Buffer.from(JSON.stringify({ violations })).toString('base64')

/** A Playwright JSON report as the reporter writes it: absolute paths, inline attachments and all. */
function report(project, { status = 'passed', extra = '' } = {}) {
  return {
    config: { rootDir: 'C:\\Users\\someone\\front-end', projects: [{ name: project }] },
    suites: [{ title: 'responsive-journeys.spec.ts', file: 'responsive-journeys.spec.ts', suites: [{
      title: 'at 360px', file: 'responsive-journeys.spec.ts', specs: [{
        title: 'the entrepreneur creates a project', ok: status === 'passed', tags: ['responsive'],
        tests: [{ projectName: project, status: status === 'passed' ? 'expected' : 'unexpected', results: [{
          status, duration: 1234, error: status === 'passed' ? undefined : { message: `boom ${extra}` },
          stdout: [{ text: `Bearer secret-token-abcdefghijklmnop ${extra}` }],
          attachments: [
            { name: 'axe-dashboard-360', contentType: 'application/json',
              body: axe([{ id: 'color-contrast', impact: 'serious', nodes: [{ target: ['p'] }] }, { id: 'region', impact: 'moderate', nodes: [{}, {}] }]) },
            { name: 'screen-dashboard-360', contentType: 'image/png', body: 'iVBORw0KGgo=' },
          ],
        }] }],
      }],
    }] }],
    stats: { expected: status === 'passed' ? 1 : 0, unexpected: status === 'passed' ? 0 : 1, flaky: 0, skipped: 0, duration: 1234 },
  }
}

test('the summary keeps titles, projects, results and durations and nothing that names the host or a token', () => {
  const summary = playwrightSummary([report('chrome'), report('edge')])
  assert.deepEqual(summary.totals, { passed: 2, failed: 0, flaky: 0, skipped: 0 })
  assert.deepEqual(summary.tests[0], {
    project: 'chrome', file: 'responsive-journeys.spec.ts', title: 'at 360px › the entrepreneur creates a project',
    tags: ['responsive'], status: 'passed', durationMs: 1234,
  })
  const text = JSON.stringify(summary)
  assert.ok(!text.includes('Users'), 'no host path')
  assert.ok(!text.includes('Bearer'), 'no token from stdout')
})

test('a failed test keeps only its status: the error text stays in the full report', () => {
  const summary = playwrightSummary([report('chrome', { status: 'failed', extra: 'C:\\Users\\someone\\x' })])
  assert.deepEqual(summary.totals, { passed: 0, failed: 1, flaky: 0, skipped: 0 })
  assert.equal(summary.tests[0].status, 'failed')
  assert.ok(!JSON.stringify(summary).includes('boom'))
})

test('axe results become counts by impact per state, never the scanned DOM', () => {
  const summary = axeSummary([report('chrome')])
  assert.deepEqual(summary, [{
    project: 'chrome', state: 'dashboard-360', violations: { critical: 0, serious: 1, moderate: 1, minor: 0 },
    rules: [{ id: 'color-contrast', impact: 'serious', nodes: 1 }, { id: 'region', impact: 'moderate', nodes: 2 }],
  }])
})

test('the sanitizer names what does not belong in evidence', () => {
  assert.deepEqual(unsanitized('a.json', 'commit 1234 passed'), [])
  assert.deepEqual(unsanitized('a.json', 'Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxIn0.abcdefghijklmnop'),
    ['a.json: bearer token', 'a.json: JSON web token'])
  assert.deepEqual(unsanitized('a.md', 'report from C:\\Users\\someone\\front-end'), ['a.md: local absolute path'])
  assert.deepEqual(unsanitized('a.md', 'entrepreneur someone.real@gmail.com'), ['a.md: personal e-mail address'])
  assert.deepEqual(unsanitized('a.md', 'empresaria@example.test and duena@ejemplo.pe'), [])
  assert.deepEqual(unsanitized('a.txt', 'Eres el asistente de Abstractify, una plataforma'), ['a.txt: assistant prompt text'])
})

test('writing the evidence refuses a directory that would carry a token', async () => {
  const out = await mkdtemp(join(tmpdir(), 'evidence-'))
  // The raw report lives outside the evidence: it is exactly what the evidence must not copy.
  const raw = await mkdtemp(join(tmpdir(), 'raw-'))
  const reportFile = join(raw, 'pw.json')
  await writeFile(reportFile, JSON.stringify(report('chrome')))
  const written = await writeEvidence({ out, reports: [reportFile], commit: 'abc', artifact: null, blockers: null })
  assert.ok(written.passed)
  const evidence = JSON.parse(await readFile(join(out, 'frontend-evidence.json'), 'utf8'))
  assert.equal(evidence.commit, 'abc')
  assert.equal(evidence.playwright.totals.passed, 1)
  await writeFile(join(out, 'leak.txt'), 'Bearer secret-token-abcdefghijklmnop')
  await assert.rejects(writeEvidence({ out, reports: [reportFile], commit: 'abc', artifact: null, blockers: null }), /leak\.txt: bearer token/)
  await rm(out, { recursive: true }); await rm(raw, { recursive: true })
})
