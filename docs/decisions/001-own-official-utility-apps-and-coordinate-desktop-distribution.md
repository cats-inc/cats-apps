# ADR-001: Own Official Utility Apps and Coordinate Desktop Distribution

## Status

Accepted — repository and initial distribution direction approved on 2026-09-10.
Acceptance does not mean app packaging or loading has been implemented.

## Context

Cats has a platform host, a provider runtime, and a planned collection of small
utility apps. Cats Usage is the first concrete app. These apps need real package
boundaries without imposing a separate repository and release workflow on every
small tool.

The existing platform App system has manifest/registry/Lobby foundations but
does not yet load built app renderers or execute declared scoped API handlers.

## Decision

1. Use cats-inc/cats-apps as the official utility-app source monorepo.
2. Give each app its own ID, version, manifest, build output, and lifecycle.
   The root workspace is private and is not an installable app.
3. Keep the public SDK, permissions, installation/loading, catalog consumption,
   and Desktop packaging in cats-platform.
4. Keep provider execution, usage normalization, account quota collection,
   persistence, and guardrails in cats-runtime.
5. Start with Desktop-coordinated distribution: a Desktop release includes an
   exact, tested set of built app packages from an identified apps revision.
   App versions remain independent from the Desktop version.
6. Share repository checks and package automation. Each app does not need its
   own GitHub repository or workflow.
7. Production loads installed build artifacts, never a source checkout, dev
   server, arbitrary sibling import, or install-time npm build.
8. Reserve later remote distribution through an official App Catalog. Available
   catalog entries, hosted release artifacts, and the local installed registry
   are separate concepts.
9. Use Cats Usage, ID cats.usage, as the first planned utility app. It remains an
   App under Lobby Apps and does not become a new top-level Product.

## Consequences

### Positive

- Utility code can evolve independently from host implementation.
- One app exercises a real SDK/package boundary before the collection grows.
- Initial Desktop releases have a pinned compatibility set and work offline.
- Independent app updates can be introduced without relocating app source.

### Negative

- Host SDK and artifact compatibility must be explicit across repositories.
- App updates initially follow the Desktop delivery cadence.
- Versioned installation and actual renderer loading still need host work.

### Neutral

- First-party preinstallation does not change the app package format.
- A future remote catalog can use GitHub-hosted artifacts without requiring a
  marketplace backend.
- Public third-party trust/signing governance is outside the initial utility slice.

## Alternatives Considered

### Keep Utility Implementations Inside the Platform

Simple initial imports, but app code could depend on host internals and would not
exercise the intended package/SDK boundary. Rejected for the official collection.

### One Repository and Release Workflow Per App

Allows separate ownership immediately, but adds overhead for small apps maintained
together. Keep as an option when ownership or update cadence actually differs.

### Require Independent Remote Updates From Day One

Provides faster individual delivery but makes the first app depend on catalog,
download, install, update, and trust work. Deferred in favor of bundled artifacts.

## References

- [SPEC-001](../specs/SPEC-001-official-utility-app-packages.md)
- [SPEC-002](../specs/SPEC-002-cats-usage-dashboard.md)
- [Platform ADR-114](../../../cats-platform/docs/decisions/114-separate-official-app-sources-and-coordinate-desktop-distribution.md)
- [Runtime ADR-038](../../../cats-runtime/docs/decisions/038-separate-execution-usage-from-provider-account-quota.md)

*Decision made: 2026-09-10*
