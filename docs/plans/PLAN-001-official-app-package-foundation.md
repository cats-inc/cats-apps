# PLAN-001: Official App Package Foundation

## Metadata

| Field | Value |
|-------|-------|
| Status | Planned; repository bootstrap completed |
| Owner | cats-apps |
| Related spec | SPEC-001 |
| Scope | Built official apps and coordinated Desktop artifact handoff |

## Related Spec

[SPEC-001](../specs/SPEC-001-official-utility-app-packages.md)

## Overview

Keep package production in cats-apps and host execution in cats-platform.
Bootstrap completion does not complete the package or host runtime.

## Implementation Phases

### Phase 0: Repository Foundation

- [x] Generate the empty clone through the canonical Windows bootstrap script.
- [x] Preserve existing Git metadata; audit mbf proposals (none present).
- [x] Replace project placeholders with the official utility monorepo facts.
- [x] Declare private workspaces and document the public SDK dependency boundary.
- [x] Record ADR-001, package requirements, Cats Usage planning, and indexes.
- [x] Add a dependency-free documentation check.

### Phase 1: Host Contract Alignment

- [ ] Confirm the usable renderer SDK export and host compatibility mechanism with
      platform PLAN-106.
- [ ] Freeze package contents, manifest validation, and renderer entrypoint handling.
- [ ] Define artifact identity/checksums and the exact Desktop bundle-selection input.
- [ ] Ensure bundle system trust derives from host provenance.

Deliverable: a testable package/host contract, not a TypeScript interface alone.

### Phase 2: First App and Shared Packaging

- [ ] Create apps/usage with app-local package metadata, manifest, and renderer.
- [ ] Add only the actual build/test dependencies and commit their lockfile.
- [ ] Build and test Cats Usage through its own workspace commands.
- [ ] Add shared artifact assembly that includes only required built payloads.
- [ ] Validate every declared entrypoint and record version/source/checksum metadata.
- [ ] Prove that the assembled artifact works after removing access to source.

Deliverable: an installable, independently versioned Cats Usage artifact.

### Phase 3: Coordinated Desktop Handoff

- [ ] Produce a selected app set through common build automation.
- [ ] Have Desktop packaging consume the pinned artifacts through platform PLAN-106.
- [ ] Verify launch, disable/enable, data retention, and failed replacement in an
      isolated profile.
- [ ] Record the actual bundled app versions in release provenance.

Deliverable: a Desktop build with a functioning installed app.

### Phase 4: Later Catalog

- [ ] Publish available-app metadata and versioned download references when remote
      installation is selected for implementation.
- [ ] Add independent update production only for apps that need the separate cadence.
- [ ] Keep catalog consumption, download verification, and installed state in the host.

## Work Areas

| Area | Work |
|------|------|
| apps/usage | First app implementation and targeted tests |
| scripts/ | Common build/validate/archive automation |
| root workspace metadata | Actual dependencies, workspace commands, and lockfile |
| CI | App tests and artifact production after implementation exists |
| cats-platform | SDK/load/install/Desktop consumer; separate owning plan |

## Testing Strategy

Run repository docs checks now. Later verify manifest/build outputs, artifact
completeness, no source dependency, host permissions, lifecycle, and an offline
Desktop launch. All registries and runtime roots used by tests are temporary.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Treating registry navigation as working app execution | Require rendered built app evidence |
| Bundling arbitrary source revisions | Pin artifacts and checksums |
| SDK drift | Check host compatibility before installation/activation |
| Shared tooling grows too early | Extract only concrete repeated build steps |

## Progress Log

| Date | Update |
|------|--------|
| 2026-09-10 | Repository initialized; ownership and package/Cats Usage planning recorded. Application work remains open. |

*Created: 2026-09-10*
