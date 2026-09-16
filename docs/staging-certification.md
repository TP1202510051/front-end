# Staging certification — frontend half

Capability ticket: [front-end#90](https://github.com/TP1202510051/front-end/issues/90), paired with [back-end#100](https://github.com/TP1202510051/back-end/issues/100). The staging resources, the certifier that writes deployment identities onto the release manifest and the operator's wizard live in the backend (`back-end/docs/architecture/staging-certification.md`). This half is what the SPA contributes: staging the identified artifact, proving what Hosting serves, and running the platform journeys against the real deployment.

## Promote without rebuild

1. Obtain the `release-<id>` artifact of the backend's `release.yml` run: it carries `frontend-dist/` and `release/frontend-artifact.json`. Or rebuild the pinned commit locally and check `node scripts/release-artifact.mjs verify dist release/frontend-artifact.json` says it is the identified artifact.
2. Write the staging runtime configuration (untracked; `docs/runtime-config.example.json` is the shape, https origins of the staging API and WebSocket, the Firebase web configuration of the reused identity) and stage it: `npm run hosting:stage -- <staging-runtime-config.json> <site> rc`. The script refuses a `dist/` that is not the identified artifact, refuses an incomplete or non-https configuration, writes `dist/runtime-config.json` and checks the identity again — the configuration is the one file the identity leaves out.
3. Deploy to a preview channel with no traffic: `npx firebase hosting:channel:deploy rc --only <site> --expires 30d` (release-gates §12.2: the candidate stays without public traffic until both authors approve).
4. Prove what is served: `node scripts/release-artifact.mjs verify-remote <channel url> release/frontend-artifact.json release/hosting-receipt.json` fetches every identified file from the channel and compares hashes. A SPA host answers `index.html` to a missing file, so a missing file reads as a changed one. The receipt (`hosting-receipt@1`: url, the channel's version id passed as the last argument, commit, `artifactSha256`, `fileCount`, time) is what the backend certifier accepts as `firebaseHostingVersion` evidence.

## Journeys against staging

`npm run test:staging` (`playwright.staging.config.ts`, `tests/staging/platform-journeys.spec.ts`) runs against `STAGING_URL` with a Firebase e-mail test account (`STAGING_EMAIL`, `STAGING_PASSWORD`) that the operator creates for the certification and removes after it; `STAGING_STORE_URL` points at the deployed `textile-complete` reference store; `STAGING_INSTRUCTION` is the predeclared assistant instruction. Without those variables every test is skipped and says so — nothing local is presented as the real integration.

What they prove, in order and against real boundaries: sign-in with a verified Firebase identity; create a project; save a manual edit as an accepted revision that survives a reload (Cloud SQL); ask the assistant, see progress arrive (Pub/Sub → worker → channel) and accept the proposal as the next revision; recover the proposal list from REST after a reload; request an export, wait for the verified ZIP and download it through the short-lived link (object storage), recording its SHA-256; and read the reference store's mode, which must not be `DEMO`. The first journey also posts a project whose body names another actor and records that the deployment ignored or refused it: the actor is the verified token. Each journey attaches `staging-receipt` (project id, revisions, the actor-from-body outcome, instruction, export hash, store mode) to the report; `npm run staging:receipt -- <out.json>` extracts it for the backend certifier, which composes the Firebase, Pub/Sub and storage receipts from it, and `npm run release:evidence` summarises the JSON report like any other.

Run it once in Chrome (blocking) and once with `--project=edge`.

## Declared limits

- Nothing here runs in CI or from this repository's automation: the staging identities, credentials and billing are the operator's, and the journeys need a real deployment.
- The e-mail sign-in is a certification convenience; the demo uses the same Firebase identity providers as the deployment offers.
- The Gemini run is one journey of the sequence; its cost and token counts come from the backend's evidence, not from the browser.
