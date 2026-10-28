# PLAN-004: Independent App Distribution

## Metadata

- Status: In progress; A2 catalog implemented and unpublished (2026-10-20); A1/A3/A4 open.
- Owner: cats-apps; the host lifecycle, Market and SDK are owned by cats-platform.
- Governing decision: [Platform ADR-121](../../../cats-platform/docs/decisions/121-distribute-apps-independently-with-host-owned-lifecycle.md).
- Requirements: [Platform SPEC-120](../../../cats-platform/docs/specs/SPEC-120-app-market-and-lifecycle.md).
- Joint delivery: [Platform PLAN-112](../../../cats-platform/docs/plans/PLAN-112-app-market-and-lifecycle.md).

## Accepted product policy

Usage ships preinstalled and enabled with Desktop, and is also listed in the Market; after it is removed or disabled, Home still offers a way to restore it.
Studio is not preinstalled. Home shows no placeholder while it is not installed, keeps its card while it is installed but disabled, and the card disappears once it is removed.
The Home placeholder, shipping policy, trust, download and cleanup are all handled by the host and are not put into the Usage or Studio renderer.
Both use the same kind of `.catsapp`, keep their source in the same repo, and each has its own version, build and release.

## Desktop management clarification (accepted, 2026-09-29)

The Apps Marketplace is a separate Desktop page, and Home provides a prominent entry to it. Users discover,
read descriptions and install directly in the store, without detouring through Settings. Home also keeps the
launch cards for installed Apps and the established restore entry.

Settings > Apps focuses on the installed list, permissions, machine-level settings, enable/disable, update, repair and removal.
Store detail pages may also offer suitable actions; both share the same Desktop lifecycle service and state,
and the Settings path is not treated as the only condition for management authorization. Plugins keep their own
Settings > Plugins tab, and if Home offers a Plugin management shortcut it stays a small entry; the Apps store is not bound by this small-shortcut rule.

Opening the cats-platform web page in an ordinary browser does not grant package-management rights over this Desktop.
The restriction must be enforced by the authorization contract for host management operations; it cannot rely only on hiding buttons, trusting an owner login, localhost,
or an environment flag passed in by the frontend. Browser or remote calls must not trigger installs or other package changes on their own.
The management service code can still be owned by cats-platform; "which repo owns the service" and "which client may operate it" are separate matters.

Whether an installed App can be used from an authorized web page, and ordinary in-App preferences, are decided separately from this management restriction.
This addendum does not change Usage/Studio shipping, Home cards, format or SDK capabilities, and does not claim the web is currently restricted.
This change also updates the management requirements and acceptance items of Platform ADR-121, SPEC-120 and PLAN-112;
the concrete issuance, delivery and revocation contract for the context, plus its implementation and acceptance, remain for Platform to complete later.

## Baseline and scope

The existing shared builder can select a single App; the `<slug>-vX.Y.Z` tag workflow can already produce a `.catsapp`,
a lock and a source record. Usage 0.4.0 is published, and Studio 0.1.0 has a local artifact and install verification;
this plan does not treat it as publicly listed. The public Desktop 0.5.13 bundle still contains only Usage.

This plan adds official catalog metadata and promotion, compatibility fixtures, source-free SDK development and an App update drill.
It does not add video or photo editing, a third-party store or an arbitrary App runner, and it no longer calls real Grok image generation.

## A1 — Versioned SDK consumption and fixtures

- [x] Fix with Platform the obtainable SDK development artifacts, the schema and capability types, and the minimum/candidate host matrix.
      Obtain `./app-sdk` through an exact-pinned `@cats-inc/cats-platform` devDependency; each App
      validates its declared minimum host/SDK, and the pinned host when the range accepts it. A minimum host below the first SDK version is checked against the
      pinned version's rules; the old host rules are not rerun.
- [x] Validate both Apps against the versioned contract, without importing sibling private source or shipping a privileged host bridge.
- [ ] Add an understandable screen for when the minimum capability is unavailable; installing or opening an App does not automatically call generation or provider login.
- [ ] Update docs to distinguish the renderer build, host integration fixtures and actual provider acceptance.
- [ ] Fix with Platform the Desktop management context and the contract for rejecting ordinary browser mutations;
      the App SDK gives no lifecycle management rights, and the restore/Market entries do not bypass host authorization.

