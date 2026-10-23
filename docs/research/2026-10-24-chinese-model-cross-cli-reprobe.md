# Chinese-model media capabilities across CLI wrappers

Date: 2026-10-24 (Asia/Taipei). Cross-check of the
[first four-model probe](2026-10-24-chinese-model-cli-media-probe.md), following
the [media probe SOP](2026-10-23-cli-media-probe-playbook.md).

## Selection and scope

The owner requested four different CLI wrappers from Cursor, Copilot, Kiro,
Junie and Devin to cover GLM-5.3, Seed 2.1 Turbo, DeepSeek V4 Pro and Kimi K3.
The current Cats catalogs cannot make that complete pairing:

| Original model | Available candidate wrapper used | Coverage limit |
| --- | --- | --- |
| GLM-5.3 | Cursor | Exact family available; max resolves to `glm-5p3[reasoning=max]` |
| Kimi K3 | Copilot | `kimi-k3`, max effort |
| DeepSeek V4 Pro | Devin agent backend, ACP stdio | Max configuration failed; high completed the same model's inventory |
| Seed 2.1 Turbo | None of the five candidates | Owner explicitly retained the existing Kilo/Seed result as the baseline |

Kiro lists older DeepSeek/GLM entries, not these exact versions. Junie lists none
of the requested four models. Devin's relevant catalog is its `agent` backend,
not the empty legacy `cli` catalog. These membership observations do not claim
that a custom upstream model string would be accepted.

The three valid cases used separate real Cats Desktop conversations created
through New Chat and its provider/model controls, with `desktopBridge: true`.
No hidden inference sessions, direct terminal prompts or research sub-agents
replaced the Desktop requests. The same short inventory, schema challenge and
one-read image case were used. Effort was not isolated as an experimental factor.

The installed Windows environment reported Platform 0.9.4 and Runtime 0.6.1.
The selected execution targets were Cursor `glm-5p3[reasoning=max]`, Copilot
`kimi-k3`, and Devin `deepseek-v4-pro-high` after the failed max attempt. Native
CLI version measurements were not established for the accepted inference cases.
Account settings, permissions, privacy and timeouts were not changed.

## Existing-image results

The fixture is the same neutral-name JPEG as the first probe: 1024 x 1024,
85,413 bytes, SHA-256
`6a4fe15907ac11becbc892029dd78cbf40c00590c82826ae638df5b93965867e`.
Prompts did not disclose its subject, colors, pose or tail direction. Each
accepted image case allowed one reading call and no retry, OCR, shell,
sub-agent, image generation or alternative API.

| Model | Earlier route | New route | Interpretation |
| --- | --- | --- | --- |
| GLM-5.3 | OpenCode Go read succeeded, but final answer reported image-input rejection | **Cursor answered correctly through a host-supplied description** | CLI assistance can make this task work without establishing direct GLM vision |
| Kimi K3 | Auggie returned image content and answered correctly | **Copilot returned an image binary receipt and answered correctly** | Same existing-image case succeeds on both observed routes |
| DeepSeek V4 Pro | ClinePass read tool rejected image input | **Devin read the file, but reported that the selected model could not accept the image** | File read and visual task success remain separate; native model-input support is not established |
| Seed 2.1 Turbo | Kilo returned an image attachment and answered correctly | Existing Kilo result retained; no new Seed invocation | No second wrapper was available in the allowed candidate catalogs |

### Cursor: image description bridge

The exact native SQLite records contain one `Read` call for the fixture. Its
tool result includes an `image/jpeg` image-content item. A retained version of
that same result additionally has
`providerOptions.cursor.imageDescriptions["1"]`, containing a detailed textual
description of the orange seated cat, blue background and right-side curved tail.
The model explicitly stated it answered from the host's textual description.

These records establish that the Cursor route assisted the image-understanding
task. They do not establish which backend produced the caption, its price, or
that GLM received image pixels directly. The internal service is not an explicit
research delegation by the driver. Do not report this case as native GLM vision.

### Copilot: image binary receipt and prompt delivery

The exact native event log contains one successful fixture `view`. Its
`binaryResultsForLlm` has `type: image`, `mimeType: image/jpeg`, `byteLength:
85413`, and an asset ID equal to the fixture's SHA-256. The final answer correctly
identified the cat, colors, seated pose, right-side tail and absence of text.

The log also contains three `view` calls for Runtime-created temporary prompt
text files, one per submitted turn. Those are input-delivery reads, not additional
image reads or generation. Inventory answers reported zero task tool calls;
this must not be promoted to a claim of zero raw native calls. Expanded prompt
file contents were excluded from retained evidence.

### Devin: model gate after file read

After high configuration succeeded, Devin reported the builtin
`read(file_path, offset?, limit?)` definition, with image content described as
visually presented. No native generator was reported. Its image-test answer
reported one successful `read`, an `[IMAGE 0: (1024x1024)]` result, and a host
notice that the selected model does not support image input. It did not describe
the image or use a caption/OCR fallback.

