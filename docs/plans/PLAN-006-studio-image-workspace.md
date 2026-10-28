# PLAN-006: Studio image workspace

## Metadata

| Field | Value |
| --- | --- |
| Status | In progress — A3a is implemented and being prepared as Studio 0.3.0; A0–A2 and A3b–A5 have not started |
| Owner | cats-apps integration; Runtime and Platform each own the work in their own repository |
| Assigned To | A3a is implemented by Apps; the rest awaits the user's scheduling |
| Reviewer | Pending the cross-repository contract review and an independent implementation review |
| Spec | [SPEC-006](../specs/SPEC-006-studio-image-workspace.md) |
| Decision | [ADR-004](../decisions/004-expand-studio-with-verified-image-profiles.md), [ADR-005](../decisions/005-provider-first-studio-image-operations.md) |

## Handoff reading order and scope

A taker first reads the workspace and member AGENTS and their own agent-specific instructions, then this
PLAN, the SPEC, ADR-004, ADR-005 and the [probe summary](../research/2026-10-23-studio-cli-media-probe-summary.md).
The raw capability and size evidence is in the [three-provider real-output report](../research/2026-10-23-three-provider-image-artifact-probe.md),
the [Grok capability probe](../research/2026-10-23-grok-media-capability-probe.md)
and the [Grok sample](../research/2026-10-23-grok47-xhigh-studio-sample.md); further provider
investigation follows the [SOP](../research/2026-10-23-cli-media-probe-playbook.md).

The goal is an image workspace that "picks the service first, then does what that service can do": generation by the four candidate services, plus
photo editing and compositing where there is evidence. It is not taking on every multimodal feature at once, and not just a CSS change. It keeps `cats.studio`, existing
works and the SDK boundary; it does not turn the Studio renderer into a shell or provider API client, and adds no App-owned
server. The service architecture of other full Apps is outside the scope of this change.

### Already established inputs

- [x] Each of the four has one decodable original image; the model, format, size, hash and evidence limits are recorded.
- [x] Muse has a case of "a turn timeout after the image succeeded", and a square composition intent yielded a 3:2 image.
- [x] The actual generation calls of the Antigravity child and the Codex nested exec were each checked individually.
- [x] The tool definitions and aspect-ratio differences of Grok `image_edit` for single and multiple images were read; the reference inputs of Muse and Codex
  and Codex's transparent background are only agent-reported.
- [x] The user reviewed the interactive design draft and decided to pick the service first and have operations declared by the profile (ADR-005).

These are not the new Studio's bounded route or installed acceptance. No new generation quota was added;
any later live probe or paid acceptance first applies the user's explicit authorization and count limits at that time.

## Shared Platform service consumer track (authorized, 2026-10-23)

[Platform PLAN-121](../../../cats-platform/docs/plans/PLAN-121-shared-image-service-and-controlled-cat-generation.md)
manages the image service shared by Studio and Cats, the limited Cat grant, assets and Telegram delivery.
This section lists the Apps consumer responsibilities; the owner authorized implementation and the necessary release, and clarified that the shared party is Studio and Usage is unchanged.

- [x] Studio 0.4.0 switches to the host-injected `media.images` (SDK floor `^1.8.0`), keeping
      contract 2's enabled profiles, PNG/JPEG, existing works and queue; no App image-generation server is added.
      The archive encoder still uses the public exact Platform 0.6.0, independent of the browser SDK's version.
- [ ] Together with Platform P1/P5, using a real built Studio + host SDK + isolated fixtures, verify submit,
      cancel, reopen, offline/read/export, exact bytes and App/account isolation.
- [ ] Verify that Studio being uninstalled, disabled or removed does not revoke a Cat's independent grant, and that Studio does not automatically
      see a Cat's private works; existing Studio work and original images keep the same IDs/hash after the upgrade.
- [ ] If Cat works are later to be used for photo editing, first define an explicit sharing/source grant, then coordinate the SDK contract with A0/A2;
      the current same-App/account source restriction is not removed.

