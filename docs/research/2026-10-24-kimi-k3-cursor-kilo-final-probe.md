# Final Kimi K3 probe: Cursor and Kilo

Date: 2026-10-24 (Asia/Taipei). The owner explicitly selected Cursor and Kilo
for the last round, both using Kimi K3. This follows the
[initial Chinese-model inquiry](2026-10-24-chinese-model-cli-media-probe.md)
and [cross-CLI re-probe](2026-10-24-chinese-model-cross-cli-reprobe.md), using
the [media probe SOP](2026-10-23-cli-media-probe-playbook.md).

## Cases and method

| Route | Requested picker selection | Retained execution target |
| --- | --- | --- |
| Cursor CLI | Kimi K3, max | `kimi-k3[reasoning=max]` |
| Kilo gateway | MoonshotAI: Kimi K3, max | `kilo/moonshotai/kimi-k3`; native provider/model `kilo` / `moonshotai/kimi-k3` |

Both cases used fresh, retained Cats Desktop conversations created through
New Chat. The driver checked settled picker chips and the resulting Runtime
bindings, with `desktopBridge: true`. No hidden inference session, terminal
prompt, research sub-agent or model substitution replaced the Desktop route.
The installed Windows environment reported Platform 0.9.4 and Runtime 0.6.1;
Kilo's running native server health reported 7.8.17. Cursor CLI version was not
independently measured. Model names and routing metadata do not attest remote
weights or media backend identity.

Each case had an independent no-tools inventory, a read-only schema/discovery
challenge, and one read of the same existing image. A native generator, if
exposed, could be tested once for one output, without retry, editing, reference
input, fallback API/CLI or delegation. Ordinary Chat enforces no hard tool-call
cap; these were prompt limits, checked against relevant native receipts.

The read fixture was an unchanged neutral-name copy of Studio's sample: JPEG,
1024 x 1024, 85,413 bytes, SHA-256
`6a4fe15907ac11becbc892029dd78cbf40c00590c82826ae638df5b93965867e`.
Its subject, colors, pose and tail direction were not disclosed in the prompts.
The expected image is an orange seated cartoon cat, light-blue background,
curved striped tail on the viewer's right, no visible text.

## Image understanding

| Route | Native receipt | Final answer | Outcome |
| --- | --- | --- | --- |
| Kilo / Kimi K3 | One completed `read(filePath)`; `Image read successfully`; `image/jpeg` attachment | Correctly described the cat, colors, seated pose, right-side tail and absence of text | **Existing-image understanding verified for this case** |
| Cursor / Kimi K3 | One `Read(path)`; an image-content item with the exact fixture byte count and SHA-256; no retained `imageDescriptions` field | Reported that the file read succeeded but no perceptible visual content was available; all requested visual details marked unknown | **Visual task did not succeed**, despite successful file reading and retained image payload |

Kilo's agent reported receiving the actual image. The driver independently
inspected the exact native session's image-read result and matching final answer.
No image generation or alternative vision route was invoked there.

Cursor's exact native SQLite result retains the correct image bytes, not merely
a filename. Nevertheless, the selected agent did not describe the picture and
explicitly declined to guess. The driver did not retry or use OCR, another model,
or a host-description fallback to repair that result.

This contrasts with the earlier Cursor/GLM case: that native result retained
`providerOptions.cursor.imageDescriptions`, and GLM answered from its textual
description. The corresponding field was absent from this Kimi read receipt.
This observation does not identify the internal cause, prove intrinsic Kimi
vision absence, or establish whether every payload in native storage was
forwarded to the remote model in a usable form. Kimi succeeded through Auggie,
Copilot and now Kilo in the observed existing-image cases.

## Generation tools and controls

Kilo's two inventories reported no native image generation/editing, video or
audio generator and no relevant deferred discovery entry. Its 26 reported tools
include `read`, file operations, shell, web, task and skill functions. No
image-generation skill was listed. Those are reported inventory/schema findings,
not an independently exported complete Kilo tool declaration. No generation was
attempted through Kilo, and its output dimensions/storage contract remain
untested for generation.

