# Grok media capability inquiry through Cats Desktop

Last updated: 2026-10-23 (UTC+8). Research for extending cats.studio; no Studio
implementation, version bump or publication is included.

A later [Grok 4.5 / Low comparison](2026-10-23-grok45-low-media-probe-comparison.md)
repeats the discovery prompt in a separate Desktop conversation.
After those inquiries, the owner separately authorized
[one Studio replacement sample](2026-10-23-grok47-xhigh-studio-sample.md) in this
4.7 room. The no-generation findings below describe the original two inquiry turns.

## Route and scope

The owner requested a visible **+ New Chat** inquiry in Cats Desktop using
**Grok 4.7 / Extra High**, rather than an undisclosed provider process or child
agent. The operator used the existing loopback CDP endpoint of the actual
Electron renderer. `desktopBridge: true`, visible state and a 1078 x 632 CSS-pixel
viewport (device pixel ratio 1.5) were observed before clicking **新增聊天**.
The picker showed provider `grok`, model `grok-4.7` and effort `xhigh`.

This is a real user-requested research conversation and is retained in Desktop.
It is not an isolated Studio acceptance test. No Desktop restart or terminal TUI
was needed. CDP was already enabled and is left in its existing state.

The initial prompt requested exact tool names and schemas for image generation,
editing, image/video references, video generation/editing/extension, image/video
understanding, audio input and speech/music output. It required a separation of
current tool definitions, documentation, and unknowns; allowed read-only tool
discovery; and prohibited media generation, uploads, settings/privacy changes,
paid external API calls and child agents. Historical values were explicitly
identified as claims to recheck. The reusable discovery/challenge prompts are
in the [playbook](2026-10-23-cli-media-probe-playbook.md).

## Historical baseline

| Source | Evidence and limits |
| --- | --- |
| [User-provided five-CLI report](2025-09-12-five-cli-media-final-report.md) | Names image_gen, image_edit, image_to_video and reference_to_video. Reports image aspect ratios, image_to_video at 6/10 seconds and 480p/720p, reference_to_video at 1–15 seconds, and a successful 6-second 480p video after disabling privacy. Its original date is retained; raw receipts and precise CLI versions are unavailable. |
| [2026-09-28 Runtime image spike](../../../cats-runtime/docs/research/2026-09-28-grok-single-image-spike.md) | Grok Build 1.0.41; one image_gen with aspect_ratio 1:1 produced a decoded 1024 x 1024 JPEG, 98,234 bytes. Agent model was grok-4.7-build-fast / low, not the image-model identity. No exact pixel parameter was sent. Editing and video were not run. |
| [Current Studio specification](../specs/SPEC-003-media-studio-vertical-slice.md) | Single square JPEG only. Editing, arbitrary ratios and video require additional contracts and are not already supported by the App. |

The earlier one-image authorization was exhausted in September. This October
inquiry authorizes a new text conversation; it is not evidence of a new paid
media test or permission to change privacy.

## Independent installed-document checks

The operator separately read the installed Grok user guide, without launching a
Grok process or reading account credentials/configuration. The executable's
Windows file/product version fields were empty; that metadata does not establish
the CLI version used by Desktop.

| Installed guide | Observed statement | Interpretation |
| --- | --- | --- |
| 04-slash-commands.md, Media Generation | `/imagine-video` plans shots, generates source images and animates them using image_to_video. | Text-to-video UX can be a multi-tool workflow. This is not evidence of a native text-only video tool. |
| 26-config-reference.md, features | image_gen_model_override and image_edit_model_override accept Imagine model IDs; empty generation override defers to a remote default. | A CLI-level model override exists in documentation even if tool arguments lack a model field. No override was changed or executed. |
| 26-config-reference.md, tools | disable_zdr_incompatible_tools; zdr_video_output_s3; per-model-step image/video parallelism limits. | Storage/privacy and invocation limits are separate concerns. A parallelism cap is not a total generation budget. |
| 14-headless-mode.md, tool selection | Daemon route exposes GenerateImage/GenerateVideo, with image_edit mapping to the same image tool as image_gen. | Tool names and filtering semantics can differ by route. Do not generalize this Desktop session to every Grok transport. |

## Live inquiry findings

These are the Grok agent's reports of its current tool definitions, cross-checked
against the installed guide and Imagine skill where stated. A renderer transcript
is direct evidence of the answer, not independent access to the provider's tool
registry. No current media invocation or artifact measurement was performed.

