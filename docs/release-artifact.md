# Release artifact — built once, promoted by hash

Capability ticket: [front-end#89](https://github.com/TP1202510051/front-end/issues/89), paired with [back-end#99](https://github.com/TP1202510051/back-end/issues/99). The coordinated manifest and the evidence bundle that carry what this produces are described in `back-end/docs/architecture/release-manifest.md`; the backend's `release.yml` runs the steps below on the pinned revision.

## Identity

`npm run build` is the one build; `npm run release:artifact` identifies that `dist/` and writes `release/frontend-artifact.json`: the commit, one entry per file with its SHA-256, and `artifactSha256` — the SHA-256 of the sorted content manifest (`path\0sha256` per file). It is not the hash of a tarball, which would depend on the archiver and the clock; anyone with a copy of `dist/` recomputes it with `node scripts/release-artifact.mjs verify dist release/frontend-artifact.json`, and the manifest composer in the backend refuses an identity built from a commit other than the pinned one. A rebuild of the same commit reproduces the hash.

`runtime-config.json` is never part of the artifact (`excludes` names it): the installation writes it next to `dist/` at deployment time, so the same artifact serves local acceptance, staging and the evidence — which is what "promoted without rebuild" requires.

## Runtime configuration

`src/runtime-config.ts` fetches `/runtime-config.json` before the application modules are imported (the REST client and Firebase read it when they load). A configuration is usable when it carries a Firebase identity (`apiKey`, `projectId`, `appId`); its outcome is explicit:

| Situation | Outcome |
| --- | --- |
| File served, valid | its values win, field by field, over the build-time values |
| No file (404, or a SPA fallback that returns HTML) | the build-time values (development server, `e2e` mode); a release artifact, built without identity, reports itself unconfigured |
| File present but malformed (wrong type, broken JSON) | refused as a whole: the installation is reported invalid, nothing is half applied |

`tests/e2e/runtime-config.spec.ts` proves the three on the e2e server; `tests/artifact/boot.spec.ts` (`npm run test:artifact`, its own `playwright.artifact.config.ts`) proves them on the identified `dist/` itself, served by `vite preview`: the built artifact reads a served configuration and shows the entry page, and without one reports itself unconfigured. `docs/runtime-config.example.json` is the shape.

## Evidence

`npm run release:evidence` reads the Playwright JSON reports (`release/playwright-report.json` from the gate and `release/playwright-artifact.json` from the artifact boot test; the JSON reporter is always on), `release/frontend-artifact.json` and `release-evidence/security-blockers.json` and writes `release-evidence/frontend-evidence.{json,md}` and `axe-summary.json`: per browser and test, title, file, tags, result and duration; per scanned state, axe violation counts by impact. Nothing else from the reports crosses over — no error text, console output, attachment bodies or host paths — and the whole directory is scanned for credential shapes, bearer and JSON web tokens, personal e-mail addresses and local absolute paths (`scripts/secret-shapes.mjs`) before it is accepted. `scripts/release-evidence.test.mjs` proves both the summary and the refusal.

## Declared limits

- The canvas journeys, axe and the security-blocker proofs run against the `e2e` development server of the same commit, which swaps authentication and the realtime channel for deterministic doubles and cannot be built; what the identified artifact itself is proven to do is what `tests/artifact/boot.spec.ts` covers. The evidence names both the commit and the artifact hash, and does not claim more.
- The artifact is environment-agnostic; the installation's `runtime-config.json` is the deployer's responsibility and is not versioned here.
- Firefox evidence, Lighthouse and the manual accessibility checklist are as declared in `docs/release-gate.md`.
