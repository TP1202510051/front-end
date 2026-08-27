import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'
import { verifyGenerated, verifyPair } from './contract-checks.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contract = path.join(root, 'contracts/openapi-v1.json')
const generated = path.join(root, 'src/api/schema.d.ts')
const mode = process.argv[2] ?? 'check'
const types = astToString(await openapiTS(new URL('../contracts/openapi-v1.json', import.meta.url)))

if (mode === 'generate') {
  await fs.mkdir(path.dirname(generated), { recursive: true })
  await fs.writeFile(generated, types)
  console.log('Generated client types from the reviewed OpenAPI contract.')
} else {
  verifyGenerated(await fs.readFile(generated, 'utf8'), types)
  if (mode === 'pair') {
    const backendContract = process.argv[3] ?? process.env.ABSTRACTIFY_BACKEND_CONTRACT
    if (!backendContract) throw new Error('Set ABSTRACTIFY_BACKEND_CONTRACT to the paired backend contracts/openapi-v1.json. Pair verification never silently skips.')
    const local = JSON.parse(await fs.readFile(contract, 'utf8'))
    const remote = JSON.parse(await fs.readFile(path.resolve(backendContract), 'utf8'))
    verifyPair(local, remote)
    console.log('Backend and SPA contracts agree.')
  } else if (mode !== 'check') throw new Error(`Unknown contract mode: ${mode}`)
  console.log('Generated client matches its versioned contract.')
}
