# Contributing

## Start Here

Read [setup](docs/setup-guide.md), [architecture](docs/architecture.md), and the
app's SPEC/PLAN before changing behavior. Coding agents also read AGENTS.md,
their own agent file, and [the agent guide](docs/AGENT-GUIDE.md).

## Boundaries

- Utility implementations belong in apps/<slug>; shared code belongs in packages
  only after a real multi-app use case exists.
- Use the public platform App SDK and host bridge. Do not import sibling repository
  source files, spawn provider CLIs, or read provider credentials from an app.
- Keep the root workspace private. An app package's version is its own identity.
- Preserve local user state. Tests and install checks use isolated temporary roots.

## Workflow

1. Use a focused feature, fix, or docs branch.
2. Update the relevant specification and plan with behavior changes.
3. Run `npm run check:docs` and the implemented app's targeted checks.
4. Report missing application tests or manual validation honestly.
5. Use Conventional Commits and a pull request when publishing is authorized.

No dependencies or app tests exist at the repository foundation stage.
Do not add placeholder success scripts in place of implementation.

## Documentation

Use numeric ADR filenames such as `001-short-title.md`, matching cats-platform
and cats-runtime. Specifications use `SPEC-NNN-short-title.md`; plans use
`PLAN-NNN-short-title.md`. Update their indexes and preserve the difference
between accepted direction and completed implementation.