Runtime's same-instance, pool and tool re-entry are verified by Platform P0/P5 and the Runtime owner,
and this change adds a controlled yield for the source session; photo editing and compositing still follow A0–A5 below, without borrowing acceptance that is not yet complete.

## Workstreams and dependencies

| Workstream | Owner | Deliverables | Parallel / dependency |
| --- | --- | --- | --- |
| A0 Contract and feasibility | Runtime + Platform + Apps | The owners' successor documents, contract 2 (including operations, sources, options) fixtures/types, adapter enablement gate, upgrade and version matrix | First; A3a does not depend on it |
| A1 Native execution | Runtime | For each "service × operation": profiles, bounded runners, source inputs, matching receipts, original-file validation and recovery | Depends on A0; parallel with A2/A3b; enabled one by one |
| A2 SDK and retained works | Platform | Typed bridge, source authorization and resolution, managed PNG/JPEG, job projection, storage upgrade | Depends on A0; can start with Runtime fixtures |
| A3a Studio UI on SDK 1.x | Apps | A built App that picks the service first; the capability normalization layer reads both schema 1 and the proposed schema 2; only Grok generation appears on the current host | Start immediately; can merge independently, no bump |
| A3b Contract 2 wiring | Apps | Connect A2's public SDK major and manifest compatibility, and remove differences between the proposed fixtures and the actual contract | Depends on A0/A2 |
| A4 Integration and review | Three-party integrator | Real package/host fixtures, cross-version acceptance, acceptance evidence for each "service × operation" | After the A1/A2/A3b compatible combination is done |
| A5 Release preparation | Each release owner | Notes, versions, pins, upgrade/signing/compatibility in the original bump/PR | When implementation and acceptance are done and a release is separately authorized |

A3a can be delivered first, but UI completion cannot be used to declare A1 and A2 done. The production capability of a new provider or new operation
opens one by one after it passes its gate, without waiting for other paths, and no fake option that can be pressed may be shown first.

## A0 — Freeze contracts and prove bounded routes

- [x] Runtime and Platform each create or update their owning ADR/SPEC/PLAN successor, linking back to this set of documents (Runtime ADR-047 / SPEC-038 / PLAN-048, Platform ADR-137 / SPEC-119);
  the original ADR-042 / SPEC-033 / PLAN-043 and ADR-120 / SPEC-119 / PLAN-111 keep the delivery history.
- [ ] Freeze the SPEC's capability/profile/operation/agentConfig/target relationships, `inputs`,
  `aspectRatio` modes and enum, `transparentBackground`, canonical submit (including `sourceIds`),
  schema 2 job/output/warning, idempotency hash, safe error codes and read/export types.
  Write shareable sanitized contract vectors so that Apps and Platform do not each invent enums.
- [ ] Find out the actual means of restriction for the four native transports: tool allowlist, media call cap,
  parent/child limits, turn/deadline, cancellation, update policy and CLI version evidence.
  Use fake processes or retained sanitized records first; do not generate images automatically just to verify a flag.
- [ ] For Muse's empty normalized arguments, Codex nested `exec` and Antigravity child
  correlation, propose a credible, size-bounded way to capture events, without scanning home, reading thinking or using a regex
  to find an arbitrary image path. Establish an unavailable reason for when capability is insufficient.
- [ ] Photo editing and compositing: find out the source forms each service accepts (Grok attachment / path / data URL, Muse local
  `image_paths`, Codex reference paths, Antigravity unknown), the format and size limits, and whether
  sources can be placed in an attempt-specific location without widening the provider's read scope. An operation that cannot be done is not enabled.
- [ ] Check whether the media budget really takes effect before execution. If a CLI can only rely on a prompt or counting tools afterwards,
  that route is recorded as not yet enableable, and other routes are completed first; a hard cost limit must not be claimed.
- [x] List contract 2's SDK major, the Runtime/Platform/Studio 0.x minor boundaries and the storage
  migration (decision: SDK 1.7.0 compatible minor per App declaration; Runtime next 0.x minor). Decide the owner and release timing
  of the exact versions; this stage does not bump or publish.