## A2 — Official catalog content and promotion

- [ ] Maintain the Usage/Studio descriptions, icons, permission summaries, requirements and release notes in Chinese and English.
- [ ] For each version, record the App ID, immutable URL, size, SHA-256, source commit, compatibility range and required capabilities.
- [x] stable/preview point to verified exact versions, separate from the GitHub repo-wide latest.
- [x] Implement the catalog schema check and the published-artifact identity check, rejecting duplicate or overwritten versions.
- [x] The promotion workflow produces an incrementing revision and expiry, signs, and publishes the catalog atomically; the key does not enter the repo.
- [x] Test key rotation, withdrawing/restoring a version, expiry and wrong metadata with a temporary key; formal trust is decided by Platform.

Catalog promotion is a publishing action; an App tag release does not automatically enter the catalog or Desktop, and withdrawing from the catalog does not delete works.
The local fixture endpoint and key must not be mixed into formal metadata. The endpoint and key were decided on 2026-10-20, see
[SPEC-005](../specs/SPEC-005-official-app-catalog.md); descriptions and permissions come from the artifact manifest,
the notes currently exist only in Chinese, and the source commit is not yet written into the catalog, so the first two items remain unfinished.

## A3 — Independent release candidates

- [ ] Pick unused Usage/Studio versions and sync them with each App's manifest, package and workspace lock.
- [ ] Because host registry schema 2 is expected to need the next Desktop minor, re-verify the compatibility range;
      the existing Usage ^0.5.0 / Studio ^0.5.11 cannot directly claim to support 0.6, and old artifacts must not be overwritten.
- [ ] Build one candidate with the existing build pipeline and verify identical bytes after download; all catalog and Desktop pins
      take the published source, and a hash from a rebuild on another OS is not a substitute.
- [ ] If the manifest or renderer needs changes, publish a new App version; the host carries over data for a local Studio with the same ID.
- [ ] Verify independent updates with two distinguishable versions; an App change does not require rebuilding an already compatible Desktop.

The version selection above and any real publication must be executed only after this App release is authorized; this round is planning only.

## A4 — Joint acceptance

- [ ] A new Desktop preinstalls only Usage and opens it directly offline; Studio is discoverable only in the Market.
- [ ] Usage disable, removal, placeholder reinstall and repair; the Market and the bundle both validate the same package format.
- [ ] Studio install, disable, removal and reinstall keep works; the host provides real status for cancel and cleanup.
- [ ] A broken package or wrong hash can be recovered from or rejected; a new version that is incompatible or adds permissions is handled explicitly.
- [ ] After a Market update, the older bundled package in Desktop does not overwrite it; a manual removal is not resurrected by a Desktop upgrade.
- [ ] Artifact/SDK checks and per-OS installed acceptance are recorded separately, with the source, hash and host matrix added.
- [ ] Desktop Settings, the Home shortcut and the Market share management state; even with an owner login, an ordinary browser
      calling a lifecycle mutation directly is still rejected, and the registry, package and process are unchanged.
- [ ] Home's prominent entry opens the separate Apps Marketplace directly, and discovery, detail and install do not jump to Settings;
      after install completes, the installed lists in Home and Settings are synced, and the two entries do not each maintain an installer.
- [ ] Verify that localhost, forged frontend environment flags and an App iframe cannot obtain Desktop management rights;
      authorized Desktop operations still work. Platform provides isolated evidence for the host acceptance above.

All fixtures use a temporary registry and profile, and data-reclamation acceptance does not touch user works or provider accounts.

## Publication order and responsibility

1. Prepare the host capabilities and migration, the SDK development artifacts and the Apps candidates; complete isolated review and validation.
2. Within the matching authorization, publish the necessary SDK and App immutable artifacts, and confirm the source and downloaded bytes.
3. Publish the official Catalog with compatibility filtering; a host that has not upgraded must not install an incompatible new App.
4. Platform separately updates the Usage exact pin and publishes a new Desktop; Studio is not added to the preinstall list.
5. Later compatible App updates need only an App release plus catalog promotion; Desktop does not need to be reissued.

