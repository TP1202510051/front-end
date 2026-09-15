// The frontend's sanitized release evidence (front-end#89): what the tests said, without anything
// the full reports carry that does not belong in a thesis bundle -host paths, console output,
// error text, tokens in flight, the scanned DOM. The full Playwright reports stay in CI artifacts.
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { EVIDENCE_PATTERNS, findings } from './secret-shapes.mjs'
import { walk } from './walk.mjs'

const IMPACTS = ['critical', 'serious', 'moderate', 'minor']

function specs(suite, path, file) {
  const out = []
  for (const spec of suite.specs ?? []) out.push({ spec, path: [...path, spec.title].join(' › '), file: file ?? suite.file })
  for (const child of suite.suites ?? []) out.push(...specs(child, child.title && child.title !== child.file ? [...path, child.title] : path, file ?? suite.file))
  return out
}

function outcome(test) {
  const status = test.status === 'expected' ? 'passed' : test.status === 'unexpected' ? 'failed' : test.status
  return status === 'passed' || status === 'failed' || status === 'flaky' || status === 'skipped' ? status : 'failed'
}

/** One line per test and browser: title, file, tags, result, duration. Nothing else survives. */
export function playwrightSummary(reports) {
  const tests = []
  for (const report of reports) {
    for (const root of report.suites ?? []) {
      for (const { spec, path, file } of specs(root, [], undefined)) {
        for (const test of spec.tests ?? []) {
          tests.push({
            project: test.projectName, file, title: path, tags: spec.tags ?? [], status: outcome(test),
            durationMs: (test.results ?? []).reduce((total, result) => total + (result.duration ?? 0), 0),
          })
        }
      }
    }
  }
  const totals = { passed: 0, failed: 0, flaky: 0, skipped: 0 }
  for (const test of tests) totals[test.status] += 1
  return { totals, tests }
}

function decode(attachment) {
  if (attachment.body === undefined) return null
  try { return JSON.parse(Buffer.from(attachment.body, 'base64').toString('utf8')) } catch { return null }
}

/** The axe scans attached by the journeys, reduced to counts by impact and rule per state. */
export function axeSummary(reports) {
  const states = []
  for (const report of reports) {
    for (const root of report.suites ?? []) {
      for (const { spec } of specs(root, [], undefined)) {
        for (const test of spec.tests ?? []) {
          for (const result of test.results ?? []) {
            for (const attachment of result.attachments ?? []) {
              if (!attachment.name?.startsWith('axe-')) continue
              const scan = decode(attachment)
              if (!scan?.violations) continue
              const violations = Object.fromEntries(IMPACTS.map(impact => [impact, 0]))
              const rules = []
              for (const violation of scan.violations) {
                if (violation.impact in violations) violations[violation.impact] += 1
                rules.push({ id: violation.id, impact: violation.impact, nodes: violation.nodes?.length ?? 0 })
              }
              states.push({ project: test.projectName, state: attachment.name.slice(4), violations, rules })
            }
          }
        }
      }
    }
  }
  return states
}

export function unsanitized(name, content) {
  return findings(name, content, EVIDENCE_PATTERNS)
}

async function scanDirectory(directory) {
  const problems = []
  for (const name of await walk(directory)) {
    if (/\.(json|md|txt|html|xml|csv|log)$/i.test(name)) problems.push(...unsanitized(name, await readFile(join(directory, name), 'utf8')))
  }
  return problems
}

/**
 * Writes frontend-evidence.{json,md} and axe-summary.json into `out` from the Playwright JSON
 * reports, the artifact identity and the blockers evidence, then scans the whole directory: a file
 * that carries a token, a person or a host path is a failure, not a warning.
 */
export async function writeEvidence({ out, reports, commit, artifact, blockers }) {
  const parsed = []
  for (const file of reports) parsed.push(JSON.parse(await readFile(file, 'utf8')))
  const playwright = playwrightSummary(parsed)
  const axe = axeSummary(parsed)
  const evidence = {
    schema: 'frontend-evidence@1', repository: 'TP1202510051/front-end', commit,
    generatedAtUtc: new Date().toISOString(),
    artifactSha256: artifact?.artifactSha256 ?? null,
    playwright, axe: { states: axe.length, blocking: axe.filter(state => state.violations.critical + state.violations.serious > 0).length },
    securityBlockers: blockers ? { passed: blockers.passed, blockers: blockers.blockers.map(b => ({ id: b.id, passed: b.passed, proofs: b.proofs.length })) } : null,
    passed: playwright.totals.failed === 0 && (blockers?.passed ?? true),
  }
  await writeFile(join(out, 'frontend-evidence.json'), JSON.stringify(evidence, null, 2) + '\n')
  await writeFile(join(out, 'axe-summary.json'), JSON.stringify(axe, null, 2) + '\n')
  const projects = [...new Set(playwright.tests.map(test => test.project))]
  const lines = [
    '# Frontend evidence', '',
    `Commit \`${commit}\`; artifact \`${evidence.artifactSha256 ?? 'not identified'}\`; generated ${evidence.generatedAtUtc}.`, '',
    `Playwright: ${playwright.totals.passed} passed, ${playwright.totals.failed} failed, ${playwright.totals.flaky} flaky, ${playwright.totals.skipped} skipped across ${projects.join(', ') || 'no browser'}.`,
    `axe: ${axe.length} states scanned, ${evidence.axe.blocking} with a critical or serious violation.`,
    `Security blockers: ${blockers ? (blockers.passed ? 'PASS' : 'FAIL') : 'not run'}.`, '',
    '| Project | Test | Result | ms |', '| --- | --- | --- | --- |',
    ...playwright.tests.map(test => `| ${test.project} | \`${test.file}\` ${test.title} | ${test.status} | ${test.durationMs} |`), '',
  ]
  await writeFile(join(out, 'frontend-evidence.md'), lines.join('\n'))
  const problems = await scanDirectory(out)
  if (problems.length > 0) throw new Error(`evidence is not sanitized:\n  ${problems.join('\n  ')}`)
  return evidence
}
