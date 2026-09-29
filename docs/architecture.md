# Architecture

## Accepted Repository Boundaries

| Repository | Owns |
|------------|------|
| cats-apps | Official utility source, individual app packages, shared build automation, future official catalog metadata |
| cats-platform | Public App SDK, versioned installation/loading, permission checks, Lobby/Settings inventory, Desktop bundle selection, future remote catalog consumption |
| cats-runtime | Provider execution, normalized usage, quota collection, persistence, rate-limit incidents, and execution guardrails |

Apps consume host contracts. Provider parsing and secrets remain runtime/host-owned.

## Proposed Ask delegation boundary (2026-09-29)

Ask / `cats.ask` is a planning identity. [ADR-003](decisions/003-delegate-personal-questions-to-first-party-assistants.md),
[SPEC-004](specs/SPEC-004-personal-assistant-questions-mvp.md) and
[PLAN-005](plans/PLAN-005-personal-assistant-questions-mvp.md) propose:

Ask question UI → host-authorized submission and retained request → Runtime-owned
delegation to the user's actual first-party assistant → correlated, retained answer
→ Ask detail and Copy.

Apps owns the list/detail/copy renderer and eventual package. Platform owns the
public SDK, permissions, clipboard boundary and App-scoped read views; Runtime
owns generic workspace persistence, product-specific execution, connectors and
return handling. Reuse existing storage and job primitives where they satisfy the
contract. Exact APIs, storage and read-view contracts require follow-up decisions
in their owning repositories.

Gemini Spark, Grok Bot with its X Connector, and Meta AI are distinct product
targets. Each needs proof of activation, personal-context access and answer return;
an MCP endpoint alone proves none of those. Current SDK 1.3 does not implement
this delegation flow. Credentials remain outside the App iframe, and closing that
iframe must not be treated as cancelling a submitted task.

The MVP provides asynchronous status, reopening of retained answers and Copy.
Host deep links/history, automatic Chat/Code/Work ingestion, a general answer
knowledge service and full offline execution remain deferred.

## Planned independent distribution (2026-09-28)

[Platform ADR-121](../../cats-platform/docs/decisions/121-distribute-apps-independently-with-host-owned-lifecycle.md)
and [SPEC-120](../../cats-platform/docs/specs/SPEC-120-app-market-and-lifecycle.md)
govern the next phase; [PLAN-004](plans/PLAN-004-independent-app-distribution.md)
tracks this repository's SDK, artifact and catalog work. Usage remains preinstalled
and listed in Market, with a host-owned Home recovery placeholder after removal.
Studio is optional: no uninstalled Home placeholder. Both keep independent App
versions, release artifacts and one common host lifecycle.

### Desktop management surface clarification (accepted, 2026-09-29)

Apps Marketplace is a standalone Desktop destination with a prominent entry from
Home. Users discover Apps, inspect details and install directly from Marketplace;
installation must not require a detour through Settings. Home also retains installed
App launch cards and the existing recovery entries.

Settings > Apps focuses on installed inventory, permissions, machine-level setup,
enable/disable, updates, repair and removal. Marketplace may expose appropriate
actions on App details using the same Desktop lifecycle service and state. Settings
is not the exclusive route allowed to initiate these actions. Plugin inventory
uses a separate Settings > Plugins page; any Home shortcut to Plugin management stays small.

Ordinary browser access to the Platform web UI does not grant authority to
install, enable, disable, update, repair, remove, or change the machine-level
setup of Desktop-managed packages. These operations need a verified Desktop
management context at the service boundary, not merely hidden web controls,
an owner login, a localhost URL, or a client-supplied environment flag. Browser
or remote invocation alone must not silently initiate a Desktop mutation.
This is a client authorization boundary, not a requirement to place Marketplace
inside Settings.

The implementation remains owned by cats-platform: repository ownership and
the client allowed to initiate an operation are separate concerns. Package
renderers receive no package-management authority through the App SDK. Whether
an authorized browser may launch or use an already-installed App is a separate
product decision; this clarification neither removes that capability nor promises
browser support. Ordinary in-App preferences are also separate from installation
and machine-level setup.

This is an accepted planning requirement, not an implemented access restriction.
The coordinated Platform ADR-121 / SPEC-120 / PLAN-112 update records the same
requirement and Desktop-versus-browser acceptance cases. The concrete management
context contract, implementation and acceptance remain host-owned follow-up work.

Current Desktop 0.5.13 publicly bundles Usage only. Studio's single-image renderer
and SDK 1.3 integration are implemented and locally installed; remote catalog,
resource-cleaning uninstall and complete repair remain unimplemented. The sections
below describe the initial package foundation, not delivery of the new phase.

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

Usage 0.1.1 and the shared builder are implemented. The `.catsapp` v1 archive is
gzip-compressed JSON containing a manifest and base64 payload files; the first
renderer is a self-contained HTML document. Host-injected SDK v1 is implemented in
cats-platform, not copied into this repository. The host owns the opaque-origin
iframe, verified package activation, lifecycle and telemetry permission. General
server/worker/action executors still return unsupported; see
[cats-platform PLAN-106](../../cats-platform/docs/plans/PLAN-106-official-app-package-hosting.md).

Runtime exposes authenticated `/usage/snapshot`, preserving quota-only reports,
passive Claude/Codex windows, per-currency cost, epoch and truncation. Explicit
native Codex reads use the separately authorized SDK 1.1 quota-refresh operation;
Runtime owns CLI execution and authentication stays entirely in the CLI. Automatic
account polling, other collectors and durable time-series data still require
[cats-runtime PLAN-038](../../cats-runtime/docs/plans/PLAN-038-provider-account-quota-and-usage-snapshots.md).

## Planning References

- [ADR-001](decisions/001-own-official-utility-apps-and-coordinate-desktop-distribution.md)
- [Package requirements](specs/SPEC-001-official-utility-app-packages.md)
- [Usage](specs/SPEC-002-cats-usage-dashboard.md)
- [Platform ADR-114](../../cats-platform/docs/decisions/114-separate-official-app-sources-and-coordinate-desktop-distribution.md)
- [Runtime ADR-038](../../cats-runtime/docs/decisions/038-separate-execution-usage-from-provider-account-quota.md)

*Last updated: 2026-09-29*
