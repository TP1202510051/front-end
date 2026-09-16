// Stage the identified SPA artifact for a Hosting preview channel (see hosting-config.mjs).
//
//   node scripts/hosting-stage.mjs <dist> <identity.json> <staging-runtime-config.json> [site] [channel]
import { readFile } from 'node:fs/promises'
import { stage } from './hosting-config.mjs'

const [, , dist, identityFile, configFile, site, channel] = process.argv
if (!dist || !identityFile || !configFile) {
  console.error('usage: node scripts/hosting-stage.mjs <dist> <identity.json> <staging-runtime-config.json> [site] [channel]')
  process.exit(2)
}
const staged = await stage(dist, JSON.parse(await readFile(identityFile, 'utf8')), JSON.parse(await readFile(configFile, 'utf8')))
console.log(`${dist} staged for ${staged.projectId} against ${staged.apiBaseUrl}; artifact ${staged.artifactSha256}`)
console.log('Deploy it without traffic to a preview channel, then verify what is served:')
console.log(`  npx firebase hosting:channel:deploy ${channel ?? 'rc'} --only ${site ?? '<site>'} --expires 30d`)
console.log(`  node scripts/release-artifact.mjs verify-remote <channel url> ${identityFile} release/hosting-receipt.json <hosting version>`)
