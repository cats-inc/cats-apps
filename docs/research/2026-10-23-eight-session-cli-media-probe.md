# Eight-session CLI media inquiry through Cats Desktop

Date: 2026-10-23 (Asia/Taipei). Scope: user-requested read-only research for
cats.studio, following the [probe playbook](2026-10-23-cli-media-probe-playbook.md).
This is not an implementation, publication, or media-generation acceptance result.

## Route and evidence

All eight conversations were created with **New Chat in the installed Cats
Desktop renderer**, using its existing loopback CDP connection. The renderer
reported `desktopBridge: true`, a 1078 x 632 CSS-pixel viewport and DPR 1.5.
Provider, model and effort were selected in the real picker before each first
message. No separately spawned model or terminal conversation replaced this route.

Each room received the same initial Traditional Chinese discovery prompt, with
only its identifying title changed. It requested tool inventory, schemas, media
controls, tool provenance, CLI version/cwd, account-policy evidence and integration
gaps. Generation, uploads, paid generation APIs, configuration changes and
delegation were prohibited. No other configuration's answers were supplied before
the first successful answer. The owner's `xhgih` spelling was treated as `xhigh`.

Evidence retained privately includes picker snapshots, conversation URLs and cwd
chips, DOM transcripts/screenshots, the rooms' message diagnostics, Runtime model
resolution/state observations, and assistant/tool-name records from the exact
eight Runtime histories. These are not committed: they contain local identifiers,
paths and account context. Read-only diagnostics were used to distinguish a
completed Runtime turn from an incomplete Desktop projection; all prompts were
submitted through the Desktop composer, not an API mutation.

Tool definitions below are **model transcriptions of session-injected definitions**,
not independently exported provider schemas. Even matching transcriptions do not
establish backend acceptance, entitlement, actual file output or tool provenance.
The inspected histories contained no named media-generation or agent-delegation
calls; successful answers reported zero media-generation calls. Generic shell and
web-tool activity is not itself an independent audit of every service-side action.

## Selected configurations

The picker evidence and Runtime's resolved configuration agree on these selections.
Runtime resolution confirms routing intent, not an upstream model-attestation or
proof of the actual media backend.

| Provider | Picker choice / effort | Runtime model / control |
| --- | --- | --- |
| Muse | muse-wonder-1.0 / xhigh | `muse-wonder-1.0`; `muse.reasoning_effort=xhigh` |
| Muse | muse-spark-1.3 / xhigh | `muse-spark-1.3`; `muse.reasoning_effort=xhigh` |
| Antigravity | Gemini 4 Argon / high | `gemini-4-argon-high`; `antigravity.effort=high` |
| Antigravity | Gemini 3.8 Flash / high | `gemini-3.8-flash-high`; `antigravity.effort=high` |
| Claude | Fable 5.1 / xhigh | `claude-fable-5-1`; `claude.reasoning_effort=xhigh` |
| Claude | Opus 5.5 / xhigh | `opus` alias; `claude.reasoning_effort=xhigh` |
| Codex | GPT-6-Astra / Extra high | `gpt-6-astra`; `codex.reasoning_effort=xhigh` |
| Codex | GPT-6.1-Sol / Extra high | `gpt-6.1-sol`; `codex.reasoning_effort=xhigh` |

Antigravity's picker uses `gemini-4-argon-low` and `gemini-3.8-flash-low` as entry
IDs while effort is selected separately; Runtime resolved both to their `-high`
model values. The initial opaque option value alone would misstate execution.
Claude's `opus` remains an alias in Runtime; Opus reported `claude-opus-5-5` from
its injected context, not an independently inspected backend response.

Both Claude sessions reported a `claude --version` result of Claude Code 2.1.308;
both Codex sessions reported `codex-cli 0.163.0`. A PATH version query does not
necessarily prove the version of an already running process. Muse/Antigravity
version identification is not independently established in the accepted results.

## Execution outcomes and limits

| Pair | First discovery | Follow-up outcome |
| --- | --- | --- |
| Muse | Both full prompts failed with a 30-second post-initial-response idle refusal | Both answered the identical short no-tools recovery question and a schema challenge |
| Antigravity | Both full prompts failed with the same idle refusal | Both answered the short recovery question; Flash answered the detailed schema challenge. Argon's first detailed challenge failed, then its owner-requested focused retry succeeded |
| Claude | Both completed the full discovery | Short definition checks distinguish Read from API vision limits |
| Codex | Both completed the full discovery | Definition checks distinguish the exposed image tool from bundled API fallback parameters |

The recorded error was `E_PRECHECK_FAILED ProviderRefusalError`, reporting that
the provider stopped responding after its initial response for `30000ms`.
This establishes a route/turn failure, not lack of media support or a bad model
ID. No timeout, effort, credential or privacy setting was changed to bypass it.
There was no generation attempt to retry.