- [ ] Record the SDK/host compatibility and upgrade strategy of existing Apps such as Usage and Ask, and an explicit
  compatibility UX for packages that are too old; updating Studio must not silently disable other official Apps.

**Exit:** The three parties share one contract that fixtures can validate; each "service × operation" has either an executable state or a concrete reason it cannot yet be
enabled. An unresolved CLI capability does not block A3a, but blocks live enablement of that route.

## A1 — Runtime profiles, execution and collection

- [x] Extract the Grok-specific catalog/profile/service into an operation-specific execution strategy, still
  managed by Runtime; no separate model catalog is built. The first agent settings follow the SPEC, and Grok must not revert to Fast / Low.
- [ ] Continue shared selection, worker capacity, metering, singleton, shutdown and the single
  image active slot; use the same preflight for capabilities and submit, and add no paid probe.
- [ ] Worker slots for bounded media operations: idle chat workers fill `maxSessions` and are not reclaimed
  (instance on 2026-10-23: 10 idle research conversations made Studio image generation fail immediately with busy). Design for bounded operations to
  reclaim the least recently used idle worker or reserve slots, and add idle reclamation; first confirm that chat
  sessions can be safely resumed after an idle worker is stopped. It has first been changed to report `runtime_capacity_full`, and the default slot count was raised to 50.
- [ ] Implement the Grok generation profile, using the existing bounded flow as the regression baseline; keep the existing collection-only
  recovery semantics, and do not replace an earlier successful or failed image with a new attempt.
- [x] Muse: a verifiable binding of one native media call, the matching result and a cwd-relative image source;
  a timeout after a successful result can safely end the execution, validate the original PNG, and keep the execution warning.
- [ ] Codex: obtain the generation evidence and output hint of the nested `exec` from bounded native events,
  without opening the general exec/shell permission wholesale to the media profile, and without running a provider API fallback.
- [ ] Antigravity: allow only one specified image-generator child and one media call; manage parent-child
  cancellation/termination and the native artifact locator, and do not treat the Workspace as an output directory.
- [ ] Photo editing and compositing: per the A0 result, implement source input one by one (attempt-specific location, containment, cleanup),
  with Grok single-image editing sending no aspect ratio and multi-image compositing sending an aspect ratio within the enum; each operation has its own fixtures.
- [ ] Collect compliant sources into the Runtime data root, keeping the provider's original file; full PNG/JPEG decoding and
  MIME, byte/pixel/edge limits, hash, alpha measurement and source containment checks.
- [ ] Implement separation of turn outcome and artifact outcome; allow saved-with-warning only after the source, count,
  stop and cancel checks all pass. Unknown or violating cases cannot be promoted through this path.
- [x] Runtime schema 1→2 upgrade: validate / backup / atomic replace / failure recovery /
  repeated restart; keep job IDs, the original JPEG and historical agent metadata, without re-executing.

**Exit:** Every enabled profile passes managed runner/collector fixtures and has acceptance evidence for its actual
bounded route. Without new live-call authorization, report fixtures done and the live
gate not done, and keep that new profile unavailable; an existing Chat probe must not be renamed as App acceptance.

## A2 — Platform SDK, persistence and delivery

- [ ] Per A0, update the public SDK types, the actually injected bridge, the Runtime client projections,
  the host routes and the contract vectors; keep `media.images`'s scoped permission.
- [ ] The request identity includes the profile revision, target/config, operation, ordered sources, and
  prompt/options; persist before dispatch, and a lost POST, double click, reload or reconnect only recovers the
  original request.
- [ ] Source authorization and resolution: accept only works successfully saved by the same App/account; hand the saved original and SHA-256
  to Runtime; a revoked or missing source returns `source_unavailable`; the job keeps a source snapshot.
- [ ] Maintain Core task/run/artifact authority, App/account/version/package digest isolation, and
  disable/remove revocation; do not create an extra Studio job database or a path the renderer can decide.
