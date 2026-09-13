# Release gate — frontend half

Capability ticket: [front-end#88](https://github.com/TP1202510051/front-end/issues/88), paired with [back-end#98](https://github.com/TP1202510051/back-end/issues/98). The decisions it implements are sections 6, 8 and 9 of the backend's `TesisAoskaunto/docs/research/release-gates-2026.md`; the coordinated run that covers both repositories is `back-end/.github/workflows/release-gate.yml` and is described in `back-end/docs/architecture/release-gate.md`.

## What runs in CI

`.github/workflows/gate.yml` runs on every pull request to `develop` and on demand:

| Job | What it proves | Blocks |
| --- | --- | --- |
| `verify` | `npm ci` from the lockfile, generated client equals the versioned contract, contract and renderer-security tests, ESLint, TypeScript (app and Playwright files), production build, and the artifact secret scan (S1) | yes |
| `journeys` (`chrome`, `edge`) | every Playwright journey, axe on the states they visit, the responsive journeys at 360/768/1024/1440 px and the keyboard journey | yes |
| `journeys` (`firefox`) | the same journeys in Firefox | no: the step continues on error, and a failure is left visible as a warning annotation, a step-summary line and the uploaded report |
| `blockers` | `npm run blockers` after a build: the negative proofs of S1–S4 and the sanitized evidence in `release-evidence/` | yes |

The backend's coordinated gate checks out the revision pinned in `TesisAoskaunto/contracts/frontend-ref.txt` and runs the same scripts, so the SPA that the evidence names is the SPA the backend was verified against.

## Browsers and widths

Chrome and Edge are the blocking browsers for the critical journeys; Firefox is an informative smoke; Safari is not claimed. The critical journeys measured at the four agreed widths are, in `tests/e2e/responsive-journeys.spec.ts`: create a Store project from the dashboard and reach its accepted revision; edit the cover heading and save it as the next accepted revision; ask the assistant for a proposal, read its effects and accept it. At every state the test attaches the full axe scan and a full-page screenshot, rejects critical and serious axe violations (illegible contrast is "serious" for axe and a material defect for §9: it caught the dashboard's empty-state text, now on the muted-foreground token), checks that the document does not overflow horizontally and that each control of the step lies entirely inside the viewport. That last check is what caught the 360 px defect fixed in this change: the project rail took a quarter of the width and pushed the canvas "Guardar" button off screen; the rail now stacks above the canvas below the `md` breakpoint.

Claims are limited to the routes and states these journeys visit. The other specs run at Playwright's desktop size.

## Accessibility: automated and manual

Automated: axe on the dashboard, canvas, proposal and manual-edit states at the four widths (critical and serious violations block; everything found is attached), plus `tests/e2e/keyboard-journey.spec.ts`, which creates a project and saves a manual edit with Tab, typing and Enter only, and checks that the name field takes focus when the dialog opens and that saving does not throw the focus away (the heading field is controlled now instead of remounted).

Manual, from `docs/accessibility-checklist.md`: visible and restored focus, names and roles, labels, contrast, error and progress announcements. The checklist names the routes evaluated; the release evidence (back-end#99) records who ran it and what was found. A finding blocks only when it makes a critical journey impossible or materially defective.

## Security blockers

`npm run blockers` runs the frontend proofs and writes `release-evidence/security-blockers.{json,md}` with the test file, title and result of each — nothing else, so the file can travel into the evidence bundle as it is.

| Blocker | Frontend proofs |
| --- | --- |
| S1 secret absence | `scripts/artifact-secrets.test.mjs`: tracked sources and `dist/` carry no private key, service account, Mercado Pago token, OAuth client secret or dotenv file |
| S2 cross-owner isolation | tests tagged `@S2`: foreign or missing project, operation and download read as not available without server detail |
| S3 no model-originated code | `scripts/renderer-security.test.mjs` and tests tagged `@S3`: typed rendering, no executable sink, incompatible data fails closed, proposals are structured effects |
| S4 WebSocket protection | tests tagged `@S4`: REST recovers after gaps, reconnects and identity expiry; a foreign signal discloses nothing |
| S5 Mercado Pago signature and idempotency | no SPA half; proven by the Generated store backend |

Tags are Playwright tags on the existing tests; adding a proof means tagging a test, and the script fails if a tag matches nothing.

## Declared limits

- Playwright's Firefox build does not start on the Windows 10 development host; Firefox evidence comes from Linux CI.
- Lighthouse and the short load exercise (release-gates §10) are performance evidence and belong to the evidence bundle ticket, not to this gate.
- The secret scan looks for credential shapes; a secret with no recognisable shape would pass it. Revocation of historical credentials is a documented action, not a test.
