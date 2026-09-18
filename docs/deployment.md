# Deployment

## Current State

Usage 0.2.1 is the compatibility release prepared for the authorized Desktop
0.3.0 unsigned preview. It declares Platform ^0.3.0 and retains App SDK ^1.2.0;
the renderer and permissions are unchanged. Publish `usage-v0.2.1` after CI,
then pin the published archive's SHA-256 and release URL in Desktop's lock.
Desktop's package and offline-activation gates must pass before publication.
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

*Last updated: 2026-09-18*
