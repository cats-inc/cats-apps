# Deployment

## Release boundaries

cats-apps is a private npm workspace containing independently versioned Apps,
not a single npm product release. Currently Usage is the only App. The root
private package version does not determine App versions, and releasing one App
does not bump unrelated Apps or the workspace root.

Ordinary implementation, documentation, commit/push and merge requests do not
authorize an App version bump or publication. Accumulate commits until an App
release is selected, using existing user authorization for the required steps.
Branch CI checks/builds and uploaded CI artifacts are not public App releases.

For a selected App, keep these three values synchronized:

| File | Version field |
| --- | --- |
| `apps/<slug>/cats.app.json` | `version` in the App manifest |
| `apps/<slug>/package.json` | `version` in the App's private build package |
| Root `package-lock.json` | `packages["apps/<slug>"].version` |

The artifact is published to GitHub Releases as `.catsapp`, with an exact-version
lock and source provenance. There is no npm publish step for these Apps. See the
[cross-repository release guide](https://github.com/cats-inc/cats-one/blob/main/docs/release-guide.md)
for Runtime, Platform, launcher and Desktop release scope.

### Compatibility and data upgrades

Apply the [shared version policy](https://github.com/cats-inc/cats-one/blob/main/docs/release-guide.md#compatibility-and-data-upgrades)
to each independently versioned App: breaking public behavior, configuration or
stored-data requirements increment `0.x` minor, or stable `1.x+` major. Compatible
fixes can use patch. Schema and App versions remain independent. Preserve existing
user data through a validated, backed-up, atomic one-time migration; test a prior
profile, repeat startup and failed conversion as well as clean installation.
Unknown data must remain intact. Delegate host- or Runtime-owned migrations to
their owners; do not populate or repair the real user's registry in tests.

A host minor bump is not an instruction to bump all Apps, but it does require
checking the declared host range. Publish a new immutable App artifact if its
compatibility declaration must change; verify it against the new host first.
Version numbers and release notes never replace the data-upgrade path.

### Publish one App

1. Integrate remote changes and select the App, intended source and unused version.
   A prepared unpublished version can be reused; published artifacts are immutable.
2. Update that App's three version fields above and follow the repository's scoped
   validation rules. Documentation-only edits need diff/link review, not App tests
   or builds. Keep the hosted release gates; a bump alone does not require repeating
   the same passing suite locally.
3. Commit/push using the user's authorized Git workflow. Separately create and push
   the matching `<slug>-vX.Y.Z` tag at the selected commit, for example
   `usage-v0.2.2` (illustrative, not an instruction to release that version).
4. The [App release workflow](../.github/workflows/release-app.yaml) runs on that
   tag push, checks the App manifest/package/tag agreement, builds the selected
   App and publishes its assets. It is not triggered by a normal main push and
   has no manual dispatch input.
5. Confirm workflow success and download the archive, lock and provenance. Verify
   their App ID, version, source revision and archive SHA-256 agree before reporting
   publication complete.

Publishing an App does not update an installed Desktop. Platform separately
selects the published version, URL and SHA-256 in `config/desktop-apps.lock.json`
for an authorized later Desktop release, including Platform/App SDK compatibility
checks. Do not bump/publish Desktop, Runtime, Platform npm or cats-one as an
automatic follow-on. Independent installed-App updates via a remote catalog
remain future work.

## Host and SDK compatibility

Every App already has two required manifest declarations. In
[Usage's current manifest](../apps/usage/cats.app.json), App version `0.2.1` has:

```json
{
  "compatibility": {
    "catsPlatform": "^0.3.0",
    "appSdk": "^1.2.0"
  }
}
```

| Declaration | Meaning for this App |
| --- | --- |
| App `version` | Identifies this immutable App artifact; does not imply a matching Desktop version |
| `compatibility.catsPlatform` | Platform/Desktop host version must be at least 0.3.0 and below 0.4.0 |
| `compatibility.appSdk` | Host SDK interface version must be at least 1.2.0 and below 2.0.0 |

Desktop and Platform currently share a version source, so `catsPlatform` already
expresses the Desktop host requirement. Keep `appSdk` separate: host features and
SDK APIs can evolve at different rates. Both checks must pass during installation.
These declarations state the supported range; they are not evidence that every
combination was tested. Record actual verification with the release evidence.

### Version discipline

- Specify the oldest version supplying the required behavior and a compatibility
  upper boundary. For example, `^0.3.2` accepts stable 0.3.2 and later 0.3.x,
  but not 0.4.0. It does not promise support for all future Desktop versions.
- Keep the App-facing contract compatible within a 0.x minor line; an incompatible
  host change must move to the next minor. For stable SDK 1.x, a breaking API
  change must move to SDK 2.x. This is the adopted project discipline;
  [SemVer itself leaves 0.x unstable](https://semver.org/#spec-item-4).
- If compatibility within the line cannot yet be supported, use an exact verified
  version such as `0.3.6` instead. Do not use a wide range to avoid stating uncertainty.
- Do not raise an App's minimum merely because Desktop or SDK has a newer release.
  Raise it when the App needs a newly introduced API, behavior or necessary fix.
- A declared range change modifies the immutable App manifest. Publish it as a
  new App version when selected for release; never rewrite an existing archive.
  Supporting a new host minor requires checking the contract and deliberately
  updating the declaration, not assuming that every 0.x version is compatible.

The [current host matcher](https://github.com/cats-inc/cats-platform/blob/main/packages/app-sdk/package.js)
accepts exact stable versions, carets, `major.x` and `major.minor.x`. It is not a
full npm range parser: comparator expressions (`>=0.3.2 <0.4.0`), `~` ranges,
unions and prerelease strings are unsupported. Write the supported `^0.3.2`
form instead of its comparator equivalent. Avoid `0.x`, which admits all 0.x
minors, and wildcard forms that omit a required patch minimum. See the
[host compatibility guide](https://github.com/cats-inc/cats-platform/blob/main/docs/app-packages.md#host-and-sdk-compatibility).

## Current State

Usage 0.2.1 is [published](https://github.com/cats-inc/cats-apps/releases/tag/usage-v0.2.1)
for the authorized Desktop 0.3.0 unsigned preview. It declares Platform ^0.3.0
and retains App SDK ^1.2.0; the renderer and permissions are unchanged.
Source: `df1c57168c98a6a83fffb54f58ad298a1b769511`. Archive SHA-256:
`6b8160e548488f30c741cadd4726b55fa18f8c0a324d48ac0cbc6ea143788f24`.
The [release workflow](https://github.com/cats-inc/cats-apps/actions/runs/35302009970)
passed docs, all six app tests and the tagged build. The downloaded archive,
GitHub asset digest, lock and provenance agree. Platform 0.3.0 accepts the
published archive; its decoded payload matches the tested local build.
Desktop [PR #98](https://github.com/cats-inc/cats-platform/pull/98) selects this
exact release. Desktop's package and offline-activation gates must pass before
its publication.
Existing Desktop installers retain their previously pinned Usage version.

### Previous published version

Usage 0.2.0 is published as an immutable `.catsapp` artifact, exact-version lock
and source provenance in the [Usage 0.2.0 release](https://github.com/cats-inc/cats-apps/releases/tag/usage-v0.2.0).
It requires App SDK ^1.2.0 for explicit Codex/Copilot/Claude/Antigravity queries,
native quantities and per-provider cooldowns.

Published provenance: source revision
`1affcf38e427f636e1eedb45bf3d1ac4e78eeb4f`; archive SHA-256
`7d5455bb6b484b731becbc69b469e649fbfc433cf015586e0022c3045974c04e`.
The release workflow passed docs/tests/build. The downloaded archive, GitHub
asset digest, release lock and provenance agree; decoded payloads match the
locally tested build. Use the published hash, not a different OS's gzip hash.

The owner authorized the coordinated Desktop 0.2.5 unsigned preview with this
archive, SDK 1.2.0 and Runtime revision
`91bba98e2e621ec3124130b7c79fdc6c3ab7ca19`. Platform owns the exact release
selection, PR/CI and each OS's resource/offline-activation gates. Existing Desktop
0.2.4 installers retain Usage 0.1.1 unchanged. This task does not update the
operator's installed Desktop. Native Windows CLI queries were live-verified;
macOS/Linux live checks and WSL/Docker query support remain separate work.
### Package commands

CI runs docs/unit/build checks and uploads artifacts. The shared App-tag workflow
publishes a utility only when a matching `<slug>-v<version>` tag is pushed; it never
overwrites a released version. Normal builds do not publish releases.

```powershell
# cats-apps
npm run build -- --version 0.2.1
# cats-platform
npm run desktop:package:windows -- --apps-lock ../cats-apps/dist/usage-0.2.1.lock.json --skip-mobile
```

The lock, not a moving latest release, selects the App version. This local example
selects only the App: a later Desktop release must also pin the matching Runtime
revision (the release workflow's `runtime_ref` input) and ship SDK 1.2. See the host
[build/install guide](../../cats-platform/docs/app-packages.md) for all platforms,
local/remote artifact references, source-free launch, and lifecycle behavior.

## Accepted Initial Delivery

1. Build each selected app from an identified cats-apps revision.
2. Produce immutable, individually versioned Cats App Packages.
3. Record app IDs, exact versions, checksums, source revision, and Platform/SDK
   compatibility in the Desktop bundle selection.
4. Include those built packages in a coordinated Cats Desktop release.
5. Have the host install and load the selected versions, preserving per-app data.

App version numbers are independent from Desktop's release number. The app set
can share build automation; a separate GitHub Release workflow per app is optional.
Desktop packaging consumes artifacts, not imported sibling source or a developer
workspace path.

`.catsapp` v1 is gzip-compressed JSON with the manifest, license and built payload
files encoded as base64. The first renderer is self-contained HTML. Directory-only
manifest registration remains a development path; it does not execute source as a
production App. Private GitHub assets need an independently authenticated download
followed by local pin selection; the initial URL resolver handles public release assets.

Desktop release CI uses a checked-in selection with real App release artifacts.
Publishing an App and committing its exact hash/URL into that selection are
explicit release actions, not implied by adding an implementation. Existing
Desktop 0.2.2/0.2.3 selections remain on Usage 0.1.0; publishing Usage 0.1.1 alone
does not replace bytes in an already published Desktop installer.

## Later Remote Distribution

The official App Catalog may be published alongside release artifacts. It describes
available apps, compatible versions, download URLs, sizes, and checksums.
cats-platform consumes it, validates downloads, and manages updates; its local
installed registry remains a separate record.

Remote discovery, independent app updates, signatures, and marketplace governance
require later implementation. Initial bundled utility delivery does not depend
on a network catalog.

See [ADR-001](decisions/001-own-official-utility-apps-and-coordinate-desktop-distribution.md).

*Last updated: 2026-09-23*
