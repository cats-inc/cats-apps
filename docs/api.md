# App Data and API Boundary

## Current State

cats-apps serves no HTTP API and publishes no App SDK implementation.
The SDK and authorization bridge belong to cats-platform.

Runtime has existing read surfaces that the host may adapt:

| Runtime read | Relevant data |
|--------------|---------------|
| GET /diagnostics/runtime | metering usage aggregates, incidents, guardrails |
| GET /diagnostics/providers | Per-target incident/cooldown/block summaries; not a full account quota balance |
| GET /sessions/:id | inspection.metering for one session |

These are host/runtime integration references, not permission for an installed
renderer to call arbitrary URLs or receive the runtime API key.

## Planned Contract

The host provides a narrowly authorized telemetry snapshot operation through its
App renderer context. A proposed runtime.telemetry.read permission and operation
name must be added and tested in the host; neither exists as a usable installed
App capability yet.

Account quotas, history, and refresh semantics are specified in
[runtime SPEC-029](../../cats-runtime/docs/specs/SPEC-029-provider-account-quota-and-usage-snapshots.md).
Host access and payload projection are specified in
[platform SPEC-115](../../cats-platform/docs/specs/SPEC-115-versioned-official-app-packages-and-telemetry-bridge.md).

The initial dashboard is read-only. Collector scheduling/configuration and any
operation that contacts provider accounts remain host/runtime-owned. Cached UI
refresh is separate from requesting a fresh upstream probe.

*Last updated: 2026-09-10*
