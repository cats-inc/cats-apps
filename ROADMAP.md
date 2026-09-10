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

*Last updated: 2026-09-10*
