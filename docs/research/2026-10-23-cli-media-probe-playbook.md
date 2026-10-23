# CLI media capability probe SOP

Last updated: 2026-10-24. Scope: repeatable research for extending cats.studio.
This is a research procedure, not an approved implementation or release plan.
Current findings are in the [Studio CLI summary](2026-10-23-studio-cli-media-probe-summary.md).
The first application is the [Grok Desktop inquiry](2026-10-23-grok-media-capability-probe.md).

## Run preparation

Use one visible conversation per requested provider/model/effort configuration.
The initial inventory is read-only. A request to probe or compare models is not
itself permission to generate a matrix of images/videos, change account settings
or spawn hidden workers. Apply any generation authorization already given in the
session without requesting it again; record its actual limits.

Prepare this case card before dispatch. Unknown values remain unknown:

```text
case_id / date / timezone / operator:
purpose / requested operation:
OS / Cats version / CLI version and how measured:
entry surface / transport / provider / execution instance:
requested model label / picker option value / effort:
Runtime resolved model / controls / upstream attestation if available:
conversation / Runtime session / native session identifiers (private):
cwd / storage mode (private values; sanitize published notes):
tool origin: CLI | bundled skill | MCP/plugin | host | unknown
scope: read-only discovery | chosen artifact case | installed acceptance
allowed generation budget / retries / delegation / deadline:
private evidence directory / sanitized research destination:
```

Record opaque picker entry IDs separately from the resolved execution model.
Antigravity's observed `-low` entry IDs resolved to `-high` with the high effort
control. Runtime routing metadata is still not an upstream model attestation.
Do not select a media model by copying an agent model ID into an unrelated tool.

## Evidence to preserve

Record each claim separately. These are distinct evidence types, not automatic
promotion steps:

| Evidence | What it establishes | What it does not establish |
| --- | --- | --- |
| Model answer | What this agent reports in this session | Actual tool schema, availability or successful execution |
| Current tool definition | Exposed input contract and advertised controls | Entitlement, backend acceptance or actual output dimensions |
| Installed/vendor documentation | Documented intent for its specific version and route | Current session visibility or execution success |
| Tool invocation and result | The attempted arguments and returned success/failure | Valid bytes, complete output or successful enclosing turn |
| Independently measured artifact | Actual dimensions, duration, streams and file format | All advertised settings or repeatability |
| Installed Studio acceptance | The App/SDK/host/Runtime path works for the observed case | Other CLI routes, operating systems or privacy modes |

Every capability record should include date, provider/CLI version when observed,
OS, entry point/transport, agent model and effort, media-model identity when
reported, precise tool name, source of each constraint, and unresolved conflicts.
Unknown is different from unsupported. An empty tool search proves only that the
search did not expose a tool on that route.

Keep raw screenshots/transcripts and user-specific paths outside Git. Store only
sanitized findings and reproducible prompts here. Do not read credentials or
change privacy, plan, storage or credentials as a probing shortcut.

Before reading a native transcript, define the evidence whitelist in the reader:
relevant assistant answers, matching tool-use/result records and selected
execution/status fields. Exclude system prompts, expanded user instructions,
reasoning and image base64 **before** printing or saving anything. Runtime user
history can contain dynamically injected authorization instructions; filtering
only after a raw history dump is too late. Never print a whole user-message or
inspection object to learn its shape; inspect property names first. Apply the
same whitelist to private evidence files, not only to committed notes.

## Procedure

1. Start through the surface the owner wants to validate. For Cats Desktop,
   inspect the real renderer, click **+ New Chat**, and verify provider, model
   and effort before sending. Retain the inquiry as requested user work. A
   separate terminal run measures a different route and must be identified as
   such. Do not replace this with an undisclosed child model invocation.
2. Start with the short no-tools inventory below. Ask about all media categories,
   not just historical names. If inventory is partial, split the full prompt into
   operation-specific questions. Preserve the independent first successful answer
   before revealing the other model's findings.
3. Challenge the result with exact fields, defaults, enums, bounds, descriptions
   and missing controls. Retrieve definitions through read-only discovery where
   available. Prefer an exact-session persisted tool definition over a model's
   reconstructed schema. Extract only relevant definitions; do not archive auth,
   private config, system prompts or whole home/session directories. Check the
   output-location contract separately using the prompt below. Keep conflicts open.
