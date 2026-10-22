# Three-provider single-image artifact probe

Date: 2026-10-23 (Asia/Taipei). The owner authorized one image attempt each for
Muse Spark 1.3 / xhigh, Antigravity Gemini 3.8 Flash / high, and Codex GPT-6.1-Sol /
xhigh, following the [CLI media probe SOP](2026-10-23-cli-media-probe-playbook.md).
This follows the [read-only eight-session inquiry](2026-10-23-eight-session-cli-media-probe.md).

## Route and budget

All three requests were sent through the real Cats Desktop composer in their
existing research conversations. The driver verified the identifying transcript,
model/effort chip, dispatched user message and cleared composer separately. The
renderer retained `desktopBridge: true`; no hidden CLI conversation replaced it.
The rooms retain their historical read-only titles, but each new message explicitly
superseded that restriction with the owner's bounded generation authorization.

The common image brief was:

```text
A simple flat illustration of one orange cat sitting, solid light blue background,
minimal shapes, square composition, no text, no letters, no watermark.
```

Each request allowed one generation call, no retry/edit/fallback, no external
API/key, no configuration/privacy/permission changes and no moving/copying outputs.
It requested native `1:1` when such a field existed, otherwise only square intent
in the prompt. No exact pixels or media model were specified. Read-only artifact
inspection was allowed. Antigravity additionally had explicit authorization for
one built-in `image-generator` delegation with `Model: inherit` and
`Workspace: inherit`, carrying the same limits into the child. No other research
delegation was requested. These were natural-language limits in ordinary Chat,
not the mechanically bounded Studio execution service.

## Independently verified artifacts

| Provider / selected agent | Observed generation route | Artifact | Bytes | Measured ratio | Enclosing Runtime turn |
| --- | --- | --- | --- | --- | --- |
| Muse Spark 1.3 / xhigh | `muse.image_generation`; normalized history name `image_generation` | PNG, **1920 x 1280** | 1,252,742 | **3:2**, despite square intent | **Failed** after tool success: post-initial-response 30000ms idle refusal |
| Antigravity Gemini 3.8 Flash / high | One `invoke_subagent` to `image-generator`, then one child `generate_image` | JPEG, **1024 x 1024** | 326,878 | 1:1 | Succeeded |
| Codex GPT-6.1-Sol / xhigh | One `image_gen__imagegen` inside the native `exec` call | PNG, **1254 x 1254** | 1,264,820 | 1:1 | Succeeded |

The driver read the original files without rewriting them, fully decoded PNGs
using `pngjs` with CRC checks and JPEG using `jpeg-js` with tolerant decoding
disabled, and visually inspected all three. Each depicts one seated orange cat on
a light blue background with no visible text. Both PNG IHDRs use 8-bit RGB
(color type 2), with no alpha channel. All decoded pixels are opaque; the JPEG
format has no alpha channel. This does not test transparent-background generation.

| Provider | Original-byte SHA-256 |
| --- | --- |
| Muse | `7064787815a871c4c13612eae42e0815d8086b0241399bfe3921efe76b9e845b` |
| Antigravity | `9533c466d796049aec30fb6a73bca382dfd42599aa8b2e4bad6ae45baeeb91d9` |
| Codex | `171600f8ef0bafd88d6d78ed13b5b0f7c98cfdccd042159da469f9ad9376f892` |

## Invocation and collection evidence

### Muse

The exact Runtime history contains one `image_generation` use and one result
with `isError: false`:

```text
Saved generated image to generated_images/<call-id>.png
```

The driver resolved and verified that file under the exact conversation cwd:
`<cwd>/generated_images/<call-id>.png`. The normalized use record contains
`arguments: {}`; it does **not** preserve enough evidence to independently attest
the actual native prompt or other call arguments. The Desktop user request and
matching saved artifact are retained, without inventing missing native arguments.

The run began at 2026-10-22 21:28:32.021 UTC, recorded the successful tool result
at 21:28:58.197, then ended failed at 21:29:38.810 with:

