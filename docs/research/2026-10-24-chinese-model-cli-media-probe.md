# Chinese-model media probes through four CLI providers

Date: 2026-10-24 (Asia/Taipei). Follow-up to the
[Studio media probe summary](2026-10-23-studio-cli-media-probe-summary.md), using
the [CLI media probe SOP](2026-10-23-cli-media-probe-playbook.md).

## Scope and route

The owner selected four different model labs through four CLI wrappers. Each
configuration has its own retained Cats Desktop conversation, created through
New Chat and the visible provider/model controls. Requests were submitted through
the real Desktop composer with `desktopBridge: true`. No hidden inference
session, research sub-agent or alternative provider replaced those requests.

The installed Windows Desktop reports Platform **0.9.4** and Runtime **0.6.1**.
These are installed version reports, not a source-revision attestation. Default
room-created working directories were used, with sandbox/read-write workspace
metadata and the displayed Full access permission mode. Account settings,
privacy policy and CLI permissions were not changed by the probe driver.

| CLI route | Selected agent model | Selected control | Version evidence |
| --- | --- | --- | --- |
| OpenCode Go | `opencode-go/glm-5.3` | `opencode.variant=max` | Running native server `/global/health`: **1.19.4** |
| Kilo gateway | `kilo/bytedance-seed/seed-2-1-turbo` | `kilo.variant=thinking` | Running native server `/global/health`: **7.8.17** |
| ClinePass | `cline-pass/deepseek-v4-pro` | `cline.reasoning_effort=xhigh` | CLI version not independently measured |
| Auggie | `kimi-k3` | Native default; no Cats effort control | CLI version not independently measured |

Picker chips and retained execution metadata identify the requested routes.
They do not independently attest a remote backend's model weights. Effort was
not varied, so this inquiry does not measure its effect.

## Procedure and limits

1. Send the same short no-tools media inventory, with only the configuration
   title changed. Cover image generation/editing/references, video, audio,
   speech/music and image understanding.
2. Challenge the image-reading schema, deferred discovery and generation-tool
   inventory. Permit at most one relevant read-only discovery call; no outside
   API, credential changes, drawing fallback or delegation.
3. Read the same existing image once through the reported local-image tool.
   Ask for subject, colors, pose, the side of a curved feature and visible text.
   Permit only that reading tool, with no shell, OCR, fallback or retry.
4. Compare answers against the inspected fixture and inspect only relevant
   native call/result records. Do not retain raw system prompts, expanded user
   instructions, reasoning, credentials or image base64 as research evidence.

No new image, video or audio was generated. None of the four inventories exposed
a native generator, so no generation attempt or output-path test was warranted.
The ordinary Chat route has no mechanically enforced per-turn tool cap; the
one-read/no-retry limits were prompt instructions, with observed calls checked
afterward where native records were available.

The fixture is an unchanged, neutrally named copy of Studio's existing sample:
JPEG, 1024 x 1024, 85,413 bytes, SHA-256
`6a4fe15907ac11becbc892029dd78cbf40c00590c82826ae638df5b93965867e`.
It depicts a seated orange cartoon cat on a light-blue background, a curved
striped tail on the viewer's right, and no visible text. The prompts did not
name the subject or these expected details. This is a small local-file
understanding case, not a general vision benchmark or attachment-upload test.

## Findings

| Route/model | Image generation/editing | Video/audio generation | Image-reading tool | Actual local-image case |
| --- | --- | --- | --- | --- |
| OpenCode Go / GLM-5.3 | No generator reported in either inventory | No tools reported | `read(filePath)` | **Input unavailable**; file read succeeded, but the model reported an attachment-layer image-input rejection and could not describe the image |
| Kilo / Seed 2.1 Turbo | No generator reported in either inventory | No tools reported | `read(filePath)` | **Succeeded**; identified the subject, colors, seated pose, right-side tail and absence of text |
| ClinePass / DeepSeek V4 Pro | No generator reported in either inventory | No tools reported | `read_files(files[].path)` | **Rejected** before image input: `Current model does not support image input` |
| Auggie / Kimi K3 | No generator reported in either inventory | No tools reported | `view(path)`; `web-fetch(url)` also reported | **Succeeded**; identified the same visual details |

Generation inventories and schema transcriptions are **reported** evidence from
the selected models, not independently exported complete tool declarations.
Absence applies to these sessions and discovery limits. It does not establish
that the model lab has no image/video product, or that another plugin, API,
account or model would expose the same tools.

