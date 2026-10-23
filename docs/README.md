# Documentation Index

## Decisions, Specifications, and Plans

| Document | State | Responsibility |
|----------|-------|----------------|
| [Platform shared image service](../../cats-platform/docs/specs/SPEC-128-shared-image-service-and-controlled-cat-generation.md) | Draft; documentation only | Shared Studio/Cat service, finite Cat grants and durable Telegram delivery; Apps consumer tasks in PLAN-006 |
| [ADR-005](decisions/005-provider-first-studio-image-operations.md) | Proposed; amends ADR-004 Decisions 1 and 5 | Provider-first selection, profile-declared generate/edit/compose operations, saved-work sources and per-operation gates |
| [ADR-004](decisions/004-expand-studio-with-verified-image-profiles.md) | Proposed; next Studio phase | Profile allowlist, agent/media model separation, native execution/collection boundaries and upgrade decision |
| [SPEC-006](specs/SPEC-006-studio-image-workspace.md) | Draft; A3a prepared as Studio 0.3.0 | Provider-first workspace with generate/edit/compose, visual layout/states, proposed contract 2 and acceptance criteria |
| [PLAN-006](plans/PLAN-006-studio-image-workspace.md) | In progress; A3a prepared as Studio 0.3.0 on SDK 1.x | Runtime/Platform/Apps workstreams, contract gates, UI fixtures, migrations, validation and separate release scope |
| [Chinese-model CLI media probes](research/2026-10-24-chinese-model-cli-media-probe.md) | Four Desktop configurations; no native generators reported | GLM, Seed, DeepSeek and Kimi tool inventories, actual image-input gates and OpenCode authentication recovery |
| [Three-provider image artifacts](research/2026-10-23-three-provider-image-artifact-probe.md) | Three verified images; Muse enclosing turn failed after tool success | Actual formats, dimensions, ratio mismatch, native receipts and output collection implications |
| [Studio CLI probe summary](research/2026-10-23-studio-cli-media-probe-summary.md) | Current evidence and gaps across nine CLI providers | Single entry point for model pairs, tool controls, output contracts, real artifacts, image-input gates and Studio implications |
| [Eight-session Studio inquiry](research/2026-10-23-eight-session-cli-media-probe.md) | Eight Desktop conversations; no media generation | Compare Muse, Antigravity, Claude and Codex tool surfaces, model pairs and integration gaps |
| [Studio sample replacement](research/2026-10-23-grok47-xhigh-studio-sample.md) | One authorized image generated; source sample replaced | Original-byte provenance, Grok 4.7 / Extra High selection and separate candidate-package validation |
| [Grok 4.5 / Low comparison](research/2026-10-23-grok45-low-media-probe-comparison.md) | Separate Desktop inquiry; no media generation | Compare exposed tools, schema interpretation and document coverage with 4.7 / Extra High |
| [Studio Grok inquiry](research/2026-10-23-grok-media-capability-probe.md) | Desktop capability inquiry; no new media generation | Tool contracts, resolution limits, privacy/storage preconditions and expansion candidates |
| [CLI media probe SOP](research/2026-10-23-cli-media-probe-playbook.md) | Reusable research procedure | Case cards, staged prompts, output/delegation contracts, failure recovery and bounded artifact verification |
| [ADR-003](decisions/003-delegate-personal-questions-to-first-party-assistants.md) | MVP, complete App and shared ingress confirmed | Ask owns UI/services/data/MCP in one installation; ordinary App API requests and host SDK capabilities |
| [SPEC-004](specs/SPEC-004-personal-assistant-questions-mvp.md) | Local Windows prototype passed; shared ingress pending | Grok-first tutorial/composer and assisted initiation; Spark/Meta remain unverified |
| [PLAN-005](plans/PLAN-005-personal-assistant-questions-mvp.md) | A4a shared ingress/tutorial/sandbox rework next | Platform multi-component contract, App-owned services, unified package and installed acceptance |
| [Ask research baseline](research/2026-09-29-personal-assistant-delegation-baseline.md) | Historical baseline plus follow-up evidence | Bot receipts, CLI enrollment failure, current host limits and revised App ownership |
| [SPEC-005](specs/SPEC-005-official-app-catalog.md) | Implemented; Pages enabled, not yet published | Signed official catalog: source, build, schema v1, key and promotion |
| [PLAN-004](plans/PLAN-004-independent-app-distribution.md) | A2 catalog implemented, unpublished; A1/A3/A4 open | SDK consumption, official catalog and independent Usage/Studio delivery; governed by Platform ADR-121/SPEC-120 |
| [ADR-001](decisions/001-own-official-utility-apps-and-coordinate-desktop-distribution.md) | Accepted | Official utility monorepo, individual packages, coordinated Desktop distribution |
| [SPEC-001](specs/SPEC-001-official-utility-app-packages.md) | v1 implemented | Package outputs, workspace boundaries, and delivery requirements |
| [PLAN-001](plans/PLAN-001-official-app-package-foundation.md) | Implemented; publication/catalog deferred | Repository, SDK consumption, package production, and Desktop handoff |
| [SPEC-002](specs/SPEC-002-cats-usage-dashboard.md) | Grok/Muse source support added; new delivery deferred | Usage identity, native quantities, data truth, and staged scope |
| [PLAN-002](plans/PLAN-002-cats-usage-dashboard.md) | Seven CLI query seams; six numeric providers verified, Grok currently unavailable; history deferred | Usage MVP, account quotas, persistence, and installed validation |
| [ADR-002](decisions/002-cli-backed-media-studio-vertical-slice.md) | Accepted | Independent Studio beside Usage; bounded CLI image generation and SDK 1.3 |
| [SPEC-003](specs/SPEC-003-media-studio-vertical-slice.md) | Implemented; installed Desktop verified | Single-image generate/preview/download/reopen; editing/video deferred |
| [PLAN-003](plans/PLAN-003-media-studio-vertical-slice.md) | Isolated acceptance passed | Installed Desktop accepted; direct-main delivery; no additional paid calls |

## Project Guides

| Document | Purpose |
|----------|---------|
| [Architecture](architecture.md) | Cross-repository ownership and data flow |
| [Requirements](requirements.md) | Repository and first-app scope |
| [API](api.md) | Executable SDK v1, host boundary and available Runtime reads |
| [Setup](setup-guide.md) | Reproduce bootstrap and run repository checks |
| [Testing](testing.md) | Current check and future verification gates |
| [Deployment](deployment.md) | Per-App versions, tag-triggered publication, host/SDK compatibility and separate Desktop selection |
| [Security](security-guidelines.md) | App permissions, credentials, and isolated state |
| [Services](services.md) | No standalone app listener in the current foundation |
| [Agent guide](AGENT-GUIDE.md) | Maintenance, mbf, and document routing |
| [Terminology](terminology.md) | App/package/catalog/registry and usage/quota distinctions |
| [MCP](mcp-config.md) | Current telemetry bridge and planned App-owned Ask MCP boundary |
| [Script standards](SCRIPT-STANDARDS.md) | Bootstrap reference for future scripts |

[Decisions](decisions/README.md), [specifications](specs/README.md),
[plans](plans/README.md), and [research](research/README.md) have separate indexes.
Protocol examples remain optional; [A2A](a2a/README.md) is a bootstrap pointer.

Root state: [README](../README.md), [PROGRESS](../PROGRESS.md),
[ROADMAP](../ROADMAP.md), and [CONTRIBUTING](../CONTRIBUTING.md).

*Last updated: 2026-10-23*