4. Only within the owner's generation authorization, run a bounded artifact
   test for each chosen operation. Fix tool-call count, image count, duration,
   resolution, timeout, cancellation and retry policy before dispatch. Enforce
   budgets in the runner where supported; natural-language instructions and
   parallelism limits are not enforcement. Record a UI route's lack of a hard
   invocation cap rather than silently substituting a different CLI route or
   claiming a prompt imposed a mechanical bound. A timeout or cancellation can
   leave a paid artifact, so inspect that attempt before retrying.
5. Measure the exact returned file. For images record signature, bytes, format,
   width, height, frame count and digest; inspect the image. For video record
   container, codec, dimensions, duration, frame rate and audio streams with
   ffprobe or equivalent, and inspect representative frames. Preserve input
   lineage. Never infer pixel dimensions from a label such as 720p alone.
6. Translate supported operations into Studio controls only after identifying
   the required Runtime collector and host/SDK contracts. Native CLI ability
   does not automatically make the operation available to the current App.
7. Finish the case with its actual status and limitations. Verify the intended
   user message was sent, the enclosing turn finished, and no unsent probe draft
   remains. Keep requested research conversations; do not delete the owner's
   work as test cleanup. Close only listeners/helpers created for this run and
   report the retained CDP state. Update the dated findings, summary and indexes.

## Reusable discovery prompt

For long-reasoning or idle-sensitive routes, first use the short inventory prompt
below, then the full discovery prompt in separate bounded questions. In the
[eight-session inquiry](2026-10-23-eight-session-cli-media-probe.md), Muse and
Antigravity's full first prompts hit a 30-second idle refusal; all four answered
the short no-tools question. This does not prove the prompt length caused the
refusal, or justify changing timeout/effort/privacy settings.

```text
本輪只做唯讀盤點，請直接依當前 session 已注入的定義短答，不查外部資料、
不呼叫工具、不生成媒體、不改檔案/設定、不啟動子代理或其他模型。
列出真正可見的媒體生成/編輯/理解工具精確名稱與必填欄位；沒看見就明說，
不要用一般 API、網頁版或記憶補齊。哪些定義明列尺寸、格式、媒體模型選擇
與輸出位置？來源能否證實為 CLI、MCP/plugin、bundled skill 或宿主？
區分定義與推論，控制在600字內；最後列工具呼叫與媒體生成呼叫數（應為0）。
```

For UI automation, separate filling the controlled composer from clicking Send
when necessary. A successful click return is not dispatch evidence: verify the
exact prompt appears as a user message and the composer clears before leaving
the room. When switching rooms, wait for the identifying first user message as
well as the URL; navigation can precede the new transcript render. Preserve unsent
drafts and send the existing draft rather than inserting duplicates. Distinguish
a current stream, persisted room messages and exact Runtime
history when a Desktop revisit temporarily shows a stale typing indicator. Use
read-only diagnostics for those distinctions; do not create turns through an
alternate route as a shortcut.

Replace the bracketed context. Use in an ordinary visible conversation:

```text
我們正在擴充 cats.studio，盤點 [CLI / 版本 / 執行入口] 的多模態能力。
本輪只做唯讀調查：不生成媒體、不上傳內容、不改檔案/設定/privacy，
不呼叫外部付費 API，不啟動其他 CLI 工作階段或子代理。
可以使用唯讀工具發現功能取得當前工具定義；不要只憑記憶。

請用繁體中文列出文生圖、修圖、多圖參考、圖生影片、參考素材生影片、
純文生影片、影片編輯/延長、看圖/影片理解、音訊輸入、語音與音樂生成。
每項區分：當前定義可見、僅文件宣稱、未知/本路徑未開放。
不得把網頁版、一般 API、外掛或本機轉檔當成原生 CLI 等價能力。

對每個工具列出精確名稱與原始介面欄位：型別、required、default、enum、
minimum/maximum、比例、像素/解析度、張數、秒數、FPS、音軌、格式、
輸入路徑/URL/數量/大小限制、輸出位置、是否能選媒體模型。
不存在的參數或未公開的限制請標未知；不要自行補齊。
說明登入/方案/額度、ZDR/privacy/儲存前提與錯誤行為的證據來源。
分開列出推理模型與媒體模型。附來源，明示本輪是否呼叫生成工具。
```