### Kilo / ByteDance Seed

The reported `read` definition requires an absolute `filePath`, with optional
`offset` and `limit`; its description says image/PDF files return as attachments.
The model reported 26 tools and 14 bundled skills, with no image generator or
general deferred tool-search entry. Document/browser skills were not treated as
media-model generation capabilities.

The exact native session records **one** completed `read` call for the fixture,
`Image read successfully`, and one `image/jpeg` attachment. The final visual
description matches the independently inspected image. Native permission metadata
marks this read as outside the room cwd and allowed; this is an observation of
this Full access session, not a default read-permission guarantee.

### Auggie / Kimi

The model reported local `view` and image-URL `web-fetch` definitions, 26 visible
tools and 13 skills. No generator or callable deferred media-tool search was
reported. Skill descriptions mentioning browser MCP names did not establish
that those tools were injected.

The exact native session JSON records **one** `view` call for the fixture and a
tool result with an image-content node. Its stored model is `kimi-k3`; the final
answer correctly describes the image. Runtime's native history projection
returned zero messages even though Platform retained the completed replies and
the native session contained them. The native filtered receipt establishes the
read; the empty history projection must not be interpreted as no execution.

### ClinePass / DeepSeek

The reported `read_files` schema accepts a required `files` array with required
`path` per element and optional text line bounds. Its top-level description
mentions text or image files, while the path-field description mentions a text
file. The existence of this tool did not establish model image acceptance.

The exact native image-test record contains **one** `read_files` call and a
matching result with `success: false`, empty `result`, and:

```text
Error reading file: Current model does not support image input
```

The model stopped and reported inability to identify the image without guessing.
The enclosing Runtime turn succeeded as a report of a rejected read; the visual
task did not succeed. This is a gate on this ClinePass/model route, not proof
that every Cline model or every DeepSeek product rejects images.

The visible Composio search/connection tools were not invoked: they are an
external integration route, and no media App/connection was established in this
native inventory. External media integrations remain outside this test.

### OpenCode authentication recovery

The initial inventory failed with an expired-key error. After the owner updated
the key and explicitly requested a retry, the same room still returned that
error. The driver confirmed the native server was healthy and had no active
session statuses, then called the documented **directory-scoped**
`POST /instance/dispose` for this probe's cwd. It returned `true`.

The next inventory succeeded with the same GLM model and max variant. This
sequence is consistent with retained per-directory provider state; it does not
prove a general credential-cache implementation. No credentials were read,
printed or changed as part of this recovery. No Desktop/global server restart
or model substitution was used. See the
[OpenCode server API](https://docs.opencode.ai/docs/server/) for the scoped
dispose operation. Failed authentication attempts are not model-capability
results.

### OpenCode Go / GLM

The model reported 12 visible tools and 14 skills, without a native media
generator or general deferred tool search. Its `read` schema report resembles
Kilo's: required absolute `filePath`, optional line `offset`/`limit`, images/PDFs
returned as file attachments and no generation controls.

The exact native session records **one** completed `read`, `Image read
successfully`, and an `image/jpeg` attachment. The final model answer then
reports:

```text
Cannot read image (this model does not support image input)
```

It did not provide a visual description and did not retry. Keep both evidence
levels: the native file-read receipt succeeded; the attachment/model acceptance
failure is reported in the final answer, not an independently captured backend
error. This is not a successful visual task. Native assistant metadata retains
provider `opencode-go` and model `glm-5.3`. It does not prove GLM's capabilities
through other APIs or model variants.

## Studio implications

- Keep generation, image understanding and generic file-tool availability as
  separate capabilities. A model dropdown entry plus a read tool is insufficient
  to enable a Studio generation operation or even guarantee image input.
- No new native image-generation profile is justified by these four inventories.
  Their image dimensions, output formats, media backend models and cwd output
  behavior remain untested because no generation tool was exposed.
- Model-specific input gates matter: the same fixture reached Kimi/Seed through
  their CLI reading tools but was unavailable on the selected GLM and DeepSeek routes.
  Re-probe a different model as a separate configuration when needed.
- Do not infer provider-wide media support or an effort effect from this sample.
  The previous Grok/Muse/Antigravity/Codex generation evidence remains separate.

All requested research conversations are retained. Raw Desktop captures and
filtered receipts stay in the private task evidence directory. No source sample,
provider timeout, catalog, package, installed App or release was changed by this
inquiry.
