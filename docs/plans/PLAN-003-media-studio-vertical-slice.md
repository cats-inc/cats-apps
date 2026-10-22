# PLAN-003: Media Studio Vertical Slice

## Metadata

- Status: Implementation, isolated acceptance and installed Desktop acceptance complete (2026-09-28).
- Scope approved: standalone Studio, single-image generation, necessary SDK/Runtime and installed Desktop update.
- Spec: [SPEC-003](../specs/SPEC-003-media-studio-vertical-slice.md).
- Decision: [ADR-002](../decisions/002-cli-backed-media-studio-vertical-slice.md).

2026-10-23 follow-up: the owner chose Grok 4.7 / Extra High (non-Fast) and authorized
one new sample through the existing Desktop Chat. The original JPEG replaces the
source sample and the isolated candidate package/host checks pass. See
[sample provenance and current scope](../research/2026-10-23-grok47-xhigh-studio-sample.md).
The no-additional-generation limits below describe the September implementation;
this new authorization permits only that one sample, without publication or an
installed update.

A later separate authorization permitted one image attempt each in the existing
Muse Spark 1.3 / xhigh, Antigravity Gemini 3.8 Flash / high and Codex GPT-6.1-Sol /
xhigh research rooms. All three artifacts were independently verified, including
Muse's file generated before a turn timeout. See the
[artifact evidence](../research/2026-10-23-three-provider-image-artifact-probe.md).
This does not expand the implemented Studio execution contract or authorize
additional attempts.

## Delivery checklist

- [x] One bounded Grok native image spike: valid 1024×1024 JPEG, 98,234 bytes; no retry.
- [x] Freeze Studio / cats.studio / 0.1.0 and single-image scope; Usage remains independent.
- [x] Runtime typed submission, durable receipt, one native invocation, bounded output collection,
      decoding, cancellation, no replay, shared selection/pool/metering admission.
- [x] Platform SDK 1.3 and permission/account/version binding; Core task/run/artifact,
      retained images, recovery, preview/export and no direct renderer filesystem access.
- [x] Studio form, prompt ideas, existing sample, job list, cancellation, preview/download/reuse,
      offline saved works, Chinese/English and narrow layout.
- [x] Immutable package builder embeds bounded image assets; CI builds Studio separately.
- [x] Isolated actual-package browser check: submit/download/reopen/offline/cancel/CSP/Home;
      no Grok call. Independent review findings addressed with regression tests.
- [x] Install local Desktop 0.5.11 containing published Usage 0.4.0 and Studio 0.1.0;
      verify installed version, services and separate Home entry without generating.

Git delivery follows the user's direct-main commit/push instruction. Installed evidence:
version UI 0.5.11, SDK 1.3.0, healthy services, separate Home cards, actual Studio/Usage
pages and working Studio → Home navigation. No new real generation or synthetic Core
records. Details and archive hashes are in the Platform owner plan linked below.

## Owner plans

- [Runtime PLAN-043](../../../cats-runtime/docs/plans/PLAN-043-bounded-image-generation.md)
- [Platform PLAN-111](../../../cats-platform/docs/plans/PLAN-111-app-image-generation.md)

## Validation and delivery boundaries

App package tests include deterministic builds, embedded sample and independent manifest/route.
Platform owns real-package browser checks. Runtime owns fake process tests and JPEG validation.
All synthetic jobs use temporary roots/registries. The real profile receives only the requested
App installation and Desktop update, never synthetic tasks or generated images.

No fresh real CLI call is made: the user's monthly Grok budget restriction remains in force.
The earlier image-generation result does not establish edit/video support, current generation
pricing, exact image pixel controls or a new App-to-live-CLI acceptance run.

Local installer delivery is authorized; public App/Desktop releases, tags and Runtime npm
publication are not part of this delivery. The canonical Desktop bundle pin remains Usage-only
until a separately authorized immutable Studio publication/selection.

## Deferred follow-up

Discovery input for the next Studio design is recorded in the
[five-provider probe summary](../research/2026-10-23-studio-cli-media-probe-summary.md)
and [repeatable probe SOP](../research/2026-10-23-cli-media-probe-playbook.md).
Model-pair inquiries and the selected Spark/Flash/Sol single-image artifact cases
are complete. An expanded App/SDK/Runtime contract and installed acceptance remain
separate from this implemented slice; edit/reference/alpha cases remain untested.

- App lifecycle／Market delivery now has an owner plan:
  [PLAN-004](PLAN-004-independent-app-distribution.md), governed by Platform SPEC-120.
  It keeps Studio optional and preserves existing works when changing update sources.
- Full fresh App → Grok acceptance after the collection correction, when allowance permits.
- Editing/import, image-to-video, playback, reference inputs and asset lineage.
- User-facing App install/remove/update/catalog UX and retention/deletion controls.
- Other CLI transports/providers; only native direct Grok is currently supported.

## Real Studio attempt and collection correction

After initial installation, the user submitted one real Studio job and reported failure.
Grok did generate a 1024 × 1024 JPEG, but Runtime returned `invalid_image_source` because
the configured `~/.grok/sessions` directory was not expanded. The prior isolated fixture
covered absolute paths and missed this default-configuration case. This was a real failure
of the delivered App workflow, despite successful fixture and Home-page checks.

Runtime now resolves native home-relative paths and validates retained session evidence
before recollecting the existing image, backing up the failed receipt first. Platform
checks these specific failed jobs on reopen and retains the original task/run. Neither
repair submits another generation. Studio 0.1.0 itself and its immutable archive are
unchanged; the correction is delivered by local Desktop 0.5.12. Installed recovery evidence
is tracked in Platform PLAN-111, with no further paid CLI call by the agent.

Installed acceptance passed: reopening Studio shows the original tabby-cat work as saved
and completed; normal preview and enlargement display the recovered image. Byte hashes
match the original Grok JPEG, and the user's existing task/run are retained. This verifies
actual collection/recovery; a fresh generation after the fix remains untested.
