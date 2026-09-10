# SPEC-002: Usage Dashboard

## Metadata

| Field | Value |
|-------|-------|
| Status | U1 plus passive Claude/Codex windows implemented; collectors/history deferred |
| Owner | cats-apps |
| Product name | Usage |
| App ID | cats.usage |
| Workspace / version | apps/usage / 0.1.0 |
| Placement | Installed App under Lobby Apps |
| Initial delivery | Built package included with a coordinated Desktop release |

## Summary

Delivered on 2026-09-10: real packaged renderer, overview/provider/session filters,
per-currency cost, confidence/coverage, incidents/guardrails, unknown/zero/offline/
stale/restart states, Traditional Chinese/English, and 30-second visible-page cached
reads. Existing Claude/Codex stream signals supply passive percentage/reset windows.
Account linkage is explicitly unverified; quota is never summed across targets.
No active account query, complete billing history, persistent preferences, or
verified shared-account deduplication is claimed. Provider coverage remains limited
to the latest supported passive report observed by this Runtime process.

Usage is a read-only utility for understanding provider usage and available
quota across Cats. It presents facts supplied by cats-runtime through the
platform's authorized App bridge. It does not own account login, CLI parsing,
quota policy, execution blocking, or a separate provider connection.

The name covers tokens, costs, request/credit allowance, reset windows, and
runtime incidents without promising that every provider exposes an exact balance.

## Goals

- Let the owner see which provider targets have usable, stale, or missing data.
- Distinguish execution consumption from account allowance and cooldown state.
- Show source, coverage, freshness, and confidence alongside the numbers.
- Prove the actual built-package/App SDK boundary with a useful first app.

## Non-Goals

- Budget approval/override workflows, billing settlement, or payment management.
- Automatic provider rerouting, quota purchasing, or resetting provider limits.
- Replacing Settings Runtime setup/auth flows.
- A standalone service, an app-owned polling daemon, or a revived Work War Room.
- Guaranteed account quota support for every CLI in the initial release.

## Users and Entry

The owner opens Usage from Lobby Apps. The host may show installed app identity
and settings inventory using its normal App contract. The full dashboard lives
inside the app route; embedding live dashboard widgets in Lobby is not required.

## Views and Data

### Overview

Show a compact summary of observed usage, provider targets needing attention,
and the observation period. Totals must be labelled with their scope.
An account's remaining percentage cannot be meaningfully summed across providers.

### Provider and Account Rows

Each row shows provider, a sanitized account alias when available, related
instances, selected quota window/limit, used or remaining values in their native
unit, reset time when reported, current incident/cooldown state, and last refresh.

When several instances share an account, display the shared quota once and show
the linked instances. Do not turn identical account snapshots into additive usage.

### Usage Detail

Allow filtering by provider/instance and session using the host's authorized
read contract. Show input/output/total tokens and cost only where available.
Provider-reported cost, estimates, cached tokens, and unknown values remain
distinguishable. Different currencies and quota units are not combined silently.

### History (Later)

Charts and period comparisons require a persisted runtime data source with
explicit retention, gaps, and coverage. Before that exists, show the current
observed snapshot and its bounded coverage, not a fabricated daily/monthly trend.

## Functional Requirements

1. Consume only the host-provided telemetry operation with the proposed
   runtime.telemetry.read capability once implemented.
2. Never read provider login files, invoke CLIs, or request raw runtime credentials.
3. Preserve the distinction between:
   - runtime-observed execution usage;
   - provider-account quota for a specific limit/window;
   - rate-limit incidents and locally enforced guardrails.
4. Display an explicit unavailable/unsupported/auth-required/error state where the
   source cannot provide a metric. Missing is not zero and not 100% remaining.
5. Preserve reported zero as a valid value. Render a percentage bar only when a
   percentage is reported or a valid same-window limit/usage calculation exists.
6. Do not derive subscription quota consumption from raw token totals alone.
7. Show absolute reset time and, when meaningful, a relative countdown in the
   viewer's timezone. Missing reset times remain unknown; clock passage alone
   does not prove the provider has restored allowance.
8. Show provider-reported windows/model-specific limits separately. Do not hardcode
   a universal five-hour, daily, weekly, or monthly reset schedule.
9. Mark stale snapshots with their original observation time. A failed refresh
   may retain the last known values but must not present them as fresh.
10. Show runtime-only activity coverage explicitly. Activity from other tools or
    devices is reflected only if the account source itself reports that scope.
11. Show cooldown/block state independently from the account balance. A local
    cooldown expiry is not an account quota reset.
12. Avoid double counting cumulative CLI reports or shared accounts. Runtime owns
    normalization; the UI must not reconstruct usage from transcript text.
13. Use the host locale/theme and existing navigation conventions. English and
    Traditional Chinese are initial localization targets.
14. Poll cached host snapshots at a bounded, configurable cadence while visible;
    suspend repeated UI reads when hidden. UI polling must not force account probes.
15. An initial Refresh action refreshes the cached host view. Any later upstream
    collector refresh uses a separately specified host/runtime operation.
16. When runtime is unavailable, display that state and the last observation
    timestamp if cached data exists; do not imply healthy current telemetry.
17. Package launch requires no source checkout, development server, or npm install.
18. View preferences such as filters may use scoped app storage after that host
    capability is implemented. Credentials and authoritative usage history may not.

## Delivery Slices

| Slice | Content | Required dependency |
|-------|---------|---------------------|
| U1 | Current execution usage, partial cost, incidents, confidence, coverage | Real host renderer + telemetry read bridge |
| U2 | Account quota windows, remaining values, reset times, shared-account mapping | Verified runtime quota collectors |
| U3 | Trends and longer-period totals | Runtime persistence and retention/coverage contract |

U1 may ship with explicit unsupported account-quota fields. If the release is
described as an account-quota dashboard, U2 must have actually verified supported
providers and disclose the unsupported ones.

## Acceptance

- A built Usage package launches from Lobby in an isolated Desktop profile.
- A fixture with unknown quota does not show a full bar or zero consumption.
- Reported zero, stale data, missing reset, different currencies, and an exhausted
  account all produce distinct, correct UI states.
- Two instances linked to one account display one quota allowance.
- Existing execution usage can be shown while account collectors are unavailable.
- Disabling the app revokes its bridge access; reopening never triggers paid work.
- A source-free offline launch renders the app and a truthful unavailable-data state.

## Dependencies

- [Package SPEC-001](SPEC-001-official-utility-app-packages.md)
- [Platform SPEC-115](../../../cats-platform/docs/specs/SPEC-115-versioned-official-app-packages-and-telemetry-bridge.md)
- [Runtime SPEC-029](../../../cats-runtime/docs/specs/SPEC-029-provider-account-quota-and-usage-snapshots.md)

## Open Questions

- Select the first verified account-quota providers in runtime, based on actual
  structured interfaces and local evidence rather than assumed CLI commands.
- Finalize telemetry refresh intervals and history retention with runtime owners.
- Decide whether later alert preferences belong to this app or a shared host
  notification capability; no background alert service is required for U1.

*Created: 2026-09-10*
*Related Plan: [PLAN-002](../plans/PLAN-002-cats-usage-dashboard.md)*