| Operation | Tool and reported contract | Evidence qualification |
| --- | --- | --- |
| New image | image_gen: required prompt; aspect_ratio defaults to auto. Described ratios: auto, 1:1, 16:9, 9:16, 3:2, 2:3. One image per call; no n/count, pixel size, seed, quality or output-format control reported. | Agent-reported schema; ratio and count behavior also independently read in installed Imagine skill. |
| Edit / multiple image references | image_edit: required prompt and image string array; aspect_ratio defaults to auto. Single-image edits preserve the input ratio and ignore this control; multiple-image edits can use it. | Agent-reported schema; single/multiple-image distinction independently confirmed in Imagine skill. |
| Image animation | image_to_video: required image; optional prompt defaults null; duration defaults 6, described as 6 or 10 seconds; resolution_name defaults 480p, described as 480p or 720p. No independent aspect_ratio or voice argument. | Agent-reported current schema. Installed slash-command guide independently refers to this tool. No current generation. |
| Reference / pinned-frame / voice video | reference_to_video: required prompt and aspect_ratio; described duration 1–15 seconds, default 6; resolution_name 480p/720p, default 480p. Descriptions require at least one image, voice or pinned frame/keyframe. | Agent-reported schema; duration, resolutions and reference precondition independently confirmed in Imagine skill. |
| Image understanding | read_file reportedly exposes images to the model. | Agent report of tool definition; no image-input test this round. |
| Video understanding, native video editing/extension, audio-file input, standalone speech/music output | No corresponding native function found in this session. Preset voices embedded in video are a separate capability. | Not exposed by this inquiry; not proof that every Grok route lacks the capability. |
| Voice dictation | User guide describes /voice and terminal shortcuts. | Documented CLI user-input feature; not an exposed media-generation function or Studio audio contract. |
| Image to 3D | Bundled game-assets documentation describes scripts/three_d.py, default grok-imagine-3d, one JPEG/PNG/WebP image (each side <=4096 pixels), HTTPS/data URL support and GLB output. | Operator independently read the documentation. This is a script route, not one of the four functions; team entitlement is gated and untested. The script was not run. |

Additional image_edit ratios reported by the agent are 4:3, 3:4, 2:1, 1:2,
19.5:9, 9:19.5, 20:9 and 9:20, alongside the ordinary ratios and auto.
The reported reference_to_video list is 1:1, 16:9, 9:16, 4:3, 3:2, 3:4 and 2:3;
it has no auto. Do not share one universal ratio picker across these operations.

Input forms also differ: image_edit describes attachment tokens, absolute paths
and image data URLs; its description does not advertise HTTPS. Both video tools
report absolute paths, HTTPS and image data URLs. Input byte/MIME limits and edit
reference count were not disclosed. The skill states edit references are reduced
to roughly 768 pixels on their long edge; this is reference preprocessing, not
the generated output resolution.

### Advanced reference video

The following are description/documentation limits, not proven runtime validation:

- Up to 14 reference images; references are redrawn rather than literal frames.
- Up to 3 preset voice IDs, with examples ara, eve, leo and rex. No complete
  allowlist was obtained. No audio-file upload or standalone TTS function found.
- first_frame and last_frame pin opening/ending images. The same image at both
  ends is described as a looping-video workflow.
- Up to 4 keyframes with image and timestamp_s. Described timing is strictly
  inside the clip, snapped to a 1/3-second grid, with at least 1/3 second between
  anchors. That grid does not establish the output frame rate.
- Prompt reference numbering follows first_frame, images, keyframes, last_frame.
  With first_frame set, the first ordinary image is IMAGE_1 rather than IMAGE_0.

The Imagine skill calls reference_to_video the only video tool, while the agent
reports image_to_video in current definitions and the slash-command guide names
it. Preserve this conflict. Do not remove either path from research on the basis
of one guidance file.

### Challenge-round corrections and schema structure

The second prompt requested schema excerpts, separated description-only limits
from validation, challenged the voices-only case and clarified version provenance.
It prohibited further cache/account reads or broad searches. Grok returned
structural excerpts from its previous read without reopening the file. They are
model-reproduced excerpts, not an independently collected schema fixture.

