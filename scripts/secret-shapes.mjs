// The credential shapes the release must never carry: in the tracked sources, in the built
// artifact (artifact-secrets.test.mjs) and in the evidence (release-evidence.mjs). The Firebase web
// configuration is public by design and is not a secret; what must never appear is a private key, a
// service account, a payment access token, an OAuth client secret or a bearer token.
export const SECRET_PATTERNS = [
  ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['service account JSON', /"private_key"\s*:\s*"/],
  ['service account type', /"type"\s*:\s*"service_account"/],
  ['Mercado Pago access token', /\b(APP_USR|TEST)-\d{6,}-\d{6}-[0-9a-f]{32}-\d{6,}\b/],
  ['Google OAuth client secret', /\bGOCSPX-[A-Za-z0-9_-]{20,}\b/],
  ['AWS access key id', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
]

/** Shapes that are not credentials but do not belong in evidence: tokens in flight and people. */
export const EVIDENCE_PATTERNS = [
  ...SECRET_PATTERNS,
  ['bearer token', /\bBearer\s+(?!deterministic-e2e-token\b|actor-[ab]-token\b|valid-token\b)[A-Za-z0-9._-]{16,}/],
  ['JSON web token', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['personal e-mail address', /\b[A-Za-z0-9._%+-]+@(?!(example|e2e)\.(test|com|invalid)\b|ejemplo\.pe\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/],
  ['local absolute path', /(?:[A-Z]:\\Users\\|\/home\/|\/Users\/)[A-Za-z0-9._-]+/],
  // The assistant prompt template lives in the backend resources; its opening words identify it.
  ['assistant prompt text', /Eres el asistente de Abstractify|Responde SOLO con un objeto JSON/],
]

export function findings(name, content, patterns = SECRET_PATTERNS) {
  return patterns.filter(([, pattern]) => pattern.test(content)).map(([label]) => `${name}: ${label}`)
}