Some Desktop revisits initially showed an empty typing bubble even though later
read-only Runtime inspection showed a completed turn; full first answers were
preserved from the exact histories and subsequently appeared in room messages.
This observation does not establish a cause. Two schema prompts initially remained
in the composer after an attempted combined fill/send sequence; their existing
drafts were sent separately and verified as user messages with an empty composer.
The playbook now requires that post-send check before leaving a room.

After all runs became idle, the renderer was refreshed and each room was checked
against its identifying first user message, not the URL alone. All eight retained
their successful capability answers, had empty composers and showed no active
Stop action. Argon's earlier schema-challenge error is retained alongside its
successful inventory answer and subsequent successful retry. The existing CDP
port was left open; Desktop was not restarted.

On the owner's request, Argon/high was retried in the same visible conversation
with a shorter question limited to required fields, Model/Workspace constraints,
the advertised image child and cwd guarantees. Composer clearing and the actual
new user message were verified before waiting. Runtime retained
`gemini-4-argon-high` / `antigravity.effort=high` and reported `succeeded` from
2026-10-22 20:38:04.001 UTC to 20:38:36.672 UTC (32.671 seconds). The exact
Runtime history for that turn contains user and assistant records, with no tool
calls. The response is visible in Desktop; its transcribed fields agree with
Flash's earlier answer. No child was invoked. This success does not establish
why the earlier idle refusal occurred or prove that shortening caused recovery.

This was one conversation per model/effort combination, not a speed, quality,
cost, reliability or isolated reasoning-effort benchmark. Recovery prompts differ
from the full discovery prompt, so response length cannot be compared across
those paths as an ability score.

## Capability comparison

| Provider pair | Generation/editing reported in the current sessions | Controls established by the transcribed definitions | Unverified or absent from the visible route |
| --- | --- | --- | --- |
| Muse | `muse.image_generation`: text-to-image and local-image edit/composition | Required `prompt`; optional `image_paths`, reported `maxItems: 50` | No structured size, ratio, format, alpha, output count or media-model selector; no dedicated video/audio/music/3D generation tool reported |
| Antigravity | Built-in `image-generator` type advertised through `invoke_subagent`; no direct `generate_image`/`generate_video` in the parent | Required `TypeName`, `Role`, `Prompt`; optional reasoning-model tier and workspace mode | Child's actual media tools/parameters, media model, output dimensions/format/count and collection contract unknown; no child was invoked |
| Claude | Neither session found a media-model generation tool | `Read` supports image input; connectors can read/render existing media | Video/audio/music/3D generation absent from this snapshot; code drawing, ffmpeg and external APIs are separate routes |
| Codex | `image_gen__imagegen`: image generation/editing and reference images | Required `prompt`; optional reference paths or recent-image count; optional `transparent_background` | No structured size, ratio, format, quality, output count, destination or media-model selector; no dedicated video/audio/music/3D generation tool reported |

Within each pair, the successful answers agree on this core inventory. There is
no demonstrated model-dependent media-tool entitlement difference. Argon's later
focused retry agrees with Flash on the transcribed delegation fields below;
neither answer is an independently exported schema or the child's media schema.

### Muse

Both models transcribed the same two-field image interface:

| Field | Reported schema | Description-only behavior |
| --- | --- | --- |
| `prompt` | Required string; no enum/default/numeric bounds reported | New-image description or edit/composition instruction |
| `image_paths` | Optional array of strings; `maxItems: 50` | Ordered local references; omitted/empty means generation, supplied images mean edit/composition |

The description says results are saved under `generated_images/` and returned as
model-visible images. No destination parameter, exact absolute location, fixed
return structure, input file-size/format/URL support, or output dimensions were
established. A request written into prompt text is not a constrained size/format
parameter. Both models left the CLI/MCP/plugin/host implementation origin unknown.

