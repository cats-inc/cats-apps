# Deployment

## Release boundaries

### Ask 0.1.0 — independently installable personal questions (2026-10-25)

Ask's first immutable release reuses its existing unused 0.1.0 version. The App
collects questions, exposes credential-scoped MCP get/submit tools for a connected
assistant, and retains answers/sources across close/reopen. Clipboard Copy uses
the permission-checked host bridge. Its MCP endpoint is the Platform's shared
origin plus `/apps/cats.ask/mcp`; configure the tunnel once in host Remote access.
The App does not own another tunnel or receive the ngrok authtoken.

- Tag `ask-v0.1.0` selects the exact producer commit recorded in provenance.
  Archive `ask-0.1.0.catsapp` is 649128 bytes and uses SHA-256
  `0f3853ca845b5435faf2f091b79049d5f960c4f3921565501d06eb1bed91e217`.
  Source digest: `2d67c59769c8f8c1363c0f8fc2a729656b3d2b1cca3c5deeab6a8ea0a9278e57`.
  The public builder stays pinned to Platform 0.9.3 / SDK 1.8.0. The immutable
  manifest retains host minimum `^0.6.1` and bounded App SDK `^1.3.0`; ADR-128
  treats the Platform declaration as a floor across minors. Desktop 0.10.0 keeps
  SDK 1.9.0. No unrelated App, root workspace or SDK pin is bumped.
- App data stays schema 1 in the host's App-scoped storage. Existing question,
  attempt, connection and answer IDs remain; this release changes neither its
  stored format nor migration behavior and requires no reset. Local-user
  publisher/trust and declared permissions remain unchanged. Credentials are
  per-connection, explicitly revocable and omitted from catalog metadata.
- The same reproducible candidate passed isolated Windows actual-archive/SDK/
  host create, MCP get/submit, close/reopen, Unicode clipboard Copy/paste, denial,
  opaque-frame isolation and Settings navigation. Apps CI passed 44 tests.
  A separate installed Windows Ask archive completed a user-operated Grok Bot
  round trip through the temporary external ngrok helper; its different archive
  hash stays separately recorded in PLAN-005. That is not live Bot proof of the
  new managed worker. Other assistants, independent shared-consumer acceptance
  and native macOS/Linux remain outside this evidence.
- Publish the immutable App through `release-app.yaml`, verify its hosted archive,
  lock and provenance, then promote its exact URL/size/hash to the signed catalog's
  stable channel. Ask stays optional in Marketplace, like Studio; the Desktop
  bundle remains Usage-only. The catalog uses the existing Ed25519 signing key.
  This promotion is a functional distribution change, not a publication-status
  follow-up. Publication results: `ask-v0.1.0`, its release workflow, and the
  catalog deployment/verified public signed envelope.

### Studio 0.4.1 — Cursor and service order (2026-10-24)

Studio 0.4.1 recognizes the Cursor generation profile and orders services Codex,
Antigravity, Grok, Muse, Cursor. Entry defaults to available Grok; polling keeps an
explicit selection. Five cards fit a normal desktop row and wrap on narrow screens.
Cursor's initial configuration is GLM 5.3 / max, requested 1:1; the Runtime profile
and host capabilities decide availability, rather than a renderer CLI/model probe.

- Immutable tag `studio-v0.4.1` selects the exact source commit, recorded in the
  release provenance. Archive `studio-0.4.1.catsapp`: 140830 bytes, SHA-256
  `398cb051f4130bd049e6485e89a1cd2e01189abf5723564496349fddcaa453ff`.
- App SDK floor stays `^1.8.0`: the existing shared image contract remains usable
  on those hosts. Cursor is offered when the host/Runtime advertise it (Desktop
  0.9.5 / SDK 1.9); older hosts retain their existing available providers.
  Platform minimum remains `^0.6.0`. No stored-data change, reset or new permission;
  existing work IDs, prompts and original image bytes remain host-owned.
- The release workflow checks the tag, package/manifest agreement, tests, docs and
  deterministic archive, lock and provenance. Local coverage includes 43 App tests
  and isolated actual archive/SDK/host acceptance of service order, centered/default
  Grok, Cursor JPEG export, reopen, narrow layout, cancellation and deletion.
  These browser calls are fixtures, not live provider generation; Runtime records
  its separate runner acceptance. Independent review is not claimed.
- Publisher and integrity policy are unchanged. Studio remains optional in Market;
  the verified hosted artifact is selected by the catalog promotion. Usage 0.5.4,
  the private workspace version and the pinned public archive encoder stay unchanged.
- Publication results: `studio-v0.4.1` GitHub Release and its release workflow.

### Prepared Studio 0.4.0 — shared multimedia SDK (2026-10-23)

Owner authorized implementation and the necessary releases; the clarified scope is
Cat and **Studio**, with Usage unchanged. Studio 0.4.0 uses host-injected
`catsApp.media.images`, declares App SDK `^1.8.0`, and retains the Platform minimum
`^0.6.0`. Raising the required SDK sets a new Studio 0.x minor boundary. The public
archive encoder remains exactly Platform 0.6.0; it does not supply the browser SDK.
Existing App/account-scoped work, IDs and saved JPEG/PNG bytes stay in the host;
this release changes no App storage format and needs no data migration. It grants
neither Studio access to Cat-private work nor Cat authorization through installation.

- Selected tag: `studio-v0.4.0`; its tag commit and release provenance are the exact
  source pin. Published 0.3.2 assets stay immutable.
