# Frontend verification

Use Node.js 24, the committed npm lockfile, and an installed Google Chrome browser. Docker and cloud credentials are not required for this frontend smoke.

```powershell
npm ci
npm run verify
npm run test:e2e
```

`npm run verify` runs lint, the standalone TypeScript check, and the production build. The E2E command starts Vite in `e2e` mode, uses the deterministic authentication boundary, intercepts only the public backend request used by the smoke, and runs Playwright plus axe in the installed Chrome channel. It retains screenshots, traces, and the HTML report when a test fails.

Port 4173 must be free: the test always starts its own server and refuses to reuse another application. The minimal accessibility gate rejects critical axe violations and attaches the complete axe scan to the HTML report; it is not a full WCAG compliance check.

The smoke has a 90-second limit to include Vite's cold dependency transformation after `npm ci`. This harness timeout is not a production responsiveness target.

The `e2e` authentication boundary is selected only for the test development server. A deployment build using this mode is rejected. Normal development and production modes continue to use Firebase authentication. The standalone typecheck includes the Playwright configuration and test files.