## Resume checkpoint

2026-09-28: the user asked for planning documents; no build/workflow, SDK dependency, manifest or App version has been changed.
After Platform M0 fixes the contract, run A1/A2; before publishing, verify per the [App release SOP](../deployment.md).

Original proposal document validation: `npm run check:docs` passed (38 Markdown files, 155 local targets, no sibling links skipped),
and `git diff --check` passed. The independent read-only review had no remaining blockers; no App build/tests or new provider calls were run.

2026-09-28 Desktop management boundary addendum: only the Apps-side documents were updated; Platform contract sync and implementation have not started.
Clarified the same day: the Apps Marketplace must be separate and reached prominently from Home;
Settings is responsible for installed-App management, and Desktop management rights do not mean the store must be placed in Settings.
This addendum has had no independent review; validation covered only Markdown links and the diff, and does not mean the host access restrictions above are in effect.
For this addendum `npm run check:docs` passed (38 Markdown files, 156 local targets, no sibling links skipped);
`git diff --check` passed. No product tests, build or install were run.

2026-09-29: the user asked to finish the commit/PR and auto-merge for this addendum; sync the Platform plan,
keeping implementation and acceptance marked unfinished. This independent read-only review had no blockers, and the small Home shortcut
is now explicitly limited to the Plugin management entry. `npm run check:docs` passed (38 Markdown files, 156 local targets,
no sibling links skipped); a check of 35 local file/anchor targets across the 6 changed documents in the two repos passed,
with cross-repo links verified using the corresponding worktrees. `git diff --check` passed in both repos.
These are documentation checks; no product tests, build, install or provider calls were run, and they do not mean the host restrictions are in effect.

2026-09-29: per Platform ADR-123, switched to the published `@cats-inc/cats-platform/app-sdk`.
`build-app.mjs` keeps renderer assembly, version checks, lock and provenance; the hand-rolled gzip envelope
is replaced by the SDK's `encodeAppPackage`, and before writing, `validateRendererAppPackage` checks the declared minimum
host and the pinned host when the range accepts it. Added `tests/sdk-build.test.mjs`; CI and the release workflow
now run `npm ci --ignore-scripts` first. Verified against Platform 0.6.0 on the registry: 12 App tests passed.
No App version, manifest or release was changed.

2026-10-20: the user asked to implement the catalog workflow, code and docs without pushing for now, and authorized generating the formal key.
Added `catalog/apps.json` (Usage 0.5.3, Studio 0.2.1), `catalog/signing-keys.json`,
`scripts/build-catalog.mjs`, `scripts/new-catalog-key.mjs`, `.github/workflows/publish-catalog.yaml`,
`tests/catalog.test.mjs` and a contract vector shared with Platform; `CATALOG_SIGNING_KEY` was written by the script
to the repo secret (keyId `cats-apps-catalog-2026-10`). `node scripts/build-catalog.mjs --dry-run`
actually downloaded both published artifacts, and size, SHA-256 and manifest identity all match. The results of the local `npm test`,
`npm run check:docs` and `git diff --check` are recorded in this delivery's report. Pages is not yet enabled,
the workflow has not run, and the catalog is not yet published; Platform's preview Market is recorded separately in PLAN-112.
After the independent review the same day: the build applies Platform's field limits and keeps only the publisher's `name` and `homepage`;
the key script can stage a new key with `--secret-name`, the workflow picks the secret by the `CATALOG_SIGNING_SECRET` variable
and signs only the latest commit of `main`; if the secret is written but writing the public key to the file fails, the error message keeps the public key so it can be added back.
After the second review: the key script no longer overwrites an existing secret, and from the second key on it saves to `CATALOG_SIGNING_KEY_<KEY_ID>` by default;
the workflow now checks whether the signing input is still the same as `main`, and adds the package and Node version files to the trigger paths.
At the user's request, GitHub Pages was enabled with Actions as the source, and the `github-pages` environment allows only `main`.

*Last updated: 2026-10-20*
