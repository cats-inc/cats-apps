# AGENTS.md

> Shared coding-agent instructions. Customize project facts, not protocol claims.

## Reading Order and Scope

1. Read this file and confirm understanding, then read only your own agent file
   (`CLAUDE.md`, `GEMINI.md`, or `CODEX.md`).
2. Consult `docs/AGENT-GUIDE.md` and any relevant skill before task work.
3. Never edit another agent's specific instruction file.
4. These local conventions do not override host safety rules or higher-priority
   instructions. MUST means required; SHOULD means recommended. Explicit user
   workflow choices can override defaults such as branch and PR policy.

## Project Metadata

- Type: monorepo for official Cats utility apps
- Purpose: independently versioned Cats App Packages, initially shipped with Desktop
- Entry points: apps/usage; npm run build produces versioned .catsapp artifacts
- Stack and versions: Node.js 22+, npm workspaces; TypeScript/browser baseline
- Test commands: npm test and npm run check:docs; see docs/testing.md
- Subprojects: apps/usage (Usage, cats.usage); shared packages need proven reuse.

## Repository Boundaries

- App source and package automation belong here.
- App SDK, install/load, permissions, catalog consumption, and Desktop packaging
  belong to cats-platform. Provider execution and usage/quota collection belong
  to cats-runtime.
- Consume published/versioned host contracts; do not import sibling source trees.
- Production loads built versioned packages. Local source paths are development
  inputs, not production install references.
- Keep the workspace root private. Individual app versions need not match Desktop.
- Never populate the user's real app registry or provider accounts with test data.
- Keep planning state truthful: passive quota/current usage are implemented;
  active account collectors, account linkage, catalog updates and history are deferred.
- Document filenames follow sibling Cats repos: NNN-title.md for ADRs,
  SPEC-NNN-title.md for specifications, and PLAN-NNN-title.md for plans.

## Task Routing

| Need | Reference |
|------|-----------|
| Setup and commands | `docs/setup-guide.md`, `docs/testing.md` |
| Architecture and decisions | `docs/architecture.md`, `docs/decisions/` |
| Feature planning | `docs/specs/`, `docs/plans/` |
| Document inventory | `docs/README.md` |
| Script help and naming | `docs/SCRIPT-STANDARDS.md` |
| Services / ports | `docs/services.md` |
| Security | `docs/security-guidelines.md` |
| Optional reusable workflows | `skills/README.md` |
| Optional A2A / MCP integration | `docs/a2a/README.md`, `docs/mcp-config.md` |

## Change and Safety Rules

- Preserve user edits. Do not discard, delete, publish, or stage unrelated work
  without authorization. Never commit credentials or modify out-of-scope files.
- Update related tests and docs in the same session/commit. Keep examples consistent
  with actual behavior; placeholders are not completed implementation.
- Read relevant ADRs before architecture decisions and record new decisions using
  `docs/decisions/000-template.md`. Use SPEC/PLAN templates for approved complex work.
- Resolve destructive targets exactly and preview operations. On a violated
  requirement, stop the affected operation, disclose it and propose correction;
  obtain approval before corrective destructive work.
- Check `docs/services.md` before adding listeners and update it when ports change.
  If available, consult the bootstrap's cross-project port registry. Warn about
  conflicts and make ports configurable; do not modify an external registry
  without permission.

## Development Workflow

Default: plan → feature/fix branch → implement → test → independent review →
Conventional Commit → PR → merge. Follow an explicitly authorized direct-commit
workflow when requested. Do not interpret a review request as permission to edit.

Use the project's documented test command; confirm the manifest/CI configuration
when this template still contains placeholders. Report missing tests as missing,
not successful. New or changed behavior needs appropriate regression coverage.

## Project Roles

| Role | Assigned Agent | Responsibility |
|------|----------------|----------------|
| Conductor | Unassigned | Planning, assignment, status |
| Architect | Unassigned | Architecture and stack decisions |
| Security Specialist | Unassigned | Security review |
| UX Lead | Unassigned | UX decisions |
| Specialist | All others | Implementation, testing, documentation |

If assigned, the Conductor coordinates architecture and owns README Current Status.
Specialists acknowledge assignments, follow the agreed plan and do not change that
status section without approval. Otherwise work follows the authorized user task.

An agent MUST NOT review code it wrote itself. Author-run tests and mechanical
checks are allowed but are not independent review. Important changes SHOULD be
reviewed by a separate agent or human. Report when independent review is unavailable.
Do not add agent annotations in code or docs. Shared AGENTS changes require a
reason in the commit message. Handoffs state completed work, checks and remaining work.

## Conventions and Skills

Honor `.editorconfig`. Use lowercase kebab-case directories, snake_case Python,
and the project's chosen JavaScript/TypeScript naming. PowerShell scripts use
`Verb-Noun.ps1` with comment-based help; Bash uses kebab-case, header help and
a `usage()` function. See `docs/SCRIPT-STANDARDS.md` for examples.

Canonical skills live in `skills/`; edit them there, not in discovery copies.
Run `scripts/windows/Sync-AgentSkills.ps1` after changes. See `skills/README.md`
for discovery paths and installed workflows. Do not assume optional skills exist.

Branch cleanup is an explicit maintenance task, never an automatic commit step.
Preview `scripts/windows/Remove-MergedBranches.ps1 -WhatIf` or the corresponding
Bash script's `--dry-run`; see `docs/AGENT-GUIDE.md` for details.

## Command Aliases

| Alias | Required behavior |
|-------|-------------------|
| `dyu` | Read this file and own agent file, reply exactly “I am [Agent Name], and I understand.”, then await the next task |
| `cnp` | Check secrets and scope; `git add .`, Conventional Commit and push; resolve unsafe unrelated changes first |
| `mbf` | Review pending *.bootstrap files, merge accepted changes while preserving project decisions, remove only verified merged proposals, and report leftovers; no proposals means no merge is needed |
| `umd` | Update documentation affected by recent changes; use `update-docs` if installed |
| `rlc` | Read-only review of the last commit; use an independent reviewer for your own code |

Aliases do not authorize force-pushes, destructive cleanup or additional external
actions. Report completion or a precise blocker.

These are project conventions using the [AGENTS.md](https://agents.md) format,
not AAIF certification or a claim of runtime protocol interoperability.
