import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { artifactSha256, contentManifest, identify, mismatches, remoteMismatches, RUNTIME_CONFIG } from './artifact-identity.mjs'

async function dist(files) {
  const directory = await mkdtemp(join(tmpdir(), 'artifact-'))
  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(directory, path, '..'), { recursive: true })
    await writeFile(join(directory, path), content)
  }
  return directory
}

const BUILD = { 'index.html': '<div id="root"></div>', 'assets/app-abc123.js': 'console.log(1)', 'assets/app-abc123.css': 'body{}' }

test('the same content is the same artifact wherever and whenever it is identified', async () => {
  const first = await dist(BUILD)
  const second = await dist(BUILD)
  const a = await identify(first, 'c1')
  const b = await identify(second, 'c2')
  assert.equal(a.artifactSha256, b.artifactSha256)
  assert.equal(a.fileCount, 3)
  assert.deepEqual(await mismatches(second, a), [])
  await rm(first, { recursive: true }); await rm(second, { recursive: true })
})

test('one changed byte, one extra file or one missing file is a different artifact', async () => {
  const original = await dist(BUILD)
  const identity = await identify(original, 'c1')
  const changed = await dist({ ...BUILD, 'assets/app-abc123.js': 'console.log(2)' })
  assert.deepEqual(await mismatches(changed, identity), ['changed file assets/app-abc123.js'])
  const extra = await dist({ ...BUILD, 'extra.txt': 'x' })
  assert.deepEqual(await mismatches(extra, identity), ['unexpected file extra.txt'])
  const { 'assets/app-abc123.css': _css, ...without } = BUILD
  const missing = await dist(without)
  assert.deepEqual(await mismatches(missing, identity), ['missing file assets/app-abc123.css'])
  assert.notEqual(artifactSha256(await contentManifest(changed)), identity.artifactSha256)
  for (const directory of [original, changed, extra, missing]) await rm(directory, { recursive: true })
})

test('the installation configuration is never part of the artifact', async () => {
  const bare = await dist(BUILD)
  const configured = await dist({ ...BUILD, [RUNTIME_CONFIG]: '{"apiBaseUrl":"https://api.example"}' })
  const identity = await identify(bare, 'c1')
  assert.deepEqual(await mismatches(configured, identity), [])
  assert.deepEqual(identity.excludes, [RUNTIME_CONFIG])
  await rm(bare, { recursive: true }); await rm(configured, { recursive: true })
})

test('a directory without index.html is not a built artifact', async () => {
  const empty = await dist({ 'readme.txt': 'nothing built here' })
  await assert.rejects(identify(empty, 'c1'), /no index\.html/)
  await rm(empty, { recursive: true })
})

/** A host like Firebase Hosting: serves what it has and index.html to everything else. */
function host(files) {
  return async url => {
    const path = new URL(url).pathname.slice(1)
    const body = files[path] ?? files['index.html']
    return { ok: true, status: 200, arrayBuffer: async () => Buffer.from(body) }
  }
}

test('a deployment serves the identified artifact only when every file hashes the same', async () => {
  const bare = await dist(BUILD)
  const identity = await identify(bare, 'c1')
  assert.deepEqual(await remoteMismatches('https://rc.example.invalid/', identity, host(BUILD)), [])
  assert.deepEqual(await remoteMismatches('https://rc.example.invalid', identity, host({ ...BUILD, 'assets/app-abc123.js': 'console.log(2)' })),
    ['changed file assets/app-abc123.js'])
  // A missing file comes back as index.html: still not the artifact.
  const { 'assets/app-abc123.css': _css, ...without } = BUILD
  assert.deepEqual(await remoteMismatches('https://rc.example.invalid', identity, host(without)), ['changed file assets/app-abc123.css'])
  await rm(bare, { recursive: true })
})
