# Documentation Index

## Decisions, Specifications, and Plans

| Document | State | Responsibility |
|----------|-------|----------------|
| [ADR-001](decisions/001-own-official-utility-apps-and-coordinate-desktop-distribution.md) | Accepted | Official utility monorepo, individual packages, coordinated Desktop distribution |
| [SPEC-001](specs/SPEC-001-official-utility-app-packages.md) | v1 implemented | Package outputs, workspace boundaries, and delivery requirements |
| [PLAN-001](plans/PLAN-001-official-app-package-foundation.md) | Implemented; publication/catalog deferred | Repository, SDK consumption, package production, and Desktop handoff |
| [SPEC-002](specs/SPEC-002-cats-usage-dashboard.md) | Multi-CLI queries implemented, unreleased | Usage identity, native quantities, data truth, and staged scope |
| [PLAN-002](plans/PLAN-002-cats-usage-dashboard.md) | Kiro verification/history deferred | Usage MVP, account quotas, persistence, and installed validation |

## Project Guides

| Document | Purpose |
|----------|---------|
| [Architecture](architecture.md) | Cross-repository ownership and data flow |
| [Requirements](requirements.md) | Repository and first-app scope |
| [API](api.md) | Executable SDK v1, host boundary and available Runtime reads |
| [Setup](setup-guide.md) | Reproduce bootstrap and run repository checks |
| [Testing](testing.md) | Current check and future verification gates |
| [Deployment](deployment.md) | Versioned build artifacts and coordinated Desktop delivery |
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

*Last updated: 2026-09-10*