- [x] Correctly receive, save, read and export PNG and JPEG; the original file's extension/MIME/hash match and the export is
  byte-identical; the paths and headers hard-coded to `.jpg` / `image/jpeg` must not be kept.
- [ ] Add warnings, execution outcome and the measured transparency projection; cancel intent takes priority in
  a save race. refresh/list/reopen can only read or collect the original attempt; generation must not run again even after the disk fills.
- [x] Work deletion (SDK 1.x compatible addition `images.delete`): Platform deletes the Core record and the original file, then does its best to ask Runtime to
  delete the receipt; in-progress or pending-confirmation returns `image_not_deletable`; interleaving collection and deletion leaves no orphan files. The SDK version
  will be adjusted with the next Desktop release preparation.
- [ ] The migration lives in the owner's existing state/store upgrade mechanism, keeping foreign Core fields, IDs, and
  original artifacts, with the operation of old works being generation; provide tests or explicit errors for failure, restart
  and unsupported downgrade.
- [ ] Update the fixtures of the real package/host smoke harness, keeping offline images and the Usage/Ask enablement
  compatibility cases; do not write synthetic Core records directly into a real profile.

**Exit:** The actual renderer SDK and host can walk through the four services and each operation state using fixtures; the document types
alone do not count as functional acceptance. The public SDK dev pin and package compatibility are coordinated during the formal release preparation.

## A3a — Studio UI on SDK 1.x

Capability normalization and submit construction are centralized in `apps/studio/src/model.js`, which Node unit tests can import directly;
`app.js` is responsible only for the DOM and SDK calls. This lets schema 1 production behavior and the schema 2 proposed fixtures
share one UI, and A3b only needs to change the normalization layer.

- [x] Capability normalization: schema 1 → one service per Grok target, generation only, native 1:1; schema 2
  proposal → service, operation, aspect-ratio mode and enum, source lower/upper bounds, transparent background, agent settings, unavailable reason;
  an unknown schema or malformed format fails closed (no usable service, while works can still be read).
- [x] Submit construction: schema 1 sends only `requestId` / `instance` / `prompt`; schema 2 follows the SPEC proposal,
  carrying only the declared options. The description is validated by code points, and the source count is validated per operation.
- [x] Job normalization: a missing operation is treated as generation; format is determined by MIME; width/height, aspect ratio, bytes,
  measured transparency (JPEG is opaque, an unmeasured PNG is unknown), warning, source and execution result.
- [x] Screens: service cards, operations, source picker, description and inspiration, aspect-ratio mode, transparent background, agent settings, submit,
  result preview with a measurement ruler, zoom, work filters and cards, with actions provided per the SPEC's state table.
- [x] Draft and active request are separate; switching service or operation neither generates an image nor changes existing work. A new
  job is selected only on explicit submit; background polling does not steal the older work the user selected.
- [x] When the submit result is unconfirmed, keep the same requestId and payload; 「確認送出結果」 ("Confirm submit result") resends with the same payload
  (Platform returns the original attempt by requestId; a different payload is a conflict).
- [x] Provider-specific safe error copy replaces the hard-coded Grok text; `refresh` / confirming the result is separate from
  「再生成一張」 ("Generate another"), and the latter creates a new request only when the user explicitly presses it.
- [x] Work thumbnails are read lazily by visible range, with a limit on concurrent reads and blob cache size, released on switching or leaving the page.
- [x] All `sdk.images` calls go through a single queue (the host bridge handles one at a time, with a 500 ms interval for the same method); deletion is shown by feature
  detection, and saved works are confirmed with an in-App dialog (the sandbox has no allow-forms, so form submit is not used).
- [x] Complete labels / focus / Escape / dialog return, Unicode count, zh/en, keyboard, text enlargement, reduced motion, light/dark and the SPEC's four window sizes; an unavailable operation must not be masked by hiding it with CSS.
- [x] Tests: model unit tests (both schemas, submit shape, validation, job normalization) and a package test;
  also a development-only schema 2 fixture preview, which does not go into the package.
