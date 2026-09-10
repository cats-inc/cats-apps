# Cats Apps

> Official utility apps for Cats Desktop, maintained as independently versioned Cats App Packages.

## Overview

`cats-inc/cats-apps` is the source monorepo for first-party utility apps.
`cats-platform` owns the App SDK, installation, loading, Lobby integration, and
Desktop packaging. `cats-runtime` owns provider execution and usage/quota facts.

The first app is **Usage** (`cats.usage`, 0.2.0, unreleased): a read-only dashboard
for execution usage, provider-account quotas, reset windows, and cooldowns.
Its specification distinguishes data already reported by runtime from quota
collectors that still need verification. Codex, Copilot, Claude Code and Antigravity
now have explicit CLI-only queries through SDK 1.2. Kiro success verification is
blocked on CLI authentication; it is not advertised as a working collector.

## Current Status

- Bootstrap initialization and project-specific documentation are complete.
- Repository ownership and Desktop-coordinated distribution are accepted.
- Usage shows current tokens/cost/confidence, passive Claude/Codex quota windows,
  reset times, incidents, stale/offline states, and in-memory coverage.
- Explicit query buttons preserve native request counts, unlimited entitlements,
  real window lengths, and independent provider/instance cooldowns. No model turns,
  credential extraction, automatic account polling, or direct provider API calls.
- Deterministic `.catsapp` packaging and an App-tag release workflow are implemented.
- cats-platform provides the real isolated renderer/SDK, managed install, and pinned
  Desktop package consumption. Remote catalog, active account polling and history remain deferred.
- No provider probes, live user-profile installs, or release publication are performed by a build.

## Quick Start

Use Node.js 22 or newer:

```sh
git clone https://github.com/cats-inc/cats-apps.git
cd cats-apps
npm run check:docs
npm test
npm run build -- --version 0.2.0
```

The documentation check uses Node built-ins and needs no dependency installation.
Build and tests also use Node built-ins. There is no standalone app server.
The output includes `usage-0.2.0.catsapp`, its exact-version lock and build provenance.
This source version is not published or selected by an existing Desktop release.
See [deployment](docs/deployment.md) for Desktop version selection.

## Workspace Layout

| Location | Responsibility | Current state |
|----------|----------------|---------------|
| `apps/<slug>/` | One utility app, manifest, renderer, and tests | Usage implemented |
| `packages/<name>/` | Proven shared utilities used by multiple apps | Reserved; no speculative shared library |
| `scripts/` | Shared repository checks and build/package automation | Package builder, docs check and maintenance helpers |
| `docs/` | Accepted decisions, feature specifications, and delivery plans | Active |

The private root npm workspace is not an installable Cats App.
Each app has its own stable ID, version, manifest, and built entrypoint.

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
- [Usage specification](docs/specs/SPEC-002-cats-usage-dashboard.md)
- [Usage delivery plan](docs/plans/PLAN-002-cats-usage-dashboard.md)
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
