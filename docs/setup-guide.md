# Setup Guide

## Requirements

Node.js 22+ is sufficient for builds, tests and documentation checks. No application
dependencies, environment secrets, database, or running service are required.

```sh
npm run check:docs
npm test
npm run build -- --version 0.1.0
```

These commands check documentation, run fixture tests, and produce a versioned
artifact. They do not access provider accounts, install into a user profile, or publish assets.

## Bootstrap Provenance

The existing clone was initialized on 2026-09-10 with the canonical
project-bootstrap Windows generator and the explicit nodejs + github-actions
flavors. No InitGit option was used.

The generator rejects any nonempty target, including a clone containing only
.git. A fresh staging directory inside cats-apps was generated, then its payload
was moved into the otherwise empty clone. Git metadata and the origin URL were
preserved; the empty staging directory was removed.

## Bootstrap Updates and mbf

Run the updater from the separate project-bootstrap checkout against this
repository when a template upgrade is requested. mbf means Merge Bootstrap Files:
review each pending *.bootstrap proposal, retain project-specific decisions,
merge accepted changes, and remove only proposals whose merge has been verified.
A fresh initialization had zero proposals, so no merge was necessary.

## Application Work

Usage uses dependency-free JavaScript/CSS. The builder assembles a self-contained
HTML payload, packages its license/manifest, and emits a SHA-256 lock. No App SDK
source is imported from sibling repositories. See [PLAN-001](plans/PLAN-001-official-app-package-foundation.md).

See [testing](testing.md) and [deployment](deployment.md).

*Last updated: 2026-09-10*