```text
ProviderRefusalError: Muse stopped responding after the initial response for 30000ms.
```

No final assistant report was completed. The image nevertheless exists and decodes
successfully. No request was resent. This verifies a generated artifact with a
failed enclosing turn, not a clean end-to-end Chat success. The 3:2 result also
shows that the submitted square-composition intent did not yield a square file
in this case; no native aspect-ratio parameter was established.

### Antigravity

The driver independently inspected the exact child's native transcript, selecting
tool calls/results without model thinking or unrelated context. It contains one
successful `generate_image` with:

```json
{
  "AspectRatio": "1:1",
  "ImageName": "orange_cat_illustration",
  "Prompt": "A simple flat illustration of one orange cat sitting, solid light blue background, minimal shapes, square composition, no text, no letters, no watermark."
}
```

The call also carried tool-action/summary display strings. The result returned an
absolute saved path under
`~/.gemini/antigravity-cli/brain/<parent-native-session-id>/orange_cat_illustration_<timestamp>.jpg`.
The child then sent its report to its caller. The parent performed read-only
property/transcript checks and completed successfully in 64.643 seconds.

This establishes the actual child tool name and accepted arguments for this one
case, **not** its complete schema, all supported aspect ratios or an Imagen
version. `Workspace: inherit` did not make the file a cwd output: it was stored
in the native brain/artifact directory. The parent history exposes only partial
delegation arguments; `Model`/`Workspace` values are requested and parent-reported,
not independently established from that normalized event.

### Codex

The normalized Runtime history does not expose the image call itself. The driver
therefore inspected only the current turn's relevant native rollout records. One
completed `exec` called `tools.image_gen__imagegen` exactly once with:

```json
{
  "prompt": "A simple flat illustration of one orange cat sitting, solid light blue background, minimal shapes, square composition, no text, no letters, no watermark.",
  "transparent_background": false
}
```

No reference, size, ratio, count, format, destination or media-model argument was
supplied. Its output displayed an image and reported the saved absolute PNG path
under `~/.codex/generated_images/<native-session-id>/exec-<id>.png`, outside cwd.
The returned object keys were `image_url` and `output_hint`; this one response
does not establish a complete stable success/error schema. The generation helper
reported 13.3 seconds; the enclosing turn completed successfully in 71.465 seconds
including reasoning and read-only file-header inspection.

## Implications for Studio

All three selected routes now have a verified single generated artifact. None
has a tested Studio App/SDK/Runtime execution profile or installed acceptance.
The existing production single-Grok capability list is unchanged.

1. Separate tool/artifact outcome from enclosing-turn outcome. Collect an
   existing valid artifact after a timeout; a final assistant sentence must not
   be the sole success or collection signal. Never auto-regenerate to recover it.
2. Display actual encoding, dimensions and ratio from validated bytes. Preserve
   original PNG/JPEG files; do not force every preview to imply a square output.
   A requested ratio and a measured ratio are different facts.
3. Keep native artifact locators behind Runtime's collection boundary. This Muse
   file was cwd-relative; Antigravity and Codex used provider-owned roots. Do not
   infer output paths from cwd or child workspace mode.
4. Normalize nested/custom-tool receipts explicitly. Antigravity needs the
   permitted child route; Codex's image call is inside native `exec`; Muse's
   normalized arguments are incomplete. Root research reads are evidence, not
   an implemented secure collector contract.
5. Keep agent model/effort separate from media model and expose only verified
   controls. All three actual media model IDs and standalone media charges remain
   unknown. No account/settings changes were made to make these attempts work.

Editing, reference-image acceptance, transparent generation, non-square parameter
coverage, cancellation, independent media pricing and model-pair quality/latency
comparisons remain untested. One case per provider cannot establish defaults,
output ranges, reliability or equality between agent models. No new image was
used to replace Studio's source sample; no code, package, installation or release
was changed. Private filtered receipts and measurements are retained under the
task's temporary evidence directory; raw transcripts/local identifiers are not
committed.
