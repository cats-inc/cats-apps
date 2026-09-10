# SPEC-001: Official Utility App Packages

## Metadata

| Field | Value |
|-------|-------|
| Status | v1 renderer/package slice implemented; remote distribution deferred |
| Owner | cats-apps |
| Implementation | Usage 0.1.0, shared archive builder, host SDK integration and pinned Desktop handoff |
| Related decision | ADR-001 |

## Summary

Produce small official utilities as independently versioned Cats App Packages.
Initially distribute a selected app set with Cats Desktop, preserving the option
of later catalog installation and independent updates.

## Goals

- Real source/package/host boundaries across the three Cats repositories.
- Reproducible built payloads with individual versions and compatible SDK usage.
- Shared package automation for a collection of utilities.
- A first installed app, Usage, that proves the boundary.

## Non-Goals

- A standalone server for every utility.
- Application source compilation on the user's machine at install/launch time.
- A public marketplace or a separate release pipeline per app.
- Moving provider integrations or the host SDK into this repository.

## Requirements

1. The root npm workspace shall remain private and coordinate apps/<slug> plus
   packages/<name>. Shared packages need a demonstrated multi-app consumer.
2. Every app shall have a stable ID, display name, version, publisher, category,
   compatibility declarations, requested permissions, and manifest entrypoints.
3. Built payloads shall contain the manifest, executable renderer/assets, license
   information, and any declared optional runtime dependencies.
4. The production package shall run without the app's source tree, build tools,
   sibling repository paths, or a dev server. App source may be published separately.
5. Apps shall use the versioned public host SDK and scoped bridge. Workspace
   imports of cats-platform/cats-runtime source are forbidden.
6. Build output, app version, source revision, and content checksum shall be
   traceable. Rebuilding changed contents under an already released app version
   is not an update strategy.
7. The shared package workflow shall be able to build/test/package a selected app
   and later multiple apps; initial utilities need not own separate workflows.
8. Desktop bundle input shall identify an exact app/version/artifact set and host
   compatibility. A moving latest URL shall not determine release contents.
9. The host shall own installation, enabled/disabled state, activation, data roots,
   Lobby registration, and replacement of package versions.
10. Each app's data shall survive replacement of its package version unless a
    separate, explicit data-removal action is requested.
11. First-party ownership shall come from trusted host bundle provenance. A package's
    self-declared system trust is not sufficient.
12. Usage shall contribute a Lobby Apps entry with ID cats.usage. It requests
    the proposed telemetry read capability once the host implements it.
13. A later catalog shall describe available app versions, compatibility, artifact
    download references, sizes, and checksums. Catalog state is not installed state.
14. Documentation and release notes shall distinguish supported capabilities from
    reserved manifest fields and unimplemented SDK interfaces.

## Acceptance

- A fixture or first app builds in an isolated workspace and its packaged renderer
  runs with the source directory absent.
- The host installs and opens the exact built app version from its Lobby entry.
- Disabling the app removes active launch/access; re-enabling restores it without
  losing scoped data.
- A Desktop bundle identifies the app revisions/checksums it contains.
- Failed package validation does not replace an existing usable installation.

## Dependencies

- [Platform SPEC-115](../../../cats-platform/docs/specs/SPEC-115-versioned-official-app-packages-and-telemetry-bridge.md)
- [Platform PLAN-106](../../../cats-platform/docs/plans/PLAN-106-official-app-package-hosting.md)
- [Usage SPEC-002](SPEC-002-cats-usage-dashboard.md)

## v1 Contract Resolution

- `.catsapp` uses gzip JSON with manifest and base64 built files; license included.
- Host-injected executable SDK v1 provides only Usage reads and Lobby navigation.
- `<slug>-v<version>` tags use one shared App release workflow. Desktop selects
  exact ID/version/SHA-256/artifact locks; official default selection remains empty
  until the first published artifact is explicitly selected.
- [Frozen host/package details](../../../cats-platform/docs/app-packages.md).

*Created: 2026-09-10*
*Related Plan: [PLAN-001](../plans/PLAN-001-official-app-package-foundation.md)*
