# SPEC-006: Studio image workspace

## Metadata

| Field | Value |
| --- | --- |
| Status | Draft — a planning baseline ready for handoff; A3a (the new UI on SDK 1.x) is implemented, the rest is not implemented; none is published |
| Owner | cats-apps; Runtime and Platform each own the execution and the SDK/storage contracts |
| Reviewer | A later cross-repository implementation/design review; no independent review was done this time |
| Decision | [ADR-004](../decisions/004-expand-studio-with-verified-image-profiles.md), [ADR-005](../decisions/005-provider-first-studio-image-operations.md) |
| Plan | [PLAN-006](../plans/PLAN-006-studio-image-workspace.md) |
| Baseline | The delivered single-Grok image feature of [SPEC-003](SPEC-003-media-studio-vertical-slice.md) |

## Summary

Turn `cats.studio` into an image workspace that "picks the service first, then does what that service can do": once a service is selected, only the operations
enabled for that service (generate, edit, compose) appear, along with the inputs and parameters that operation declares. The result is shown in a large preview
with the actual format and measured size, and saved as a work; a work can reuse its description, or serve as the source of the next edit or composite.
The candidate services are Grok, Muse, Antigravity, Codex and Cursor; each "service × operation" can be used only after it passes
bounded execution and collection acceptance. The new UI is delivered first on SDK 1.x (only Grok
generation appears), and contract 2 is connected after the owners freeze it.

## Platform shared-image integration (in progress, 2026-10-23)

The owner has approved the implementation and the necessary releases of "Platform shared image service + controlled Cat image generation + Studio sharing",
and explicitly clarified that Usage is unchanged.
The canonical contract is in
[Platform ADR-136](../../../cats-platform/docs/decisions/136-share-controlled-image-capabilities-between-cats-and-studio.md),
[SPEC-128](../../../cats-platform/docs/specs/SPEC-128-shared-image-service-and-controlled-cat-generation.md) and
[PLAN-121](../../../cats-platform/docs/plans/PLAN-121-shared-image-service-and-controlled-cat-generation.md);
this Studio consumer uses the shared service through SDK 1.8's `media.images`, and is being prepared as Studio 0.4.0;
publication and installed acceptance are not yet complete.

- The Studio SDK adapter and the Cat-scoped agent tool share the Platform image service,
  and Runtime remains responsible for bounded execution. Cats do not depend on Studio being installed, and do not borrow Studio's scope.
- The existing contract 2 profiles, JPEG and PNG are kept; Studio now calls `media.images`, and the manifest
  SDK floor is `^1.8.0`. Raising the required host SDK is a Studio 0.x minor boundary, hence 0.4.0;
  the original 0.3.2 archive and the old host contract are unchanged. No Cat tools are registered, and there is no App-owned image-generation server.
- The shared service does not let Studio automatically read Cat works. The App/account source restriction of OP-02/03 in this SPEC
  is kept; using a Cat image as an original in the future needs explicit sharing and a new source authorization.
- Disabling or uninstalling Studio revokes only the App scope and its own initiated jobs, and does not cancel a Cat grant or remove
  Cat works. Existing Studio work and original images keep their IDs, hash and App/account isolation.
- The A0–A2 contract work for photo editing, compositing and new options is still managed by this SPEC / PLAN-006;
  the Platform shared-service extraction cannot be used to claim that the new operations are complete.

## Goals and non-goals

- A clear, unconfused presentation of the service, operation, agent model/effort and the actual image specs.
- Opening, switching service or operation, applying an example, picking an original, reusing a description, refreshing and reopening do not generate; only an explicit
  generating operation (generate image, edit image, compose image, generate another) creates an attempt. Recovering the original
  attempt and creating another image are different operations.
- The sources for editing and compositing come only from saved works; the result is a new work that records its sources; the original image is unchanged.
- Existing Grok works, original bytes, existing task/run/artifact and offline reading are kept.
- Not in this phase: local file import/drag-and-drop, mask or brush inpainting, video/audio, batches, simultaneous multi-service
  generation, queues, schedules, seed/exact-pixel/quality options, automatic translation/rewriting of prompts and a version-tree UI.
  Work deletion is included (decided by the user on 2026-10-23): see the work card below and AC-14. Do not let unavailable buttons or "coming soon" labels occupy the main interface.
