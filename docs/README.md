# Documentation Index

## Decisions, Specifications, and Plans

| Document | State | Responsibility |
|----------|-------|----------------|
| [ADR-003](decisions/003-delegate-personal-questions-to-first-party-assistants.md) | Proposed; MVP scope confirmed | Ask / cats.ask working identity; delegate through the user's first-party assistant; asynchronous response and copy |
| [SPEC-004](specs/SPEC-004-personal-assistant-questions-mvp.md) | Scope confirmed; design draft | Personal questions to Gemini Spark, Grok Bot and Meta AI; each integration unverified; navigation SDK and cross-product integration deferred |
| [PLAN-005](plans/PLAN-005-personal-assistant-questions-mvp.md) | Planning documents prepared; no probes or implementation | Product round-trip evidence first, then host/runtime contracts, App UI and actual-package acceptance |
| [Ask research baseline](research/2026-09-29-personal-assistant-delegation-baseline.md) | Evidence recorded; no authenticated Cats round trip | User observations, dated official sources, current SDK limits and open integration questions |
| [PLAN-004](plans/PLAN-004-independent-app-distribution.md) | Planned; no implementation/publication | SDK consumption, official catalog and independent Usage/Studio delivery; governed by Platform ADR-121/SPEC-120 |
| [ADR-001](decisions/001-own-official-utility-apps-and-coordinate-desktop-distribution.md) | Accepted | Official utility monorepo, individual packages, coordinated Desktop distribution |
| [SPEC-001](specs/SPEC-001-official-utility-app-packages.md) | v1 implemented | Package outputs, workspace boundaries, and delivery requirements |
| [PLAN-001](plans/PLAN-001-official-app-package-foundation.md) | Implemented; publication/catalog deferred | Repository, SDK consumption, package production, and Desktop handoff |
| [SPEC-002](specs/SPEC-002-cats-usage-dashboard.md) | Usage 0.2.0 published | Usage identity, native quantities, data truth, and staged scope |
| [PLAN-002](plans/PLAN-002-cats-usage-dashboard.md) | Kiro verification/history deferred | Usage MVP, account quotas, persistence, and installed validation |
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
| [MCP](mcp-config.md) | No app-owned MCP server or provider connection |
| [Script standards](SCRIPT-STANDARDS.md) | Bootstrap reference for future scripts |

[Decisions](decisions/README.md), [specifications](specs/README.md),
[plans](plans/README.md), and [research](research/README.md) have separate indexes.
Protocol examples remain optional; [A2A](a2a/README.md) is a bootstrap pointer.

Root state: [README](../README.md), [PROGRESS](../PROGRESS.md),
[ROADMAP](../ROADMAP.md), and [CONTRIBUTING](../CONTRIBUTING.md).

*Last updated: 2026-09-29*
