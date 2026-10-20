# SPEC-005: Official App Catalog

## Metadata

- Status: Implemented, not yet published; GitHub Pages is not enabled (2026-10-20).
- Owner: cats-apps produces and signs the catalog; cats-platform consumes it and owns the trust root.
- Decision: [Platform ADR-121](../../../cats-platform/docs/decisions/121-distribute-apps-independently-with-host-owned-lifecycle.md).
- Requirements: [Platform SPEC-120 FR-09](../../../cats-platform/docs/specs/SPEC-120-app-market-and-lifecycle.md).
- Plan: [PLAN-004](../plans/PLAN-004-independent-app-distribution.md).

## Summary

The official catalog lists which published `.catsapp` versions Cats Desktop may
install from its App Market. It is a signed static file on GitHub Pages; the App
artifacts stay on this repository's immutable GitHub Releases. Promotion is a
reviewed change to `catalog/apps.json`. An App release never changes the catalog
by itself, and the catalog never changes a Desktop's bundled App selection.

## Endpoint, key and promotion

- Published path: `https://cats-inc.github.io/cats-apps/catalog/v1/catalog.json`.
- Signing: Ed25519. The private key is the `CATALOG_SIGNING_KEY` Actions secret
  (PKCS#8 PEM). `catalog/signing-keys.json` lists the public keys; the first is
  `cats-apps-catalog-2026-10`, created 2026-10-20 with `scripts/new-catalog-key.mjs`,
  which writes the secret through `gh` and never prints or stores the private key.
- Trust: Platform embeds the same public key in `src/platform/apps/catalogTrust.ts`.
  Rotating to a new key or moving the endpoint requires a Desktop release first. A new
  key is staged under another secret name and activated with the `CATALOG_SIGNING_SECRET`
  repository variable (see the deployment SOP).
- Promotion: a pull request edits `catalog/apps.json`; the publish workflow verifies
  every listed artifact on the pull request and signs and deploys on `main`.
- Expiry: each build sets `issuedAt`, `expiresAt = issuedAt + 30 days` and
  `revision = issuedAt` in epoch seconds. A weekly scheduled run re-signs the catalog.
  GitHub pauses scheduled workflows after 60 days without repository activity, so a
  quiet repository needs a manual `workflow_dispatch` run before the catalog expires.
- Signing runs only for the current tip of `main`, never for another branch or an older
  commit, so a re-run cannot re-list a withdrawn version under a newer revision.
- Custody limit: an Actions secret protects against tampering on Pages or in transit,
  not against a compromised repository or workflow. A protected environment with
  required approval, or offline signing, is a later hardening step.

## Source file

`catalog/apps.json` holds only what a promotion decides:

- `schemaVersion: 1` and the catalog `publisher { name, homepage? }`.
- Per App: `id`, `channels { stable, preview? }` and `versions[]`.
- Per version: exact `version`, `artifact { url, size, sha256 }`, optional `notes`
  and optional `withdrawn { reason, at }`.

The source is strict: unknown fields, duplicate IDs or versions, a channel that
selects an unlisted or withdrawn version, and any artifact URL other than this
repository's `<slug>-vX.Y.Z` release asset `<slug>-X.Y.Z.catsapp` for that exact
version are rejected.

## Build

`scripts/build-catalog.mjs` downloads every listed artifact, checks its size,
SHA-256 and manifest identity through the pinned Platform SDK, and copies the
remaining fields from the artifact's own manifest: `displayName`, `description`,
lobby `icon`, `compatibility`, `permissions` and `publisher`. App-level fields
come from the stable version. The payload is built field by field in a fixed
order, so the same source, artifacts and issue time produce the same bytes. Derived
fields must fit the consumer limits (name 100, description 500, icon 40 characters; at
most 32 permissions), and the publisher keeps only `name` and an https `homepage`, so
one oversized manifest cannot make every Desktop reject the catalog. The
signing key must match a key in `catalog/signing-keys.json`, and the result is
verified again before it is written to `site/catalog/v1/catalog.json`.

## Schema v1

- Envelope: `{ algorithm: "ed25519", keyId, payload, signature }`; `payload` is the
  base64 of the UTF-8 JSON payload bytes and `signature` signs those exact bytes.
- Payload: `schemaVersion`, `revision`, `issuedAt`, `expiresAt`, `publisher`, `apps[]`.
- App: `id`, `displayName`, `description`, `icon` (string or null), `channels`, `versions[]`.
- Version: `version`, `artifact`, `compatibility`, `permissions`, `publisher`, `notes`
  (possibly empty) and optional `withdrawn`.

Consumers ignore unknown payload fields, so optional data can be added within v1.
An incompatible format needs a new `schemaVersion` and a new `catalog/v2/` path.
The order in which Platform verifies a catalog is recorded in SPEC-120 FR-09.

## Contract vector

`tests/fixtures/app-catalog/` holds a test-only key (`keyId: "test-only"`), a payload
and its envelope. The cats-apps test signs the payload with that key and must
reproduce the committed envelope byte for byte; Platform keeps a copy of the
envelope, payload and public key and must verify it to the same payload. The test
key is never listed in `catalog/signing-keys.json` or in Platform's trust root.

## Non-goals

- Third-party submissions, ratings, payments or a review queue.
- Preview channel selection in the host; Platform currently reads `channels.stable`.
- Automatic App updates or remote kill switches.
- Changing Desktop's bundled App pins.
