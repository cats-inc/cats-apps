# ADR-004: Expand Studio with verified image execution profiles

## Status

Proposed — 2026-10-23. The user asked for the next phase to be planned and handed to
later implementers and UI designers. This document provides a concrete recommended
baseline; it is not implemented and does not authorize a new round of paid generation or
publication.
Decision 1 and Decision 5 were amended by [ADR-005](005-provider-first-studio-image-operations.md)
to "choose the service first, operations declared by profile" and to include image
editing/compositing; the other decisions stand.
[SPEC-006](../specs/SPEC-006-studio-image-workspace.md) defines behavior and
[PLAN-006](../plans/PLAN-006-studio-image-workspace.md) defines work order and enablement gates.

This is the next phase of [ADR-002](002-cli-backed-media-studio-vertical-slice.md); it keeps
the standalone `cats.studio` identity, the SDK boundary and saved works. The previously
delivered Grok single-image version remains the current state; research success on four
providers does not mean Studio already supports four providers.

## Context

The current UI and execution contract are fixed to Grok, 1:1 and JPEG. Adding a provider
dropdown option is not enough to support different native outputs, nested generation tools
and the case where "the image finished but the agent turn failed".

Independently inspected image evidence is as follows; these are single observations, not
default sizes or a quality comparison:

| Provider / agent setting | Original file | Key difference |
| --- | --- | --- |
| Grok 4.7 / xhigh, non-Fast | 1024 × 1024 JPEG | Stored in the native session, not output directly to cwd |
| Muse Spark 1.3 / xhigh | 1920 × 1280 PNG | The square composition intent did not produce a square image; the turn timed out after the image completed |
| Antigravity Gemini 3.8 Flash / high | 1024 × 1024 JPEG | Built-in `image-generator` sub-agent calls `generate_image` |
| Codex GPT-6.1-Sol / xhigh | 1254 × 1254 PNG | Generation is hidden inside native `exec`; output is in a provider-owned directory |

The actual image model and the standalone per-image cost of each provider are unknown.
Claude exposed no generation tool this time and is not part of this phase's generation
service choices. The image editing, reference image, transparent background and video claims
in the research have not yet been verified with matching artifacts.

## Decision

1. **Deliver a single-image text-to-image workspace first.** Provide unified create, preview,
   save work, download original file and reuse description. Scope covers Grok, Muse,
   Antigravity and Codex; each adapter is enabled only after it passes its gate
   independently. Image editing, import, multi-image reference, transparent generation, video,
   voice, batch, scheduling and automatic retry are handled separately.
2. **Allowlist executable profiles; do not judge capability by brand or frontier label.**
   Runtime manages operation, provider/instance, native transport, allowed agent settings,
   tool and artifact-collection contract, limits and evidence version. General chat model
   catalogs and model names from media APIs cannot directly become options. The first set of
   settings is fixed to the four rows in the table above; Grok explicitly excludes Fast. A new
   combination first extends the Runtime profile and verification, without modifying
   provider-specific form branches in Studio.
3. **Agent model and image model are separate.** The generation service is provider +
   execution instance; model and effort are settings of the executing agent. The image model
   is recorded only when the tool actually reports it; no guessed Imagen / Muse Image /
   GPT Image menu is provided. The UI explains this difference in advanced settings, shows
   text when there is a single approved setting, and shows Runtime-provided options only when
   there are multiple settings; raw model IDs and arbitrary CLI arguments are not exposed.
4. **The interface centers on creation and results.** A compact header, create settings on
   the left, a large preview on the right and works below. Narrow viewports switch to
   sequential layout. Designers can adjust color, typography, spacing and component shape,
   but must follow the SPEC's capability, state, accessibility and interaction requirements.
   Engineering paths, tool names and session IDs do not appear in the main flow.
5. **Parameters are offered according to the execution path.** In the first phase
   Grok/Antigravity offer only the native 1:1 already included in the profile; Muse/Codex
   show that the size and ratio are decided by the service. A prompt may describe
   composition but does not pose as a constrained ratio/size parameter. All paths request
   exactly one image and offer no unverified quality, format, exact pixel, count or
   transparency controls. Extending the ratio enumeration requires its own verification.
6. **Judge image usability by the verified artifact, and retain the execution result.**
   Runtime records provider turn status, artifact verification status and warnings
   separately. When one compliant image is confirmed, the original execution has ended and
   there was no cancellation or tool violation, it can be saved as a successful work with the
   notice "Image saved; generation response timed out". Disk files of unknown origin, unknown
   tool-call counts and late images after cancellation cannot be promoted this way. Confirming
   the result only reads the original attempt and does not generate again.
