// Extract the journeys' receipt from the staging Playwright JSON report (see tests/staging).
//
//   node scripts/staging-receipt.mjs <out.json> [release/playwright-staging.json]
//
// The last `staging-receipt` attachment is the complete one; it is decoded and written as is.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const [, , out, reportFile = 'release/playwright-staging.json'] = process.argv
if (!out) {
  console.error('usage: node scripts/staging-receipt.mjs <out.json> [playwright-staging.json]')
  process.exit(2)
}
const report = JSON.parse(await readFile(reportFile, 'utf8'))
let receipt = null
const walk = suite => {
  for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) for (const result of test.results ?? []) {
    for (const attachment of result.attachments ?? []) {
      if (attachment.name === 'staging-receipt' && attachment.body) receipt = JSON.parse(Buffer.from(attachment.body, 'base64').toString('utf8'))
    }
  }
  for (const child of suite.suites ?? []) walk(child)
}
for (const suite of report.suites ?? []) walk(suite)
if (!receipt) {
  console.error(`${reportFile} carries no staging-receipt attachment: did the journeys run?`)
  process.exit(1)
}
await mkdir(dirname(out), { recursive: true })
await writeFile(out, JSON.stringify(receipt, null, 2) + '\n')
console.log(`${out}: ${Object.keys(receipt).join(', ')}`)
