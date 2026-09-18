# Testing

## Implemented Checks

```sh
npm run check:docs
npm test
npm run build -- --version 0.2.1
```

This dependency-free Node check validates root workspace metadata and local
Markdown file targets. External URLs, heading anchors, document templates, and
other agents' private instruction files are outside its inspection scope.
Cross-repository relative links are checked when their sibling checkout exists
and skipped in a standalone clone.

`npm test` covers unknown/zero, independent quota/session scopes, currency separation,
stale resets, deterministic source-free packaging and explicit version mismatches.
It also verifies explicit CLI refresh capability, native quantities/unlimited
entitlements, provider+instance cooldown isolation and passive snapshot polling.
The docs command alone is not application test coverage.

Host tests live in cats-platform: package limits/path/digest checks, compatibility,
pin selection, updates/rollback/data preservation, capability denial/revocation,
upstream redaction and App-route execution. Its `scripts/testing/check-usage-app.mts`
loads the real artifact with the actual host surface and routes against fixture data,
using a temporary registry and an ephemeral loopback port. It checks desktop/narrow
layouts, the SDK handshake, frame/network isolation, filters, offline/stale/restart,
and disable revocation. See the host [package guide](../../cats-platform/docs/app-packages.md).

## Remaining Gates

- Kiro authenticated quota success and verified unit/window mapping.
- Scheduled account polling, verified shared-account linking, durable history and gaps.
- Native live query verification on macOS/Linux and WSL/Docker query transports.
- Desktop 0.2.5 PR/CI and three-OS package gates for the now-authorized coordinated
  selection of Usage 0.2.0, SDK 1.2 and matching Runtime code; installed acceptance
  remains separate and the user's installation is unchanged.

Native Codex/Copilot/Claude/Antigravity query integration, isolated built-package
browser checks and independent implementation review are complete. Usage 0.1.1
was previously published and bundled. Usage 0.2.0 is now published: its release
workflow passed docs/tests/build, and downloaded digest/lock/provenance plus
decoded payload comparisons passed. See [deployment](deployment.md) for exact pins.

Use isolated temporary app registries, runtime roots, and fixture data. Never
install test apps into the user's actual Desktop profile or spend provider quota
to verify a display-only change.

See [PLAN-001](plans/PLAN-001-official-app-package-foundation.md) and
[PLAN-002](plans/PLAN-002-cats-usage-dashboard.md).

Usage 0.2.1 changes only release identity and Platform compatibility for Desktop
0.3.x. Run the same docs/tests/build checks; the coordinated Desktop release must
also verify the published archive and offline activation on all three OSes.

*Last updated: 2026-09-18*
