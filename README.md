# Cats Apps

> Official utility apps for Cats Desktop, maintained as independently versioned Cats App Packages.

## Overview

`cats-inc/cats-apps` is the source monorepo for first-party utility apps.
`cats-platform` owns the App SDK, installation, loading, Lobby integration, and
Desktop packaging. `cats-runtime` owns provider execution and usage/quota facts.

The first planned app is **Cats Usage** (`cats.usage`): a read-only dashboard
for execution usage, provider-account quotas, reset windows, and cooldowns.
Its specification distinguishes data already reported by runtime from quota
collectors that still need implementation.

## Current Status

- Bootstrap initialization and project-specific documentation are complete.
- Repository ownership and Desktop-coordinated distribution are accepted.
- Cats Usage requirements and cross-repository delivery plans are documented.
- App implementation, package production, host loading, and remote installation
  are not implemented by this bootstrap.
- No application server, provider probe, package publication, or installer is run here.

## Quick Start

Use Node.js 22 or newer:

```sh
git clone https://github.com/cats-inc/cats-apps.git
cd cats-apps
npm run check:docs
```

The documentation check uses Node built-ins and needs no dependency installation.
Application build/test commands will be added with the first implementation;
there is currently no application `start`, `dev`, or `test` command.

## Workspace Layout

| Location | Responsibility | Current state |
|----------|----------------|---------------|
| `apps/<slug>/` | One utility app, manifest, renderer, and tests | Planned; no app package exists yet |
| `packages/<name>/` | Proven shared utilities used by multiple apps | Reserved; no speculative shared library |
| `scripts/` | Shared repository checks and future build/package automation | Documentation check and bootstrap maintenance helpers |
| `docs/` | Accepted decisions, feature specifications, and delivery plans | Active |

The private root npm workspace is not an installable Cats App.
Each future app has its own stable ID, version, manifest, and built entrypoint.

## Distribution

Initially, Desktop releases include a pinned, tested set of app packages built
from an identified `cats-apps` revision. App version numbers do not have to
match Desktop's version. Production installations load built artifacts from
host-managed install locations.

One shared build workflow may produce several app packages. A separate repository
or GitHub Release workflow per app is not required. Remote Catalog discovery and
independent app updates remain a later phase.

## Planning Map

- [Repository and distribution decision](docs/decisions/001-own-official-utility-apps-and-coordinate-desktop-distribution.md)
- [App package requirements](docs/specs/SPEC-001-official-utility-app-packages.md)
- [Repository and package delivery plan](docs/plans/PLAN-001-official-app-package-foundation.md)
- [Cats Usage specification](docs/specs/SPEC-002-cats-usage-dashboard.md)
- [Cats Usage delivery plan](docs/plans/PLAN-002-cats-usage-dashboard.md)
- [Cross-repository architecture](docs/architecture.md)
- [Documentation index](docs/README.md)

## Maintenance

This repository was generated on 2026-09-10 using project-bootstrap's
`Initialize-Project.ps1`, with the `nodejs` and `github-actions` flavors.
Generation used an empty staging directory because the cloned target contained
`.git`; the generated payload was moved into the clone without replacing Git metadata.

`mbf` means Merge Bootstrap Files. Review and merge individual `*.bootstrap`
proposals after a future bootstrap update; never bulk-overwrite project decisions.
The initialization audit found no pending review copies.

See [setup](docs/setup-guide.md), [contributing](CONTRIBUTING.md), and
[progress](PROGRESS.md). Licensed under [MIT](LICENSE).
