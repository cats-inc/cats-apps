# Requirements

The accepted scope is an official utility-app monorepo with versioned package
boundaries and initially coordinated Desktop distribution.

## Repository

- Keep the root npm workspace private.
- Give each app its own ID, version, manifest, build output, and targeted tests.
- Use the public platform SDK and host APIs; never sibling source imports.
- Share package automation without requiring one release workflow per app.
- Record planned functionality separately from delivered functionality.

## First App

Usage (cats.usage) presents normalized execution usage and provider-account
quota when available, including coverage, freshness, source confidence, reset
windows, and active cooldown/block state.

The first slice can use existing usage/incidents while quota collectors and history
remain unavailable. Unknown data must not be rendered as zero or a full allowance.

Detailed requirements are in
[SPEC-001](specs/SPEC-001-official-utility-app-packages.md) and
[SPEC-002](specs/SPEC-002-cats-usage-dashboard.md).

*Last updated: 2026-09-10*
