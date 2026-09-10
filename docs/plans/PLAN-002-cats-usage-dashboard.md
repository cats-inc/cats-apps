# PLAN-002: Cats Usage Dashboard

## Metadata

| Field | Value |
|-------|-------|
| Status | Planned; no dashboard implementation |
| Owner | cats-apps |
| Related spec | SPEC-002 |
| Cross-repository dependencies | Platform PLAN-106; runtime PLAN-038 |

## Related Spec

[SPEC-002](../specs/SPEC-002-cats-usage-dashboard.md)

## Overview

Implement Cats Usage as a versioned read-only App. Prove the host/package boundary
and existing usage display first, then add account quotas and history as their
runtime contracts become available.

## Implementation Phases

### Phase 0: Product and Data Contract

- [x] Define Cats Usage, cats.usage, Lobby placement, and coordinated Desktop delivery.
- [x] Separate usage, account allowance, incidents, freshness, and coverage.
- [ ] Align the host DTO and permission with platform PLAN-106.
- [ ] Agree the U1 fixture set and data retention/coverage labels with runtime PLAN-038.

### Phase 1: App Package and Host Execution

- [ ] Create apps/usage and its own manifest/version/build/test setup.
- [ ] Consume the real exported renderer SDK; do not substitute direct host imports.
- [ ] Implement locale/theme/navigation and read-only telemetry access.
- [ ] Verify the actual built app inside the host using a temporary registry.

### Phase 2: U1 Current Usage

- [ ] Implement overview, provider/instance rows, and session detail.
- [ ] Show tokens, cost/confidence, runtime coverage, incidents, and guardrails.
- [ ] Implement missing/zero/stale/error/offline states.
- [ ] Add bounded visible-page polling and cached-view refresh.
- [ ] Add fixtures for mixed currencies, unsupported quotas, and runtime restarts.

U1 release gate: a packaged app renders truthful existing data; registry navigation
or an exported HTML file alone is insufficient.

### Phase 3: U2 Provider Account Quotas

- [ ] Connect the runtime account/window snapshot when collectors are verified.
- [ ] Display related instances without multiplying shared quota.
- [ ] Add used/remaining, native units, reset timestamps, and stale countdown behavior.
- [ ] Publish a provider coverage matrix based on executed collector validation.
- [ ] Keep unsupported providers explicit rather than estimating their allowance.

### Phase 4: U3 History

- [ ] Read persisted runtime series with retention and coverage metadata.
- [ ] Add period filters and trends only for actually retained observations.
- [ ] Verify that process restarts, retention trimming, and missing intervals remain visible.

### Phase 5: Desktop Delivery

- [ ] Package the app through PLAN-001 and record its version/source/checksum.
- [ ] Include it in a pinned Desktop bundle through platform PLAN-106.
- [ ] Verify source-free launch, offline state, enable/disable, and preferences
      against an isolated profile.
- [ ] Update user documentation with the exact shipped U1/U2/U3 capabilities.

## Work Areas

| Area | Work |
|------|------|
| apps/usage | UI, presentation helpers, manifest, localization, and fixtures |
| shared package automation | Reuse PLAN-001; no app-specific release platform |
| cats-platform | SDK, renderer host, scoped read bridge, preinstall, lifecycle |
| cats-runtime | Usage/coverage DTO, quota collectors, cache, account mapping, history |

## Testing Strategy

Use deterministic fixtures for presentation and a real built package for host
integration. Exercise unknown versus zero, stale account observations, reset-time
timezone conversion, shared-account deduplication, unsupported metrics, mixed
currencies, expired cooldowns, disabled-app access, and runtime unavailability.

No test creates records in a real user app registry or spends provider quota
without a separately authorized collector-validation task.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| UI claims total account allowance from runtime token observations | Separate scopes and explicit coverage |
| Quota collection gets duplicated inside the app | Keep all source adapters in runtime |
| History appears complete despite bounded memory records | Gate charts on persistence and gap metadata |
| Polling causes provider requests | Read cached host snapshots; separate collector refresh |

## References

- [PLAN-001](PLAN-001-official-app-package-foundation.md)
- [Platform PLAN-106](../../../cats-platform/docs/plans/PLAN-106-official-app-package-hosting.md)
- [Runtime PLAN-038](../../../cats-runtime/docs/plans/PLAN-038-provider-account-quota-and-usage-snapshots.md)

## Progress Log

| Date | Update |
|------|--------|
| 2026-09-10 | Product/data scope and phased plan documented. U1/U2/U3 implementation remains open. |

*Created: 2026-09-10*
