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

## Planned Media Studio Vertical Slice

The 2026-09-28 planning request adds a separate App track alongside Usage.
Cats Studio is a working name; the draft contracts do not represent shipped capabilities.

- [ ] Verify Grok image generation, editing and image-to-video through the Runtime CLI path.
- [ ] Define and implement owner-scoped App jobs/assets SDK and durable media delivery.
- [ ] Complete generation, editing, a 6-second/480p clip, export and retained works in one App.
- [ ] Validate the built installed package, recovery, access boundaries and compatibility.

See [ADR-002](docs/decisions/002-cli-backed-media-studio-vertical-slice.md),
[SPEC-003](docs/specs/SPEC-003-media-studio-vertical-slice.md) and
[PLAN-003](docs/plans/PLAN-003-media-studio-vertical-slice.md).
A single-image adapter spike passed on 2026-09-28. Further live generation is deferred
under the owner's allowance constraint; App implementation, editing/video validation
and publication remain pending.

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

*Last updated: 2026-09-29 (Ask planning added; earlier phase history retained)*