Both also named `muse.read_file` with required `path` for image input; their
reported video behavior was local frame-extraction guidance, not proof of direct
video-model input. The older report's blanket negative Muse conclusion should
therefore be replaced with **image tool reported in these sessions; execution
unverified**. The earlier official subscription/API evidence is a separate layer:
[Muse Code subscriptions](https://dev.meta.ai/help/subscriptions/what-is-a-muse-code-subscription)
and [Muse image generation](https://dev.meta.ai/docs/image-generation). A documented
Muse Image product does not identify this CLI tool's actual backend or charges.

### Antigravity

Both parent sessions advertised an `image-generator` subagent type with the
description: "Generates or edits images from a brief and replies with the saved
file paths." The parent tool was reported as `default_api:invoke_subagent`
(also displayed without the namespace). No subagent was started during this
inquiry. This is an advertised delegation route, not an image-generation receipt.

Flash's successful challenge, corroborated on the relevant fields by Argon's
later focused retry, transcribed:

| Field | Reported schema | Description-only meaning/default |
| --- | --- | --- |
| `TypeName` | Required string; no enum/default | Subagent type, here advertised as `image-generator` |
| `Role` | Required string; no enum/default | 2-5 word job/role label |
| `Prompt` | Required string; no enum/default | Actionable task brief |
| `Model` | Optional string; enum `inherit`, `flash_lite`, `flash`, `pro` | Child reasoning tier; described default `inherit`, no schema default |
| `Workspace` | Optional string; no enum/default keyword | Modes `inherit`, `branch`, `share`; described default `inherit` |

`Workspace` is a workspace mode, not an output-directory field. It does not
guarantee generated files land in the parent cwd. `Model` does not establish a
selectable Imagen/Veo media backend. The parent's inventory does not reveal the
child's actual tool schema, reference-image support, alpha, dimensions, format or
output count. Argon's guessed artifact directory and both models' provenance
claims are not promoted to independently verified facts. The historical direct
`generate_image`/fixed-Imagen claim cannot be carried over to this current route.

Both named `read_file` with required `Path`; its description includes image,
video and audio reading. That is a declared input surface, not an acceptance test
of every media type. Any later execution of the advertised image child must be
visible and explicitly bounded as part of the generation route.

### Claude

Fable and Opus agree that no current tool generates model-produced images,
videos, speech, music or 3D assets. `Read` is the image-understanding surface;
Drive/Slides tools read or render existing content. Programmatically producing
SVG/HTML or using ffmpeg is a different operation from invoking a media model.

The reported Read interface requires `file_path: string`; optional fields include
`offset` (integer, minimum 0), `limit` (integer, exclusiveMinimum 0), `pages`
(string) and `allow_large` (boolean), with no schema defaults. Both challenges
reported maximum 9007199254740991 for offset/limit; Opus explicitly corrected
its initial omission. Image/PDF behavior is described in text.
API vision size/token limits must not become Read-tool schema constraints.

Claude can remain a candidate for prompt preparation, storyboards and image QA;
these observations do not justify presenting it as an immediately usable image
generator. The sessions cited [tools reference](https://code.claude.com/docs/en/tools-reference.md),
[vision](https://platform.claude.com/docs/en/build-with-claude/vision.md) and
[voice dictation](https://code.claude.com/docs/en/voice-dictation.md). Their broader
account/privacy claims were not independently validated by this inquiry's driver
and are not adopted as Studio account-policy guarantees.

### Codex

Both sessions transcribed the same exposed declaration (not a JSON Schema export):

```ts
image_gen__imagegen(args: {
  num_last_images_to_include?: number | null;
  prompt: string;
  referenced_image_paths?: Array<string> | null;
  transparent_background?: boolean;
}): Promise<unknown>;
```

Only `prompt` is required. Description/comment rules say transparent background
defaults to false, recent conversation images are limited to 5, and the two
reference mechanisms must not be supplied together. No schema numeric bounds or
array limit was provided for local paths. `number` is not an integer constraint;
nullable does not imply a null default. Alpha output remains untested.

There is no destination field. Bundled imagegen documentation describes a default
under `$CODEX_HOME/generated_images/`; the tool declaration alone does not give
that guarantee. A local PNG/JPEG/WebP, dimensions, output count and return-event
shape have not been observed in this round. There is no tool-level media-model
selector, even if vendor or bundled API documentation names a model.

The sessions distinguish built-in tooling from the bundled Python/API fallback,
which requires separate API credentials and has a different parameter surface.
Do not import fallback size/n/format/mask/model options into this tool's UI.
Both left the underlying binary/MCP/host implementation origin unknown; the tool
was reported inside the actual Cats-created sessions, not inferred solely from
its availability in the driver's own environment. Their source list included
[Codex image generation](https://learn.chatgpt.com/docs/image-generation).
Unrelated API lifecycle, pricing and retention statements in the long answers
are retained privately and require independent verification before product use.

## Implications for Studio

These are research recommendations, not ratified contracts:

1. Keep Grok's existing verified image case; add Muse and Codex as candidates
   awaiting bounded artifact tests. Antigravity needs an explicit nested-agent
   execution/collection design. Claude's observed role is preparation/analysis.
2. Describe capabilities per operation and execution profile, with current
   availability and evidence levels. Do not build a universal provider/model
   whitelist that implies every model emits media or exposes identical controls.
3. Separate agent model/effort from media backend. None of these newly observed
   image paths establishes an end-user-selectable media-model list.
4. Build the common prompt/reference/result flow; reveal structured controls only
   when the route supports them. Codex's alpha request and Muse's reference array
   are distinct contracts. Exact size/format/count remain unknown for both.
5. Retain output collection as a Runtime responsibility. No advertised cwd or
   child workspace mode guarantees media output location. App preview/download
   must consume collected artifacts rather than infer a directory.

No media was intentionally generated in this round. No output resolution,
encoding, actual alpha, generation cost, account entitlement, edit quality or
installed Studio integration was verified. The next useful evidence is a bounded
artifact case for selected generation routes, rather than more model-name surveys.
