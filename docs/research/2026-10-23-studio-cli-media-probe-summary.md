# Studio CLI media probe summary

Last updated: 2026-10-23 (Asia/Taipei). This is the entry point for the current
Grok, Muse, Antigravity, Claude and Codex findings. Follow the
[CLI media probe SOP](2026-10-23-cli-media-probe-playbook.md) for another provider,
model or CLI version. Findings describe observed routes, not provider-wide
guarantees or approval to implement every candidate.

## Scope and evidence

Ten visible Cats Desktop research conversations were retained: two Grok rooms
and two rooms each for the other four providers. All were created through New
Chat with the requested picker selections. Follow-ups stayed in those rooms.
The operator did not substitute hidden provider sessions or delegate research.

The capability inquiries were read-only. Separately, the owner authorized one
Grok 4.7 / xhigh image to replace Studio's earlier Fast/Low sample. No Muse,
Antigravity, Claude or Codex media generation was attempted. Antigravity's
advertised image child was not invoked. Raw transcripts, account context,
native IDs and local paths remain outside Git.

| Evidence label | Meaning |
| --- | --- |
| Reported | Model transcribed its currently injected definitions; not an independently exported schema |
| Defined | Driver independently inspected an exact-session persisted tool definition |
| Documented | Bundled/vendor documentation describes a separate or unexecuted route |
| Verified artifact | Matching invocation/result plus independently decoded/measured bytes |

Fixture acceptance proves its fixture route, not live account entitlement or
the other providers. An unknown media model or missing field remains unknown.

## Configurations

| Provider | Selected configurations | Version evidence and limit |
| --- | --- | --- |
| Grok | `grok-4.7 / xhigh` (non-Fast); `grok-4.5 / low` | Agent cited 1.0.67 from cache in the original inquiry, not an executable version measurement; historical bounded image spike used 1.0.41 |
| Muse | `muse-wonder-1.0 / xhigh`; `muse-spark-1.3 / xhigh` | CLI version not established by the accepted inquiry results |
| Antigravity | Gemini 4 Argon / high; Gemini 3.8 Flash / high | Runtime resolved `gemini-4-argon-high` and `gemini-3.8-flash-high`; CLI version not independently established |
| Claude | Fable 5.1 / xhigh; Opus 5.5 / xhigh | Both reported `claude --version`: 2.1.308; PATH query is not necessarily the already-running binary's version |
| Codex | `gpt-6-astra / xhigh`; `gpt-6.1-sol / xhigh` | Both reported `codex --version`: 0.163.0; exact running entry not independently attested |

Picker entry ID, Runtime-resolved model and upstream execution identity are
different evidence. Antigravity's observed `-low` picker entry IDs resolved to
`-high` with the high control; Claude's Opus selection remains an `opus` alias
in Runtime. These do not establish any media backend model ID.

## Operation matrix

| Provider | Image generation / editing / references | Video generation | Understanding and other media | Current execution evidence |
| --- | --- | --- | --- | --- |
| Grok | **Defined** `image_gen`, `image_edit`; local/attachment/data-image references | **Defined** `image_to_video`, `reference_to_video`; descriptions advertise 480p/720p and operation-specific duration/reference limits | Image reading reported; independent speech/music/video editing tools not observed. Bundled 3D script/API is a separate **documented** route | One new 4.7 square JPEG **verified**; edit/video/3D not executed in this inquiry |
| Muse | **Reported** `muse.image_generation`: prompt plus optional local `image_paths`, reported maxItems 50 | No dedicated generation tool reported | `muse.read_file` image input; video frame-extraction guidance is not a native video-understanding acceptance test | No generated artifact |
| Antigravity | **Reported** `invoke_subagent` with advertised `image-generator` type; child can generate/edit according to its description | No direct parent video-generation tool reported | `read_file` description includes image/video/audio; actual type acceptance untested | Child not invoked; internal media contract unknown |
| Claude | No media-model generation tool found in either session | No generation tool found | **Reported** `Read` image/PDF input; connectors read/render existing media. Code drawing and ffmpeg are distinct operations | No generated artifact or new image-understanding acceptance test |
| Codex | **Reported** `image_gen__imagegen`: generation/editing with local or conversation references, plus transparent-background request | No dedicated tool reported | `view_image` and CLI image input reported; no dedicated speech/music/3D generator in the snapshot | No generated artifact |

"Not reported/found" describes these sessions, including their discovery limits;
it is not permanent absence across a provider's products, plugins or APIs.

## Controls, models and output collection

| Provider | Structured controls observed | Media model and output location |
| --- | --- | --- |
| Grok | Image ratios; video duration/resolution/reference fields, many limits only in descriptions. No exact pixel, output-format, destination or media-model input | Actual media model unknown. Descriptions return absolute artifact paths and request short session-relative display links; cwd groups sessions rather than specifying media output |
| Muse | Required prompt; optional local reference array. No structured size/ratio/format/alpha/output count in the reported definition | Tool implementation/backend model unknown. Description says `generated_images/`; absolute location, output format/dimensions and result shape untested |
| Antigravity | Parent required `TypeName`, `Role`, `Prompt`; optional `Model` and `Workspace` | `Model` is child reasoning tier. `Workspace` is isolation mode, not destination path. Child's actual media tools/model/size/format/reference/alpha controls unknown |
| Claude | Read input fields, not generation controls | No separate media generator exposed; API vision limits do not become Read schema bounds |
| Codex | Required prompt; optional reference paths or recent-image count; optional transparent-background boolean | No tool-level media-model/size/format/count/destination field. Recent-image maximum 5 is a description rule. Actual alpha and media backend unknown; bundled/API fallback has a different credential/control surface |

