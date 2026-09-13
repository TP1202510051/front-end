# Frontend verification

Use Node.js 24, the committed npm lockfile, and an installed Google Chrome browser. Docker and cloud credentials are not required for this frontend smoke.

```powershell
npm ci
npm run verify
npm run test:e2e
```

`npm run verify` runs lint, the standalone TypeScript check, and the production build. The E2E command starts Vite in `e2e` mode, uses deterministic authentication and realtime subscription boundaries, intercepts only public backend requests, and runs Playwright plus axe in the installed Chrome channel. Operation scenarios prove monotonic visible progress, stale-signal suppression, gap and reconnect REST recovery (including a remembered receipt whose first notification is lost), local-only stage labels, identity-expiry clearing, and non-disclosing missing/foreign behavior. It retains screenshots, traces, and the HTML report when a test fails.

Port 4173 must be free: the test always starts its own server and refuses to reuse another application. The minimal accessibility gate rejects critical axe violations and attaches the complete axe scan to the HTML report; it is not a full WCAG compliance check.

The smoke has a 90-second limit to include Vite's cold dependency transformation after `npm ci`. This harness timeout is not a production responsiveness target.

## Release gate

The gate (`docs/release-gate.md`) adds to the smoke above: `npm run test:e2e:gate` runs every journey in Chrome and Edge, which block; `npm run test:e2e:firefox` is an informative smoke whose failure is recorded and does not block; `tests/e2e/responsive-journeys.spec.ts` walks the critical journeys at 360, 768, 1024 and 1440 px with axe and a screenshot per state; `tests/e2e/keyboard-journey.spec.ts` walks them by keyboard alone; and `npm run blockers` (after `npm run build`) writes the sanitized security-blocker evidence to `release-evidence/`. On this Windows 10 host Playwright's Firefox build does not start; Linux CI is where Firefox runs.

The `e2e` authentication boundary is selected only for the test development server. A deployment build using this mode is rejected. Normal development and production modes continue to use Firebase authentication. The standalone typecheck includes the Playwright configuration and test files.
