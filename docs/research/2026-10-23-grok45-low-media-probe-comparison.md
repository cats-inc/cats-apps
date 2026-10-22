# Grok 4.5 / Low media inquiry comparison

Last updated: 2026-10-23 (UTC+8). Follow-up to the
[Grok 4.7 / Extra High inquiry](2026-10-23-grok-media-capability-probe.md).
This is a capability inquiry, not media-generation acceptance or implementation.

## Method

The owner requested a separate Cats Desktop conversation using Grok 4.5 / Low.
The operator used the same pre-existing loopback CDP endpoint of the real
Electron renderer, confirmed desktopBridge: true and visible state, and clicked
**新增聊天**. In the picker, the operator selected model grok-4.5, then effort low,
and verified both selected options and the Grok-CLI / Grok 4.5 / low composer chip
before sending. The earlier conversation was preserved.

The discovery prompt is identical to the 4.7 prompt except for its identifying
title and the stated current reasoning model/effort. It contains the same
historical baseline, but none of the 4.7 agent's new answers. It requests tool
definitions, operation-specific limits and explicit unknowns, with no media
generation, uploads, configuration/privacy changes, external paid API calls or
child agents. See the [reusable playbook](2026-10-23-cli-media-probe-playbook.md).

Comparison dimensions are tool inventory, input contract, description-vs-schema
precision, sources consulted and unresolved claims. These two configurations
change both model and effort. One conversation per configuration cannot isolate
their individual effects, establish general reliability or measure media quality.
No matched cost/latency benchmark or new media artifact is implied.

## Independent first-answer comparison

| Subject | Grok 4.7 / Extra High | Grok 4.5 / Low |
| --- | --- | --- |
| Native media tools | image_gen, image_edit, image_to_video, reference_to_video | Same four names reported |
| Extra MCP media tools | None discovered | None discovered |
| Image generation | One image/call, aspect ratios, no precise pixel argument | Same reported contract |
| Image editing | Multiple references; single-image edits preserve ratio | Same reported contract |
| Image animation | Described 6/10 seconds, 480p/720p | Same reported contract |
| Reference video | Described 1–15 seconds, 480p/720p, 14 images, 4 keyframes, 3 preset voices | Same reported contract |
| Reference video ratio list | Lists 1:1, 16:9, 9:16, 4:3, 3:2, 3:4, 2:3 | Says full list is not exposed; requires source-level follow-up |
| Guidance conflict | Detects Imagine skill claiming reference_to_video is the sole video tool despite current image_to_video definition and slash guide | Independently detects the same conflict |
| Schema precision | Explicitly distinguishes description limits from absent enum/maxItems; challenge clarifies missing duration default | Initial tables label description constraints as interface values and end by calling duration ranges enumerations; challenge requested |
| 3D documentation | Reads game-assets/3d.md and identifies separate three_d.py / grok-imagine-3d / GLB route | Reads game-assets/SKILL.md, then groups 3D/game assets as Imagine-tool workflows; specific 3d.md follow-up requested |
| Extra documentation detail | Image understanding and voice dictation described | Additionally mentions models.image_description, a documentation observation rather than a new generation tool |
| Configuration inspection | Reports reading selected media flags/overrides from settings cache | Reports keyword sampling config.toml; neither current-account readiness nor generation success established |
| Actual artifacts | None generated | None generated |

The 4.5 first answer is substantially complete on the four principal operations.
Its omissions and source labeling do not establish a different tool inventory or
media backend. In particular, a missing ratio list and an unread 3D guide must
not be recorded as evidence that 4.5 lacks those capabilities.

## Challenge scope

The follow-up requests compact schema excerpts, verbatim reference-video ratio
description, actual schema defaults/enums/count bounds, and voices-only versus
no-reference behavior. It also directs a read-only check of the known 3d.md file
to challenge the broad 3D statement. It supplies no 4.7 answer or schema excerpt,
but it is an adaptive challenge, not the identical second prompt used for 4.7.
Further cache/configuration/credential inspection and all generation remain
prohibited; the 3D script must not be executed.

## Challenge results

Both turns completed with the composer continuing to show Grok 4.5 / low. The
agent explicitly characterized its excerpts as a condensed restatement of the
system-injected Available Tools definitions, not original bytes exported from
an independent schema endpoint/file. The 4.7 excerpts were also model-reproduced,
so neither should be promoted into an independently captured provider fixture.