| Tool / field | Reported schema structure | Description-only behavior |
| --- | --- | --- |
| image_gen | required prompt:string; aspect_ratio:string, default auto | Allowed ratio list; one output per call |
| image_edit | required prompt:string and image:array of string; aspect_ratio:string, default auto | Single-image ratio ignored; multi-image ratio selection |
| image_to_video | required image:string; prompt:string or null, default null; duration:integer or null, format uint32, minimum 0; resolution_name:string, default 480p | Duration 6/10 with default 6; resolutions 480p/720p |
| reference_to_video | required prompt:string and aspect_ratio:string; images/voices:array of string; first_frame/last_frame:string or null; keyframes:array of object; duration:integer or null, format uint32, minimum 0; resolution_name:string, default 480p | Duration 1–15 with default 6; resolutions 480p/720p; reference precondition and count limits |
| keyframes items | required image:string and timestamp_s:number, format float | Interior timestamps, grid snapping and spacing |

Crucially, neither duration field has a JSON schema default, enum or maximum.
The default of 6 is in the description. The reported structures also lack ratio
and resolution enums, array minItems/maxItems and the anyOf reference requirement.
A schema validator alone therefore would not enforce the described product limits.
Studio/Runtime would need deliberate validation based on the verified contract;
backend enforcement remains untested.

The agent clarified that prompt + aspect_ratio + voices satisfies the described
reference requirement without an image. This is text plus preset voice reference.
Prompt + aspect_ratio with no image, voice, frame or keyframe passes the reported
required list but violates the description; actual server acceptance is unknown.
No independent text_to_video function was found. The documented /imagine-video
workflow still permits a text description to initiate a multi-step video process.

### Pixels, format, audio and media model

480p and 720p are described selectable resolution names. Neither is a verified
width/height pair for every aspect ratio. No 1080p/4K option, explicit FPS,
precise output pixels or guaranteed audio-stream behavior was found. Absence of
a voices argument does not prove the output is silent.

The agent reports output paths with examples images/1.jpg and videos/1.mp4.
Those examples do not establish a mandatory codec/container. The measured
1024 x 1024 JPEG remains the September artifact fact, not a guarantee for a
new request or this CLI version.

The four reported argument schemas contain no model parameter. Configuration
documents image generation/editing model overrides, but neither this inquiry nor
the historical spike establishes the remote default media-model ID. Grok 4.7 /
Extra High identifies the reasoning agent only.

### Privacy, entitlement and version provenance

The operator independently confirmed the Imagine skill's warning that video
returns an upgrade notice on free/X Basic tiers, and that ZDR video requires
user-hosted output storage. The guide names tools.zdr_video_output_s3. Current
account entitlement, quota, ZDR state and bucket readiness were not verified.
Do not turn privacy off or infer entitlement merely from a visible tool.

The agent cited grok_version 1.0.67 from a settings cache. This is cache provenance,
not a grok --version measurement or proof of the running executable version.
The agent reported extracting media feature flags/override values from that cache;
the operator did not read the cache or account credentials. No current configuration
was changed. The follow-up explicitly prohibited further cache/account inspection.

## Later cwd and media-output contract follow-up

On 2026-10-23 the owner requested the same follow-up in both original Desktop
conversations: Grok 4.7 / xhigh and Grok 4.5 / low. The prompt asked whether cwd,
session grouping, sandbox/workspace concepts and native media output have the
same contract; it prohibited generation, file relocation/copying, configuration
changes, credential reads and delegation. Both completed successfully using only
`grep` and `read_file`, as confirmed in the exact Runtime histories after each
follow-up user message. No media tool was called in these turns.

Both answers agree on the output boundary. The driver additionally read the
**persisted `tool_definitions.json` of each exact native Grok session**, filtering
to the four media functions before retaining private evidence. Unlike the
original model-transcribed excerpts, these are independently inspected local
tool-definition snapshots. All four functions' `parameters` objects and
`description` strings match between the two sessions.

| Function | Declared input property names in both snapshots |
| --- | --- |
| `image_gen` | `prompt`, `aspect_ratio` |
| `image_edit` | `prompt`, `image`, `aspect_ratio` |
| `image_to_video` | `prompt`, `image`, `duration`, `resolution_name` |
| `reference_to_video` | `prompt`, `images`, `first_frame`, `last_frame`, `keyframes`, `voices`, `aspect_ratio`, `duration`, `resolution_name` |