For Grok, the driver independently compared the latest native `tool_definitions.json`
snapshots of both exact sessions. All four media functions have identical complete
`parameters` objects and `description` strings. No cwd/workspace/output directory
or filename property is declared. Omitted `additionalProperties` does not prove
the backend rejects undocumented fields; none were tried.

Bundled Grok session documentation independently specifies
`~/.grok/sessions/<encoded-cwd>/<session-id>/`. The observed generated image's
parent contains the encoded cwd. Its location therefore does not by itself show
that cwd was omitted or ignored. `GROK_HOME` changes a storage base, not a
per-generation output directory. Runtime must collect returned artifacts; Platform
retains/exports works; Studio consumes the permitted SDK result. Export or copying
to a workspace is a separate operation, not an invented native output argument.

Grok ZDR video additionally documents a user-hosted bucket and
`tools.zdr_video_output_s3`. Current account settings, bucket details and video
return behavior are untested. The other sessions' pricing/privacy/API lifecycle
statements are not adopted as Studio account guarantees.

## Real artifact and source changes

The owner-selected Grok 4.7 / xhigh Chat session invoked `image_gen` once with the
same orange-cat prompt and `aspect_ratio: 1:1`. Independent decoding established:

| Property | Result |
| --- | --- |
| Image | Orange seated cat, light blue background, no visible text |
| Encoding / dimensions | Complete JPEG, 1024 x 1024 |
| Bytes | 85,413 |
| SHA-256 | `6a4fe15907ac11becbc892029dd78cbf40c00590c82826ae638df5b93965867e` |
| Backend model / media cost | Unknown |

Original bytes replaced the **source** Studio sample. Runtime's existing
`grokSingleImage` profile now selects `grok-4.7 / xhigh`, retaining the single-round,
image-only, no-retry bounds. Focused invocation assertions cover this selection.
This is not a claim that xhigh improves the image backend, nor a new paid run
through Studio's bounded HTTP/SDK collector.

The changed source sample passed the package test, exact-byte archive inspection
and isolated Platform/SDK browser fixture with zero CLI calls. Runtime's focused
image suite, build and catalog checks passed. No version, published package,
Desktop pin or installed profile was changed for this research delivery.

## Failures and comparison limits

Muse's two full first questions and Antigravity's two full first questions hit
the same reported post-initial-response 30000ms idle refusal. All four answered
the shorter no-tools inventory. Both Muse models completed schema follow-ups;
Flash completed its detailed follow-up. Argon's first detailed follow-up failed,
then its owner-requested focused retry succeeded in 32.671 seconds with no tools.
The evidence does not establish why shortening or retrying changed the outcome.

Within each pair the successful core inventories agree. There is no demonstrated
model-dependent media-tool entitlement difference. This supports testing lighter
agent models rather than requiring a frontier label. It does **not** establish
equal generation quality, reliability, latency or cost, or make effort irrelevant:
the four new provider pairs held effort fixed, and the Grok pair changed model
and effort together. Most paths have not generated an artifact.

The Desktop automation checks also learned to verify actual user-message dispatch
and composer clearing, and to wait for transcript identity after navigation.
Stale UI projection alone is not a reason to resend a completed request.

## Implications and remaining evidence

Studio currently implements one native Grok square-image operation. Research does
not enable the other providers in its production capabilities. `grok/native`
identifies provider/instance, not a media model.

Use operation-specific execution profiles plus current configured availability.
Only expose controls supported by that route; distinguish configured, defined
and artifact-verified states. Keep agent model/effort separate from the media
backend and do not build a media-model list from the chat model catalog. Existing
Runtime capabilities are a configured view, not an authentication/quota smoke test.

The next useful evidence is a deliberately bounded image case for selected Muse
and Codex configurations, an explicitly visible/bounded Antigravity child route,
then selected edit/video cases where supported. Claude remains a preparation/QA
candidate on this evidence. Each requires its applicable generation/input budget;
this summary does not authorize new provider calls or implement a new UI.

Output accessibility is tracked in [Runtime #177](https://github.com/cats-inc/cats-runtime/issues/177).
Composer observations are separate product issues:
[height reset #296](https://github.com/cats-inc/cats-platform/issues/296) and
[chip positioning #297](https://github.com/cats-inc/cats-platform/issues/297).
These issues were recorded; this research delivery does not fix or close them.

## Detailed evidence

- [Grok capability inquiry and cwd/output follow-up](2026-10-23-grok-media-capability-probe.md)
- [Grok 4.5 / Low comparison and raw-definition follow-up](2026-10-23-grok45-low-media-probe-comparison.md)
- [Grok 4.7 / xhigh replacement sample and fixture validation](2026-10-23-grok47-xhigh-studio-sample.md)
- [Eight sessions: Muse, Antigravity, Claude and Codex](2026-10-23-eight-session-cli-media-probe.md)
- [Historical five-CLI report](2025-09-12-five-cli-media-final-report.md) (versions/raw receipts absent; not a current contract)
- [Runtime profile evidence](../../../cats-runtime/docs/research/2026-10-23-grok47-xhigh-studio-sample.md)
