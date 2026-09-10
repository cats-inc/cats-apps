# Architecture

## Accepted Repository Boundaries

| Repository | Owns |
|------------|------|
| cats-apps | Official utility source, individual app packages, shared build automation, future official catalog metadata |
| cats-platform | Public App SDK, versioned installation/loading, permission checks, Lobby/Settings inventory, Desktop bundle selection, future remote catalog consumption |
| cats-runtime | Provider execution, normalized usage, quota collection, persistence, rate-limit incidents, and execution guardrails |

Apps consume host contracts. Provider parsing and secrets remain runtime/host-owned.

## Source, Package, and Release

An app lives in apps/<slug> and produces a Cats App Package with a stable
ID, independent version, manifest, built renderer, and required static assets.
Server/worker entrypoints are optional future capabilities; Usage starts
as a read-only renderer.

The private root workspace coordinates tooling; it is not itself an installable
app or a replacement Platform product. Shared packages are introduced only when
used by multiple apps.

Initial delivery follows a coordinated Desktop release: app builds are identified
by source revision, packaged once, then selected by exact version and checksum.
Desktop installs built artifacts under host management and retains app data
separately from replaceable package versions. Production does not build source,
install npm dependencies, or require a sibling source checkout.

## Usage Data Flow

Provider observations → cats-runtime telemetry → platform-authorized read bridge
→ Usage renderer.

Collection and execution guardrails continue independently of whether the dashboard
is open. The UI distinguishes runtime-observed usage from provider-account quota.
Account observations shared by several provider instances must not be summed twice.

## Current Implementation Boundary

Usage 0.1.0 and the shared builder are implemented. The `.catsapp` v1 archive is
gzip-compressed JSON containing a manifest and base64 payload files; the first
renderer is a self-contained HTML document. Host-injected SDK v1 is implemented in
cats-platform, not copied into this repository. The host owns the opaque-origin
iframe, verified package activation, lifecycle and telemetry permission. General
server/worker/action executors still return unsupported; see
[cats-platform PLAN-106](../../cats-platform/docs/plans/PLAN-106-official-app-package-hosting.md).

Runtime exposes authenticated `/usage/snapshot`, preserving quota-only reports,
passive Claude/Codex windows, per-currency cost, epoch and truncation. Account quota polling
and durable time-series data require
[cats-runtime PLAN-038](../../cats-runtime/docs/plans/PLAN-038-provider-account-quota-and-usage-snapshots.md).

## Planning References

- [ADR-001](decisions/001-own-official-utility-apps-and-coordinate-desktop-distribution.md)
- [Package requirements](specs/SPEC-001-official-utility-app-packages.md)
- [Usage](specs/SPEC-002-cats-usage-dashboard.md)
- [Platform ADR-114](../../cats-platform/docs/decisions/114-separate-official-app-sources-and-coordinate-desktop-distribution.md)
- [Runtime ADR-038](../../cats-runtime/docs/decisions/038-separate-execution-usage-from-provider-account-quota.md)

*Last updated: 2026-09-10*