## Reusable challenge prompt

```text
請繼續唯讀，不生成、不改設定、不啟動子代理。
請提供你真正取得的相關工具 schema 節錄，保留 required、enum、default、
minimum/maximum 和描述中的限制，並標清「原始 schema」或「你整理的摘要」。
schema 沒有的限制不要補成預設值。
對照上一輪逐項列出衝突、缺漏及不能證實的答案：
1. 解析度是否為可送入的參數？預設值來自 schema 還是文件？
2. 支援範圍是 schema 約束、描述文字，還是模型推論？
3. 文生影片是一個原生工具，還是先生成圖片再動畫的工作流？
4. 音軌/FPS/底層媒體模型是否有明確欄位？沒有就標未揭露。
5. 工具名稱出現、工具可呼叫、已成功生成，分別有什麼證據？
最後列出本輪真正用過的工具名稱及有沒有媒體生成呼叫。
```

## Output location and delegated-tool prompt

```text
只做唯讀，不生成媒體、不搬移/複製檔案、不改 cwd、設定或 privacy，
不啟動子代理/其他模型，也不讀私人設定或憑證。
請依當前工具定義與相關 bundled 文件，分開回答：
1. 工具有沒有 cwd、workspace、output_dir、檔名或目的地欄位？列型別與語意。
2. cwd 影響 shell、相對輸入路徑、session 分組或媒體輸出哪些部分？
3. Workspace 是隔離模式、路徑還是其他概念？是否保證媒體寫進 cwd？
4. 原生回傳的是檔案路徑、URL、附件、base64 或 job ID？哪些是實測？
5. 指定輸出位置是原生參數，還是生成後另行複製/匯入？不要實作。
6. 若生成只能委派給內建 child，僅列委派 schema 與能力描述；
   不啟動 child。主代理看不到的內部媒體 schema、模型與尺寸都標未知。
7. 遠端儲存/ZDR 是否有另一路徑契約？只查文件，不查目前私人設定。
附來源，分開標原始定義、模型重述、文件、觀察與推論；列本輪工具呼叫。
```

Tool `Model` fields may select a child reasoning tier rather than the media model.
Sandbox write permission is not an output-directory guarantee. A short clickable
display link is not necessarily a cwd-relative on-disk path. Follow the returned
artifact contract, and record collection/export as a separate operation.

## Failure handling and stop conditions

| Observation | Interpretation and next step |
| --- | --- |
| Provider/model/effort unavailable in picker | Record the missing choice and stop that case; do not silently substitute another configuration |
| Tool absent from inventory | Record this route/snapshot as unexposed; distinguish deferred tool discovery, nested agents and external APIs from proven provider-wide absence |
| Generic image-reading tool exists but rejects the selected model | Record an input rejection for this CLI/route/model, preserving the exact tool result. Do not count a successful enclosing report as successful visual understanding, or silently substitute OCR, another model or another API |
| Post-initial-response idle refusal | Preserve exact error, phase and timing. Confirm the turn ended, then try one shorter no-tools question in the same room; keep the model/effort unchanged |
| Focused recovery also fails | Keep capability unknown and report the route limitation; do not loop, lower effort or alter timeout/account policy without scope to do so |
| Tool/schema transcription disagrees | Seek raw definitions and exact documentation; preserve both claims until resolved |
| Generation timeout, cancellation or partial result | Inspect the original attempt's receipt and artifact before any authorized retry; never assume no charge/no output or regenerate to repair collection |
| Successful image tool result followed by failed enclosing turn | Preserve both outcomes; verify the existing file before considering another generation. Muse's Spark case produced a valid PNG before a 30000ms idle refusal |
| Requested shape differs from measured output | Record requested intent, actual arguments where available, and decoded dimensions separately. Muse's square-intent request yielded 1920 x 1280; do not regenerate just to obtain the requested ratio |
| Stale typing indicator or old transcript after navigation | Check identifying user message, persisted room messages and exact-session diagnostics read-only; do not resend an already dispatched prompt |

An idle threshold is not necessarily a total turn deadline. Argon's successful
focused retry took 32.671 seconds despite earlier reported 30-second idle
refusals. This is not proof of why either outcome occurred. Inspect tool
descriptions for hidden delegation: a document fetcher/advisor may invoke another
model even when the intended task is read-only.

