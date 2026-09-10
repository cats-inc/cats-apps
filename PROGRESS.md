# Progress

## Current Status

Implementation follow-through (2026-09-10): Usage 0.1.0, deterministic `.catsapp`
packaging, exact-version lock/provenance, CI build/tests and an App-tag release
workflow are implemented. The actual archive passed isolated host/browser checks:
SDK handshake, scoped filtering, frame/network isolation, desktop/narrow layouts,
offline/stale/restart states, and disable revocation. Host package/lifecycle and
Desktop pinning regressions pass; no real user state or provider account was used.
Active account collectors, verified shared-account linkage, durable history and
remote catalog remain deferred. No App release or native installer is published
by this work; full cross-OS native smoke and independent review are still pending.

Final verification: 4 App tests, 91 Runtime/provider tests and 91 Platform/package/
Desktop tests passed (186 related tests total); the final licensed artifact passed
the isolated browser check and Windows x64/arm64 staging. Relevant TypeScript,
workflow YAML, and documentation checks passed. Cross-repository link audit:
46 modified/new documents, 430 local targets, no missing files. These are targeted
checks, not the full three-repository or cross-OS native installer suites.

## Earlier Bootstrap Milestone (Historical)

| Component | Status | Evidence / remaining work |
|-----------|--------|---------------------------|
| Repository bootstrap | Completed | Canonical Windows generator, Node.js + GitHub Actions flavors; Git clone preserved |
| Bootstrap merge audit | Completed | mbf: no pending *.bootstrap files after fresh generation |
| Project documentation | Completed | ADR-001, SPEC-001/002, PLAN-001/002, indexes, project facts |
| Workspace configuration | Completed | Private npm workspace; Node 22+; no unimplemented app commands |
| App build and packaging | Not Started | PLAN-001; requires the public host SDK and package contract |
| Usage | Not Started | PLAN-002; no dashboard or provider-account collectors are shipped |
| Remote Catalog and app updates | Deferred | Desktop-coordinated delivery is the initial policy |

## Work Packages

### WP-1: Official App Package Foundation

- [x] Bootstrap the existing empty clone and preserve Git metadata.
- [x] Record ownership, individual app versions, and coordinated Desktop releases.
- [x] Provide a dependency-free documentation check.
- [ ] Produce the first built app package and verify its manifest/contents.
- [ ] Integrate the package into a pinned Desktop bundle.
- [ ] Verify real installed renderer execution against isolated host state.

See [PLAN-001](docs/plans/PLAN-001-official-app-package-foundation.md).

### WP-2: Usage

- [x] Define the product name, ID, read-only scope, and truthful data states.
- [ ] Implement current runtime usage and incident presentation.
- [ ] Integrate provider-account quota snapshots as runtime collectors become available.
- [ ] Add history only after durable storage and coverage semantics exist.
- [ ] Verify an offline installed launch and unavailable-runtime behavior.

See [PLAN-002](docs/plans/PLAN-002-cats-usage-dashboard.md).

Documentation completion does not complete either implementation plan.
Application releases and live App installs remain outside this foundation.
Repository publication is a separate user-authorized GitHub task. The repository
now enables automatic deletion of remote pull-request branches after merge.

## Verification (2026-09-10)

- Passed: `node --check scripts/check-docs.mjs`.
- Passed: `npm run check:docs` (33 Markdown files, 96 local link targets,
  all referenced sibling repositories available).
- Passed: root package and TypeScript configuration JSON parsing.
- Passed: cross-repository link audit (61 changed/new non-template Markdown
  files, 1,337 local targets, no missing targets).
- No pending `*.bootstrap` review copies remain.
- App builds, provider/account probes, installed-renderer tests, and independent
  code review were not performed by this documentation/bootstrap task.

*Last updated: 2026-09-10*