| Challenged claim | Grok 4.5 follow-up | Comparison outcome |
| --- | --- | --- |
| Reference video ratios | Quotes a description listing 1:1, 16:9, 9:16, 4:3, 3:2, 3:4, 2:3, with no auto. No enum. | Matches the seven ratios reported by 4.7. Initial omission, not evidence of a different contract. |
| Duration defaults/ranges | Both duration fields are nullable integer with minimum 0; no enum, maximum or schema default. The default 6 and 6/10 or 1–15 ranges are description-only. | Matches 4.7's clarified result. Corrects the first answer's stronger interface/enum labeling. |
| Reference counts | 14 images, 3 voices, 4 keyframes are description-only; no maxItems reported. | Matches 4.7. |
| No-reference request | prompt + aspect_ratio meets schema required but violates the described reference precondition. Backend acceptance was not tested. | Matches 4.7's clarification; initial categorical unavailable label should not be read as tested server rejection. |
| Voices-only request | prompt + aspect_ratio + voices satisfies schema and description. Actual backend behavior remains unknown. | Matches 4.7. |
| 3D | Reads 3d.md and corrects the first answer: separate three_d.py / 3D API, default grok-imagine-3d, GLB output, JPEG/PNG/WebP or HTTPS/data input, each side <=4096 pixels, team entitlement gated. | Matches the document route found by 4.7. This correction was assisted by a precise source pointer. No script was executed. |
| Exact output pixels, FPS, audio streams, actual media-model ID | Unknown; no generated artifact. | Same unresolved items as 4.7. |

The compact 4.5 excerpts omit format annotations that the 4.7 summary included
(uint32/float). Because these are selective summaries, omission is not evidence
of a schema difference. Both report the same required fields, nullable duration,
480p schema default, absent enums/count bounds, image arrays and nested keyframe
required fields.

## Interpretation for Studio and future probes

This pair did not reveal a reduction in exposed media tools or advertised
resolution/duration choices under Grok 4.5 / Low. The observed difference was
first-answer source coverage and precision: 4.7 surfaced 3D and the ratio list
without a targeted source pointer, and separated description constraints more
clearly. 4.5 reached the same principal candidate contracts after the challenge.

For future capability discovery, this supports trying the lighter configuration
with a required evidence/challenge step. It does not establish cost savings,
overall model superiority, execution reliability or equal media quality. It also
does not establish that every provider/model combination exposes identical tools.

Studio's proposed feature set is unchanged by this comparison. Treat the agent
as the tool planner, while recording actual media output and media-model identity
separately. Do not map the reasoning effort setting to an unmeasured media quality
level.

## Actions, evidence and verification

The agent reports read_file, search_tool, list_dir, grep and run_terminal_command
in the first turn, including a local config keyword sample; second-turn tool use
was read_file for 3d.md only. It states no media generation, privacy/configuration
change, credential/auth-file read or child-agent invocation occurred. This is a
transcript statement, not a complete independently audited native tool-call log.
The operator launched no separate Grok process or child agent.

Private evidence retains selected-state/completed renderer screenshots and both
transcript captures outside Git. Both requested research chats remain in Desktop;
the new 4.5 chat is left open. No restart, terminal TUI or new listener was needed.
The pre-existing CDP endpoint remains open. Only research documentation was edited;
no App code, version, package or installed Studio state was changed.

## Later cwd/output contract follow-up

The owner subsequently requested the same read-only cwd/output question in both
original rooms, retaining Grok 4.7 / xhigh and Grok 4.5 / low. Both succeeded.
The driver checked the selected chips, actual follow-up messages and completed
answers in Desktop. Each exact Runtime history records only `grep`/`read_file`
tool use for that turn; there was no generation, copying, moving or delegation.

Both answers distinguish process cwd, cwd-based session grouping and media
output. Neither found a declared cwd/workspace/output directory/filename input
in `image_gen`, `image_edit`, `image_to_video` or `reference_to_video`. Their
descriptions return absolute artifact paths and request short session-relative
display links. `GROK_HOME` changes a storage base; it is not a per-media output
destination. Known settings/flags did not establish direct-to-cwd output.

This follow-up adds stronger evidence than the original selective schema
summaries: the driver independently filtered the four media functions from each
exact session's persisted `tool_definitions.json`. Their complete `parameters`
objects and `description` strings match between the two model/effort selections.
That comparison is limited to these two current snapshots, not all possible
accounts, versions, transports or media backends. It does not test undocumented
fields or create a new generated artifact.

Bundled `17-sessions.md` independently confirms the encoded-cwd session grouping;
the previously generated image is an observed native-session artifact, not proof
that cwd was lost. The [detailed output-contract follow-up](2026-10-23-grok-media-capability-probe.md#later-cwd-and-media-output-contract-follow-up)
records sources, video/ZDR limits and the implication for Runtime collection.