- [x] Platform's `scripts/testing/check-studio-app.mts` is updated for the new selectors (Platform PR),
  accepting both the old Studio's select and the new service buttons, and accepting AC-13 with the actual package + host; this
  harness never calls a CLI.
- [x] No Studio version bump, no manifest compatibility change, no publication; release follows A5 separately.

**Design freedom:** Color, icons, fonts, card styles, animation and fine spacing are left to the designer; keep
the SPEC's capability boundaries and state semantics. Cost/ETA/success-rate figures without a basis cannot be used as design decoration.

## A3b — Contract 2 wiring

- [x] Generation subset: the normalization layer and submit construction now match the host's actual contract 2 (the `HOST_CONTRACT_TWO_*` fixtures,
  the exact submit fields), `executionOutcome` is shown as text, and copy for `image_profile_changed` /
  `image_profile_unavailable` is added. Handling of the proposed fields for photo editing and compositing is kept until they are frozen.
- [ ] Connect A2's public SDK entry and exact pin; Apps does not import sibling implementation or copy SDK types.
- [x] The manifest `compatibility.appSdk` is changed to `^1.7.0` (contract 2 is negotiated per App declaration); hosts at SDK 1.6 and below
  continue to be offered the previous Studio version.

## A4 — Acceptance and independent review

- [ ] Complete SPEC AC-01–AC-13 one by one, listing the owner, command, fixture/native evidence and untested platforms.
- [ ] Do interactive acceptance with the actual `.catsapp` + real host/SDK + isolated Runtime/Core; standalone HTML or a direct browser
  localhost tab cannot pass for the installed Desktop's bridge.
- [ ] Verify opening old works after the upgrade, original-file export, and offline/reopen; also protect the existing behavior of Usage and Ask.
- [ ] The independent review covers execution budgets, path/correlation, source authorization, migration/cancel
  races and UI states; tests the author ran themselves count only as validation. With no reviewer, record that explicitly and do not falsely claim completion.
- [ ] If the user schedules an actual install or live acceptance, record the exact App/SDK/Platform/Runtime/CLI
  identity, the number of generations allowed and the results; do not automatically consume account quota in ordinary UI tests.

### Required fixture scenarios

| Fixture | Expected result / main AC |
| --- | --- |
| Four profiles, one/multiple configs, unavailable target, changed revision | Correct service cards and operations; no silent fallback; AC-01 |
| Lost submit response, repeated request ID, reload, changed payload/sources/options | One attempt; a different payload conflicts; AC-02 |
| Grok square JPEG, Muse 1920×1280 PNG, Codex 1254² PNG | Real metadata / original aspect ratio / original bytes; AC-03 |
| Muse successful tool → timeout | succeeded + warning after a safe stop; no rerun; AC-04 |
| Timeout + foreign/missing result, extra media call | Not a success, no automatic regenerate; AC-04/09 |
| AgY child control, Codex nested exec, oversized inline image/event | Mechanical limits and bounded evidence; AC-05 |
| Cancel before spawn, during child, during save, late image | cancel precedence, parent and child stopped, no late success; AC-06 |
| schema 1 JPEG success/failure/interrupted, malformed/ENOSPC/restart | Original IDs/hash kept, operation is generation, failure recovery, no replay; AC-07 |
| Actual package, offline, filter/reuse, keyboard/theme/narrow | UI/bridge and existing Apps do not regress; AC-08 |
| App/account/version mismatch, revoked package, path escape/bad image, foreign work as source | Rejected without leaking private data; AC-09 |
| Grok single edit, Grok multi-reference, Muse 50-reference cap, cross-provider source, revoked source, unsupported source format | Count and order, aspect-ratio mode, `source_*` errors, original image unchanged; AC-11 |
| Codex transparent request with opaque and with alpha result | Measured value shown; AC-12 |
| Current SDK 1.x host with new Studio | Only Grok generation, 1.x payload, harness passes; AC-13 |

