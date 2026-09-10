# Agent Guide

Read root `AGENTS.md` and your own agent file first. Customize this guide with
project-specific procedures that are too detailed for always-loaded instructions.

## Project Context

- Read [architecture](architecture.md) for the three-repository split.
- Repository/package work follows [SPEC-001](specs/SPEC-001-official-utility-app-packages.md)
  and [PLAN-001](plans/PLAN-001-official-app-package-foundation.md).
- Cats Usage follows [SPEC-002](specs/SPEC-002-cats-usage-dashboard.md) and
  [PLAN-002](plans/PLAN-002-cats-usage-dashboard.md).
- npm run check:docs is the only implemented repository check. No app is running.
- Provider quota research/collectors belong in cats-runtime. App access is through
  the platform bridge, whose usable implementation remains planned.
- mbf means Merge Bootstrap Files. Inspect each *.bootstrap against its accepted
  original, preserve project-specific facts, merge deliberately, then remove only
  consumed proposals. Report none when there are no proposals.

## Workflows

- Features: consult requirements and architecture; use existing SPEC/PLAN templates
  for complex approved work. Implement, add tests, and update affected docs.
- Bugs: reproduce, identify the cause, fix when authorized, and add regression
  coverage. A diagnosis-only request does not authorize implementation.
- Documentation: use `update-docs` if installed. Otherwise map the change to the
  existing document inventory in `docs/README.md`, update targeted sections,
  check links and examples, and report omissions.
- Tests: use `run-tests` if installed; otherwise read `docs/testing.md` and the
  actual manifest/CI commands. Do not infer pytest solely from a Python filename.
- Review: use `review-code` if installed and you did not author the code. Review
  read-only and report actionable findings with evidence.
- Scripts: use `docs/SCRIPT-STANDARDS.md` for help and naming examples.
- Research: record dated primary sources in `docs/research/` when conclusions
  depend on changing external APIs or protocols.

## Optional Protocol Integrations

A coding-agent skill is not an A2A Agent Card skill, and local agent instructions
are not wire protocol configuration. Consult `docs/terminology.md` first.

When A2A examples are installed, read `docs/a2a/README.md`. Select public versus
authenticated cards deliberately; advertise only implemented capabilities. Validate
the selected protocol revision and actual transport/auth behavior separately.
MCP host configurations belong to that host, not to A2A discovery metadata.

## Services and Ports

Consult `docs/services.md` before assigning a port. If the bootstrap checkout and
its `docs/port-registry.md` are available, check cross-project usage as well.
Choose a configurable port, warn about conflicts, update this project's service
documentation, and obtain permission before changing an external central registry.

## Branch Maintenance

GitHub automatically deletes remote pull-request branches after merge, matching
the sibling Cats repositories. The initial repository publication is explicitly
authorized directly on `main`; subsequent non-trivial changes follow the default
branch/PR workflow unless the user directs otherwise.

Before deleting a local branch, verify a matching merged PR or full integration
into the default branch, with no unpublished commits and no other worktree using
it. A missing upstream alone is not sufficient proof that the work was merged.

Remote deletion after a squash merge does not remove local branches; ancestry alone
may not identify squash-merged work. Use the shipped merged-branch cleanup helper
only when cleanup is requested:

```powershell
.\scripts\windows\Remove-MergedBranches.ps1 -WhatIf
```

```bash
./scripts/linux/remove-merged-branches.sh --dry-run
```

The macOS copy provides the same interface. Helpers stop on dirty worktrees, skip
other worktrees and never remove the default branch or never-pushed branches.
Read their help before execution. `-ReturnToDefault` / `--return-to-default`
also updates and switches to the default branch. Do not change global Git settings
as an implicit step; use repository-scoped or explicit user choices.

## Handoff

Report the affected behavior, commands actually tested, independent-review status,
documentation updates, and any remaining blockers. Update progress/status only
within the role ownership rules in `AGENTS.md`. Never label placeholder tests or
unrun deployment/runtime checks as passing.
