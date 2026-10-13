# Staging certification — frontend half

Capability ticket: [front-end#90](https://github.com/TP1202510051/front-end/issues/90), paired with [back-end#100](https://github.com/TP1202510051/back-end/issues/100). The staging resources, the certifier that writes deployment identities onto the release manifest and the operator's wizard live in the backend (`back-end/docs/architecture/staging-certification.md`). This half is what the SPA contributes: staging the identified artifact, proving what Hosting serves, and running the platform journeys against the real deployment.

## Promote without rebuild

1. Obtain the `release-<id>` artifact of the backend's `release.yml` run: it carries `frontend-dist/` and `release/frontend-artifact.json`. Or rebuild the pinned commit locally and check `node scripts/release-artifact.mjs verify dist release/frontend-artifact.json` says it is the identified artifact.
2. Write the staging runtime configuration (untracked; `docs/runtime-config.example.json` is the shape, https origins of the staging API and WebSocket, the Firebase web configuration of the reused identity) and stage it: `npm run hosting:stage -- <staging-runtime-config.json> <site> rc`. The script refuses a `dist/` that is not the identified artifact, refuses an incomplete or non-https configuration, writes `dist/runtime-config.json` and checks the identity again — the configuration is the one file the identity leaves out.
3. Deploy to a preview channel with no traffic: `npx firebase hosting:channel:deploy rc --only <site> --expires 30d` (release-gates §12.2: the candidate stays without public traffic until both authors approve).
4. Prove what is served: `node scripts/release-artifact.mjs verify-remote <channel url> release/frontend-artifact.json release/hosting-receipt.json` fetches every identified file from the channel and compares hashes. A SPA host answers `index.html` to a missing file, so a missing file reads as a changed one. The receipt (`hosting-receipt@1`: url, the channel's version id passed as the last argument, commit, `artifactSha256`, `fileCount`, time) is what the backend certifier accepts as `firebaseHostingVersion` evidence.

## Journeys against staging

The backend wizard runs the corrected staging tools with:

```bash
node scripts/staging/journeys.mjs chrome /path/to/front-end staging/.env.staging
# After recording Gemini's receipt and switching BOTH services to deterministic:
node scripts/staging/journeys.mjs edge /path/to/front-end staging/.env.staging
```

Run these from the backend checkout. Its local configuration is private JSON data, never shell source. The runner verifies the actual model of both tagged cloud revisions and supplies credentials through the environment. It requires the deployed SANDBOX reference store URL before starting any journey.

Chrome proves, in order: real Firebase sign-in; creation of a fresh project at revision 1; the predeclared assistant instruction through Pub/Sub and the worker, accepted as revision 2; a manual edit saved as revision 3 that survives a reload; recovery of the proposal from REST; verified export and temporary download; and the SANDBOX reference store. The actor named in a forged request body cannot replace the verified identity. The assistant checks revision 1 before submitting, preserving the predeclared condition of no previous manual edits.

`STAGING_BROWSER` defaults to `chrome` and selects exactly one project. Configured runs also require `STAGING_ASSISTANT_MODEL`; Gemini requires Chrome and `STAGING_GEMINI_RUN_LOCK`. Immediately before clicking the request button, an exclusive persistent reservation is written. A duplicate or concurrent attempt fails before making the request. The reservation stays after errors and timeouts; inspect the existing execution rather than deleting the lock or retrying automatically. The backend runner supplies a stable per-candidate lock path. Unconfigured staging skips; partial configuration fails before browser launch.

Edge runs only after both services use the deterministic model. It repeats the journeys without a second paid model request. The runner writes `playwright-staging-chrome.json` and `playwright-staging-edge.json` separately; extracted receipts are `journeys-receipt.json` (Chrome) and `journeys-edge-receipt.json` (Edge). These operator reports complement the frozen release; they do not rebuild the deployed SPA or replace its identity.

## Declared limits

- Nothing here runs in CI or from this repository's automation: the staging identities, credentials and billing are the operator's, and the journeys need a real deployment.
- The e-mail sign-in is a certification convenience; the demo uses the same Firebase identity providers as the deployment offers.
- The Gemini run is one journey of the sequence; its cost and token counts come from the backend's evidence, not from the browser.