## Implementation starting points

The following are existing source entry points, to help a taker find ownership; they are not a list of files modified in this change.

| Member | Existing entry | Expected work |
| --- | --- | --- |
| Apps | `apps/studio/src/{app.js,model.js,style.css,index.html}` | Capability normalization, submit construction, service-first UI, actual MIME/size |
| Apps | `tests/studio.test.mjs`, `apps/studio/cats.app.json` | Package regression; later exact compatibility / manifest |
| Runtime | `src/core/media/{contracts.ts,ImageGenerationService.ts}` | schema / profile / operation / selection / receipt / recovery |
| Runtime | `src/catalogs/media-profiles.json`, `src/backends/cli/media/grokImage.ts`, `src/http/routes/images.ts` | Profile registry, provider strategies, source input, MIME-aware routes |
| Runtime | `tests/image-generation.test.ts` and provider fixtures | Fake native processes, correlation, budget, sources, migration |
| Platform | `src/runtime/images.ts`, `src/platform/apps/images.ts` | Projections, source authorization, Core persistence, PNG paths, cancellation and upgrade |
| Platform | `packages/app-sdk`, public `src/app-sdk` entry, the actual bridge | Contract 2 types and the executable SDK |
| Platform | `tests/app-images.test.js`, `tests/app-sdk-*`, `scripts/testing/check-studio-app.mts` | host/account/SDK/package coverage and browser fixtures |

## Validation and delivery rules

Implementers first read each member's testing guide and run the affected scope; docs-only changes need only diff/reference
checks. Runtime uses focused Vitest and the necessary build/catalog checks, Platform runs the affected
SDK/image/host/migration tests, and Apps runs Studio/package and public SDK pin checks. The full
CI / release preflight follows the owning repo's rules, and the full service tests are not rerun for ordinary copy changes.

Source work uses the member's `.claude/worktrees/`, without touching others' worktrees or uncommitted data.

## A5 — Release preparation (separate authorization)

- [ ] In the original bump commit/PR, prepare together the exact App/SDK/Platform/Runtime versions, source /
  artifact pins, release notes, compatibility matrix, migration/backups/recovery and applicable signing.
- [ ] Clearly distinguish source implementation, published package, Desktop selection and installed
  version; publishing an App does not mean Desktop was updated, and an SDK major cannot pass for compatibility with an existing minor.
- [ ] Bump, publish or install only if the user separately authorizes it; after publication, check the hosted evidence per the shared release guide,
  clean up and finish, without adding a status-only commit or rewriting a published Release.

## Risks and handling

| Risk | Handling |
| --- | --- |
| A CLI cannot mechanically limit generation/delegation | That "service × operation" is not enabled; it is not relaxed to an arbitrary chat agent |
| A file exists but there is no credible call correlation | Keep it unknown; do not scan directories to find an image to fill in success |
| Source input widens the provider's read scope | Copy only this run's source to an attempt-specific location; if that cannot be done, do not enable photo editing/compositing |
| An SDK schema change breaks other Apps | The A0 compatibility matrix and A4 actual package acceptance; release coordination |
| Migration interrupted / disk full / unknown historical configuration | validate + backup + atomic replacement; unknown is not filled in as the current setting |
| The proposed schema 2 differs from the frozen contract | The difference exists only in Studio's normalization layer; A3b changes it and validates with vectors |
| Visual design and engineering each invent success/retry flows | Share the SPEC states, contract fixtures and AC IDs |

## Progress log

### Cursor generation extension — 2026-10-24

- Source: Cursor name, capability-driven submission and retained-work display; fixed service order
  Codex / Antigravity / Grok / Muse / Cursor. Grok remains the initial choice, independently of
  host target order. Desktop cards fit five across; narrow layouts wrap in the same order.
- Runtime pins `glm-5p3[reasoning=max]` / max and collects only the completed native image call's
  returned path in an attempt-isolated Cursor data root. Platform recognizes the additive provider
  in Runtime projection, SDK types and shared ledger. No source/schema migration or version bump.
