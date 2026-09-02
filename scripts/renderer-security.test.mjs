import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'

const renderers = new URL('../src/components/renderers/', import.meta.url)
const rendererFiles = (await readdir(renderers)).filter(name => name.endsWith('.tsx'))
const sources = await Promise.all([
  ...rendererFiles.map(name => readFile(new URL(name, renderers), 'utf8')),
  readFile(new URL('../src/pages/code-interface/CodeInterface.tsx', import.meta.url), 'utf8'),
])
const renderingPath = sources.join('\n')

test('the verified Canvas path uses typed rendering and contains no executable source sink', () => {
  assert.match(renderingPath, /RegistryRenderer/)
  assert.doesNotMatch(renderingPath, /new\s+Function|\beval\s*\(|dangerouslySetInnerHTML|\.innerHTML\s*=|\.write\s*\(/)
})
