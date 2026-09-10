# App Data and API Boundary

## Current State

cats-apps serves no HTTP API and publishes no App SDK implementation.
The SDK and authorization bridge belong to cats-platform.

The App uses `catsApp.usage.getSnapshot()` from host-injected SDK v1. The host
requires `runtime.telemetry.read`, binds reads to the enabled App/version, and
projects the authenticated Runtime snapshot. No App-owned HTTP listener exists.

Runtime read surfaces include:

| Runtime read | Relevant data |
|--------------|---------------|
| GET /usage/snapshot | Sanitized current usage, passive quota windows, epoch/coverage, incidents and guardrails; the App bridge's source |
| GET /diagnostics/runtime | metering usage aggregates, incidents, guardrails |
| GET /diagnostics/providers | Per-target incident/cooldown/block summaries; not a full account quota balance |
| GET /sessions/:id | inspection.metering for one session |

These are host/runtime integration references, not permission for an installed
renderer to call arbitrary URLs or receive the runtime API key.

## Implemented v1 Contract

SDK `usage.getSnapshot()` maps to the allowlisted `usage.snapshot` operation.
The host reads `/api/apps/:id/usage?version=<exact-version>`; unknown operations are
rejected. Snapshot schemaVersion 1 separates totals, targets, sessions, quota
windows, incidents, guardrails, and memory coverage. Unknown metrics are null;
account linkage remains unverified; no cross-instance quota sum is exposed.
See the [host package guide](../../cats-platform/docs/app-packages.md).

Account quotas, history, and refresh semantics are specified in
[runtime SPEC-029](../../cats-runtime/docs/specs/SPEC-029-provider-account-quota-and-usage-snapshots.md).
Host access and payload projection are specified in
[platform SPEC-115](../../cats-platform/docs/specs/SPEC-115-versioned-official-app-packages-and-telemetry-bridge.md).

The initial dashboard is read-only. Collector scheduling/configuration and any
operation that contacts provider accounts remain host/runtime-owned. Cached UI
refresh is separate from requesting a fresh upstream probe.

*Last updated: 2026-09-10*
