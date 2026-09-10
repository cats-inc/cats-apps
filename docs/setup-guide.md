# Setup Guide

## Requirements

Node.js 22+ is sufficient for current documentation checks. No application
dependencies, environment secrets, database, or running service are required.

```sh
npm run check:docs
```

This command checks local Markdown targets and workspace metadata. It does not
run the planned app, access provider accounts, install packages, or publish assets.

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

Follow [PLAN-001](plans/PLAN-001-official-app-package-foundation.md) before adding
runtime dependencies or claiming app build/test support. The current tsconfig is
a planned TypeScript/browser baseline; no TypeScript compilation is part of this
documentation-only foundation.

See [testing](testing.md) and [deployment](deployment.md).

*Last updated: 2026-09-10*
