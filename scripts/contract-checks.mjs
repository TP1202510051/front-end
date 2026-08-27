const canonical = (value) => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value

export function verifyPair(local, remote) {
  if (JSON.stringify(canonical(local)) !== JSON.stringify(canonical(remote))) {
    throw new Error('Backend / SPA OpenAPI drift. Both paired tickets must agree before merge.')
  }
}

export function verifyGenerated(actual, expected) {
  if (actual !== expected) {
    throw new Error('Generated client types drifted. Review the contract, then run npm run contract:generate.')
  }
}
