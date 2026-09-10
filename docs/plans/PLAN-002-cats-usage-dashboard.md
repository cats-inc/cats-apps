# PLAN-002: Usage Dashboard

## Metadata

| Field | Value |
|-------|-------|
| Status | Usage 0.2.0 published and selected for Desktop 0.2.5 preview; Kiro verification and remaining U2/U3 deferred |
| Owner | cats-apps |
| Related spec | SPEC-002 |
| Cross-repository dependencies | Platform PLAN-106; runtime PLAN-038 |

## Related Spec

[SPEC-002](../specs/SPEC-002-cats-usage-dashboard.md)

## Overview

Implement Usage as a versioned read-only App. Prove the host/package boundary
and existing usage display first, then add account quotas and history as their
runtime contracts become available.

## Implementation Phases

### Phase 0: Product and Data Contract

- [x] Define Usage, cats.usage, Lobby placement, and coordinated Desktop delivery.
- [x] Separate usage, account allowance, incidents, freshness, and coverage.
- [x] Align the host DTO and permission with platform PLAN-106.
- [x] Agree the U1 fixture set and data retention/coverage labels with runtime PLAN-038.

### Phase 1: App Package and Host Execution

- [x] Create apps/usage and its own manifest/version/build/test setup.
- [x] Consume the real exported renderer SDK; do not substitute direct host imports.
- [x] Implement locale/theme/navigation and read-only telemetry access.
- [x] Verify the actual built app inside the host using a temporary registry.

### Phase 2: U1 Current Usage

- [x] Implement overview, provider/instance rows, and session detail.
- [x] Show tokens, cost/confidence, runtime coverage, incidents, and guardrails.
- [x] Implement missing/zero/stale/error/offline states.
- [x] Add bounded visible-page polling and cached-view refresh.
- [x] Add fixtures for mixed currencies, unsupported quotas, and runtime restarts.

U1 release gate: a packaged app renders truthful existing data; registry navigation
or an exported HTML file alone is insufficient.

### Phase 3: U2 Provider Account Quotas

Follow-up 2026-09-11 (implementation/verification only):

- [x] Generalize query buttons to Runtime-advertised Codex/Copilot/Claude/Antigravity targets.
- [x] Key status/failure/cooldown by provider and instance, not instance name alone.
- [x] Display native request quantities and unlimited entitlements without inferred balances.
- [x] Preserve missing reset times, elapsed resets, stale values and passive polling.
- [x] Require SDK ^1.2.0 and increment immutable package version to 0.2.0.
- [x] Add multi-provider same-instance, no-auto-query and native-quantity VM tests.
- [x] Complete built-package browser smoke and final independent review.
- [ ] Kiro: authenticated success fixture and verified mapping before advertising a button.

Live numeric verification and the Kiro auth blocker are recorded in
[Runtime research](../../../cats-runtime/docs/research/2026-09-11-additional-cli-quota-queries.md).
That implementation-only slice did not authorize publication or an installed
update. The later release authorization below supersedes the publication hold.
Usage 0.2.0 validation: six App tests plus docs and deterministic build passed.
The built archive passed authenticated host checks with both the standalone and
production renderer, including all three new query buttons, native quantities,
unlimited values, passive polling, stale/offline state, mobile width and disable.
These browser values are fixtures; separate live CLI evidence is linked above.
The following completed items record the earlier 0.1.1/Codex delivery:

- [x] Add Codex-only `查詢最新額度` through SDK 1.1, with distinct refresh permission.
- [x] Render actual window duration, remaining percentage, reset and observation time.
- [x] Show pending/cooldown/auth-required/unsupported/error states without inventing zero.
- [x] Keep last values on failure, suppress concurrent clicks, and leave polling passive.
- [x] Increment immutable App version to 0.1.1 and require SDK ^1.1.0.
- [x] Publish the immutable Usage 0.1.1 package with release lock/provenance.
- [ ] Validate this package in the user's updated Desktop (separate update authorization).

Local validation (2026-09-11): five App tests and docs/build checks passed. The built
0.1.1 archive was staged offline and exercised in headless Edge with a temporary
authenticated Platform profile and actual native Codex CLI. The displayed window
and percentage matched Runtime's real response; no model turn or execution usage
record was created. Publication and installed updates were initially deferred.
On 2026-09-11 the user authorized publishing the Desktop 0.2.4 unsigned preview
with Usage 0.1.1; updating the installed Desktop remains outside that task.

- [x] Present existing passive Claude/Codex percentage/reset reports with explicit
      unverified account linkage and no cross-target quota sum. This is not an active collector.

- [ ] Connect the runtime account/window snapshot when collectors are verified.
- [ ] Display related instances without multiplying shared quota.
- [x] Add used/remaining, native units, reset timestamps, and stale countdown behavior.
- [x] Document a provider coverage matrix based on executed collector validation.
- [x] Keep unsupported providers explicit rather than estimating their allowance.

### Phase 4: U3 History

- [ ] Read persisted runtime series with retention and coverage metadata.
- [ ] Add period filters and trends only for actually retained observations.
- [ ] Verify that process restarts, retention trimming, and missing intervals remain visible.

### Phase 5: Desktop Delivery

- [x] Publish immutable Usage 0.2.0 with exact archive hash, lock and source provenance.
- [ ] Complete coordinated Desktop 0.2.5 three-platform release gates (Platform PLAN-106).

The owner authorized the 0.2.5 unsigned preview after the parallel skill-root
changes merged. Usage 0.2.0 release CI and downloaded archive/lock/provenance
verification passed. Desktop selects SDK 1.2.0 and Runtime
`91bba98e2e621ec3124130b7c79fdc6c3ab7ca19`; installed updates and native
interactive acceptance are separate from publication.

- [x] Package the app through PLAN-001 and record its version/source/checksum.
- [x] Include it in pinned Windows Desktop staging through platform PLAN-106.
- [x] Verify source-free launch, offline state, enable/disable, and data preservation
      against an isolated profile.
- [x] Update user documentation with the exact implemented U1/passive/U3 boundaries.
- [ ] Publish and validate native installers; add persistent filter preferences only with scoped storage.

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
| 2026-09-11 | Published Usage 0.2.0 from `1affcf38e427f636e1eedb45bf3d1ac4e78eeb4f`: release workflow docs/tests/build passed. Downloaded archive, lock, provenance and GitHub digest agree on SHA-256 `7d5455bb6b484b731becbc69b469e649fbfc433cf015586e0022c3045974c04e`; decoded payload matches the locally tested build. Desktop 0.2.5 selection and OS gates are owned by Platform PLAN-106. No installed update performed. |
| 2026-09-11 | Unreleased Usage 0.2.0 adds Copilot/Claude/Antigravity refresh through SDK 1.2, native quantities and provider+instance isolation. Six App tests and authenticated built-package browser checks passed; independent review completed. Kiro remains unenabled pending authenticated evidence. |
| 2026-09-11 | Usage 0.1.1 released from Apps commit `1a06d51523e0175f65a3a062be3581a659ada2ef`; workflow docs/tests/build passed. Downloaded archive, release lock, provenance and GitHub asset digest agree. Desktop 0.2.4 version/hash selection and three-platform release gates are tracked in Platform PLAN-106; no local installed update performed. |
| 2026-09-10 | Product/data scope and phased plan documented. U1/U2/U3 implementation remains open. |

*Created: 2026-09-10*