- Apps: 43 tests, Studio candidate packaging, Usage build and docs check passed. Isolated actual
  package/SDK/host browser check passed five-card order/center/default, Cursor JPEG download,
  reopen-to-Grok, cancellation/deletion/offline and narrow no-overflow; four fixture submissions,
  zero CLI calls. Runtime records the separate live runner gate and enablement evidence.
  Independent review was unavailable; these are author-run mechanical checks.
- The owner selected Studio 0.4.1 and Desktop 0.9.5 standard preview on 2026-10-24, through
  auto-merge PRs. Exact archive, compatibility and integrity selections are in the deployment
  guide; publication results are the selected GitHub Releases and Actions records.

| Date | Update |
| --- | --- |
| 2026-10-23 | At the user's request, completed the ADR/SPEC/PLAN planning and handoff; A0–A5 not yet implemented. The four providers' Chat artifact evidence exists, and cannot substitute for acceptance of the new bounded routes |
| 2026-10-23 | The user reviewed the interactive design draft and adopted ADR-005: pick the service first, operations declared by the profile, including photo editing and compositing; A3 is split into A3a, which can be delivered first on SDK 1.x, and A3b, which connects contract 2 |
| 2026-10-23 | A3a implementation: `model.js` capability normalization / submit construction / job normalization and the service-first UI. `npm test` and `npm run check:docs` passed; the fixture preview checked the four services, photo editing and compositing, transparent background, dark mode and 360 / 1078 widths. Platform `check-studio-app.mts` (selector compatibility update) accepted the new UI and main's old UI with the actual archive + host + fixture Runtime, 2 submissions each, 0 CLI calls. No bump, no publication; schema 2 validated only with proposed fixtures |
| 2026-10-23 | The user authorized releasing A3a as Studio 0.3.0, and after release pointing `channels.stable` to 0.3.0 via a catalog PR, to use the existing Desktop 0.9.1 Market to verify "update the App alone without upgrading Desktop". Version fields, release notes and the expected SHA-256 are in [deployment](../deployment.md#studio-030--provider-first-image-workspace-2026-10-23); Desktop pins are not changed |
| 2026-10-23 | After updating to 0.3.0 through the Market on Desktop 0.9.1, the user reported: the shell and the App duplicated the name / back button / version, and one generation failed immediately because the Runtime worker slots were filled by idle conversations. Changed so the shell owns the App identity (Platform), Studio 0.3.1 removes its own title bar and footer and rewrites the busy copy (Apps), and Runtime reports `runtime_capacity_full` and raises the default slot count to 50; slot reclamation is listed under A1 |
| 2026-10-23 | The user asked for Muse, Antigravity and Codex to appear in Studio, starting with "generation". Froze the contract 2 generation subset and negotiated it by App declaration as an SDK 1.7.0 compatible minor (to avoid an SDK major making all official Apps incompatible). Runtime: profiles + shared execution module + restricted Muse runner (`--max-model-steps 1`, no parallel calls, no shell/web; `--disable-write` would remove the image tool, so writes are limited to the attempt workspace), and one actual Muse generation acceptance passed (1920×1280 PNG). Platform: contract 2 projection, PNG saving, schema 1 Apps unchanged. Studio: manifest `^1.7.0`; isolated package + host acceptance included a Muse PNG. Codex (the CLI has no pre-execution call cap) and Antigravity (sub-agent) are not yet enabled |
| 2026-10-23 | The user decided to offer work deletion (saved works need confirmation, unfinished or cancelled ones are deleted directly). Runtime deletes the receipt, Platform adds `images.delete` and save cleanup, and Studio shows delete; it was also found that the host bridge handles only one image call at a time, so Studio now calls through a single queue. Actual package + host acceptance covered both deletion cases; it appears only with the next Desktop version |

*Created: 2026-10-23. First implementation action: A3a; the A0 owners contract/feasibility review can run in parallel.*