None declares cwd, workspace, output directory, output filename or destination.
`additionalProperties` is not explicitly set in these objects, so the missing
fields do not prove a backend rejects undocumented arguments; none were tried.
The supported declared surface provides no output-directory control.

The independently inspected descriptions say image tools return a saved image's
absolute path and video tools return a saved video's absolute path. They instruct
the agent to present short session-relative links such as `images/1.jpg` and
`videos/1.mp4`. These are result/display contracts, not output-path arguments or
a fixed machine-readable result schema.

The driver also independently checked bundled `17-sessions.md`, **Storage Layout**:

```text
~/.grok/sessions/<encoded-cwd>/<session-id>/
```

It explicitly groups sessions by URL-encoded working directory. If the encoded
name exceeds 255 bytes, it uses a slug plus hash and stores the original path in
a `.cwd` file. The same guide says `GROK_HOME` overrides the Grok base directory
and `-s` can supply a session ID. Neither is a documented per-media destination
parameter. The listed session tree does not include image/video subdirectories;
their exact composition with that root remains an observed image case rather
than an explicit universal storage-layout guarantee.

Thus process/shell cwd and session grouping must be separated from media output.
The [authorized 4.7 sample](2026-10-23-grok47-xhigh-studio-sample.md) actually landed
inside the native session's `images` folder. Its cwd appears in the encoded parent
directory. That result alone does not demonstrate that Cats failed to pass cwd
or that Grok ignored it. No native switch guaranteeing direct output into the
project cwd was established by the checked tools and bundled documentation.
Post-generation copying/import is a separate host/Runtime operation; none was
implemented or performed by this follow-up.

For video, the default description's absolute path and `videos/1.mp4` link remain
unexecuted in this research. Independently checked Imagine skill text states
that ZDR video requires a user-hosted bucket or returns a storage error; the
configuration reference names `tools.zdr_video_output_s3` as a team S3 bucket.
This is not a cwd/output-directory parameter. Current account privacy/bucket
settings and the remote-storage return contract were not inspected or tested.

Both answers and the selected model/effort chips were verified in the actual
Desktop transcripts, with empty composers and no active turn. The driver did
not launch another Grok process. Raw definitions, identifiers and DOM receipts
remain private outside Git; the existing CDP endpoint remains open.

Studio should collect the actual returned artifact and retain/import it into its
workspace or works store, preserving source provenance. It should not derive a
destination from cwd or fabricate an unsupported native `output_dir` parameter.
This explains the collection boundary; it does not implement or close the
previously recorded cwd/output-accessibility issue.

## Implications for Studio

Suggested sequence, subject to implementation scope being agreed:

1. Add import/reference selection and image editing with retained source lineage;
   expose ratios per operation and explain the single-reference ratio behavior.
2. Add one-image animation with 6/10 seconds and 480p/720p. Collect and measure the
   native returned artifact before exposing exact output dimensions or playback.
3. Add reference video as its own operation, with reference ordering, pinned
   endpoints, keyframes and preset voice selection. Keep unknown audio behavior
   visible in the research contract until an artifact is measured.
4. Investigate the separately documented 3D script route only as a later feature;
   do not treat it as already integrated or entitled.

Runtime must own bounded execution and collection; Platform must add the needed
SDK/host retained-work contracts. The current single-image Studio package does
not gain these capabilities merely because its provider exposes them in Chat.

## Original inquiry verification boundary

Both inquiry turns completed in the same Desktop chat with Grok 4.7 / xhigh.
Grok reported search_tool, list_dir, read_file, grep and run_terminal_command in
the first turn, and no tools in the challenge turn. It stated neither turn
generated media, changed files/settings or spawned child agents. This is a
transcript report, not an independently audited complete tool-call receipt.
The operator launched no separate Grok process and no child agent.

Private evidence retains the two transcript captures and renderer screenshots
outside Git. The requested research chat remains available in Desktop. No
temporary listener, terminal, or Desktop restart was introduced; the pre-existing
CDP endpoint remains open.

The inquiry has not generated new media. The answer establishes a useful
contract candidate for future probes, not a successful new edit/video/3D run.
The next bounded artifact cards should cover one edit, one 6-second 480p image
animation, then one reference video, using explicit invocation/retry limits from
the playbook. Their execution remains future work.
