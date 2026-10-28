# SPEC-003: Media Studio Vertical Slice

## Metadata

- Status: Implemented single-image slice; isolated and installed Desktop acceptance passed (2026-09-28).
- Owner: cats-apps; Platform owns SDK and saved works; Runtime owns CLI execution.
- Decision: [ADR-002](../decisions/002-cli-backed-media-studio-vertical-slice.md).
- Plan: [PLAN-003](../plans/PLAN-003-media-studio-vertical-slice.md).

The next-stage [SPEC-006](SPEC-006-studio-image-workspace.md) plans the
multi-provider image workspace, PNG/non-square handling and contract upgrades.
It is a draft handoff, not an expansion of the implemented contract below.

## Approved scope

The user approved the full implementation and the necessary SDK/Runtime/Desktop updates, and
confirmed that Studio is a standalone App on Cats Home alongside Usage. This round fixes
`cats.studio` / Studio 0.1.0, single 1:1 image generation only. The originally proposed image
editing, image import, video and version lineage are deferred; App install/remove UX is
planned separately.

2026-09-28: install/remove, independent publishing and Market are covered by
[Platform SPEC-120](../../../cats-platform/docs/specs/SPEC-120-app-market-and-lifecycle.md)
and [Apps PLAN-004](../plans/PLAN-004-independent-app-distribution.md). Studio is not
preinstalled and has no Home placeholder when not installed; disabling keeps the installed
card, and it disappears after removal. This follow-up is not yet implemented.

The flow is description → explicit click to generate → task status → image preview/download →
reopen to retrieve. Only one CLI invocation, one model call round and one image_gen are
allowed each time; there is no automatic retry or fallback. The page initially shows the
orange-cat sample from the earlier spike, clearly labeled with its source and not presented
as this generation.

## Functional contract

| ID | Requirement |
| --- | --- |
| FR-01 | Standalone Home entry, route `/apps/cats.studio`, return to Home; Usage is kept |
| FR-02 | Description up to 2000 characters, inspiration examples, Grok instance selection, fixed 1:1 / 1 image; no exact-pixel guarantee |
| FR-03 | Submitting / generating / saving, success / failure, cancelling / cancelled and result-unconfirmed are all distinguishable |
| FR-04 | Persist the request first, then execute; the same requestId never generates more than once; leaving the page or reopening only queries the existing task |
| FR-05 | Save the verified JPEG; preview, enlarge, download, reuse description; saved works remain readable while Runtime is offline |
| FR-06 | Failure keeps the description; explicitly state login, privacy, quota, timeout, disk and unconfirmed-result cases; do not claim it is free |
| FR-07 | Cancellation persists the intent and waits for the process to end; a cancel network failure can only resend the cancel, never resend the generation |
| FR-08 | App / account / enabled state / version and permission isolation; the renderer obtains no token, shell, URL or local path |

## Ownership and limits

App uses SDK 1.3 `images.getCapabilities/list/submit/cancel/refresh/read/export` with
`media.images`, `ui.route`, `ui.lobby`; minimum Platform/Desktop is `^0.5.11`.
`refresh` only recovers the existing result. Host owns existing Core task/run/artifact
records plus retained images outside the immutable package. Runtime owns bounded execution
receipts and native Grok process/collection. No existing data schema is replaced.

Runtime limits: one active image execution, shared pool/selection/metering admission,
5-minute timeout, 2 MiB process output, JPEG up to 8 MiB and 4 megapixels, square only,
500 receipts. Host keeps at most 100 jobs per App/account with one active job.
No queue, deletion/retention UI, image edits or video operations are exposed in this slice.

Contracts: [Platform SPEC-119](../../../cats-platform/docs/specs/SPEC-119-app-image-generation.md)
and [Runtime SPEC-033](../../../cats-runtime/docs/specs/SPEC-033-bounded-image-generation.md).

## Acceptance evidence and limits

The 2026-10-23 [five-provider probe summary](../research/2026-10-23-studio-cli-media-probe-summary.md)
and [reusable SOP](../research/2026-10-23-cli-media-probe-playbook.md) record current
tool, output-location and model-pair evidence. These findings do not expand the
implemented single-image contract or enable untested provider operations.

A separately authorized [three-provider image probe](../research/2026-10-23-three-provider-image-artifact-probe.md)
then verified Muse Spark 1.3 (1920 x 1280 PNG despite square intent), Antigravity
Gemini 3.8 Flash (1024 x 1024 JPEG through its child) and Codex GPT-6.1-Sol
(1254 x 1254 PNG). Muse generated its file before the enclosing turn failed.
These are Chat-route research artifacts; expanded Studio provider support,
PNG/non-square collection and App/SDK acceptance remain unimplemented.

2026-10-23: the owner selected Grok 4.7 / Extra High (non-Fast) and authorized one
image in the existing Desktop Chat research conversation. The verified original
JPEG replaces the source preview sample; Runtime's execution profile changes to
grok-4.7 / xhigh. See [sample provenance and scope](../research/2026-10-23-grok47-xhigh-studio-sample.md).
This is separate from the original implementation allowance below and does not
claim a fresh paid App-to-CLI job or authorize a version bump/publication.

The [earlier one-image spike](../../../cats-runtime/docs/research/2026-09-28-grok-single-image-spike.md)
proved native Grok 1.0.41 image output (1024×1024 JPEG). Its one permitted paid attempt is
already used. No additional live CLI generation is authorized for this implementation.

Built-package browser acceptance uses the real host/SDK and an isolated fixture Runtime:
submit, blob preview, byte-identical download, reload, offline library, cancellation,
narrow viewport, CSP isolation, and Home navigation. Runtime separately tests native pipe
framing using a local fake process, strict JPEG validation and durable cancellation/idempotency.
These checks do not claim a new paid App → real CLI end-to-end run.
