# Versioned platform client

Capability pair: [back-end#62](https://github.com/TP1202510051/back-end/issues/62) and [front-end#70](https://github.com/TP1202510051/front-end/issues/70). Read both tickets before changing this boundary. Both branches use `feature/module-contracts`; both PRs target `develop`, never `main`.

## Boundary

`contracts/openapi-v1.json` is the reviewed copy of the backend's live `/v3/api-docs/v1` schema. `src/api/schema.d.ts` is generated with the locked `openapi-typescript` version. `openapi-fetch` constrains paths, parameters and bodies; `src/api/projects.ts` is the UI-facing boundary. Firebase supplies the bearer token through `auth-session`, not request bodies. Project identifiers stay strings, including values larger than JavaScript's safe integer range.

The metadata foundation migrates project list/create/read/rename/delete to `/api/v1/projects`. Async operation recovery extends it as described below; the structured Project document, Assistant and Generation remain separate slices. Remaining legacy endpoints keep their existing clients until their vertical slices replace them; the old synchronous ZIP download is not a verified export.

## Async operation recovery extension

For recovery work, read [back-end#63](https://github.com/TP1202510051/back-end/issues/63)
and [front-end#94](https://github.com/TP1202510051/front-end/issues/94) together. Their paired
branches use `feature/async-admission` and target `develop`.

`src/api/operations.ts` exposes `getOperation(operationId)`, an authenticated, bounded REST
read of `/api/v1/operations/{id}`. It verifies identity, safe integer version, known state/work
type/actions, timestamps, progress bounds and local references before returning data. Unknown
or malformed representations require refresh. A 404 does not distinguish another owner's work
from a missing operation. `IDEMPOTENCY_KEY_REUSED` maps to local edit guidance for future domain
commands; neither this client nor the backend provides generic arbitrary-work submission.

Admission returns `QUEUED` with no invented percentage or result. The owner-scoped progress
interface from [front-end#71](https://github.com/TP1202510051/front-end/issues/71) /
[back-end#66](https://github.com/TP1202510051/back-end/issues/66) subscribes to the exact private
`/user/queue/operations` destination after authentication. Signals contain only operation UUID
and monotonic version. Operation-starting REST flows call `registerOperationReceipt` immediately
after accepting a durable receipt, before depending on WebSocket delivery. Any newer version,
initial connection, or reconnect triggers the authoritative REST read. Stale signals are ignored, gaps converge through REST, a uniform 404
forgets the identifier, and identity expiry clears visible and remembered progress. The browser
transport exposes no business-command send interface. Stable server stage codes are mapped to
local safe labels and unknown codes fall back to local operation-state text.

Failures never display server detail/title, provider text or arbitrary recovery instructions. The generated problem-code union selects local safe text and an exhaustive recovery action. Unknown codes or invalid successful payloads request an application refresh. Transport failures permit a deliberate retry; mutations are never automatically retried. A validated correlation UUID can be copied for support. Dashboard pagination preserves existing cards while loading another page.

## Verification and coordinated updates

1. Review both tickets and the intended API change. Change the backend DTO/controller first; its image test compares the actual OpenAPI with its checked-in snapshot.
2. Review `target/openapi-v1.actual.json`, including nullable fields, responses, security and referenced schemas. Update both contract copies together. Do not accept a snapshot merely to make a test green.
3. Run `npm run contract:generate`. Generated types are not hand-edited.
4. Set `ABSTRACTIFY_BACKEND_CONTRACT` to the paired checkout's `TesisAoskaunto/contracts/openapi-v1.json`, then run `npm run verify:pair`. This checks the exact semantic schema, generated code, lint, TypeScript, production build and browser suite. Pair verification fails if the backend path is absent; it never silently skips.
5. Commit the SPA, then update the backend's `contracts/frontend-ref.txt` to that immutable SPA commit. Backend contract CI checks that exact public frontend revision without introducing a secret for the private backend. The SPA CI checks local generation and drift-negative tests. Both PRs must link each other and carry passing pair evidence before merge; any later SPA contract edit requires repinning/rechecking the backend PR.

`npm run verify` is the standalone check, not cross-repository sign-off. `npm run test:contract` proves that response, parameter, route, problem-code and generated-type drift fail. Ordering of JSON object keys alone is irrelevant. This strict equivalence intentionally rejects even additive drift until both sides are reviewed together. For a breaking change, publish a new API major version rather than silently replacing v1.

No branch protection or paid service is required. CI is a verification signal, not an automatic merge/deploy action. Production credentials are not used by contract tests; the existing deterministic browser-auth adapter remains build-rejected outside E2E development mode.
