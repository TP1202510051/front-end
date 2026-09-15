// Write the sanitized frontend evidence from Playwright JSON reports (see evidence-summary.mjs).
//
//   node scripts/release-evidence.mjs <out-dir> <playwright-report.json>...
//
// Picks up release/frontend-artifact.json and <out-dir>/security-blockers.json when they exist.
import { mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { writeEvidence } from './evidence-summary.mjs'
import { gitCommit } from './git-commit.mjs'

const [, , out, ...named] = process.argv
// A report that was not produced is not silently the same as one that passed: it is named here
// and its project simply does not appear in the evidence.
const reports = named.filter(report => existsSync(report) || (console.warn(`report ${report} not found; skipped`), false))
if (!out || reports.length === 0) {
  console.error('usage: node scripts/release-evidence.mjs <out-dir> <playwright-report.json>...')
  process.exit(2)
}
const optional = async path => existsSync(path) ? JSON.parse(await readFile(path, 'utf8')) : null
await mkdir(out, { recursive: true })
const evidence = await writeEvidence({
  out, reports, commit: gitCommit(),
  artifact: await optional(join('release', 'frontend-artifact.json')),
  blockers: await optional(join(out, 'security-blockers.json')),
})
console.log(`${evidence.passed ? 'PASS' : 'FAIL'} frontend evidence: ${evidence.playwright.totals.passed} passed, ${evidence.playwright.totals.failed} failed; axe ${evidence.axe.blocking}/${evidence.axe.states} blocking states; artifact ${evidence.artifactSha256 ?? 'not identified'}`)
process.exit(evidence.passed ? 0 : 1)