- The Chat composer problems are not modified; those are existing independent issues. This plan does not change the App install/Market
  architecture, does not publish or install any version, and does not add research generation quota.

## Evidence and initial execution configurations

The following are the suggested settings of the initial profiles, not the model IDs of the image backend, and local availability is not guaranteed:

| Provider label | Agent configuration | Aspect-ratio mode for generation | Observed original file; not to be used as a default |
| --- | --- | --- | --- |
| Grok | `grok-4.7` + `xhigh`, not Fast | `choose`: auto, 1:1, 16:9, 9:16, 3:2, 2:3 (today's production is fixed at 1:1) | 1024 × 1024 JPEG |
| Muse | `muse-spark-1.3` + `xhigh` | `service`: the composition is written in the prompt | 1920 × 1280 PNG |
| Antigravity | `gemini-3.8-flash-high` + `high` | `native` 1:1 | 1024 × 1024 JPEG |
| Codex | `gpt-6.1-sol` + `xhigh` | `service` | 1254 × 1254 PNG |
| Cursor | `glm-5p3[reasoning=max]` + `max` (GLM 5.3) | `native` 1:1 | 1024 × 1024 JPEG; an earlier Chat probe, and acceptance of the new runner's real output is recorded separately |

As of 2026-10-24 the service display order is fixed as **Codex, Antigravity, Grok, Muse, Cursor**, and does not follow
the order Runtime returns. Multiple instances of the same provider keep the host order; unknown future providers
are placed at the end. On first entry the available Grok is selected, and the first card is not the default; after switching within the page, background refreshes keep the
selection. Only when Grok is not configured is the existing fallback to an available service used.

Cursor initially opens only text-to-image, with zero sources, always requesting 1:1; the output format and size are shown according to the measured bytes.
The choice of GLM 5.3 comes from the [cross-CLI probe](../research/2026-10-24-chinese-model-cross-cli-reprobe.md):
native image generation succeeded and the Cursor caption bridge could understand the image. Kimi K3 also succeeded in generating on the same path,
but its image reading did not succeed that time. This does not prove GLM's native vision capability or that max gives any gain in image quality; the image-generation backend
is still unknown, and editing, multi-reference and other aspect ratios each still need acceptance.

Candidate declarations for photo editing and compositing (none yet produced for real):

| Provider | Editing (one original) | Compositing (multiple references) | Other parameters |
| --- | --- | --- | --- |
| Grok | `image_edit` single image, `source`: keeps the original's aspect ratio, aspect-ratio parameter not applicable | `image_edit` multiple images, `choose`: additionally 4:3, 3:4, 2:1, 1:2, 19.5:9, 9:19.5, 20:9, 9:20 | Reference images are first shrunk to a long edge of about 768 px |
| Muse | `image_paths` one | `image_paths` 2–50, ordered | None |
| Antigravity | The sub-agent description mentions editing; the arguments are unknown | Not found, not offered | None |
| Codex | reference paths one | multiple reference paths | `transparent_background` (generate, edit) |

After Muse's image was completed, the turn failed with a 30000ms idle refusal. For Antigravity only one set of the child's `generate_image` arguments was verified,
and the full schema is unknown. Codex's call is inside a native `exec`.
See the [real-output report](../research/2026-10-23-three-provider-image-artifact-probe.md) and the
[Grok capability probe](../research/2026-10-23-grok-media-capability-probe.md) for details.
Claude is not among this phase's generation services; a tool that is not exposed must not be read as the provider permanently not supporting it.

## User stories

- I first pick a configured service, and the screen shows only the operations it can do; switching service does not change my draft.
- I can describe the picture and explicitly generate one, and know which stage is in progress.
- I can pick a work as the original to modify, or pick several works in order to compose; works made by any service can be used.
- I can see the image's real size, format and transparency, zoom in, download the original file, and still find it the next time I open it.
- If the response timed out but the image was saved, I can use it directly without pressing generate again.

## Workspace and visual handoff

The following defines the information hierarchy and interaction. The designer follows Cats' light/dark theme and the Traditional Chinese / English locales; they may rearrange
whitespace, cards and work thumbnails, but cannot change the state semantics.

```text
(Shell: App / Studio / subtitle            back to lobby; below: package, version, status, provider)
Choose a service
[▣ Grok  ratio selectable | generate edit compose] [⬚ Muse  decided by service | …] [□ Antigravity …] [⬚ Codex …]
┌ What {service} can do (about 300–380px) ┐ ┌ Result preview (remaining space)          ┐
│ [Generate][Edit][Compose]  only enabled operations │ │ Status, description summary, service and operation │
│ Original / reference images (edit, compose)        │ │ Shown at original ratio; measured pixel ruler only after saving │
│ Description (2000 code points)                     │ │ Format, size, ratio, transparency          │
│ Ratio (by mode), transparent background (if declared) │ │ Zoom, download original, edit from this, reuse description │
│ Agent settings (advanced)                          │ │ Generation info expands on demand          │
│ [Generate image | Edit image | Compose image]      │ └─────────────────────────────────────────┘
└──────────────────────────────┘
Works: search description / service filter / status filter → thumbnails at original ratio and in-progress jobs
```

| Area | What must be shown and how it behaves |
| --- | --- |
| Header | The name, subtitle, back-to-lobby and version are provided by the Desktop App shell; Studio does not repeat them, keeping only an `h1` for assistive technology. No promotional hero occupying the first screen |
| Choose a service | One pressable card per service: friendly name, a ratio-mode icon with one sentence of description, and the names of the enabled operations. With multiple execution instances add an alias users can recognize; with only one, raw IDs such as `native` are not shown. A service that is implemented but temporarily unavailable shows the reason it cannot be selected; one that is not implemented is not listed |
| Operation | Only the operations enabled for the selected service, each with a one-sentence purpose. Switching operation keeps the description; switching to editing keeps only the first selected source |
| Original / reference images | Picked from saved works, with thumbnails at the original ratio. Editing takes exactly one; compositing takes at least two, shows the selection order, with the upper limit set by the profile. When there are no works, prompt to generate one first. Selected sources are placed at the front |
| Description | Required, 2000 Unicode code points; line breaks kept. Inspiration shortcuts appear only for generation, only update the draft and return focus to the input, and do not call a model |
| Ratio | `choose` shows buttons (short list) or a dropdown (long list); `native` shows the fixed ratio; `service` shows 「由服務決定」 ("Decided by the service"); `source` shows 「沿用原圖比例」 ("Keep the original's ratio") and the original's size. One image each time. No fake menus for pixels/format/quality |
| Transparent background | A checkbox that appears only when the profile declares it, with the explanation 「這是要求；保存後檢測是否真的含透明像素」 ("This is a request; after saving, it is checked whether the image really contains transparent pixels") |
| Agent settings | An advanced area labeled 「代理模型」 ("Agent model") and 「推理強度」 ("Reasoning effort"), explaining that this is not an image model. With only one approved setting it shows text, with several there is a selector; effort can only choose a combination the model allows |
| Submit button | The label depends on the operation: Generate image / Edit image / Compose image. It cannot be submitted again when the description is blank or too long, the source count does not match, the service is unavailable, a submit is unconfirmed, or an execution is already running. Enter inserts a line break; no automatic-submit shortcut is added |
| Usage note | A brief note that the selected CLI account and quota are used, one image each time, no automatic retry; no speculative price, free promise or fictitious progress percentage is shown |
| Result area | `object-fit: contain`, no cropping/stretching/re-encoding. The measured width/height ruler is shown at the image edge only after saving; while generating only a dashed frame is drawn. A sample, a running job and a saved work must be visually distinguishable |
| Work card | A thumbnail or job status, description summary, service and operation, and size/format or time. A success offers preview/download/edit/reuse description; a failure keeps the description and reason and offers 「再生成一張」 ("Generate another"); a pending-confirmation or `invalid_image_source` failure offers 「確認結果」 ("Confirm result"). A failure to collect the image is labeled 「這次未完成」 ("Not completed this time") and does not claim that no image was produced; a source validation failure explains that quota may have been used and that after updating Cats the original request can be checked. 「確認結果」 only refreshes the original ID and does not submit. When the host provides `images.delete`, saved, unfinished and cancelled works can be 「刪除」 ("Delete"): saved works are first confirmed with an in-App dialog (the original is deleted as well, irreversible), the others are deleted directly; in-progress and pending-confirmation ones cannot be deleted |
| Info detail | Description, service and operation, agent settings at submit time, requested ratio, sources (which works it is based on), bytes, image model and media cost (shown as not reported if not reported), and the generation response result. Absolute source paths / tokens / session IDs are not shown |

The ratio modes use the same icon set on the service card and the ratio row: several solid frames = selectable, a single solid square frame = fixed by the service,
a dashed frame = decided by the service. The measurement ruler uses a single accent color different from the operation color, and appears only on saved works.

At about 960px and above it uses two columns, and narrow layouts show, in order, service, create, result and works; no horizontal overflow appears.
At the actual Desktop viewport of 1078 × 632, the service, operation and description should be directly visible; shorter screens may let the
settings area scroll, and buttons or chips must not cover the input or result. Check at least 1280 × 800, 1078 × 632,
768 × 1024 and 360 × 800. The old image library must not become fixed-square cropped images because of the new size.

All controls have a label and keyboard focus; service and operation buttons use `aria-pressed`. Contrast, dark
theme, text enlargement and reduced motion must work. Status uses gentle live announcements; each
polling must not read out the whole list again. The zoomed preview supports Escape, and after closing focus returns to the trigger button. Blob URLs
are released on switching or leaving the page; thumbnails load lazily by visible range, and all 100 originals are not decoded at once.

## Capability and selection requirements

| ID | Requirement |
| --- | --- |
| CAP-01 | Runtime is the only source of executable profiles, operations and agent options; Studio does not store its own provider/model allowlist and does not copy the chat model catalog |
| CAP-02 | A profile binds operation, provider/native transport, the allowed agent configurations, input count, options, limits, tool/delegation rules, collection/decoding version and an evidence reference |
| CAP-03 | A "service × operation" that is not implemented or cannot be restricted must not be listed; one that is implemented but not installed, not configured, disabled or temporarily unavailable may show a clear reason it cannot be selected |
| CAP-04 | The capability GET only reads configuration and known availability; it does not run a model, log in, check credentials or generate an image. `available` means a submission can be accepted, and does not guarantee quota or entitlement |
| CAP-05 | The selected values must be a valid combination of target, profile, operation and agent config. `grok/native` must not appear in an "image model" field; the Model tier of an Antigravity child is not an Imagen/Veo option |
| CAP-06 | A capability change or a lost service keeps the draft, sources and recognizable selection, and does not quietly switch service, operation, model, effort or Fast. It is revalidated when submit is pressed; a stale setting is rejected and a new selection is requested |
| CAP-07 | With no preference on first use, the generation of an available Grok is selected; if unavailable, the user is asked to pick another available service, and no substitute service is called automatically. With no available service the saved works can still be viewed |
| CAP-08 | The form submits only the options the profile declares: `aspectRatio` must be within the operation's enum and is omitted in `native`/`service`/`source` modes; `transparentBackground` is submitted only when declared. Guessed fields such as size/model are not submitted |

## Operations and sources

| ID | Requirement |
| --- | --- |
| OP-01 | Operation vocabulary: `image.generate` (0 sources), `image.edit` (exactly 1), `image.compose` (2 or more, upper limit by profile). Other operations are out of this phase |
| OP-02 | A source is the ID of a work successfully saved by the same App/account; the renderer passes no path, URL or bytes. Order is meaningful, and both submit and storage keep the order |
| OP-03 | Platform validates each source's App/account/version permission and existence, and obtains the saved original and SHA-256; when it does not exist or is revoked it returns `source_unavailable` |
| OP-04 | Per the profile, Runtime converts the sources into the input form the service accepts, placed in a managed location for this attempt, with containment / size / format checks; when it does not match the declaration it returns `source_unsupported`, with no silent conversion or thumbnailing |
| OP-05 | The result is always a new work; the original is not modified or overwritten. The job stores the operation and an ordered snapshot of `{id, sha256}` sources |
| OP-06 | Idempotency: the canonical payload of the same requestId includes the operation, the order of source IDs and the options; any difference is a conflict |
| OP-07 | Cross-service sources are allowed; whether one can be used is decided by the target profile's input limits, not by the producing service |
| OP-08 | Each "service × operation" separately needs AC-10's bounded-route acceptance; editing and compositing do not inherit the generation evidence |

## Proposed contract 2 — owner handoff, not an existing SDK

On 2026-10-23 the "generation" subset was frozen, provided as a compatible minor of App SDK 1.7.0 and not an SDK major:
an App whose manifest `appSdk` floor is ≥1.7.0 sees contract 2, and other Apps keep the schema 1 projection
([Platform ADR-137](../../../cats-platform/docs/decisions/137-negotiate-image-contract-2-by-app-sdk-floor.md),
[Runtime SPEC-038](../../../cats-runtime/docs/specs/SPEC-038-image-generation-contract-2.md)).
Frozen: target `<provider>/<instance>`, the generation profile (`inputs` 0..0, `aspectRatio` being
`native` or `service`), the exact fields of submit (`sourceIds` and `options` must be empty), the job's measured
output (JPEG/PNG, size, `transparency`), `executionOutcome`
(`completed` / `stopped_after_image`) and `image_profile_changed` / `image_profile_unavailable`.
The host's actual projection is in the `HOST_CONTRACT_TWO_*` of `tests/fixtures/studio-image-fixtures.mjs`. The remaining
fields in the table below (editing/compositing, sources, ratio choice, transparent background) are still proposals and not yet frozen.

| Data / operation | Required content |
| --- | --- |
| `images.getCapabilities()` | `schemaVersion: 2`, the capability revision; `targets` contains opaque target ID, provider, instance label, availability/reason; `profiles` contains ID/revision, operation, the available target/config relationship, agent label/resolved ID/effort, `inputs: { min, max }`, `aspectRatio: { mode, options? }`, `transparentBackground?: true`, limits |
| `images.submit(input)` | An exact typed payload: `requestId`, `targetId`, `profileId`, `profileRevision`, `agentConfigId`, `operation`, `prompt`, `sourceIds` (an empty array for generate), `options`. Options allow only the profile-declared `aspectRatio` (within the enum) and `transparentBackground`. Raw CLI args, API URL/key, cwd, path or destination cannot be passed |
| `images.delete(id)` | Delete a saved / unfinished / cancelled job: the Core record, the saved original and the Runtime receipt (best effort when Runtime is offline); in-progress or pending confirmation returns 409 `image_not_deletable`; one already linked or referenced in Cats Work returns 409 `image_in_use`; after deletion the same requestId is retained, a resend returns `image_request_conflict` and never generates. SDK 1.x adds it first in a compatible way, and Studio decides whether to show it by feature detection |
| `images.list/cancel/refresh` | Method purposes are unchanged; returns schema 2 jobs. `refresh` only queries the original receipt / re-collects the original file and does not POST a generation. cancel acts on the whole parent-child tree |
| Job identity/config snapshot | request/job IDs, provider/instance label, operation, profile/revision/config, requested/resolved agent model/effort at submit time, prompt, ordered sources `{id, sha256}`, requested options, timestamps. The snapshot must not be rewritten by catalog updates |
| Job lifecycle | `submitting/running/collecting/succeeded/failed/cancelling/cancelled/interrupted`; the user's cancel intent, safe error, warnings, and a separate provider `executionOutcome` (including unknown) |
| Output | At most one image: verified `image/jpeg` or `image/png`, bytes, width, height, SHA-256, measured transparency (opaque / has-transparency / unknown). The image model and media cost may be null; not reported is not treated as zero |
| `images.read(id)` | The verified original ArrayBuffer + actual MIME; no file path, provider URL, raw transcript or credentials are returned |
| `images.export(id)` | The host decides a safe file name and the JPEG/PNG extension; the output is byte-identical to the saved original and is not recompressed for the preview size |

Proposed new safe error codes: `source_unavailable`, `source_unsupported`, `source_count_invalid`,
`option_unsupported`. Platform first persists the full canonical request, then derives a fixed Runtime ID from App/account/requestId.
The same ID with the same canonical payload returns the original attempt; any change to the settings, description,
sources or options is a conflict. Surrounding whitespace is trimmed, inner text and line breaks are kept; it must not silently translate, rewrite
or change the configuration and resend. Runtime HTTP/internal types use the same semantics; the concrete routes and typed
projections are updated together by A0, keeping the existing auth, CSRF, package digest and account/App/version authorization.

## Execution, collection and recovery

| ID | Requirement |
| --- | --- |
| EX-01 | Each explicit request allows only one native parent attempt, one media generation, zero automatic retries/fallbacks; Antigravity allows one `image-generator` child, and the child is forbidden from delegating further. Applies to every operation |
| EX-02 | Before generation, tools, delegation, media call count and deadline must be enforceable. A prompt, after-the-fact acceptance or "counts as success once the first image arrives" must not stand in for a mechanical limit. A "service × operation" with insufficient capability stays unavailable and the reason is recorded |
| EX-03 | Continue one global image active slot, one active job per App/account, no queue, and connect the existing selection / pool / metering / shutdown. The Antigravity child counts within the parent attempt's work and cancellation boundary |
| EX-04 | Initial limits: prompt 2000 code points, the whole attempt including child/collection 5 minutes, managed event output 2 MiB, single image 8 MiB / 4,000,000 pixels / 4096 per edge. Sources each apply the same single-image limits. These are acceptance limits, not selectable generation sizes; an oversize is not automatically converted/shrunk and then passed off as the original |
| EX-05 | Record the exact correlation of the native session / tool call / result, including the parent-child chain or nested exec. File name, mtime, assistant self-report and cwd directory guesses are insufficient to prove the source; the provider home must not be scanned broadly and model thinking must not be read |
| EX-06 | For the source specified by the matching result do realpath / containment, regular file, symlink/hardlink, stability before and after reading, size and full-decode checks; collection roots are decided by the trusted profile/runtime and the renderer cannot control them. Files must not be read from an arbitrary assistant path |
| EX-07 | Check the format signature, full PNG/JPEG decode, size, bytes/hash, single-image count and alpha measurement. The native media model is recorded only when actually reported; agent settings and media cost are kept separate, keeping unknown |
| EX-08 | The idle/progress behavior of different providers is handled by the media profile; the Chat timeout must not be loosened globally for this. A missing final prose after the image result completes should not trigger another generation |
| EX-09 | Publish a work only after the original execution has safely ended, with no cancellation, tools and sources compliant, and validation and atomic persistence successful. If the turn failed but the original image meets the above conditions, the job may be succeeded + executionOutcome failed + warning `response_timeout_after_image` |
| EX-10 | EX-09 is not applied when matching evidence is missing, the tool count is exceeded, the source is unknown, decoding fails or it is cancelled. An unknown result stays interrupted; refresh/reopen can only read the original attempt and does not rerun the CLI |
| EX-11 | Input sources are copied only from the saved original provided by Platform to the managed input location of this attempt; cleaned up after the attempt ends, and the provider's read access is not widened to other works or directories |

2 MiB is the managed structured event / text budget, and large inline base64 should not be mixed directly into an unbounded log.
If a CLI embeds the image in the transport layer, the adapter must have provably bounded binary handling and a separate 8 MiB
limit; if that cannot be done it is not enabled, and the stdout cap must not be raised directly or truncated to the point where tool correlation cannot be established.
The native provider transcript may live in its own directory, but the collector reads only the bounded necessary part of the original attempt,
and must not save the whole system context / thinking / account data as a Studio receipt.

## UI states and actions

| Scenario | What is shown and which actions are allowed |
| --- | --- |
| No works yet | The existing Grok sample with its source labeled, or an empty preview; changing the prompt does not modify the sample and is not treated as a new generation. The source area for editing/compositing prompts to generate one first |
| Submitting | Shows a snapshot of the selected service, operation and description; a second submit is forbidden; a lost response keeps the same requestId and can only be confirmed with the same payload |
| Generating | May show elapsed time / the actual stage and cancel; no fictitious completion percentage or remaining seconds |
| Saving | Explains that the image is being saved, and it is not treated as needing another generation; cancel still takes priority over a success not yet published |
| Saved | Shows the actual format / width and height / ratio / transparency and the measurement ruler; preview / zoom / download original / edit from this / reuse description are available |
| Saved and response timed out | The image is normally usable; one non-blocking warning, 「圖片已保存，但生成回應逾時。」 ("The image was saved, but the generation response timed out."). The detail keeps the execution result, with no automatic retry |
| Failed, no usable image | Keeps the description and a provider-specific safe reason; only when the user explicitly presses 「再生成一張」 ("Generate another") is a new requestId created, which may use quota again |
| Result pending confirmation | Shows 「確認結果」 ("Confirm result"); only reads the original attempt. The same request must not be treated as unsent and rebuilt automatically |
| Cancelling / cancelled | Wait for the parent and child processes to end; if the cancel network call fails the cancel can be resent, but the generation cannot; no quota refund is promised |
| Source unavailable | When a selected source is revoked or no longer exists it is removed from the selection with an explanation; no other work substitutes for it |
| Runtime offline / service unavailable | The draft is kept, new generation is disabled, existing saved images can still be read/downloaded; a capability refresh does not trigger an account probe |
| Save failure / disk full | Keep the original receipt and recoverable sources; confirming the result only does collection and does not generate again |

Creating and drafting are different states: the config/prompt/sources of a running execution are immutable; the next draft can be edited, but while an active or
unconfirmed attempt is unresolved another submission is still forbidden. After the user selects an older work, background polling must not swap
the preview; only when a new job is explicitly submitted does the result area switch to that job, to avoid a new description paired with an old image. Filtering works or
returning to the page does not cancel an existing execution. Filtering is a local view of at most 100 jobs of the current App/account and does not pretend to
have unlimited history; the retention limit continues the existing policy and old works are not deleted automatically.

## Persistence, compatibility and security

- Runtime keeps at most 500 receipts and Platform at most 100 jobs per App/account; originals live in mutable
  data roots, separate from the immutable App package. The historical agentModel, effort, image specs or sources
  must not be rewritten according to the current renderer version. Preview and export validate the same App/account/version permissions.
- A work used as a source is still subject to the same retention limit. After a work is deleted, works that used it as a source are kept, and "based on" shows
  that it is no longer in the works list; when a work selected as a draft source is deleted it is removed from the selection with an explanation. Revocation or loss must fail explicitly with
  `source_unavailable`.
- The host bridge handles only one image call at a time, and a repeated call to the same method within 500 ms returns
  `image_service_busy`. Studio calls all `sdk.images` methods through a single queue: the same method is spaced at least 550 ms after the previous call
  ends; preview reads go first, user actions and polling next, thumbnail reads last, and thumbnail
  reads scrolled out of view are skipped; queued calls are all ended on leaving the page. A user action waits during background polling rather than being dropped,
  and is not replayed after another user action ends.
- The migration to the new schema 2 is executed by the Runtime / Platform owners respectively: first validate schema 1,
  back up, create and validate the new file, atomic replace, and keep the original file on failure. Keep IDs, Core links, prompt,
  timestamps, hash, bytes and the existing JPEGs; the operation of old works is recorded as `image.generate` with empty
  sources. An unknown format fails closed and does not clear data. Restarts are idempotent; old running/interrupted jobs are not regenerated.
- When the historical configuration cannot be restored it is marked unknown / historical, and the current Grok 4.7/xhigh pin is not applied to earlier
  Fast/Low works. The original collection-only recovery can still only recover the same existing image.
- (Update 2026-10-23: switched to negotiating an SDK 1.7.0 compatible minor by App declaration, see the contract 2 section above;
  an SDK major would make every official App that declares `^1.x` incompatible.) This design changes the public request / capability / output types; Runtime,
  Platform and Studio are still on 0.x, so breaking public/persisted requirements need the next minor.
  The owner decides the exact versions / artifact pins / App compatibility
  ranges during release preparation, and accepts them together with the enablement compatibility matrix of Usage and Ask; it is not allowed to update only Studio and let old
  Apps disappear because of SDK incompatibility. This plan does not run a bump / publish / install, and does not guess at execution through old API aliases.
- Studio's capability normalization layer reads schema 1 and schema 2; schema 1 yields only Grok generation, native
  1:1, and at submit time sends only the three SDK 1.x fields. An unknown schema fails closed (no usable service),
  and saved works can still be read.
- The opaque iframe, nonce-bound bridge, scoped grants and host-managed downloads are kept.
  Studio gets no shell, provider credentials, absolute source paths or arbitrary provider network.
  Prompts, service labels and returned reasons are all rendered safely as text, and no HTML, script or link command in them is executed.

## Acceptance criteria

| ID | Observable completion condition |
| --- | --- |
| AC-01 | Four sets of capability fixtures show the correct service cards, enabled operations, agent settings and ratio modes; there are no fake image-model menus, and a "service × operation" that is not implemented or cannot be restricted neither appears nor can be submitted |
| AC-02 | One explicit submit produces exactly one canonical attempt; double click, reopen, refresh, disconnection and resending the same ID do not increase CLI/media calls; changing the payload (including sources or options) with the same ID gets a conflict |
| AC-03 | 1024² JPEG, 1920×1280 PNG and 1254² PNG are all fully previewed, zoomed, read with the correct MIME/size and exported byte-identically, without cropping or mislabeling as JPEG |
| AC-04 | Muse fixture: a turn timeout after a successful tool result, the original execution ends → the original image is saved and a warning is shown; with missing correlation / extra generation it cannot be judged a success; zero automatic retries throughout |
| AC-05 | Antigravity's parent→specified child→single image and Codex nested exec have fixture coverage; an unknown / multiple children, extra generation, or other tools/models cannot bypass the pre-set limits |
| AC-06 | Cancel takes priority in generation / collection / save races, cancellation is not falsely reported complete before the parent and child processes stop; a late image after cancel cannot become a successful work |
| AC-07 | Old Grok schema 1 jobs/originals are readable after the upgrade, IDs and hash unchanged, operation is generate; malformed, write failure, restart and unsupported downgrade have tests, and the original job is not rerun |
| AC-08 | The real built package + host SDK, with isolated registry/Core/Runtime fixtures, verifies service selection, operation switching, offline/reopen/filter/reuse/error/cancel/narrow/light/dark/keyboard, and Usage/Ask compatibility |
| AC-09 | Cross App/account/version, disable/remove, path escape, fake MIME / corrupt / oversize image, foreign session/tool result, and another person's work as a source are all rejected; no path/credentials/raw transcripts are leaked |
| AC-10 | Each production-enabled "service × operation" has an acceptance receipt for its actual bounded route (when an applicable authorization exists); existing Chat probes and fixtures do not pass for this evidence. Without that evidence a design fixture can still be made, but it must not be claimed to be live |
| AC-11 | Editing/compositing fixtures: source count limits, order preserved, cross-service sources, `source_unavailable` / `source_unsupported`, the result is a new work and the original's hash is unchanged, the source snapshot is not rewritten by later changes |
| AC-12 | Transparent background appears only on a profile that declares it; when transparency is requested but the result is opaque, the measured 「不透明」 ("Opaque") is shown, and the requested value does not pass for the result |
| AC-14 | Deletion: saved works need confirmation, unfinished/cancelled ones are deleted directly; the Core record, original file and Runtime receipt are removed; in-progress / pending confirmation is refused; refused with an explanation when linked by Work; another account/App cannot delete; deletion never generates, nor does resending a deleted requestId; an old host does not show delete |
| AC-13 | On the existing SDK 1.x host the new UI shows only Grok generation, the submit payload is exactly identical to 1.x, and it passes Platform's actual package browser acceptance (selectors updated to match) |

## Dependencies and unresolved engineering gates

Runtime's successor contract / adapter proofs, Platform's successor SDK / storage
migration, the exact pin of the public SDK and the new App manifest must be delivered together. Existing owner baselines:
[Runtime SPEC-033](../../../cats-runtime/docs/specs/SPEC-033-bounded-image-generation.md),
[Platform SPEC-119](../../../cats-platform/docs/specs/SPEC-119-app-image-generation.md).

A0 must find out Muse's and Codex's pre-generation mechanical limits and bounded result capture, Antigravity's parent/child
control and cancellation, and whether these capabilities exist in the target CLI transport. Editing and compositing additionally need to find out the source forms each service
accepts (attachment, path, data URL), the format and size limits, and whether sources can be placed in an attempt-specific
location without widening the provider's read scope. The existing research does not prove the answers; these gates must not be omitted just to open things up as in the table.
Local file import needs a separate host-side picker permission decision from Platform, and is outside this SPEC.

*Created: 2026-10-23. Revised: 2026-10-23 (ADR-005: pick the service first, editing/compositing). Related plan: [PLAN-006](../plans/PLAN-006-studio-image-workspace.md).*
