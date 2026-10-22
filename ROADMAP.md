# Roadmap

## Direction

Maintain small first-party utility apps as versioned packages consumed by Cats
Desktop. Keep app source ownership separate from the host and provider runtime.

## Phase 1: Repository and Contracts

- [x] Initialize cats-apps and document the accepted repository boundary.
- [x] Plan package production and Usage with linked host/runtime work.
- [x] Finish the public App SDK and versioned artifact contract in cats-platform.

## Phase 2: First Installed App

- [x] Build Usage from the app workspace.
- [x] Load the built package through the platform's actual App host.
- [x] Show existing usage, incidents, confidence, coverage, and freshness.
- [x] Validate explicit-version Windows Desktop staging and isolated browser execution.
- [ ] Include a pinned app set in a Desktop release.

## Phase 3: Quotas and History

- [x] Display existing passive Claude/Codex percentage/reset reports without summing targets.

- [ ] Connect runtime-owned, independently verified account-quota collectors.
- [ ] Add reset-window and shared-account presentation.
- [ ] Add historical charts after runtime-owned persistence is implemented.

## Phase 4: Optional Remote Distribution

- [ ] Publish an official App Catalog with compatible versions and artifact references.
- [ ] Add host-owned download, verification, install, and update behavior.
- [ ] Enable independent updates for apps whose release cadence requires them.

A public marketplace, third-party execution model, and an individual release
workflow for every utility are not prerequisites for Phase 2.

## Studio: delivered slice and planned image workspace

The standalone `cats.studio` single-Grok image slice is implemented, with SDK,
retained works and installed recovery evidence in
[PLAN-003](docs/plans/PLAN-003-media-studio-vertical-slice.md). Later Chat probes
verified one image each from Grok 4.7/xhigh, Muse Spark 1.3/xhigh, Antigravity
Gemini 3.8 Flash/high and Codex GPT-6.1-Sol/xhigh. These probes do not enable new
providers in Studio or establish a new App-to-live-CLI acceptance run.

The 2026-10-23 next-stage handoff is
[ADR-004](docs/decisions/004-expand-studio-with-verified-image-profiles.md),
[SPEC-006](docs/specs/SPEC-006-studio-image-workspace.md) and
[PLAN-006](docs/plans/PLAN-006-studio-image-workspace.md), amended by
[ADR-005](docs/decisions/005-provider-first-studio-image-operations.md) to a provider-first
workspace with profile-declared generate/edit/compose operations.

- [x] Record the multi-provider evidence, UI/contract proposal and implementation handoff.
- [ ] Freeze owner contracts and prove pre-generation budgets/correlation for each route.
- [ ] Implement Runtime profiles and Platform SDK/storage upgrades with tested migrations.
- [ ] Ship the provider-first workspace on SDK 1.x (A3a), then wire contract 2 (A3b); retain original PNG/JPEG.
- [ ] Integrate actual packages, old works, recovery/cancellation and compatible official Apps.
- [ ] Complete authorized bounded-route acceptance per enabled provider and independent review.

Edit/compose from saved works and transparent generation are planned per operation
and stay unavailable until each passes its own gate; local file import, video and
further media remain later work. Planning does not authorize additional paid calls, version
bumps, publication or installation.

## Planned Ask MVP

Ask / `cats.ask` is the working identity for the 2026-09-29 personal-assistant
question App. Scope is a question list/detail flow with asynchronous answers and
copy for manual use in Chat, Code or Work.

- [x] Record the MVP scope, proposed architecture, evidence baseline and delivery plan.
- [ ] Verify Gemini Spark's personal-context question and machine-returned answer.
- [ ] Independently verify Grok Bot's X Connector and Meta AI's authorized-content path.
- [x] Verify an assisted Grok Bot bookmark round trip, with save-order/video limits.
- [x] Confirm multiple frontends/backends in one App and direct App-owned API traffic.
- [x] Build an unpublished complete Ask/component-host prototype with retained answers.
- [x] Validate local Windows package create/MCP/reopen/Copy fixtures.
- [ ] Replace per-App ingress with shared Platform/Mobile/App routing and sandbox.
- [ ] Revise tutorial for shared host setup and `/apps/cats.ask/mcp`.
- [ ] Verify remote multi-App access, sandbox Copy, account scope and live Bot recovery.

Each assistant needs its own evidence and availability status. Full offline
operation, host navigation SDK, scheduling UI and automatic Chat/Code/Work use
remain deferred. No package version or publication is part of the planning work.

See [ADR-003](docs/decisions/003-delegate-personal-questions-to-first-party-assistants.md),
[SPEC-004](docs/specs/SPEC-004-personal-assistant-questions-mvp.md) and
[PLAN-005](docs/plans/PLAN-005-personal-assistant-questions-mvp.md).

*Last updated: 2026-10-23 (Studio handoff updated; other phase history retained)*
