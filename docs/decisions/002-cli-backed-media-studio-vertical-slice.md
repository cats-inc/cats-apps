# ADR-002: CLI-backed Media Studio Vertical Slice

## Status

Accepted — 2026-09-28. The user authorized implementation and a local installed Desktop
update, and narrowed this delivery to one image in a standalone App beside Usage.

## Context

The original proposal combined image generation, editing and short video. Native Grok's
single image path has [one observed success](../../../cats-runtime/docs/research/2026-09-28-grok-single-image-spike.md).
Further live attempts are deferred due to the user's remaining Grok allowance. The existing
SDK 1.2 provides Usage/navigation but cannot execute or deliver generated images.

## Decision

1. Use **Studio**, slug `studio`, ID `cats.studio`, as a separate Cats Home App. Preserve
   Usage as its own App. Install/remove UX is a later task.
2. Deliver one bounded flow now: description → one 1:1 image → preview/download → reopen.
   Editing, import and video remain future scope, rather than gates for this delivery.
3. Use App → public Platform SDK → Runtime → native Grok CLI. Only an explicit click
   authorizes one generation attempt. No hidden provider HTTP fallback or paid retries.
4. App owns the creative interface. Platform owns identity/grants, existing Core task/run/
   artifact records and retained files. Runtime owns native execution, receipts, validation,
   cancellation and provider-reported usage. No duplicate general task system is introduced.
5. Add compatible SDK 1.3 `media.images` capabilities; require Platform/Desktop `^0.5.11`.
   App 0.1.0 has its own immutable artifact. Existing Usage contracts remain compatible.
6. Keep renderer opaque and sandboxed. Binary image delivery uses a transferable buffer
   and blob preview; downloads are host-controlled. No shell, credentials or absolute paths
   cross the bridge. Scope access to the enabled verified package/version and current account.
7. Persist before dispatch; derive a stable Runtime request ID and never regenerate after
   uncertain completion. Recovery reads/collects the same job. Cancel intent survives transient
   network errors; cancellation does not promise a refund.
8. Store new metadata in existing Core records and new app/runtime-owned directories.
   Existing data format remains unchanged; no migration/reset is required.

## Consequences

A functioning App requires compatible host and Runtime extensions, plus a Desktop update.
The one-image scope is deliberately narrow: fixed aspect ratio, native Grok only, finite
storage, no independent install/remove or retention UI. Costs and exact output dimensions
are not guaranteed. Fixture acceptance and the earlier native spike are recorded separately;
neither implies a fresh paid end-to-end generation through the installed App.

Direct renderer CLI access and a page inside Usage were rejected because they violate
ownership and the requested independent App identity. A separate image/video App split
is unnecessary before the later video scope has been validated.

## References

- [SPEC-003](../specs/SPEC-003-media-studio-vertical-slice.md)
- [PLAN-003](../plans/PLAN-003-media-studio-vertical-slice.md)
- [Platform ADR-120](../../../cats-platform/docs/decisions/120-scope-app-image-jobs-and-assets.md)
- [Runtime ADR-042](../../../cats-runtime/docs/decisions/042-bound-native-image-generation.md)