The final answer and successful enclosing Runtime turn are retained. The precise
image-result/model-rejection wording is **model-reported** evidence; a separate
native tool-result receipt was not independently established. A successful
report of a rejection is not successful image understanding.

## Cursor image-generation tool

Cursor's first inventory named a deferred `GenerateImage`. The challenge invoked
`GetDynamicTools` once with namespace `cursor`. The driver independently extracted
the matching tool definition from that exact native result:

| Field | Native definition |
| --- | --- |
| `description` | Required string; description requests at least six words and says descriptions of three or fewer words are rejected |
| `filename` | Optional string; filename only, no directory; timestamped name if omitted |
| `reference_image_paths` | Optional array of string paths |
| `aspect_ratio` | Optional enum: `1:1`, `4:3`, `3:4`, `16:9`, `9:16` |

There is no declared exact pixel-size, output-format, output-count, destination
directory or media-model selector. Reference input is defined; a separate edit
operation or its editing semantics are not established. The description restricts
use to an explicitly requested image and says the client displays output.
Video and independent audio/voice/music generators were not found in the inspected
Cursor namespace. Copilot and Devin reported no native media generators.

### Bounded generation follow-up

Following the existing one-image-per-selected-route probe scope, one Cursor/GLM
image attempt was dispatched through the same Desktop conversation. The prompt
allowed one `GenerateImage`, no retry/edit/reference/fallback/delegation, and at
most one schema reload if required by the current turn. The requested arguments
were the common orange-cat description, `aspect_ratio: 1:1` and filename
`studio_cursor_glm_probe.png`; no invented size, format or media model was supplied.
Native output was to remain at the provider-selected location.

The exact native SQLite record contains one `CallDynamicTool` invocation with
namespace `cursor`, tool name `GenerateImage`, and precisely those three
arguments. There was no schema reload in this generation turn. The matching
result reports success, an absolute file path under
`~/.cursor/projects/<cwd-derived-project>/assets/`, and an `image/jpeg` attachment.
Repeated retained versions of the same result share its tool-call ID and are
not additional invocations.

The driver read the exact original file, verified and fully decoded it with
Pillow, and visually inspected it:

| Property | Observed result |
| --- | --- |
| Format / pixels / mode | **JPEG, 1024 x 1024, RGB**, one frame |
| Original bytes | **97,642** |
| SHA-256 | `d63ac82e3db88fbe0a3bea7950094c5ffad9c85c898549338ba7913c3a95e175` |
| Appearance | One seated orange cartoon cat, light-blue background, no visible text |
| Requested filename / actual extension | `studio_cursor_glm_probe.png` / **`.jpg`** |
| Output location | Native Cursor project assets, **outside the supplied room cwd** |
| Enclosing Runtime turn | Succeeded |
| Media backend model / standalone generation charge | Not revealed |

This verifies the Cursor/GLM agent's use of a native image-generation tool. It
does not establish that GLM itself generated pixels, that filename extensions
select encoding, or that Studio's bounded execution/collection path supports
this provider. No image was regenerated, moved, converted or committed as a
replacement Studio sample.

## Execution and UI limitations

- The first intended Copilot dispatch displayed Copilot/Kimi before Send, but
  its resulting Runtime binding was Cursor/GLM. That completed inventory is
  excluded from the Kimi comparison and renamed to identify the routing mismatch.
  A new Copilot conversation was dispatched
  after closing the picker, waiting for the target to settle and rechecking it;
  its actual binding was independently confirmed as Copilot/Kimi. The root
  cause of the first mismatch was not established or fixed here.
- Devin's first max attempt failed before inference with
  `session/set_config_option failed: Invalid params`. A read-only CLI metadata
  query listed both `deepseek-v4-pro-high` and `deepseek-v4-pro-max`. Setting high
  through the Desktop succeeded for inventory, schema and image reading. This
  sequence does not establish that max is inherently unsupported, or explain
  the rejection. The retained room title/initial prompt still says max; actual
  successful execution metadata says high.
- Some Desktop revisits initially showed an empty assistant area even after
  Runtime completion; the corresponding final Platform messages were later
  available. A driver-side `Promise was collected` CDP error also occurred after
  several clicks that had in fact dispatched. The driver checked persisted user
  message counts, cleared composer and run state before proceeding; prompts
  were not resent to repair those driver errors.
- Native Cursor history flattens assistant content and can mix reasoning into
  its text projection. This probe uses final Platform replies plus whitelisted
  native tool records, not that raw assistant-history text as research evidence.

## Studio implications

Use separate capability evidence for direct image input, host-assisted
description, image generation definitions and verified generated artifacts.
The same agent model can expose a different tool surface through another CLI.
Agent-model identity alone is insufficient for a Studio capability allowlist.

Cursor is a new native-generation candidate with an independently inspected
definition, matching invocation and verified artifact. It still needs a bounded
Runtime execution/collector profile before Studio can advertise that operation.
The selected Kimi reading result is reproducible across two observed wrappers;
the selected DeepSeek visual task remains unavailable in both tested routes.
No provider catalog, adapter, timeout, source sample, package or release was
changed by this research.
