// Identify or verify the built SPA artifact (see artifact-identity.mjs).
//
//   node scripts/release-artifact.mjs identify <dist> <out.json>    write the identity of dist/
//   node scripts/release-artifact.mjs verify <dist> <identity.json>  exit 1 unless dist/ matches
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { identify, mismatches } from './artifact-identity.mjs'
import { gitCommit } from './git-commit.mjs'

const [, , command, dist, file] = process.argv
if (command === 'identify' && dist && file) {
  const identity = await identify(dist, gitCommit())
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(identity, null, 2) + '\n')
  console.log(`${identity.artifactSha256}  ${dist} (${identity.fileCount} files, ${identity.bytes} bytes)`)
} else if (command === 'verify' && dist && file) {
  const problems = await mismatches(dist, JSON.parse(await readFile(file, 'utf8')))
  if (problems.length > 0) {
    console.error(`${dist} is not the identified artifact:\n  ${problems.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`${dist} is the identified artifact`)
} else {
  console.error('usage: node scripts/release-artifact.mjs identify <dist> <out.json> | verify <dist> <identity.json>')
  process.exit(2)
}
