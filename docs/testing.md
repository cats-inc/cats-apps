# Testing

## Implemented Checks

```sh
npm run check:docs
npm test
npm run build -- --version 0.1.0
```

This dependency-free Node check validates root workspace metadata and local
Markdown file targets. External URLs, heading anchors, document templates, and
other agents' private instruction files are outside its inspection scope.
Cross-repository relative links are checked when their sibling checkout exists
and skipped in a standalone clone.

`npm test` covers unknown/zero, independent quota/session scopes, currency separation,
stale resets, deterministic source-free packaging and explicit version mismatches.
The docs command alone is not application test coverage.

Host tests live in cats-platform: package limits/path/digest checks, compatibility,
pin selection, updates/rollback/data preservation, capability denial/revocation,
upstream redaction and App-route execution. Its `scripts/testing/check-usage-app.mts`
loads the real artifact with the actual host surface and routes against fixture data,
using a temporary registry and an ephemeral loopback port. It checks desktop/narrow
layouts, the SDK handshake, frame/network isolation, filters, offline/stale/restart,
and disable revocation. See the host [package guide](../../cats-platform/docs/app-packages.md).

## Remaining Gates

- Active account queries, verified shared-account linking, durable history and gaps.
- Native installer execution on every supported OS and independent code review.
- First published App release and an explicit official Desktop bundle opt-in.

Use isolated temporary app registries, runtime roots, and fixture data. Never
install test apps into the user's actual Desktop profile or spend provider quota
to verify a display-only change.

See [PLAN-001](plans/PLAN-001-official-app-package-foundation.md) and
[PLAN-002](plans/PLAN-002-cats-usage-dashboard.md).

*Last updated: 2026-09-10*
