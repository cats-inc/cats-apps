# ADR-005: Provider-first Studio image operations

## Status

Proposed — 2026-10-23. After reviewing the Studio interaction design draft, the user asked
to "choose the service first, then do what it can do" and to include image editing in the
same workspace. This decision amends Decision 1 (text-to-image only) and Decision 5 (ratio
is only native 1:1 or automatic) of [ADR-004](004-expand-studio-with-verified-image-profiles.md);
the other ADR-004 decisions stand. Behavior is defined in
[SPEC-006](../specs/SPEC-006-studio-image-workspace.md) and work order in
[PLAN-006](../plans/PLAN-006-studio-image-workspace.md). It does not authorize new paid
generation, version bumps or publication.

## Context

The four candidate services can do different things, with different evidence levels (see the
[probe summary](../research/2026-10-23-studio-cli-media-probe-summary.md)):

| Service | Generate | Edit (one source image) | Compose (multiple references) | Ratio |
| --- | --- | --- | --- | --- |
| Grok | Produced | `image_edit` defined, not produced | `image_edit` with multiple images defined, not produced | 6 for generation, 14 for multi-image; single-image edit keeps the source ratio |
| Muse | Produced | `image_paths` only reported | `image_paths` up to 50, only reported | No structured field |
| Antigravity | Produced (sub-agent) | Mentioned in sub-agent description, arguments unknown | Not found | Only 1:1 observed |
| Codex | Produced | Reference paths only reported | Only reported | No structured field; `transparent_background` only reported |

ADR-004 took the operation as fixed (text-to-image only), with the service as just a dropdown
option. If editing is added to the same form without deciding the service first, the screen
must show controls that half of the services cannot honor, or reject only after submission.
Ratio, reference count and transparent background are also properties determined by
"service × operation", and cannot share one set of options.

## Decision

1. **The selection order is service → operation → that operation's inputs.** A service is
   provider + execution instance; once selected, only the operations enabled for that service
   are shown. An operation no service supports does not appear; an operation a given service
   does not support is not shown as a disabled button or a "coming soon" placeholder.
2. **The operation is part of the profile.** The first operation vocabulary is
   `image.generate` (no source image), `image.edit` (exactly one source image) and
   `image.compose` (two or more ordered references). Each profile declares its own
   operations, input count bounds, submittable options and limits. Studio renders only what
   is declared and keeps no provider-specific branches or model allowlist (continuing ADR-004
   Decision 2).
3. **Ratio is declared per operation, in four modes.** `choose` (lists the profile's ratio
   enum), `native` (fixed by the service), `service` (decided by the service, composition
   written in the description), `source` (follows the source image). Grok generation and
   multi-image composition use their own enums; single-image edit is `source`. Extending a
   ratio enum still needs that operation's own verification.
4. **Source and reference images come only from saved works.** The renderer passes only work
   IDs; Platform authorizes by App/account/version and obtains the saved original file;
   Runtime converts it per profile into an input the service accepts, places it in the managed
   location for this attempt and performs a containment check. Arbitrary paths, URLs and
   drag-and-drop import are not accepted; local file import requires a separate Platform
   decision on host-side picker permission.
5. **Using a work across services is allowed, but without silent conversion.** A work
   produced by any service can be the source image for another service, provided it meets the
   input format and size declared by that profile. When it does not, it is rejected for safety
   reasons; only conversions explicitly declared and verified by the profile may run.
6. **The result is always a new work, with its source recorded.** The job records the
   operation and the ordered source IDs with their SHA-256; the source image is not modified
   or overwritten. Idempotency comparison includes operation, sources and options; any change
   is a conflict. This is a single-level "based on" relation, not a version-tree UI.
7. **Transparent background is offered only when the profile declares it, and the result is
   judged by measurement.** Requesting transparency and actually containing transparent
   pixels are different facts; after saving, the measured value is shown (opaque / contains
   transparent pixels / unknown).
8. **Each "service × operation" passes its own gate.** Editing and composing do not inherit
   generation's bounded-route acceptance. EX-01's "one media call, zero retries" applies to
   every operation; an operation not proven limitable before generation stays unavailable.
9. **The Studio UI ships first on SDK 1.x.** Studio reads schema 1 (Grok, generate, native
   1:1) and the proposed schema 2 through a capability normalization layer. For an SDK 1.x
   host only Grok generation appears, compatible with the existing Platform/Runtime
   contracts; the schema 2 path is verified with fixtures and is wired in after the SDK major
   and each owner's A0 freeze. Video and other media operations remain separate, but reuse the
   same operation/profile framework.

## Consequences

### Positive

- Users first see what the service can really do, and are not rejected after filling in the
  form.
- A new operation or new provider appears by Runtime profile declaration, with no provider
  branch added to Studio.
- Editing, composing and cross-service relay use the same work, source and idempotency rules.
- The UI revision can ship first on the current SDK 1.x, without waiting for the four
  adapters.

### Negative

- Contract 2 grows in scope: operations, sources, options and measured transparency must all
  be frozen across three repositories.
- Each new operation needs its own bounded-route evidence, so enabling is slower than
  generation only.
- Converting sources into each service's input (attachment, path, data URL) is new
  collection/isolation work for Runtime.
- The existing Platform Studio browser acceptance scripts depend on old UI selectors and need
  matching updates.

### Neutral

- Generation remains the default operation; without a preference, an available Grok is still
  selected (SPEC-006 CAP-07).
- A single observed size is still not a default or guarantee; ratio modes describe how
  control works, not the result.

## Alternatives Considered

### Alternative 1: Operation first (choose generate or edit, then the service)

- **Pros**: Matches the "I want to edit an image" intuition; fixed operation entry.
- **Cons**: After choosing the operation, the available services may shrink or become zero;
  ratio, count and transparency still have to be rearranged by service.
- **Why rejected**: The user explicitly asked to choose the provider first; capability
  differences concentrate at the service layer, so choosing the service first avoids showing
  options that cannot be done.

### Alternative 2: One universal form, with the service rejecting unsupported fields after submission

- **Pros**: Simplest frontend.
- **Cons**: Violates "do not show unverified features"; rejection can happen after quota has
  been used.
- **Why rejected**: Conflicts with ADR-004's capability allowlist and EX-02 pre-generation
  limits.

### Alternative 3: Open local file import as the source image

- **Pros**: Broader editing uses.
- **Cons**: Needs new host permission, file size/format validation and a privacy boundary;
  the renderer cannot obtain paths.
- **Why rejected**: This phase uses saved works as sources; import gets a separate Platform
  decision.

## References

- [ADR-004](004-expand-studio-with-verified-image-profiles.md), [SPEC-006](../specs/SPEC-006-studio-image-workspace.md), [PLAN-006](../plans/PLAN-006-studio-image-workspace.md)
- [Grok capability probe](../research/2026-10-23-grok-media-capability-probe.md)
- [Eight-session probe](../research/2026-10-23-eight-session-cli-media-probe.md)
- [Three-provider artifact probe](../research/2026-10-23-three-provider-image-artifact-probe.md)

---

*Decision proposed: 2026-10-23*
*Decision makers: owner (design review and direction)*