- Selected archive: `studio-0.4.0.catsapp`, 140319 bytes, SHA-256
  `87188be8f8226c39e34f83ecba694553e019d8095351fa8ccda562527e4f1eb1`.
  The matching lock and provenance must agree with the release workflow output.
- Validation: Apps 41 tests, required build/docs gates, plus production host/SDK
  browser acceptance of this archive (contract 2 JPEG/PNG, cancel, delete, offline
  retained works, exact-byte export, narrow layout, isolation; zero CLI calls).
  The independent review's preview-fixture namespace finding is fixed and its
  executable SDK regression passes. Tag CI repeats the hosted release gates.
- Publisher remains `sammykenny2`. The App archive has the existing integrity pin;
  optional Market catalog promotion uses the existing Ed25519 catalog signer.
  Studio stays outside the default Desktop bundle. Usage 0.5.4, its archive hash,
  all Usage source and the private workspace version remain unchanged.
- Publish the immutable App first. A catalog promotion may then reference only its
  verified hosted URL, length and hash; do not pre-promote an unpublished archive.
  Publication verification uses the hosted workflow and assets, with no later
  status-only edit to this preparation.

Follow the [shared release preparation/completion policy](https://github.com/cats-inc/cats-one/blob/main/docs/release-guide.md#release-preparation-and-completion):
prepare all release documentation and pins in the original version change.
Verify publication using existing hosted Release/Actions/registry evidence, then
report and finish. Do not add tracked publication reports, status-only commits
or follow-up PRs, or chase unrelated main updates after verification.

Ask's shared-ingress implementation and the remaining cross-consumer acceptance
are tracked in [PLAN-005 A4a](plans/PLAN-005-personal-assistant-questions-mvp.md#a4a--shared-platform-ingress-correction-implemented-external-ac-10-open).
Host ingress settings/migration belong to Platform; App data remains Ask-owned.

cats-apps is a private npm workspace containing independently versioned Apps,
not a single npm product release. Usage and Studio have separate workspaces. The root
private package version does not determine App versions, and releasing one App
does not bump unrelated Apps or the workspace root.

Ordinary implementation, documentation, commit/push and merge requests do not
authorize an App version bump or publication. Accumulate commits until an App
release is selected, using existing user authorization for the required steps.
Branch CI checks/builds and uploaded CI artifacts are not public App releases.

**Publisher correction carried by Usage 0.5.1 and Studio 0.2.1 (2026-09-30).**

Source manifests identify the individual maintainer `sammykenny2`; the root MIT
copyright names `sammykenny2 and contributors`. Both the full manifest and root
LICENSE enter the archive and source digest, so Usage 0.5.1 and Studio 0.2.1 are
the first artifacts that carry the correction. Published Usage 0.5.0 and Studio
0.2.0 remain immutable; the owner authorized deleting those two releases once the
corrected versions are published and Desktop no longer pins them.
Include the publisher correction in each App's next release notes.
App SDK validation requires a nonempty publisher name,
while artifact selection still pins App ID, version and archive SHA-256.

Independent catalog delivery is planned in
[PLAN-004](plans/PLAN-004-independent-app-distribution.md). Artifact publication,
catalog promotion and Desktop bundle selection are separate actions. The signed
catalog and an unreleased Platform Market preview exist (see
[Official App catalog](#official-app-catalog)); the tag workflow below remains the
App release mechanism. Usage will stay preinstalled and also available in Market;
Studio will be optional and excluded from the default Desktop bundle.

For a selected App, keep these three values synchronized:

| File | Version field |
| --- | --- |
| `apps/<slug>/cats.app.json` | `version` in the App manifest |
| `apps/<slug>/package.json` | `version` in the App's private build package |
| Root `package-lock.json` | `packages["apps/<slug>"].version` |

The artifact is published to GitHub Releases as `.catsapp`, with an exact-version
lock and source provenance. There is no npm publish step for these Apps. See the
[cross-repository release guide](https://github.com/cats-inc/cats-one/blob/main/docs/release-guide.md)
for Runtime, Platform, launcher and Desktop release scope.

### Compatibility and data upgrades

Apply the [shared version policy](https://github.com/cats-inc/cats-one/blob/main/docs/release-guide.md#compatibility-and-data-upgrades)
to each independently versioned App: breaking public behavior, configuration or
stored-data requirements increment `0.x` minor, or stable `1.x+` major. Compatible
fixes can use patch. Schema and App versions remain independent. Preserve existing
user data through a validated, backed-up, atomic one-time migration; test a prior
profile, repeat startup and failed conversion as well as clean installation.
Unknown data must remain intact. Delegate host- or Runtime-owned migrations to
their owners; do not populate or repair the real user's registry in tests.

A host minor bump is not an instruction to bump all Apps, but it does require
checking the declared host range. Publish a new immutable App artifact if its
compatibility declaration must change; verify it against the new host first.
Version numbers and release notes never replace the data-upgrade path.

### Publish one App

1. Integrate remote changes and select the App, intended source and unused version.
   A prepared unpublished version can be reused; published artifacts are immutable.
2. Update that App's three version fields above and follow the repository's scoped
   validation rules. Documentation-only edits need diff/link review, not App tests
   or builds. Keep the hosted release gates; a bump alone does not require repeating
   the same passing suite locally.
3. Commit/push using the user's authorized Git workflow, and wait for Repository
   checks on main to pass on the selected commit. Then separately create and push
   the matching `<slug>-vX.Y.Z` tag at that commit, for example
   `usage-v0.2.2` (illustrative, not an instruction to release that version).
4. The [App release workflow](../.github/workflows/release-app.yaml) runs on that
   tag push. It refuses a commit without a successful Repository checks push run
   on main and does not rerun `check:docs` or the App tests. It checks the App
   manifest/package/tag agreement, builds the selected App and publishes its
   assets. It is not triggered by a normal main push and has no manual dispatch
   input; after a refusal, re-run the failed job once main's checks pass.
5. Confirm workflow success and download the archive, lock and provenance. Verify
   their App ID, version, source revision and archive SHA-256 agree before reporting
   publication complete.

Publishing an App does not update an installed Desktop. Platform separately
selects the published version, URL and SHA-256 in `config/desktop-apps.lock.json`
for an authorized later Desktop release, including Platform/App SDK compatibility
checks. Do not bump/publish Desktop, Runtime, Platform npm or cats-one as an
automatic follow-on. Independent installed-App updates via a remote catalog
remain future work.

## Host and SDK compatibility

Every App already has two required manifest declarations. In
[Usage's prepared manifest](../apps/usage/cats.app.json), App version `0.4.0` has:

```json
{
  "compatibility": {
    "catsPlatform": "^0.5.0",
    "appSdk": "^1.2.0"
  }
}
```

| Declaration | Meaning for this App |
| --- | --- |
| App `version` | Identifies this immutable App artifact; does not imply a matching Desktop version |
| `compatibility.catsPlatform` | Minimum host: Platform/Desktop 0.5.0 or newer, across minors (the floor of the range) |
| `compatibility.appSdk` | The compatibility gate: host SDK interface version must be at least 1.2.0 and below 2.0.0 |

Since Platform [ADR-128](https://github.com/cats-inc/cats-platform/blob/main/docs/decisions/128-make-the-app-sdk-version-the-sole-app-compatibility-gate.md)
the App SDK version is the only compatibility gate; `catsPlatform` is read as a
minimum host version, so a Platform minor bump does not make a published App
incompatible and does not by itself require an App re-release. Both checks still
run during installation and Desktop packaging. These declarations state the
supported range; they are not evidence that every combination was tested. Record
actual verification with the release evidence.

### Version discipline

- For `appSdk`, specify the oldest SDK supplying the required behavior plus an
  upper boundary: `^1.2.0` accepts SDK 1.2.0 through 1.x, but not 2.0.0. For
  `catsPlatform`, declare the oldest Platform the App was verified on; the same
  grammar is accepted, but only its lower bound is enforced.
- Platform owns the promise that anything an App can observe moves
  `APP_SDK_VERSION` (minor for compatible additions, major for breaking changes).
  [SemVer itself leaves 0.x unstable](https://semver.org/#spec-item-4); the SDK
  line is what the App relies on.
- If compatibility with an SDK line cannot yet be supported, use an exact verified
  SDK version such as `1.3.0` instead. Do not use a wide range to avoid stating uncertainty.
- Do not raise an App's minimum merely because Desktop or SDK has a newer release.
  Raise it when the App needs a newly introduced API, behavior or necessary fix.
- A declared range change modifies the immutable App manifest. Publish it as a
  new App version when selected for release; never rewrite an existing archive.

The [current host matcher](https://github.com/cats-inc/cats-platform/blob/main/packages/app-sdk/package.js)
accepts exact stable versions, carets, `major.x` and `major.minor.x`. It is not a
full npm range parser: comparator expressions (`>=0.3.2 <0.4.0`), `~` ranges,
unions and prerelease strings are unsupported. Write the supported `^0.3.2`
form instead of its comparator equivalent. Avoid `0.x`, which admits all 0.x
minors, and wildcard forms that omit a required patch minimum. See the
[host compatibility guide](https://github.com/cats-inc/cats-platform/blob/main/docs/app-packages.md#host-and-sdk-compatibility).

## Studio 0.3.2 — delete works and steadier image calls (2026-10-23)

Studio 0.3.2 is a compatible patch. The owner asked that failed, cancelled and
saved works can be deleted (SPEC-006 AC-14). On a host whose SDK offers
`images.delete` (cats-platform#304, SDK 1.6.0, first carried by Desktop 0.9.2),
work cards and the preview show 刪除:

- A saved work is deleted only after confirmation in an in-App dialog, because
  its original is removed and cannot be restored.
- Failed and cancelled works go at once.
- Work still in progress or awaiting its outcome cannot be deleted.
- A work linked in Cats Work is refused with an explanation (`image_in_use`).
- Deleting never generates, and resending a deleted request does not generate either.

Older hosts, including Desktop 0.9.1, show no delete action.

Every `sdk.images` call now goes through one queue, because the host bridge
runs one image call at a time and refuses a repeat of a method within 500 ms:

- The preview read goes first, other user actions next, thumbnails last.
- A method waits 550 ms after its previous call finished.
- Leaving the page settles queued calls.
- A user action during a background poll waits for it instead of being dropped,
  and it is never replayed after another user action.
- Redrawing the grid while thumbnails load no longer leaves them blank.

Compatibility, permissions and data are unchanged (`catsPlatform` `^0.6.0`,
`appSdk` `^1.3.0`; `ui.route`, `ui.lobby`, `media.images`). Deletion is
feature-detected, so no new host floor is declared. There is no migration.

Validation before the bump: `npm test` (40), and Platform
`scripts/testing/check-studio-app.mts` on the 0.3.2 candidate. The harness, from
cats-platform#304, requires the deletion flow from Studio 0.3.2. That run had
2 submissions, 1 cancel, 2 deletions and 0 CLI calls. Expected App tag: `studio-v0.3.2`.

- Expected asset: `studio-0.3.2.catsapp` (139,495 bytes)
- Expected SHA-256 from the deterministic candidate: `c3e34db11c86a28ac06599eac4465068e77da8b0a4a3db189fa9092720e39d7d`
- Selected immutable download address: https://github.com/cats-inc/cats-apps/releases/download/studio-v0.3.2/studio-0.3.2.catsapp
- App trust: local-user package; no OS-signing profile; Studio stays outside the
  Desktop default bundle.
- Distribution: after the tag run is verified, a catalog pull request adds 0.3.2 and
  moves `channels.stable` to it; 0.3.1, 0.3.0 and 0.2.1 stay listed for rollback.

## Usage 0.5.4 — host-owned chrome (2026-10-23)

Usage 0.5.4 is a compatible patch selected for the Desktop 0.9.2 standard-profile
preview. Like Studio 0.3.1, it leaves App identity to the host shell. The visible
kicker and "Usage." title are removed, as is the version in the footer. A
visually hidden `h1` remains for assistive technology. The snapshot note stays
in the footer. Queries, data and the never-launch-a-CLI rule are unchanged.

Compatibility, permissions and data are unchanged (`catsPlatform` `^0.6.0`,
`appSdk` `^1.2.0`; builder exact Platform 0.6.0). There is no migration. Hosts
older than the shell update (cats-platform#301) still show the App name and back
button but not the version below the frame.

Validation before the bump: `npm test`, and Platform `scripts/testing/check-usage-app.mts`
on the 0.5.4 candidate (10 reads; all six quota queries; 0 CLI calls). Expected
App tag: `usage-v0.5.4`.

- Expected asset: `usage-0.5.4.catsapp` (15,053 bytes)
- Expected SHA-256 from the deterministic candidate: `46f6ca1ada461a5e6c828e3218c7a11054ffa9f28ead4940a9ed2643703610d9`
- Selected immutable download address: https://github.com/cats-inc/cats-apps/releases/download/usage-v0.5.4/usage-0.5.4.catsapp
- The workflow records this bump's immutable merge commit in source provenance.
- App trust: local-user package; no OS-signing profile. Desktop 0.9.2 selects the
  standard profile. Expected trust is macOS signed + notarized, Windows unsigned
  without a certificate, and Linux n/a.
- Distribution: Desktop 0.9.2 pins it in `config/desktop-apps.lock.json`. After the
  tag run is verified, the catalog pull request also moves Usage `channels.stable`
  to 0.5.4, and 0.5.3 stays listed.

## Studio 0.3.1 — host-owned chrome and clearer busy errors (2026-10-23)

Studio 0.3.1 is a compatible patch after the owner tested 0.3.0 through the Desktop
0.9.1 Market. The App no longer repeats what the host shell already shows: its
icon/name/subtitle row, its own Home button and its footer (the note and the
version) are removed; a visually hidden `h1` remains for assistive technology.
The one-image/no-retry note stays under the Generate button. `image_service_busy`
no longer claims that another image is running, and the new Runtime code
`runtime_capacity_full` (worker pool full, for example of idle conversations) gets
its own message; both state that nothing was generated and no allowance was used.

Compatibility, permissions and data are unchanged (`catsPlatform` `^0.6.0`,
`appSdk` `^1.3.0`; `ui.route`, `ui.lobby`, `media.images`); no migration. Hosts
older than the shell update still show the App name and back button but not the
version below the frame; Market and Settings show the installed version.

Validation before the bump: `npm test` (38), `npm run check:docs`, and Platform
`scripts/testing/check-studio-app.mts` on the 0.3.1 candidate (2 submissions,
1 cancel, 0 CLI calls) with the harness from the shell PR, which also fixes the
harness router startup state. Expected App tag: `studio-v0.3.1`.

- Expected asset: `studio-0.3.1.catsapp` (135,846 bytes)
- Expected SHA-256 from the deterministic candidate: `298feee448f3d934bd41da1686b33de050fce607ed27686235582ecbd3ed7987`
- Selected immutable download address: https://github.com/cats-inc/cats-apps/releases/download/studio-v0.3.1/studio-0.3.1.catsapp
- App trust: local-user package; no OS-signing profile; no Desktop release or pin change.
- Distribution: after the tag run is verified, a catalog pull request adds 0.3.1 and
  moves `channels.stable` to it; 0.3.0 and 0.2.1 stay listed for rollback.

Usage source drops its visible title and footer version the same way; it is bundled
with Desktop, so that change ships only with a later Usage release and Desktop pin.

## Studio 0.3.0 — provider-first image workspace (2026-10-23)

Studio 0.3.0 ships [PLAN-006](plans/PLAN-006-studio-image-workspace.md) A3a: the
workspace asks for a service first and then shows only the operations that service
declares ([ADR-005](decisions/005-provider-first-studio-image-operations.md)). On
SDK 1.x hosts that is Grok generation at the native 1:1 ratio, exactly as before:
the submit payload is still `requestId`/`instance`/`prompt` and no new host API is
used. Previews show the measured format, size, ratio and transparency; saved works,
cancellation, outcome checks and downloads keep their existing semantics. Edit,
compose and the other services stay dormant until contract 2 and their own gates.

Compatibility, permissions and data are unchanged: `catsPlatform` `^0.6.0`,
`appSdk` `^1.3.0`, permissions `ui.route`, `ui.lobby`, `media.images`. Studio owns
no stored data; saved jobs and images remain Platform/Runtime records, so there is
no migration. This is a new-feature minor within the 0.x line, not a breaking change.
The builder stays exact published Platform 0.6.0.

Validation before the bump: `npm test` (38), `npm run check:docs`, and Platform
`scripts/testing/check-studio-app.mts` on the 0.3.0 candidate with the actual
archive, host and SDK and a fixture Runtime (2 submissions, 1 cancel, 0 CLI calls).
The tag workflow must check docs, install the pinned SDK, test and build the exact
version. Expected App tag: `studio-v0.3.0`; verify its Actions run and downloaded
assets after publication.

- Expected asset: `studio-0.3.0.catsapp` (136,117 bytes)
- Expected SHA-256 from the deterministic candidate: `2d5df73e7b924d63358aabc80a1ea8a1dd72922e99d76f8018c7c6e4ec3b5394`
- Selected immutable download address: https://github.com/cats-inc/cats-apps/releases/download/studio-v0.3.0/studio-0.3.0.catsapp
- The workflow records this bump's immutable merge commit in source provenance.
- App trust: local-user package; no OS-signing profile. No Desktop release or pin
  change: Desktop 0.9.1 does not bundle Studio.
- Distribution: after the tag run is verified, a catalog pull request adds 0.3.0 with
  the published lock's URL, size and SHA-256 and moves `channels.stable` to it, so an
  existing Desktop 0.9.1 Market offers the update without a Desktop release. 0.2.1
  stays listed; moving the channel back is the rollback.

## Usage 0.5.3 — Grok/Muse allowance view (2026-10-15)

Usage 0.5.3 is the compatible patch selected for Desktop 0.8.2 standard-profile
preview. It adds Grok/Muse labels and capability-gated queries, preserves Muse's
explicit Current/Weekly zero percentages and escaped reset text, and keeps missing
Grok allowance unavailable. It creates no model work or direct provider calls.
Muse acquisition requires native Windows and an existing Git winpty helper;
reset text does not establish a complete date/timezone or window duration.

The host floor stays `^0.6.0`, SDK stays `^1.2.0`, and the builder stays exact
published Platform 0.6.0. Older hosts retain their supported query buttons;
Grok/Muse require the Desktop 0.8.2 / SDK 1.5 bridge and Runtime 0.5.2 source.
This is an additive renderer change with no storage/configuration migration.
The existing tag workflow must check docs, install the pinned SDK, test and build
the exact version. Expected App tag: `usage-v0.5.3`; verify its Actions run and
downloaded assets after publication. The manual App-release entry is deferred.

- Expected asset: `usage-0.5.3.catsapp`
- Expected SHA-256 from the deterministic candidate: `80255075c08a73a67e08c9772fa9edf381c8bc165364b81d9ad39d54ca6a3794`
- Selected immutable download address: https://github.com/cats-inc/cats-apps/releases/download/usage-v0.5.3/usage-0.5.3.catsapp
- The workflow records this bump's immutable merge commit in source provenance.
- App trust: local-user package; no OS-signing profile. Desktop 0.8.2 selects
  standard profile: expected macOS signed + notarized, Windows unsigned without
  a certificate, Linux n/a. Release validation must use isolated profiles.

## Usage 0.5.2 — Kiro-capable allowance view (2026-10-14)

Usage 0.5.2 is the selected compatible patch for the Desktop 0.8.1 standard-profile
preview. It adds capability-gated Kiro quota queries, preserves fractional credit
quantities and their percentage precision, and labels reported calendar reset dates with exact time unavailable.
The maintainer publisher and copyright correction from 0.5.1 stays in the archive.
No storage/configuration format changes or data migration are involved.

The manifest keeps host floor `^0.6.0` and SDK `^1.2.0`, and the builder keeps
exact published Platform 0.6.0: no new build/public SDK symbol is used. On older
hosts the existing four quota providers work and Kiro has no query button; absent
`resetsOn` uses timestamp rendering. Kiro requires the new Platform 0.8.1/SDK 1.4
bridge and Runtime 0.5.1 collector. The App never calls a provider directly.

Local validation: 11 focused query/presentation/SDK-build tests passed, including
old/new host capability checks and deterministic source-free construction. The final
archive passed the isolated Platform browser acceptance for Kiro credits, date-only
reset display, precise percentages and existing App lifecycle behavior. Native
Kiro collection was separately live-verified without a session or model turn.
The tagged workflow runs docs, pinned SDK install, App tests and exact-version
build. Publication results: `usage-v0.5.2` and its release workflow.

- Asset: `usage-0.5.2.catsapp`
- SHA-256: `6338ece00357f8eaff44b18fc42ef28647cce8242e5ede88bce48f6e1744c597`
- URL: https://github.com/cats-inc/cats-apps/releases/download/usage-v0.5.2/usage-0.5.2.catsapp
- Source: immutable merge commit of this Usage bump, recorded by provenance.
- App trust: local-user package; it has no OS-signing profile. Desktop 0.8.1 uses
  standard profile (macOS signed + notarized; Windows unsigned: no certificate;
  Linux n/a). No installed App is replaced during validation or publication.

## Current State

Usage 0.5.1 ([published](https://github.com/cats-inc/cats-apps/releases/tag/usage-v0.5.1))
and Studio 0.2.1 ([published](https://github.com/cats-inc/cats-apps/releases/tag/studio-v0.2.1))
are compatible patch releases whose only purpose is the publisher and copyright
correction above. Renderer payloads and
permissions equal 0.5.0 and 0.2.0; `compatibility.catsPlatform` stays `^0.6.0` and
the App SDK ranges stay `^1.2.0` (Usage) and `^1.3.0` (Studio). Under Platform
[ADR-128](https://github.com/cats-inc/cats-platform/blob/main/docs/decisions/128-make-the-app-sdk-version-the-sole-app-compatibility-gate.md)
the host reads `catsPlatform` as a minimum, so both install on Platform 0.6.x and
0.7.x alike; the build still validates against the pinned Platform 0.6.0 SDK. The
owner authorized these releases together with Runtime 0.4.0, Platform npm 0.7.0 and
the Desktop 0.7.0 standard-profile preview, which selects Usage 0.5.1. Studio stays
outside the default Desktop bundle. Both were released on 2026-09-30 from source revision
`1c67c428c0b506972d57c1d365e6b140189ba3f0`: the
[Usage workflow](https://github.com/cats-inc/cats-apps/actions/runs/36607741728) and the
[Studio workflow](https://github.com/cats-inc/cats-apps/actions/runs/36607742106) each
passed docs, `npm ci`, the App tests and the tagged build. Archive SHA-256:
Usage `8189edbf1cce81ce4d712a0cf59f9d8ab4e23225add1cbb7e3b06030483ad467`, Studio
`be0ae730c0948bf5dde7a5a519321bc86506a0bcea595783c7f8df66dc0dcb21`; the published
lock files carry the same digests and Desktop 0.7.0 pins the Usage digest. After
Desktop 0.7.0 was published with the new pin, the owner-authorized deletion of the
`usage-v0.5.0` and `studio-v0.2.0` releases and tags was carried out; their entries
below remain as history, but the links no longer resolve and no host pins them.

Studio 0.2.0 was published (release deleted on 2026-09-30, superseded by 0.2.1)
as Studio's first public release. Studio 0.1.0 was built and
installed only locally, and its Platform ^0.5.11 declaration excludes host 0.6.0. Studio
0.2.0 declares Platform ^0.6.0 and keeps App SDK ^1.3.0 and permissions `ui.route`,
`ui.lobby`, `media.images`; its LICENSE and renderer payloads equal the 0.1.0 build and
the manifests differ only in version and host range. The owner authorized publishing it.
It stays outside the default Desktop bundle; the Market and catalog promotion in PLAN-004
remain future work, so a Desktop user installs it through the local App installation.
Preparation passed 12 App tests and the 0.2.0 build validated at host 0.6.0 with SDK 1.3.0.
The [release workflow](https://github.com/cats-inc/cats-apps/actions/runs/36514425729) passed
docs, `npm ci`, all 12 App tests and the tagged build. Source revision:
`866cba7d8f42ad02f4f4af4c040515b6f56e2217`; archive SHA-256:
`1d220501ee746162104e8d577beb19bde525018f66f7922df3accba1fcd05962`. The downloaded archive,
GitHub asset digest, lock and provenance agree; the Platform 0.6.0 App SDK validator accepts it
for host 0.6.0, and a local Windows build produced the same bytes.

Usage 0.5.0 was published (release deleted on 2026-09-30, superseded by 0.5.1)
for the Desktop 0.6.0 standard-profile preview. Platform 0.6.0 is a
host minor ([ADR-124](../../cats-platform/docs/decisions/124-model-companion-as-a-cat-role-not-a-skill-profile.md)),
and Usage 0.4.0's Platform ^0.5.0 declaration excludes it. Usage 0.5.0 declares Platform
^0.6.0 and retains App SDK ^1.2.0; its LICENSE and renderer payloads equal Usage 0.4.0,
and the manifests differ only in version and host range. It is the first release built
with the pinned Platform 0.6.0 App SDK, so its archive bytes come from the SDK encoder.
The owner authorized this App release together with Platform npm 0.6.0 and the Desktop
0.6.0 preview. Preparation passed 12 App tests, and the 0.5.0 build validated at host 0.6.0
with SDK 1.2.0 and 1.3.0.

The [release workflow](https://github.com/cats-inc/cats-apps/actions/runs/36508492841) passed
docs, `npm ci`, all 12 App tests and the tagged build. Source revision:
`2c077cbf9265ff0207292ca54754b3298fa28144`; archive SHA-256:
`66bbb0acbee92cf114a7836dccbfbad261e702caeb268007f12536c804b7c47d`. The downloaded archive,
GitHub asset digest, lock and provenance agree, and the provenance records the Platform 0.6.0
SDK and both validated hosts. A local Windows build of the same commit produced the same
bytes. Platform [PR #175](https://github.com/cats-inc/cats-platform/pull/175) selects this
release, and the [Desktop 0.6.0 preview](https://github.com/cats-inc/cats-platform/releases/tag/v0.6.0)
rebuilt its payload after `npm ci` and bundles it. Installed upgrade acceptance remains separate.

Usage 0.4.0 is [published](https://github.com/cats-inc/cats-apps/releases/tag/usage-v0.4.0)
for the Desktop 0.5.0 standard-profile preview. Desktop
0.5.0 moves to the next host minor because it bundles Runtime 0.3.0, and Usage
0.3.0's Platform ^0.4.0 declaration excludes it. Usage 0.4.0 declares Platform
^0.5.0 and retains App SDK ^1.2.0, with the same renderer and permissions; only App
version and host range differ. The host matcher has no union form, so the new App
minor targets the 0.5 host line while Usage 0.3.0 continues to target Desktop
0.4.x. The owner authorized publication of this required App dependency followed
by the Desktop 0.5.0 preview. No npm publication is involved.

Preparation checks passed on 2026-09-25: the docs check, all six App tests, the
0.4.0 build, and Platform SDK 1.2.0 package validation (Platform 0.5.x accepted;
0.4.7 and 0.6.0 rejected). The decoded file payload equals published Usage 0.3.0
(verified old archive SHA-256); only App version and host range differ.

The [release workflow](https://github.com/cats-inc/cats-apps/actions/runs/36128012121)
passed docs, all six App tests and the tagged build. Source revision:
`cb48b229295d5cb4bb6f3009fbe0b9e81afe1b63`; archive SHA-256:
`7ec944b264093dbeda9009986d5558336467851868f014258be17f60db88bcba`.
The downloaded archive, GitHub asset digest, lock and provenance agree. The
Platform SDK 1.2.0 matcher accepts the published archive for host 0.5.x, and its
decoded payload equals Usage 0.3.0. Platform
[PR #141](https://github.com/cats-inc/cats-platform/pull/141) selects this exact
release for Desktop 0.5.0, whose own package and offline-activation gates must pass
before publication; installed upgrade acceptance remains separate.

Usage 0.3.0 is [published](https://github.com/cats-inc/cats-apps/releases/tag/usage-v0.3.0)
for the Desktop 0.4.0 catalog-upgrade preview. It declares
Platform ^0.4.0 and retains App SDK ^1.2.0, with the same renderer and permissions.
The changed host compatibility line uses a new App minor and immutable artifact;
Usage 0.2.1 continues to target Desktop 0.3.x. The owner authorized publication of
this required App dependency followed by the Desktop 0.4.0 preview. No npm
publication is involved.

Preparation checks passed on 2026-09-23: all six App tests, docs/build checks,
Platform 0.4.0 / SDK 1.2.0 package validation, and decoded file-payload equality
against published Usage 0.2.1 (verified old archive SHA-256). Only App version and
host range differ. The published release's archive hash must be used for Desktop
selection after download verification; local archive hashes can vary by build OS.

The [release workflow](https://github.com/cats-inc/cats-apps/actions/runs/35861559132)
passed docs, all six App tests and the tagged build. Source revision:
`4c3f6057747032df24b1c1b1bb5ea873fa94f387`; archive SHA-256:
`61395c43fc8257ffa6955c156aabe9a582fa72c903749f7684e3ed7621f5f509`.
The downloaded archive, GitHub asset digest, lock and provenance agree. Platform
0.4.0 / SDK 1.2.0 validates the published archive and its decoded payload equals the
tested local build. Desktop still requires its own three-OS package and offline
activation gates before preview publication; installed upgrade acceptance remains
separate.

Usage 0.2.1 is [published](https://github.com/cats-inc/cats-apps/releases/tag/usage-v0.2.1)
for the authorized Desktop 0.3.0 unsigned preview. It declares Platform ^0.3.0
and retains App SDK ^1.2.0; the renderer and permissions are unchanged.
Source: `df1c57168c98a6a83fffb54f58ad298a1b769511`. Archive SHA-256:
`6b8160e548488f30c741cadd4726b55fa18f8c0a324d48ac0cbc6ea143788f24`.
The [release workflow](https://github.com/cats-inc/cats-apps/actions/runs/35302009970)
passed docs, all six app tests and the tagged build. The downloaded archive,
GitHub asset digest, lock and provenance agree. Platform 0.3.0 accepts the
published archive; its decoded payload matches the tested local build.
Desktop [PR #98](https://github.com/cats-inc/cats-platform/pull/98) selects this
exact release. Desktop's package and offline-activation gates must pass before
its publication.
Existing Desktop installers retain their previously pinned Usage version.

### Previous published version

Usage 0.2.0 is published as an immutable `.catsapp` artifact, exact-version lock
and source provenance in the [Usage 0.2.0 release](https://github.com/cats-inc/cats-apps/releases/tag/usage-v0.2.0).
It requires App SDK ^1.2.0 for explicit Codex/Copilot/Claude/Antigravity queries,
native quantities and per-provider cooldowns.

Published provenance: source revision
`1affcf38e427f636e1eedb45bf3d1ac4e78eeb4f`; archive SHA-256
`7d5455bb6b484b731becbc69b469e649fbfc433cf015586e0022c3045974c04e`.
The release workflow passed docs/tests/build. The downloaded archive, GitHub
asset digest, release lock and provenance agree; decoded payloads match the
locally tested build. Use the published hash: this archive predates the SDK encoder, and
its Node zlib bytes depended on the building OS.

The owner authorized the coordinated Desktop 0.2.5 unsigned preview with this
archive, SDK 1.2.0 and Runtime revision
`91bba98e2e621ec3124130b7c79fdc6c3ab7ca19`. Platform owns the exact release
selection, PR/CI and each OS's resource/offline-activation gates. Existing Desktop
0.2.4 installers retain Usage 0.1.1 unchanged. This task does not update the
operator's installed Desktop. Native Windows CLI queries were live-verified;
macOS/Linux live checks and WSL/Docker query support remain separate work.
### Package commands

CI runs docs/unit/build checks and uploads artifacts. The shared App-tag workflow
publishes a utility only when a matching `<slug>-v<version>` tag is pushed; it never
overwrites a released version. Normal builds do not publish releases.

```powershell
# cats-apps
npm run build -- --version 0.4.0
# cats-platform
npm run desktop:package:windows -- --apps-lock ../cats-apps/dist/usage-0.4.0.lock.json --skip-mobile
```

CI and the release workflow run `npm ci --ignore-scripts`, which installs the exact-pinned
`@cats-inc/cats-platform` devDependency; run the same command before a local build. The builder
encodes with its `encodeAppPackage`, whose bytes are identical on every OS, and refuses
to write an archive that fails the installer's own `validateRendererAppPackage` against
the App's declared `catsPlatform`/`appSdk` floor, or against the pinned Platform version and
SDK when the App's ranges accept them; an App may still target an older host line.
The provenance file records that SDK and both validated hosts. A floor older than the
pinned release is checked with the pinned release's rules; earlier hosts' rules are not
re-executed. Raising the pin can change bytes, so a released version is never rebuilt
under a new pin. Archives built before this switch used Node zlib and do not match the
SDK encoder's bytes for the same inputs; their published hashes stay authoritative.

The lock, not a moving latest release, selects the App version. This local example
selects only the App: a later Desktop release must also pin the matching Runtime
revision (the release workflow's `runtime_ref` input) and ship SDK 1.2. See the host
[build/install guide](../../cats-platform/docs/app-packages.md) for all platforms,
local/remote artifact references, source-free launch, and lifecycle behavior.

## Accepted Initial Delivery

1. Build each selected app from an identified cats-apps revision.
2. Produce immutable, individually versioned Cats App Packages.
3. Record app IDs, exact versions, checksums, source revision, and Platform/SDK
   compatibility in the Desktop bundle selection.
4. Include those built packages in a coordinated Cats Desktop release.
5. Have the host install and load the selected versions, preserving per-app data.

App version numbers are independent from Desktop's release number. The app set
can share build automation; a separate GitHub Release workflow per app is optional.
Desktop packaging consumes artifacts, not imported sibling source or a developer
workspace path.

`.catsapp` v1 is gzip-compressed JSON with the manifest, license and built payload
files encoded as base64, produced by the Platform SDK encoder. The first renderer is self-contained HTML. Directory-only
manifest registration remains a development path; it does not execute source as a
production App. Private GitHub assets need an independently authenticated download
followed by local pin selection; the initial URL resolver handles public release assets.

Desktop release CI uses a checked-in selection with real App release artifacts.
Publishing an App and committing its exact hash/URL into that selection are
explicit release actions, not implied by adding an implementation. Existing
Desktop 0.2.2/0.2.3 selections remain on Usage 0.1.0; publishing Usage 0.1.1 alone
does not replace bytes in an already published Desktop installer.

## Official App catalog

The catalog lists the published App versions that Cats Desktop's Market may install.
Its contract is [SPEC-005](specs/SPEC-005-official-app-catalog.md); Platform's
consumer rules are in [SPEC-120 FR-09](../../cats-platform/docs/specs/SPEC-120-app-market-and-lifecycle.md).
Bundled delivery does not depend on it, and promotion never changes Desktop pins.

- Source: `catalog/apps.json`. Promote by pull request: add the version with the
  exact release asset URL, size and SHA-256 from the published lock file, then point
  `channels.stable` at it. Withdraw a version with `withdrawn { reason, at }` instead
  of deleting it, and move the channel to a current version first.
- Pull requests run `Publish the App catalog` in verify-only mode, downloading every
  listed artifact. Merging to `main` signs the catalog with `CATALOG_SIGNING_KEY` and
  deploys it to `https://cats-inc.github.io/cats-apps/catalog/v1/catalog.json`.
- The catalog expires 30 days after it is signed. The weekly schedule re-signs it;
  GitHub pauses schedules after 60 days without repository activity, so run the
  workflow manually (`workflow_dispatch`) when the repository has been quiet.
- Local check: `node scripts/build-catalog.mjs --dry-run` prints the derived payload
  without a key. `node --test tests/catalog.test.mjs` covers the source rules, the
  build and the contract vector shared with Platform.

One-time repository settings:

- `CATALOG_SIGNING_KEY` was set on 2026-10-20 with
  `node scripts/new-catalog-key.mjs --key-id cats-apps-catalog-2026-10`, which also
  added the public key to `catalog/signing-keys.json`.
- GitHub Pages was enabled on 2026-10-20 with **GitHub Actions** as its source
  (`gh api --method POST repos/cats-inc/cats-apps/pages -f build_type=workflow`). GitHub
  created the `github-pages` environment, which allows deployments from `main` only.
  The published path returns 404 until the first deployment.

The publish job signs only from `main`, and only when the run's catalog inputs (the
catalog, build script, workflow and Node/package files) still match `main`. A dispatch
from another branch, or a re-run of a commit whose inputs `main` has since changed,
fails before signing; the newer commit's own run publishes. The trigger paths list the
same inputs, so every change to them starts a run.

Key rotation keeps the active key signing until Desktops trust the new one. The key
script never overwrites an existing secret, and after the first key it stores each new
key as `CATALOG_SIGNING_KEY_<KEY_ID>` (uppercase, other characters as `_`):

1. `node scripts/new-catalog-key.mjs --key-id <new-id>` stores the new private key under
   its own secret, prints that name and appends the public key to
   `catalog/signing-keys.json`. Merge that change; the workflow keeps signing with the
   secret named by the `CATALOG_SIGNING_SECRET` repository variable (default
   `CATALOG_SIGNING_KEY`), which is still the old key.
2. Add the new public key to Platform `src/platform/apps/catalogTrust.ts` and ship it in
   a Desktop release. Wait until supported Desktops have it.
3. Set the `CATALOG_SIGNING_SECRET` variable to the new secret's name and run the
   workflow. Desktops without the new key keep their last verified catalog until it
   expires, so step 2 must come first.
4. Remove the old key from the trust root and `signing-keys.json` in later releases, and
   delete its secret.

See [ADR-001](decisions/001-own-official-utility-apps-and-coordinate-desktop-distribution.md).

*Last updated: 2026-10-20*
