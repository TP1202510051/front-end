import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { verifyGenerated, verifyPair } from './contract-checks.mjs'

const contract = JSON.parse(await readFile(new URL('../contracts/openapi-v1.json', import.meta.url), 'utf8'))

test('semantically identical contracts ignore object key order', () => {
  verifyPair(contract, Object.fromEntries(Object.entries(contract).reverse()))
})

for (const mutation of ['response', 'parameter', 'problem', 'route']) {
  test(`rejects ${mutation} drift before integration`, () => {
    const changed = structuredClone(contract)
    if (mutation === 'response') changed.components.schemas.ProjectSummary.properties.id.type = 'integer'
    if (mutation === 'parameter') changed.paths['/api/v1/projects'].get.parameters[0].required = true
    if (mutation === 'problem') changed.components.schemas.ProblemCode.enum.push('UNREVIEWED_PROBLEM')
    if (mutation === 'route') delete changed.paths['/api/v1/projects/{id}']
    assert.throws(() => verifyPair(contract, changed), /OpenAPI drift/)
  })
}

test('manual generated-client edits or stale generation fail closed', () => {
  verifyGenerated('expected', 'expected')
  assert.throws(() => verifyGenerated('stale or edited', 'expected'), /types drifted/)
})
