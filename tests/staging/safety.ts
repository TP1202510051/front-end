import { open } from 'node:fs/promises'

export function stagingSettings(env: NodeJS.ProcessEnv) {
  const browser = env.STAGING_BROWSER ?? 'chrome'
  if (browser !== 'chrome' && browser !== 'edge') throw new Error('STAGING_BROWSER must be chrome or edge')
  const model = env.STAGING_ASSISTANT_MODEL
  const ready = Boolean(env.STAGING_URL || env.STAGING_EMAIL || env.STAGING_PASSWORD || env.STAGING_STORE_URL)
  if (ready) {
    for (const key of ['STAGING_URL', 'STAGING_EMAIL', 'STAGING_PASSWORD', 'STAGING_STORE_URL']) {
      if (!env[key]) throw new Error(`${key} is required: a partial staging run cannot certify the candidate`)
    }
    if (model !== 'gemini' && model !== 'deterministic') throw new Error('Declare STAGING_ASSISTANT_MODEL before running staging')
    if (model === 'gemini' && (browser !== 'chrome' || !env.STAGING_GEMINI_RUN_LOCK)) {
      throw new Error('Gemini requires Chrome and a persistent STAGING_GEMINI_RUN_LOCK; run Edge after switching to deterministic')
    }
  }
  return { browser, model, ready }
}

/** Reserve before clicking, even if the response later times out. Never release automatically. */
export async function reserveGeminiRun(file: string, projectId: string) {
  const handle = await open(file, 'wx', 0o600).catch(error => {
    if (error.code === 'EEXIST') throw new Error('Gemini was already reserved for this candidate. Inspect the existing run; do not retry or remove its lock automatically.')
    throw error
  })
  try {
    await handle.writeFile(JSON.stringify({ projectId, startedAtUtc: new Date().toISOString() }) + '\n')
  } finally { await handle.close() }
}
