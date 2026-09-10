# Deployment

## Current State

Usage 0.1.1 is published as an immutable `.catsapp` artifact, exact-version lock
and source provenance in the [Usage 0.1.1 release](https://github.com/cats-inc/cats-apps/releases/tag/usage-v0.1.1).
It requires App SDK ^1.1.0 for explicit native Codex CLI quota refresh.

The current source is Usage 0.2.0 (unreleased), requiring SDK ^1.2.0 for explicit
Copilot/Claude/Antigravity queries, native quantities and per-provider cooldowns.
Its local build does not replace the published 0.1.1 artifact or Desktop 0.2.4 lock.
When separately authorized, publish a new immutable App artifact, pin its exact
version/hash plus the matching Runtime revision in Desktop, and run each OS's
resource/offline-activation gates before releasing installers.
Published 0.1.1 provenance: source revision
`1a06d51523e0175f65a3a062be3581a659ada2ef`; the published
archive SHA-256 is `2334a33c059502cf1209aa399e1ad7ce7123c6fc4c2c54173ec271c60a5803fd`.
Desktop 0.2.4 selects those exact 0.1.1 release bytes. That prior publication was
authorized; the current 0.2.0 follow-up does not authorize publication or an
installed update. Native Windows was live-verified; macOS/Linux live checks
and WSL/Docker query transport support remain separate work.
CI runs docs/unit/build checks and uploads artifacts. The shared App-tag workflow
publishes a utility only when a matching `<slug>-v<version>` tag is pushed; it never
overwrites a released version. Normal builds do not publish releases.

```powershell
# cats-apps
npm run build -- --version 0.2.0
# cats-platform
npm run desktop:package:windows -- --apps-lock ../cats-apps/dist/usage-0.2.0.lock.json --skip-mobile
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

*Last updated: 2026-09-11*