Cursor's first inventory named the deferred `GenerateImage`. Its challenge
called `GetDynamicTools` exactly once with namespace `cursor` and tool name
`GenerateImage`. The driver independently extracted the returned definition.
Both its complete `inputSchema` and description are **identical** to the earlier
Cursor/GLM snapshot:

- Required `description` string; description requests at least six words and
  says descriptions of three or fewer words are rejected.
- Optional `filename`, with no directory component; a timestamped filename is
  used if omitted.
- Optional `reference_image_paths`, an array of strings.
- Optional `aspect_ratio`: `1:1`, `4:3`, `3:4`, `16:9`, `9:16`.
- No exact pixel-size, output-format, output-count, destination-directory or
  media-model selector. Reference input does not establish a separate edit API.

No independent video or audio-generation tool was observed in these inventories.
Tool exposure, actual execution and artifact verification are recorded separately.

### One Cursor generation attempt

One attempt was dispatched through the same Cursor/Kimi conversation, using the
common orange-cat description, `aspect_ratio: 1:1`, and filename
`studio_cursor_kimi_probe.png`. No reference, exact size, format, media-model
argument, shell or post-generation move/conversion was requested. Native storage
chose the destination.

The exact native SQLite records contain one `CallDynamicTool` invocation of
namespace `cursor`, tool `GenerateImage`, with the requested three arguments.
There was no additional schema lookup in the generation turn. Its matching
result reports success, an absolute path in
`~/.cursor/projects/<cwd-derived-project>/assets/`, and an image/jpeg attachment.
The enclosing Runtime turn succeeded.

The driver verified the exact returned file with Pillow `verify` and full
decoding, inspected it visually, and matched its digest to the native attachment:

| Property | Actual result |
| --- | --- |
| Encoding / dimensions / mode | **JPEG, 1024 x 1024, RGB**, one frame |
| Bytes | **121,955** |
| SHA-256 | `2e3c67815259d6c15db8f62b293feabba8ebce88982ec230907e66f4212fc790` |
| Appearance | One seated orange cartoon cat, light-blue background, no visible text |
| Requested filename / saved extension | `studio_cursor_kimi_probe.png` / `.jpg` |
| Location | Native Cursor project assets, **outside the room cwd** |
| Media backend model / standalone media cost | Not revealed |

One original artifact was generated; no retry, edit, fallback or research
delegation occurred. The file was not moved, copied, converted or committed as
a replacement Studio sample. The filename request did not select PNG encoding.
This demonstrates Kimi using Cursor's image-generation tool, not that Kimi itself
is the image backend. Image understanding failed and generation succeeded in the
same selected agent configuration; these operations need separate capability
records.

## Interpretation and limits

- Capability records need CLI route, selected agent model and operation. A
  successful generic read receipt or stored image payload is not enough to
  report that the agent understood the image.
- Direct image input, host-produced textual description and input unavailable
  are distinct outcomes. The GLM caption bridge must not be silently attributed
  to every Cursor model, or to Kimi's own model capabilities.
- A shared Cursor generation schema does not mean the agent model is the media
  generator. The actual media backend and standalone media charges remain
  unreported unless supplied by the native result.
- Before Kilo's first dispatch, its picker reverted to Auto after selection.
  The driver guard blocked Send; the existing unsent prompt was preserved,
  Kimi/max was reselected, and the actual Kimi binding was confirmed. No Auto
  inference or wrong-model research conversation was created in this round.
- One Cursor schema-click initially left an unsent draft. The driver confirmed
  no additional persisted user message and an idle run before sending that
  existing draft. A click return alone was not treated as dispatch evidence.

Private evidence keeps final Platform replies and whitelisted native calls,
results and schema fields. Raw system prompts, expanded instructions, reasoning,
credentials and image base64 are not research artifacts. No provider credentials,
privacy/permission settings, timeouts, catalog, adapter, installed package, Studio sample or release was
changed by this research.
