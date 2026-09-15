import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findings } from './secret-shapes.mjs'
import { walk } from './walk.mjs'

const TEXT_EXTENSIONS = /\.(m?[jt]sx?|json|html|css|md|txt|ya?ml|env|map)$/i

const root = new URL('..', import.meta.url)

test('the tracked sources carry no credential-shaped text', async () => {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(name => name && TEXT_EXTENSIONS.test(name))
  assert.ok(tracked.length > 50, 'git ls-files should see the repository')
  const found = []
  for (const name of tracked) {
    if (name === 'scripts/artifact-secrets.test.mjs' || name === 'scripts/secret-shapes.mjs' || name === 'scripts/evidence-summary.mjs') continue
    found.push(...findings(name, await readFile(new URL(name, root), 'utf8')))
  }
  assert.deepEqual(found, [])
  assert.ok(!tracked.some(name => /^\.env(\..*)?$/.test(name) && !name.endsWith('.example')),
    'a dotenv file must never be tracked')
})

test('the built artifact carries no credential-shaped text and no dotenv file', async () => {
  const dist = fileURLToPath(new URL('dist/', root))
  await stat(dist).catch(() => assert.fail('dist/ is missing: run `npm run build` before this scan'))
  const files = await walk(dist)
  assert.ok(files.some(name => name === 'index.html'), 'dist/index.html is the entry point')
  assert.deepEqual(files.filter(name => /(^|\/)\.env/.test(name)), [], 'no dotenv file may ship')
  const found = []
  for (const name of files.filter(name => TEXT_EXTENSIONS.test(name))) {
    found.push(...findings(name, await readFile(join(dist, name), 'utf8')))
  }
  assert.deepEqual(found, [])
})

test('the scan recognises the credential shapes it claims to reject', () => {
  const samples = [
    '-----BEGIN PRIVATE KEY-----\nMIIE',
    '{"type": "service_account", "private_key": "-----"}',
    'token=APP_USR-1234567890-091213-0123456789abcdef0123456789abcdef-123456789',
    'secret=GOCSPX-abcdefghijklmnopqrstuvwxyz',
    'AKIAABCDEFGHIJKLMNOP',
    'ghp_' + 'a'.repeat(36),
  ]
  for (const sample of samples) assert.ok(findings('sample', sample).length > 0, sample)
  assert.deepEqual(findings('public', 'VITE_FIREBASE_API_KEY=AIzaSyDeterministic-public-web-key'), [])
})
