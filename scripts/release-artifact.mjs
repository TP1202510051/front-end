// Identify or verify the built SPA artifact (see artifact-identity.mjs).
//
//   node scripts/release-artifact.mjs identify <dist> <out.json>    write the identity of dist/
//   node scripts/release-artifact.mjs verify <dist> <identity.json>  exit 1 unless dist/ matches
//   node scripts/release-artifact.mjs verify-remote <url> <identity.json> [receipt.json] [hosting version]
//                                                exit 1 unless the deployment serves the artifact;
//                                                with a receipt path, write what was verified
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { identify, mismatches, remoteMismatches } from './artifact-identity.mjs'
import { gitCommit } from './git-commit.mjs'

const [, , command, dist, file, receipt, version] = process.argv
if (command === 'verify-remote' && dist && file) {
  const identity = JSON.parse(await readFile(file, 'utf8'))
  const problems = await remoteMismatches(dist, identity)
  if (problems.length > 0) {
    console.error(`${dist} does not serve the identified artifact:\n  ${problems.join('\n  ')}`)
    process.exit(1)
  }
  if (receipt) {
    await mkdir(dirname(receipt), { recursive: true })
    await writeFile(receipt, JSON.stringify({ schema: 'hosting-receipt@1', url: dist, version: version ?? null, commit: identity.commit,
      artifactSha256: identity.artifactSha256, fileCount: identity.fileCount, verifiedAtUtc: new Date().toISOString() }, null, 2) + '\n')
  }
  console.log(`${dist} serves the identified artifact ${identity.artifactSha256}`)
} else if (command === 'identify' && dist && file) {
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
  console.error('usage: node scripts/release-artifact.mjs identify <dist> <out.json> | verify <dist> <identity.json> | verify-remote <url> <identity.json> [receipt.json] [hosting version]')
  process.exit(2)
}
