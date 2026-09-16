// Staging the identified artifact for Firebase Hosting (front-end#90): the installation's
// runtime-config.json is written next to dist/ from a configuration file that never enters the
// repository, and dist/ is checked against its identity before and after, since the configuration
// is the one file the identity leaves out.
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { mismatches, RUNTIME_CONFIG } from './artifact-identity.mjs'

// The same keys as src/runtime-config.ts, which a script cannot import; change both together.
const FIREBASE_KEYS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
const IDENTITY_KEYS = ['apiKey', 'projectId', 'appId']

/** The shape src/runtime-config.ts accepts, with the identity the installation cannot start without. */
export function runtimeConfigProblems(config) {
  const problems = []
  if (typeof config !== 'object' || config === null || Array.isArray(config)) return ['runtime configuration is not an object']
  for (const key of ['apiBaseUrl', 'apiWsUrl']) {
    if (typeof config[key] !== 'string' || !/^https:\/\//.test(config[key])) problems.push(`${key} must be an https origin`)
  }
  if (typeof config.firebase !== 'object' || config.firebase === null) return [...problems, 'firebase must be an object']
  for (const key of FIREBASE_KEYS) {
    if (typeof config.firebase[key] !== 'string') problems.push(`firebase.${key} must be a string`)
    else if (IDENTITY_KEYS.includes(key) && config.firebase[key] === '') problems.push(`firebase.${key} must not be empty`)
  }
  for (const key of Object.keys(config)) if (!['apiBaseUrl', 'apiWsUrl', 'firebase'].includes(key)) problems.push(`unknown key ${key}`)
  return problems
}

/**
 * Writes dist/runtime-config.json from the staging configuration and returns the identity checks
 * before and after: the artifact must be the identified one, and adding the configuration must not
 * change that.
 */
export async function stage(dist, identity, config) {
  const before = await mismatches(dist, identity)
  if (before.length > 0) throw new Error(`${dist} is not the identified artifact:\n  ${before.join('\n  ')}`)
  const problems = runtimeConfigProblems(config)
  if (problems.length > 0) throw new Error(`staging runtime configuration refused:\n  ${problems.join('\n  ')}`)
  await writeFile(join(dist, RUNTIME_CONFIG), JSON.stringify(config, null, 2) + '\n')
  const after = await mismatches(dist, identity)
  if (after.length > 0) throw new Error(`writing ${RUNTIME_CONFIG} changed the artifact:\n  ${after.join('\n  ')}`)
  return { artifactSha256: identity.artifactSha256, apiBaseUrl: config.apiBaseUrl, projectId: config.firebase.projectId }
}