7. **Continue App → Platform SDK → Runtime → native CLI.** Runtime owns media execution,
   existing capacity/selection/metering, native parent-child association, limits, collection
   and decoding; Platform owns App/account/version permissions, existing Core
   task/run/artifact, storage and download; Studio owns the creative UI. This phase adds no
   Studio server, general job system, direct provider HTTP fallback or source-path input
   field, and does not change the architecture under which other complete Apps may own
   services.
8. **Media work must be limitable before generation.** Each request has one native parent
   execution, one generation call and zero retries; Antigravity additionally allows one child
   of a specified type. Control/result-delivery tools are restricted separately, so "one media
   call" is not mistaken for "every CLI can have only one reasoning turn". A prompt-only
   constraint or counting multiple generations after the fact cannot serve as a cost cap. An
   adapter that cannot prove the limit is enforceable is not listed as available.
9. **Preserve original JPEG/PNG and older works.** Runtime verifies MIME, decoding, size,
   bytes and hash; Platform saves and exports with the correct extension; Studio previews at
   the actual ratio. cwd/workspace is not used as a unified output contract. Original provider
   files are not moved; collection copies the confirmed bytes into managed storage.
10. **Handle the new contract and upgrade explicitly.** The SPEC's submission / capability /
    receipt schema 2 is a new contract; the SDK 1.x Grok/JPEG literal types must not simply be
    widened and called compatible. The planned breaking boundary is a new App SDK major plus
    the next minor of each affected 0.x component; the implementation team lists the
    compatibility matrix and exact versions before release, and this documentation change
    commits no bump or publication. The data owner must provide a one-time upgrade with
    validation, backup, atomic replacement, failure recovery and restart tests. No speculative
    fallback to obsolete execution APIs is added; enablement compatibility of existing
    official Apps must also be accepted.

## Consequences

### Positive

- Visual polish can proceed against fixture states without waiting for all provider adapters.
- A new provider/model combination is added through a concrete execution contract; the
  frontend keeps no second model list.
- Muse's timeout and non-square output have clear product behavior, avoiding duplicate
  payment or discarding valid works.
- Later image editing/video can extend along the operation/profile boundary, without
  implementing unverified features now.

### Negative

- This is a cross-Apps/Platform/Runtime feature; a skin change alone cannot complete delivery.
- The mechanical limits and collection methods of the three new adapters still carry
  engineering risk, especially nested/custom tools.
- The schema/SDK breaking boundary brings coordinated-upgrade cost; publishing only a new
  Studio version is not enough.
- The first version does not open all models of the general chat catalog, nor promise fixed
  image sizes or native image model selection.

### Neutral

- The initial model/effort pins are only observed execution settings; they do not represent
  best quality or lowest media cost.
- Capability reads do not call a model, generate an image or prove the account still has
  quota; actual execution may still be rejected.
- Saved images are readable offline; creating a new image needs an available host / Runtime /
  provider at that time.

## Alternatives Considered

| Option | Advantages | Reason not adopted |
| --- | --- | --- |
| List the four providers and all chat models directly | Fast to launch the form, high freedom | Cannot represent the corresponding operation, budget, collection or entitlement; easily misleading |
| Only restyle the Grok form | Small scope | Does not address the confirmed PNG / non-square / nested tool and turn-failure problems |
| Renderer reads provider directories or calls APIs directly | Bypasses the collection layer | Exposes files/credentials, introduces billing and permissions, violates existing boundaries |
| Support all image/video/audio operations uniformly first | Looks complete | A tool declaration is not real-production verification; requirements and acceptance scope get out of control |

## References

- [Five-provider evidence summary](../research/2026-10-23-studio-cli-media-probe-summary.md)
- [Three-provider single-image production](../research/2026-10-23-three-provider-image-artifact-probe.md)
- [Repeatable probe SOP](../research/2026-10-23-cli-media-probe-playbook.md)
- [Runtime ADR-042](../../../cats-runtime/docs/decisions/042-bound-native-image-generation.md)
- [Platform ADR-120](../../../cats-platform/docs/decisions/120-scope-app-image-jobs-and-assets.md)
- [App compatibility and release](../deployment.md#host-and-sdk-compatibility)

*Created: 2026-10-23. Planning document, pending cross-repository contract review before implementation.*
