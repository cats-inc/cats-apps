# PLAN-001: Official App Package Foundation

## Metadata

| Field | Value |
|-------|-------|
| Status | Foundation/package/host integration implemented; publication/catalog deferred |
| Owner | cats-apps |
| Related spec | SPEC-001 |
| Scope | Built official apps and coordinated Desktop artifact handoff |

## Related Spec

[SPEC-001](../specs/SPEC-001-official-utility-app-packages.md)

## Overview

Keep package production in cats-apps and host execution in cats-platform.
The v1 archive/SDK/pin contract is frozen in the [host guide](../../../cats-platform/docs/app-packages.md).
The actual Usage package passed isolated headless host checks and Windows Desktop
staging. Native installer execution on every OS and independent review remain open.

## Implementation Phases

### Phase 0: Repository Foundation

- [x] Generate the empty clone through the canonical Windows bootstrap script.
- [x] Preserve existing Git metadata; audit mbf proposals (none present).
- [x] Replace project placeholders with the official utility monorepo facts.
- [x] Declare private workspaces and document the public SDK dependency boundary.
- [x] Record ADR-001, package requirements, Usage planning, and indexes.
- [x] Add a dependency-free documentation check.

### Phase 1: Host Contract Alignment

- [x] Confirm the usable renderer SDK export and host compatibility mechanism with
      platform PLAN-106.
- [x] Freeze package contents, manifest validation, and renderer entrypoint handling.
- [x] Define artifact identity/checksums and the exact Desktop bundle-selection input.
- [x] Ensure bundle system trust derives from host provenance.

Deliverable: a testable package/host contract, not a TypeScript interface alone.

### Phase 2: First App and Shared Packaging

- [x] Create apps/usage with app-local package metadata, manifest, and renderer.
- [x] Record the dependency-free build/test setup and workspace lockfile.
- [x] Build and test Usage through its own workspace commands.
- [x] Add shared artifact assembly that includes only required built payloads.
- [x] Validate every declared entrypoint and record version/source/checksum metadata.
- [x] Prove that the assembled artifact works without source access in the host.

Deliverable: an installable, independently versioned Usage artifact.

### Phase 3: Coordinated Desktop Handoff

- [x] Produce a selected app set through common build automation.
- [x] Have Desktop packaging consume the pinned artifacts through platform PLAN-106.
- [x] Verify launch, disable/enable, data retention, and failed replacement in an
      isolated profile.
- [x] Record actual pins in staged package plans and installer manifests.
- [ ] Publish the first App release and opt it into the official Desktop selection.
- [ ] Validate native installer launch on every supported OS.

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
| 2026-09-10 | Repository initialized; ownership and package/Usage planning recorded. Application work remains open. |

*Created: 2026-09-10*