## Artifact test card (requires a chosen generation budget)

```text
operation / exact tool:
input fixture and digest:
requested arguments:
max invocations / generated outputs / retries:
timeout and cancellation rule:
privacy/storage policy to preserve:
raw tool result and enclosing-turn status:
returned artifact / signature / bytes / digest:
observed width x height / duration / FPS / audio streams:
visual inspection:
reported text-model cost / separately reported media cost / unknown costs:
result: verified case | rejected | failed | cancelled | outcome unconfirmed
```

Use small deliberate cases: one square image, one edit of that exact image, then
one short video from that image. A later matrix can vary ratios, resolutions,
length and reference count one dimension at a time. Do not batch every setting
on the first run or silently retry an expensive failure.

The [three-provider image follow-up](2026-10-23-three-provider-image-artifact-probe.md)
also demonstrates receipt gaps: Muse's normalized tool arguments were empty,
Codex's image generation lived inside native `exec`, and Antigravity's generation
was inside a child transcript. Use exact-session relevant native records when
needed, filtering out model thinking, credentials and unrelated context. Do not
reconstruct absent arguments or treat a parent-only tool count as the media count.

## Comparing model/effort configurations

Use a fresh visible conversation per configuration and verify the selected model
and effort before dispatch. Keep the discovery prompt and historical baseline
the same except for identifying context. Collect the independent first answer
before revealing the other configuration's findings. Challenge unclear claims
against their sources and distinguish an omitted answer from an unavailable tool.

After a picker change, close it and confirm the settled chip before Send; then
confirm the resulting Runtime binding independently. Exclude a mismatched route
from the requested-model comparison. The 2026-10-24 cross-CLI inquiry observed
an intended Copilot selection produce a Cursor binding on its first dispatch.

For image understanding, classify the input path separately: native image/binary
receipt, host-provided caption/description, model-input rejection, or unknown.
Cursor's native `imageDescriptions` record demonstrates why an accurate answer
alone does not prove the selected model received pixels. Count task tool calls
separately from CLI/Runtime input delivery: Copilot read temporary prompt text
files before the requested image read. Raw native assistant history can also
flatten reasoning and final text; use final-channel evidence and targeted tool
records instead of printing that whole projection.

A stored image payload still does not prove visual understanding: Cursor/Kimi
retained the correct fixture bytes while the agent reported no perceptible
visual content. Preserve both observations and mark the visual task unavailable
or unsuccessful. Do not silently retry or add a caption/OCR fallback, or infer
that a successful generation tool makes the same model's image input work.

Compare inventory, exact schemas, description-only constraints and source
provenance separately from answer detail. A schema difference needs evidence from
both sessions; incompatible model statements alone do not establish one. Changing
model and effort together compares the two configurations, not the isolated effect
of either factor. Text-only inquiry does not compare generated media quality.

## Ownership and interpretation

Publish one sanitized case record and an operation matrix, with links to detailed
findings. Use these explicit outcomes rather than a single supported boolean:

| Outcome | Minimum evidence |
| --- | --- |
| Reported | Model says a capability exists; no independent definition |
| Defined | Current relevant tool declaration independently inspected |
| Documented | Installed/vendor documentation claims a route; not current execution |
| Executed | Matching invocation/result and completed enclosing turn |
| Artifact verified | Exact output bytes and properties independently measured |
| Installed acceptance | Intended App/SDK/Runtime route tested at its installed boundary |
| Unexposed / unknown / failed / cancelled / outcome unconfirmed | Preserve the specific state and reason; do not collapse them into unsupported |

Keep description-only limits distinct from schema validation. Record requested
size separately from measured pixels, agent model separately from media model,
and text-model usage separately from media charges. One artifact verifies one
case, not a success rate or all parameter combinations. A timeout/recovery pair
does not isolate the effect of prompt length, model or effort.

Apps owns the product inquiry and Studio control proposal. Runtime owns provider
execution contracts, budget enforcement and native artifact collection; new
adapter fixtures should be retained in Runtime. Platform owns App SDK, retained
works and installed Desktop acceptance. This playbook does not expand the
single-image contract of the current Studio release.
