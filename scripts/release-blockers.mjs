// Sanitized evidence of the release security blockers (release-gates §8), SPA half.
//
// Runs the negative tests that prove each blocker and leaves in release-evidence/ a JSON and a
// Markdown with only what the evidence needs: which test, in which file, whether it passed and how
// long it took. No tokens, no addresses, no server output: the full Playwright reports stay where
// they always are. S5 (Mercado Pago signature and idempotency) has no SPA half: the Generated
// store backend proves it.
import { spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const evidenceDirectory = new URL('../release-evidence/', import.meta.url)

/** Each blocker is proven by node:test files, by Playwright tests carrying its tag, or both. */
const BLOCKERS = [
  { id: 'S1', claim: 'No live or unknown secret travels in the tracked sources or in the built artifact.',
    node: ['scripts/artifact-secrets.test.mjs'] },
  { id: 'S2', claim: 'A foreign or missing Store project, operation or download reads as not available, without any server detail.',
    tag: '@S2' },
  { id: 'S3', claim: 'Nothing model- or server-originated becomes executable code: the verified renderer is typed and incompatible data fails closed.',
    node: ['scripts/renderer-security.test.mjs'], tag: '@S3' },
  { id: 'S4', claim: 'The realtime channel only improves progress: REST recovers the authoritative state after gaps, reconnects and identity expiry, and a foreign signal discloses nothing.',
    tag: '@S4' },
]

function run(command, args, env = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', env: { ...process.env, ...env } })
  return { status: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? '' }
}

/** One node:test per TAP line: `ok N - title` or `not ok N - title`. */
function nodeTests(file) {
  const { stdout } = run('node', ['--test', '--test-reporter=tap', file])
  const proofs = []
  for (const line of stdout.split('\n')) {
    const match = /^(not ok|ok) \d+ - (.+?)(?: # .*)?\r?$/.exec(line)
    if (match) proofs.push({ file, title: match[2], passed: match[1] === 'ok' })
  }
  if (proofs.length === 0) proofs.push({ file, title: '(no test ran)', passed: false })
  return proofs
}

const TAGS = BLOCKERS.map(blocker => blocker.tag).filter(Boolean)
let playwrightReport = null

/** The Playwright tests carrying the tag, in Chrome, from one JSON report of all of them. */
async function playwrightTests(tag) {
  if (!playwrightReport) {
    const report = new URL('playwright-blockers.json', evidenceDirectory)
    // The CLI through node rather than npx: no shell, so the arguments arrive as written everywhere.
    run('node', ['node_modules/@playwright/test/cli.js', 'test', '--project=chrome', '--grep', TAGS.join('|'), '--reporter=json'],
      { PLAYWRIGHT_JSON_OUTPUT_NAME: fileURLToPath(report) })
    playwrightReport = JSON.parse(await readFile(report, 'utf8'))
  }
  const json = playwrightReport
  const proofs = []
  const walk = (suite, file) => {
    for (const spec of suite.specs ?? []) {
      if (!spec.tags?.includes(tag.slice(1))) continue
      proofs.push({
        file: `tests/e2e/${file ?? suite.file}`, title: spec.title, passed: spec.ok,
        durationMs: spec.tests?.reduce((total, test) => total + (test.results?.at(-1)?.duration ?? 0), 0) ?? 0,
      })
    }
    for (const child of suite.suites ?? []) walk(child, file ?? suite.file)
  }
  for (const suite of json.suites ?? []) walk(suite)
  if (proofs.length === 0) proofs.push({ file: 'tests/e2e', title: `(no ${tag} test ran)`, passed: false })
  return proofs
}

await mkdir(evidenceDirectory, { recursive: true })
const commit = run('git', ['rev-parse', 'HEAD']).stdout.trim()
const blockers = []
for (const blocker of BLOCKERS) {
  const proofs = [...(blocker.node ?? []).flatMap(nodeTests), ...(blocker.tag ? await playwrightTests(blocker.tag) : [])]
  blockers.push({ id: blocker.id, claim: blocker.claim, proofs, passed: proofs.every(proof => proof.passed) })
}
const evidence = {
  repository: 'TP1202510051/front-end', commit, generatedAt: new Date().toISOString(), browser: 'chrome',
  passed: blockers.every(blocker => blocker.passed), blockers,
}
await writeFile(new URL('security-blockers.json', evidenceDirectory), JSON.stringify(evidence, null, 2) + '\n')

const lines = [
  '# Security blockers — frontend evidence', '',
  `Commit \`${commit}\`, generated ${evidence.generatedAt}, Playwright project \`chrome\`.`, '',
  '| Blocker | Result | Proofs |', '| --- | --- | --- |',
  ...blockers.map(blocker => `| ${blocker.id} — ${blocker.claim} | ${blocker.passed ? 'PASS' : 'FAIL'} | ${blocker.proofs.length} |`),
  '',
]
for (const blocker of blockers) {
  lines.push(`## ${blocker.id}`, '')
  for (const proof of blocker.proofs) lines.push(`- [${proof.passed ? 'x' : ' '}] \`${proof.file}\` — ${proof.title}`)
  lines.push('')
}
lines.push('S5 (Mercado Pago signature and idempotency) has no SPA half: see the backend evidence.', '')
await writeFile(new URL('security-blockers.md', evidenceDirectory), lines.join('\n'))

console.log(evidence.passed ? 'Security blockers: all frontend proofs passed.' : 'Security blockers: a frontend proof FAILED.')
for (const blocker of blockers) console.log(` ${blocker.passed ? 'PASS' : 'FAIL'} ${blocker.id}: ${blocker.proofs.filter(p => p.passed).length}/${blocker.proofs.length}`)
process.exit(evidence.passed ? 0 : 1)
