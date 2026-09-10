# Deployment

## Current State

No app binary, archive, installer, release workflow, or production installation
is supplied by this repository foundation. The CI workflow checks documentation.

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

Package-directory input is useful during development. A distributable archive is
a transport container for the same payload; the exact archive suffix is not frozen
by this planning task.

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
