# Testing

## Implemented Repository Check

```sh
npm run check:docs
```

This dependency-free Node check validates root workspace metadata and local
Markdown file targets. External URLs, heading anchors, document templates, and
other agents' private instruction files are outside its inspection scope.
Cross-repository relative links are checked when their sibling checkout exists
and skipped in a standalone clone.

This is a documentation/configuration check, not application test coverage.
There are no app unit, browser, package-install, or provider-live tests yet.

## Planned Gates

- Package validation: app ID/version, manifest entries, built files, compatibility,
  checksums, and absence of source-workspace dependencies.
- Cats Usage: unknown/zero distinction, stale/partial data, shared-account quotas,
  mixed units/currencies, countdowns, and history coverage.
- Host integration: actual built renderer, capability denial, revocation after
  disable/uninstall, offline launch, and failed update preserving the prior version.
- Runtime contract: reported quota sources, cache/timeouts, persisted usage,
  refresh deduplication, and error classifications.

Use isolated temporary app registries, runtime roots, and fixture data. Never
install test apps into the user's actual Desktop profile or spend provider quota
to verify a display-only change.

See [PLAN-001](plans/PLAN-001-official-app-package-foundation.md) and
[PLAN-002](plans/PLAN-002-cats-usage-dashboard.md).

*Last updated: 2026-09-10*
