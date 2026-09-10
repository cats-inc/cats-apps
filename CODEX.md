# Codex-Specific Instructions

Read `AGENTS.md` first and `docs/AGENT-GUIDE.md` next. Only Codex maintains this
file; other agents should ignore it.

- Prefer `rg` for text search.
- Preserve user edits and respect `.editorconfig`.
- Use the project's verified commands in `docs/testing.md` and its manifests.
- Follow an assigned Conductor. Do not substitute author-run tests for independent
  code review.
- For `dyu`, reply exactly “I am Codex, and I understand.” after reading both files.

## Skills

The canonical source is `skills/`. Codex discovers `.agents/skills/<name>/SKILL.md`.
After skill changes, run `scripts/windows/Sync-AgentSkills.ps1`; keep referenced
resources inside the skill directory so sync preserves them. Optional skills and
scripts are documented in `skills/README.md`; do not assume they are installed.

## Project Context

- Use the actual public App SDK once the platform exports it; interfaces alone
  do not prove that an installed renderer can execute.
- Run npm test, npm run build and npm run check:docs. Host/browser checks belong
  to cats-platform and must use isolated registries; see docs/testing.md.
- Keep Git mutations sequential and non-interactive. Commit/push only when requested.
- Include source locations in user-facing answers only when asked for them.
- mbf is defined in AGENTS.md; never run a blind overwrite of bootstrap proposals.
