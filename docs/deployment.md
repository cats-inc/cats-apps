# Deployment

## Current State

Usage 0.1.1 builds a `.catsapp` artifact, exact-version lock and source provenance.
It requires App SDK ^1.1.0 for explicit Codex quota refresh. This follow-up is
locally verified only; publishing/updating Desktop was explicitly deferred.
CI runs docs/unit/build checks and uploads artifacts. The shared App-tag workflow
publishes a utility only when a matching `<slug>-v<version>` tag is pushed; it never
overwrites a released version. No release was published by implementing this workflow.

```powershell
# cats-apps
npm run build -- --version 0.1.1
# cats-platform
npm run desktop:package:windows -- --apps-lock ../cats-apps/dist/usage-0.1.1.lock.json --skip-mobile
```

The lock, not a moving latest release, selects the App version. See the host
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

Desktop release CI starts with an empty checked-in selection until a real App
release exists. Publishing the App and committing its exact hash/URL into that
selection are explicit release actions, not implied by adding this implementation.

## Later Remote Distribution

The official App Catalog may be published alongside release artifacts. It describes
available apps, compatible versions, download URLs, sizes, and checksums.
cats-platform consumes it, validates downloads, and manages updates; its local
installed registry remains a separate record.

Remote discovery, independent app updates, signatures, and marketplace governance
require later implementation. Initial bundled utility delivery does not depend
on a network catalog.

See [ADR-001](decisions/001-own-official-utility-apps-and-coordinate-desktop-distribution.md).

*Last updated: 2026-09-10*
