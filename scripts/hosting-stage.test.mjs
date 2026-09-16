import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { identify } from './artifact-identity.mjs'
import { runtimeConfigProblems, stage } from './hosting-config.mjs'

const CONFIG = {
  apiBaseUrl: 'https://api.staging.invalid', apiWsUrl: 'https://api.staging.invalid/ws',
  firebase: { apiKey: 'public-web-key', authDomain: 'p.firebaseapp.com', projectId: 'p', storageBucket: 'p.appspot.com', messagingSenderId: '0', appId: '1:0:web:0' },
}

async function dist() {
  const directory = await mkdtemp(join(tmpdir(), 'stage-'))
  await mkdir(join(directory, 'assets'))
  await writeFile(join(directory, 'index.html'), '<div id="root"></div>')
  await writeFile(join(directory, 'assets', 'app.js'), 'console.log(1)')
  return directory
}

test('the staging configuration must be complete, https and nothing else', () => {
  assert.deepEqual(runtimeConfigProblems(CONFIG), [])
  assert.deepEqual(runtimeConfigProblems({ ...CONFIG, apiBaseUrl: 'http://api.staging.invalid' }), ['apiBaseUrl must be an https origin'])
  assert.deepEqual(runtimeConfigProblems({ ...CONFIG, firebase: { ...CONFIG.firebase, apiKey: '' } }), ['firebase.apiKey must not be empty'])
  assert.deepEqual(runtimeConfigProblems({ ...CONFIG, cloudRunUrl: 'x' }), ['unknown key cloudRunUrl'])
})

test('staging writes the configuration next to the artifact without changing its identity', async () => {
  const directory = await dist()
  const identity = await identify(directory, 'c1')
  const staged = await stage(directory, identity, CONFIG)
  assert.equal(staged.artifactSha256, identity.artifactSha256)
  assert.deepEqual(JSON.parse(await readFile(join(directory, 'runtime-config.json'), 'utf8')), CONFIG)
  await rm(directory, { recursive: true })
})

test('a directory that is not the identified artifact is not staged', async () => {
  const directory = await dist()
  const identity = await identify(directory, 'c1')
  await writeFile(join(directory, 'assets', 'app.js'), 'console.log(2)')
  await assert.rejects(stage(directory, identity, CONFIG), /changed file assets\/app\.js/)
  await rm(directory, { recursive: true })
})
