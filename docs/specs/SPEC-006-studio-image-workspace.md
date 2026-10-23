# SPEC-006: Studio image workspace

## Metadata

| Field | Value |
| --- | --- |
| Status | Draft — 可交接的規劃基線；A3a（SDK 1.x 上的新 UI）已實作，其餘未實作；皆未發布 |
| Owner | cats-apps；Runtime／Platform 各自擁有執行與 SDK／保存契約 |
| Reviewer | 後續跨 repository 實作／設計 review；本次未做獨立 review |
| Decision | [ADR-004](../decisions/004-expand-studio-with-verified-image-profiles.md)、[ADR-005](../decisions/005-provider-first-studio-image-operations.md) |
| Plan | [PLAN-006](../plans/PLAN-006-studio-image-workspace.md) |
| Baseline | [SPEC-003](SPEC-003-media-studio-vertical-slice.md) 的已交付單 Grok 圖片功能 |

## Summary

把 `cats.studio` 改為「先選服務，再做它能做的事」的圖片工作區：選定服務後，只出現該
服務已啟用的操作（生成、修圖、合成），以及該操作宣告的輸入與參數。結果以大型預覽
呈現實際格式與量測尺寸，並保存成作品；作品可以複用描述，或當下一次修圖／合成的
來源。候選服務為 Grok、Muse、Antigravity、Codex；每個「服務 × 操作」各自通過
bounded execution 與收集驗收後才可使用。新 UI 先在 SDK 1.x 上交付（只會出現 Grok
生成），contract 2 由各 owner 凍結後再接上。

## Goals and non-goals

- 服務、操作、代理模型／effort 與圖片實際規格有清楚而不混淆的呈現。
- 開啟、切換服務或操作、套用範例、選原圖、複用描述、刷新、重開都不生成；只有明確的
  生成操作（生成圖片、修改圖片、合成圖片、再生成一張）建立一個 attempt。恢復原
  attempt 與建立另一張圖片是不同操作。
- 修圖與合成的來源只來自已保存作品，結果是新作品並記錄來源；原圖不變。
- 原有 Grok 作品、原始 bytes、既有 task/run/artifact 與離線讀取保留。
- 本期不做：本機檔案匯入／拖放、遮罩或筆刷局部重繪、影片／音訊、批次、多服務同時
  生成、佇列、排程、種子／精確像素／品質選項、自動翻譯／改寫提示詞與版本樹 UI。
  作品刪除已納入（2026-10-23 使用者決定）：見下方作品卡與 AC-14。不要以尚不可用的按鈕或「即將推出」標籤占據主介面。
- 不修改 Chat composer 問題；那些是既有獨立 issues。這份規劃不改 App 安裝／Market
  架構，不發布或安裝任何版本，也不增加研究生成額度。

## Evidence and initial execution configurations

以下是初始 profile 的建議設定，不是圖片 backend 的 model ID，也不保證本機可用：

| Provider label | Agent configuration | 生成的比例模式 | 已觀測原檔；不可當預設值 |
| --- | --- | --- | --- |
| Grok | `grok-4.7` + `xhigh`，非 Fast | `choose`：自動、1:1、16:9、9:16、3:2、2:3（今日 production 固定 1:1） | 1024 × 1024 JPEG |
| Muse | `muse-spark-1.3` + `xhigh` | `service`：構圖寫在提示詞 | 1920 × 1280 PNG |
| Antigravity | `gemini-3.8-flash-high` + `high` | `native` 1:1 | 1024 × 1024 JPEG |
| Codex | `gpt-6.1-sol` + `xhigh` | `service` | 1254 × 1254 PNG |

修圖與合成的候選宣告（全部尚未實產）：

| Provider | 修圖（一張原圖） | 合成（多張參考） | 其他參數 |
| --- | --- | --- | --- |
| Grok | `image_edit` 單圖，`source`：沿用原圖比例，比例參數不適用 | `image_edit` 多圖，`choose`：另加 4:3、3:4、2:1、1:2、19.5:9、9:19.5、20:9、9:20 | 參考圖會先縮到長邊約 768 px |
| Muse | `image_paths` 一張 | `image_paths` 2–50 張，有順序 | 無 |
| Antigravity | 子代理描述提到修圖；引數未知 | 未發現，不提供 | 無 |
| Codex | reference paths 一張 | 多張 reference paths | `transparent_background`（生成、修圖） |

Muse 的圖片完成後，回合因 30000ms idle refusal 失敗。Antigravity 只核實 child 的
一組 `generate_image` 引數，完整 schema 未知。Codex 的呼叫在 native `exec` 內。
詳見 [實產報告](../research/2026-10-23-three-provider-image-artifact-probe.md) 與
[Grok capability probe](../research/2026-10-23-grok-media-capability-probe.md)。
Claude 不列入本期生成服務；不得把未暴露工具解讀成 provider 永久不支援。

## User stories

- 我先選一個已設定的服務，畫面只顯示它能做的操作；切換服務不會改動我的草稿。
- 我能描述畫面並明確生成一張，知道正在做哪個階段。
- 我能選一張作品當原圖修改，或依序選多張作品合成；任何服務做的作品都可以用。
- 我能看到圖片真正的尺寸、格式與透明度，放大、下載原檔，下次開啟仍能找到它。
- 若回應逾時但圖片已保存，我能直接使用它，不必再按一次生成。

## Workspace and visual handoff

以下定義資訊層級與互動。設計者沿用 Cats 的 light/dark theme 和繁中／英文語系；可重排
留白、卡片與作品縮圖，不能變更狀態語意。

```text
（外殼：應用程式／Studio／副標            返回大廳；下方套件、版本、狀態、提供者）
選擇服務
[▣ Grok  比例可選 | 生成 修圖 合成] [⬚ Muse  由服務決定 | …] [□ Antigravity …] [⬚ Codex …]
┌ {服務} 能做的事（約 300–380px） ┐ ┌ 結果預覽（剩餘空間）                      ┐
│ [生成][修圖][合成]  只列已啟用的操作 │ │ 狀態、描述摘要、服務與操作                  │
│ 原圖／參考圖（修圖、合成時）        │ │ 按原比例顯示；保存後才標實測像素尺規        │
│ 描述（2000 code points）          │ │ 格式、尺寸、比例、透明度                    │
│ 比例（依模式）、透明背景（若宣告）  │ │ 放大檢視、下載原檔、以此修圖、複用描述      │
│ 代理設定（進階）                  │ │ 生成資訊按需展開                            │
│ [生成圖片｜修改圖片｜合成圖片]      │ └─────────────────────────────────────────┘
└──────────────────────────────┘
作品：搜尋描述／服務篩選／狀態篩選 → 依原比例的縮圖與進行中的工作
```

| 區域 | 必須呈現與行為 |
| --- | --- |
| 頁首 | 由 Desktop 的 App 外殼提供名稱、副標、返回大廳與版本；Studio 不重複，只保留給輔助技術的 `h1`。不放占據首屏的宣傳 hero |
| 選擇服務 | 每個服務一張可按的卡：友善名稱、比例模式圖示與一句說明、已啟用的操作名稱。多個 execution instances 時加使用者可辨認的 alias；只有一個時不展示 `native` 等 raw ID。已實作但暫不可用的服務顯示不可選原因；未實作的不列出 |
| 操作 | 只列所選服務已啟用的操作，附一句用途說明。切換操作保留描述；切到修圖時只保留第一張已選來源 |
| 原圖／參考圖 | 從已保存作品挑選，縮圖依原比例。修圖恰好一張；合成至少兩張、顯示選取順序，上限依 profile。沒有作品時提示先生成一張。已選來源排在最前面 |
| 描述 | 必填、2000 Unicode code points；保留換行。靈感捷徑只在生成時出現，只更新草稿並把焦點放回輸入，不呼叫模型 |
| 比例 | `choose` 顯示按鈕（短清單）或下拉（長清單）；`native` 顯示固定比例；`service` 顯示「由服務決定」；`source` 顯示「沿用原圖比例」與原圖尺寸。每次一張。沒有像素／格式／品質的假選單 |
| 透明背景 | 只在 profile 宣告時出現的勾選框，說明「這是要求；保存後檢測是否真的含透明像素」 |
| 代理設定 | 進階區標「代理模型」「推理強度」，說明這不是圖片模型。只有一組核准設定顯示文字，多組才有 selector；effort 僅能選該模型允許的組合 |
| 送出按鈕 | 文案依操作：生成圖片／修改圖片／合成圖片。描述空白或超長、來源張數不符、服務不可用、送出未確認、已有執行時不可再次送出。Enter 換行；不新增自動送出捷徑 |
| 使用說明 | 簡短說明使用所選 CLI 帳號與額度、每次一張、不自動重試；不顯示推測價格、免費承諾或虛構進度百分比 |
| 結果區 | `object-fit: contain`，不裁切／拉伸／重編碼。保存後才在圖的邊緣顯示量測寬高尺規；生成中只畫虛線框。sample、執行中與已保存作品視覺可區辨 |
| 作品卡 | 縮圖或工作狀態、描述摘要、服務與操作、尺寸格式或時間。成功提供預覽／下載／修圖／複用描述；失敗保留描述與原因並提供「再生成一張」；待確認提供「確認結果」。host 提供 `images.delete` 時，已保存、未完成、已取消可「刪除」：已保存作品先以 App 內對話框確認（原圖一併刪除、無法復原），其他直接刪除；進行中與待確認不可刪 |
| 資訊詳情 | 描述、服務與操作、提交時代理設定、要求比例、來源（基於哪幾張）、bytes、圖片模型與媒體費用（未回報則顯示未回報）、生成回應結果。不呈現來源絕對路徑／token／session ID |

比例模式在服務卡與比例列使用同一套圖示：多個實線框＝可選、單一實線方框＝服務固定、
虛線框＝由服務決定。量測尺規使用與操作色不同的單一強調色，只在已保存作品上出現。

桌面約 960px 以上採雙欄，窄版依序呈現服務、建立、結果、作品；不出現水平溢出。
1078 × 632 的實際 Desktop viewport 應能直接看見服務、操作與描述；較短畫面允許
設定區捲動，不能讓按鈕或 chips 覆蓋輸入／結果。至少檢查 1280 × 800、1078 × 632、
768 × 1024、360 × 800。舊版圖片 library 不能因新尺寸變成固定正方形裁圖。

所有控制項有 label／keyboard focus；服務與操作按鈕使用 `aria-pressed`。對比、dark
theme、文字放大和 reduced motion 必須可用。狀態使用溫和的 live announcement；每次
polling 不可重複朗讀整份列表。放大預覽支援 Escape、關閉後焦點返回觸發按鈕。Blob URL
在切換／離頁時釋放；縮圖依可見範圍延遲載入，不一次解碼全部 100 張原檔。

## Capability and selection requirements

| ID | Requirement |
| --- | --- |
| CAP-01 | Runtime 是可執行 profiles、操作與代理選項的唯一來源；Studio 不另存 provider/model 白名單、不複製聊天 model catalog |
| CAP-02 | profile 綁 operation、provider/native transport、允許的 agent configurations、輸入張數、options、限制、工具／delegation 規則、收集／解碼版本及 evidence reference |
| CAP-03 | 未實作／無法限制的「服務 × 操作」不可列出；已實作但未安裝、未設定、停用、暫不可用可顯示清楚不可選原因 |
| CAP-04 | capability GET 只讀設定／已知可用性，不執行模型、不登入、不查憑證、不產圖。`available` 表示可接受提交，不保證額度或 entitlement |
| CAP-05 | 選擇值必須是 target、profile、operation、agent config 的有效組合。`grok/native` 不能出現在「圖片模型」欄位；Antigravity child 的 Model tier 不是 Imagen/Veo 選項 |
| CAP-06 | capability 變更或服務失聯保留草稿、來源與可辨認的選擇，不悄悄換服務、操作、model、effort 或 Fast。按下送出時重新驗證；設定過期就拒絕並要求重新選擇 |
| CAP-07 | 首次沒有偏好時選可用 Grok 的生成；不可用則要求選擇其他可用服務，不自動呼叫替代服務。沒有可用服務時仍可看保存作品 |
| CAP-08 | 表單只提交 profile 宣告的 options：`aspectRatio` 必須在該操作的 enum 內，`native`／`service`／`source` 模式時省略；`transparentBackground` 只在宣告時提交。不提交 size／model 等猜測欄位 |

## Operations and sources

| ID | Requirement |
| --- | --- |
| OP-01 | 操作詞彙：`image.generate`（0 張來源）、`image.edit`（恰好 1 張）、`image.compose`（2 張以上，上限依 profile）。其他操作不在本期 |
| OP-02 | 來源是同一 App／account 已成功保存的作品 ID；renderer 不傳路徑、URL 或 bytes。順序有意義，提交與保存都保持順序 |
| OP-03 | Platform 驗證每個來源的 App/account/version 權限與存在性，取得保存的原檔與 SHA-256；不存在或被撤銷時回 `source_unavailable` |
| OP-04 | Runtime 依 profile 把來源轉成服務接受的輸入形式，放在本次 attempt 的受管位置，做 containment／大小／格式檢查；不符合宣告時回 `source_unsupported`，不偷偷轉檔或縮圖 |
| OP-05 | 結果永遠是新作品；原圖不修改、不覆蓋。Job 保存操作與有順序的 `{id, sha256}` 來源快照 |
| OP-06 | 冪等性：同一 requestId 的 canonical payload 包含 operation、來源 ID 順序與 options；任一不同即 conflict |
| OP-07 | 跨服務來源允許；能否使用由目標 profile 的輸入限制決定，不由產出服務決定 |
| OP-08 | 每個「服務 × 操作」各自需要 AC-10 的 bounded-route acceptance；修圖／合成不繼承生成的證據 |

## Proposed contract 2 — owner handoff, not an existing SDK

以下名稱是跨 repository 的具體設計基線。A0 需由 owners 一起凍結型別與 error codes，
並記錄在 Runtime／Platform 自己的 successor 文件；不可把這些欄位直接傳給現有 SDK
1.x。現有 source SDK 1.5.0 的 images API 仍是 Grok／JPEG schema 1。

| Data / operation | 必要內容 |
| --- | --- |
| `images.getCapabilities()` | `schemaVersion: 2`、能力 revision；`targets` 內含 opaque target ID、provider、instance label、availability/reason；`profiles` 內含 ID/revision、operation、可用 target/config 關係、代理 label/resolved ID/effort、`inputs: { min, max }`、`aspectRatio: { mode, options? }`、`transparentBackground?: true`、limits |
| `images.submit(input)` | exact typed payload：`requestId`, `targetId`, `profileId`, `profileRevision`, `agentConfigId`, `operation`, `prompt`, `sourceIds`（generate 時為空陣列）, `options`。options 只允許 profile 宣告的 `aspectRatio`（enum 內）與 `transparentBackground`。不可傳 raw CLI args、API URL/key、cwd、路徑或 destination |
| `images.delete(id)` | 刪除已保存／未完成／已取消的工作：Core 紀錄、保存的原檔與 Runtime receipt（Runtime 離線時盡力而為）；進行中或待確認回 409 `image_not_deletable`；從不生成。SDK 1.x 先以相容方式加入，Studio 以功能偵測決定是否顯示 |
| `images.list/cancel/refresh` | 方法用途沿用；回傳 schema 2 jobs。`refresh` 只查原 receipt／重新收集原檔，不 POST 生成。cancel 作用於整個父子樹 |
| Job identity/config snapshot | request/job IDs、provider/instance label、operation、profile/revision/config、提交時 requested/resolved agent model/effort、prompt、有順序的來源 `{id, sha256}`、要求的 options、timestamps。快照不可隨 catalog 更新而改寫 |
| Job lifecycle | `submitting/running/collecting/succeeded/failed/cancelling/cancelled/interrupted`；使用者取消意圖、safe error、warnings，以及獨立的 provider `executionOutcome`（含未知） |
| Output | 至多一張：verified `image/jpeg` 或 `image/png`、bytes、width、height、SHA-256、量測的 transparency（opaque/has-transparency/unknown）。圖片模型與媒體費用可為 null；未回報不當作零 |
| `images.read(id)` | verified original ArrayBuffer + actual MIME；不回傳檔案路徑、provider URL、raw transcript 或憑證 |
| `images.export(id)` | host 決定安全檔名及 JPEG/PNG 副檔名；輸出與保存原檔 byte-identical，不因預覽大小重新壓縮 |

新增 safe error codes 提案：`source_unavailable`、`source_unsupported`、`source_count_invalid`、
`option_unsupported`。Platform 先持久化完整 canonical request，再以 App/account/requestId
派生固定 Runtime ID。相同 ID、相同 canonical payload 回傳原 attempt；任何設定／描述／
來源／options 改變皆 conflict。trim 外圍空白，保留內部文字與換行；不得偷偷翻譯、改寫
或改配置後重送。Runtime HTTP／internal types 採相同語意；具體 routes 與 typed
projections 由 A0 一起更新，保留既有 auth、CSRF、package digest 與 account/App/version 授權。

## Execution, collection and recovery

| ID | Requirement |
| --- | --- |
| EX-01 | 每個 explicit request 只允許一個 native parent attempt、一次媒體生成、零自動重試／fallback；Antigravity 允許一個 `image-generator` child，禁止 child 再委派。適用於每個操作 |
| EX-02 | 生成前必須能強制工具、delegation、媒體次數與 deadline。不得只以提示詞、事後驗收或「第一張收到了就算成功」充當機械限制。能力不足的「服務 × 操作」保持不可用並記錄原因 |
| EX-03 | 延續一個全域 image active slot、每 App/account 一個 active job、無 queue，並接既有 selection／pool／metering／shutdown。Antigravity child 算在父 attempt 的工作與取消邊界內 |
| EX-04 | 初始上限：prompt 2000 code points、全 attempt 含 child/收集 5 分鐘、受管事件輸出 2 MiB、單圖 8 MiB／4,000,000 pixels／單邊 4096。來源各自套用同樣的單圖上限。這是接受上限，不是可選生成尺寸；不因超標自動轉檔／縮圖再冒充原檔 |
| EX-05 | 記錄原生 session/tool call/result 的 exact correlation，包含 parent-child chain 或 nested exec。filename、mtime、assistant 自述、cwd 目錄猜測均不足以證明來源；不得廣掃 provider home 或讀 model thinking |
| EX-06 | 對 matching result 指定來源做 realpath／containment、regular file、symlink/hardlink、讀取前後穩定性、大小與完整解碼檢查；收集 roots 由可信 profile/runtime 決定，renderer 不可控制。不可從任意 assistant 路徑讀檔 |
| EX-07 | 檢查格式 signature、完整 PNG/JPEG decode、尺寸、bytes/hash、單圖數量、alpha 量測。native 媒體模型只在實際回報時記錄；代理設定與 media cost 分開，保留未知 |
| EX-08 | 不同 provider 的 idle/progress 行為由 media profile 處理；不可為此全域放寬 Chat timeout。圖片結果完成後 final prose 缺失不應觸發另一張生成 |
| EX-09 | 只在原執行已安全結束、無取消、工具與來源合規、驗證與 atomic persistence 成功後發布作品。回合 failed 但原圖符合上述條件，可 job succeeded + executionOutcome failed + warning `response_timeout_after_image` |
| EX-10 | 缺 matching evidence、超出工具數、來源不明、解碼失敗或取消時不套 EX-09。未知結果保持 interrupted；refresh/reopen 只能讀原 attempt，不補跑 CLI |
| EX-11 | 輸入來源只從 Platform 提供的保存原檔複製到本次 attempt 的受管輸入位置；attempt 結束後清理，不把 provider 讀取權擴大到其他作品或目錄 |

2 MiB 是受管結構化事件／text budget，不應直接把 large inline base64 混入無界日誌。
若某 CLI 在傳輸層內嵌圖片，adapter 必須有可證明有界的 binary 處理及獨立 8 MiB
限制；做不到即不啟用，不能直接提高 stdout cap 或截斷到無法建立 tool correlation。
原生 provider transcript 可存在其自有目錄，但 collector 只讀原 attempt 的有界必要
部分，不能把整份 system context／thinking／帳號資料保存成 Studio receipt。

## UI states and actions

| 情境 | 顯示與允許動作 |
| --- | --- |
| 尚無作品 | 已標明來源的既有 Grok sample 或空預覽；換提示詞不修改 sample，不視為新生成。修圖／合成的來源區提示先生成一張 |
| 正在送出 | 顯示所選服務、操作與描述快照；禁止第二次送出；遺失 response 保留同一 requestId，只能以相同 payload 確認 |
| 生成中 | 可顯示 elapsed time／實際階段及取消；不顯示虛構完成百分比或剩餘秒數 |
| 正在保存 | 說明正在保存圖片，不當作需要再生成；取消仍優先於尚未發布的成功 |
| 已保存 | 顯示實際格式／寬高／比例／透明度與量測尺規，預覽／放大／下載原檔／以此修圖／複用描述可用 |
| 已保存且回應逾時 | 圖片正常可用；一則非阻擋警示「圖片已保存，但生成回應逾時。」詳情保留執行結果，沒有自動重試 |
| 失敗、沒有可用圖片 | 保留描述和 provider-specific safe 原因；使用者明確按「再生成一張」才建立新 requestId，可能再次使用額度 |
| 結果待確認 | 顯示「確認結果」；只讀取原 attempt。禁止把相同 request 視為未送出並自動重建 |
| 正在取消／已取消 | 等父子程序結束；取消網路失敗可重送取消，不能重送生成；不承諾退還額度 |
| 來源不可用 | 已選來源被撤銷或不再存在時移出選取並說明；不以其他作品替代 |
| Runtime 離線／服務不可用 | 草稿保留、新生成停用、既有已保存圖仍可讀／下載；capability refresh 不觸發帳號 probe |
| 保存失敗／磁碟滿 | 保留原 receipt 與可恢復來源；確認結果只做 collection，不再生成 |

建立與草稿是不同狀態：執行中的 config/prompt/來源不可變；可編輯下一份草稿，但 active／
未確認 attempt 解決前仍禁止另一筆提交。使用者選了舊作品後，背景 polling 不得偷換
預覽；明確提交新工作時才把結果區切到該工作，避免新描述搭配舊圖片。篩選作品或
返回頁面不取消既有執行。篩選是目前 App/account 至多 100 jobs 的本地視圖，不假稱
有無限歷史；保存上限延續既有政策，不自動刪舊作品。

## Persistence, compatibility and security

- Runtime 保留至多 500 receipts，Platform 至多 100 jobs/App/account；原圖存在可變
  data roots，與 immutable App package 分離。不得依目前 renderer 版本重寫歷史的
  agentModel、effort、圖片規格或來源。預覽與匯出同樣驗證 App/account/version 權限。
- 被當作來源的作品仍受同樣保存上限。作品刪除後，以它為來源的作品保留，「基於」顯示
  已不在作品列表；已選為草稿來源的作品被刪除時移出選取並說明。撤銷或遺失必須以
  `source_unavailable` 明確失敗。
- Host bridge 一次只處理一個 image 呼叫，且同一方法 500 ms 內重複呼叫會回
  `image_service_busy`。Studio 以單一佇列呼叫所有 `sdk.images` 方法、同一方法至少間隔
  550 ms，預覽讀取優先、捲出畫面的縮圖讀取略過；使用者操作在背景輪詢期間會等待而不是被丟棄。
- 新 schema 2 的 migration 分別由 Runtime／Platform owner 執行：先驗證 schema 1、
  備份、建立並驗證新檔、atomic replace、失敗保留原檔。保留 IDs、Core 關聯、prompt、
  timestamps、hash、bytes、既有 JPEG；舊作品的 operation 記為 `image.generate`、來源為
  空。不明格式 fail closed，不清空資料。重啟冪等；舊 running/interrupted 不重新生成。
- 歷史配置無法還原時標 unknown／historical，不把目前 Grok 4.7/xhigh pin 套到先前
  Fast/Low 作品。原先 collection-only recovery 仍只能恢復同一張既有圖。
- 本設計改變公開 request／capability／output 型別，預定新 App SDK major；Runtime、
  Platform、Studio 仍在 0.x，breaking public/persisted requirements 需下一 minor。
  owner 在 release preparation 決定確切版本／artifact pins／App compatibility
  ranges，連同 Usage／Ask 的可啟用相容矩陣一起驗收；不可只更新 Studio 然後讓舊
  Apps 因 SDK 不相容消失。此規劃不執行 bump／發布／安裝，也不靠舊 API alias 猜測執行。
- Studio 的能力正規化層讀 schema 1 與 schema 2；schema 1 只會產生 Grok 生成、原生
  1:1，提交時只送 SDK 1.x 的三個欄位。未知 schema fail closed（沒有可用服務），
  已保存作品仍可讀取。
- 沿用 opaque iframe、nonce-bound bridge、scoped grants、host-managed downloads。
  Studio 不取得 shell、provider credentials、絕對來源路徑或任意 provider network。
  prompt、服務標籤與回傳原因都以文字安全呈現，不執行其中的 HTML、script 或連結指令。

## Acceptance criteria

| ID | 可觀察的完成條件 |
| --- | --- |
| AC-01 | 四組 capability fixtures 呈現正確服務卡、已啟用操作、代理設定及比例模式；沒有圖片模型假選單，未實作／不可限制的「服務 × 操作」不出現也無法提交 |
| AC-02 | 一次明確送出只產生一個 canonical attempt；double click、重開、refresh、斷線及重送相同 ID 不增加 CLI/media calls；改 payload（含來源或 options）同 ID 得 conflict |
| AC-03 | 1024² JPEG、1920×1280 PNG、1254² PNG 皆完整預覽、放大、讀出正確 MIME／尺寸並 byte-identical 匯出，不裁切或錯標 JPEG |
| AC-04 | Muse fixture：成功 tool result 後 turn timeout，原執行結束 → 保存原圖且顯示 warning；缺 correlation／額外生成時不能被判成功；全程零自動重試 |
| AC-05 | Antigravity 的 parent→指定 child→單圖及 Codex nested exec 有 fixture coverage；未知／多 child、額外生成、其他工具／模型無法繞過預先限制 |
| AC-06 | 取消在生成／收集／保存 race 中均優先，父子程序停止前不假稱取消完成；取消後遲到圖不能成為成功作品 |
| AC-07 | 舊 Grok schema 1 jobs／原檔升級後可讀、IDs與hash不變、operation 為生成；malformed、寫入失敗、重啟及不支援 downgrade 有測試，不重跑原 job |
| AC-08 | 真正 built package＋host SDK 在隔離 registry/Core/Runtime fixtures 驗證服務選擇、操作切換、offline/reopen/filter/reuse/error/cancel/narrow/light/dark/keyboard，以及 Usage/Ask 相容性 |
| AC-09 | 跨 App/account/version、停用／移除、path escape、偽 MIME／損壞／超大圖片、外來 session／tool result、他人作品當來源均拒絕；不洩漏 path／credentials／raw transcripts |
| AC-10 | 每個 production-enabled「服務 × 操作」有實際 bounded route 的 acceptance receipt（有適用授權時）；既有 Chat probes 和 fixtures 不冒充此證據。沒有該證據仍可做設計 fixture，但不可宣稱已上線 |
| AC-11 | 修圖／合成 fixtures：來源張數限制、順序保存、跨服務來源、`source_unavailable`／`source_unsupported`、結果為新作品且原圖 hash 不變、來源快照不隨後續變動改寫 |
| AC-12 | 透明背景只在宣告的 profile 出現；要求透明但結果不透明時顯示量測的「不透明」，不以要求值冒充結果 |
| AC-14 | 刪除：已保存需確認、未完成／已取消直接刪；Core 紀錄、原檔與 Runtime receipt 移除；進行中／待確認拒絕；其他帳號／App 不可刪；刪除從不生成；舊 host 不顯示刪除 |
| AC-13 | 新 UI 在現有 SDK 1.x host 上只出現 Grok 生成、提交 payload 與 1.x 完全相同，並通過 Platform 的實際 package 瀏覽器驗收（選擇器配合更新） |

## Dependencies and unresolved engineering gates

Runtime 的 successor contract／adapter proofs、Platform 的 successor SDK／storage
migration、公開 SDK 的 exact pin 與新 App manifest 必須一起交付。既有 owner baseline：
[Runtime SPEC-033](../../../cats-runtime/docs/specs/SPEC-033-bounded-image-generation.md)、
[Platform SPEC-119](../../../cats-platform/docs/specs/SPEC-119-app-image-generation.md)。

A0 必須查明 Muse／Codex 的生成前機械限制與有界結果擷取、Antigravity parent/child
控制及取消，以及這些能力是否存在於目標 CLI transport。修圖／合成另需查明各服務可
接受的來源形式（附件、路徑、data URL）、格式與大小限制，以及來源能否放在 attempt
專屬位置而不擴大 provider 的讀取範圍。現有研究沒有證明答案；不得為了照表開放而省略
這些 gate。本機檔案匯入需要 Platform 另立 host-side picker 權限決策，不在本 SPEC 範圍。

*Created: 2026-10-23。Revised: 2026-10-23（ADR-005：先選服務、修圖／合成）。Related plan: [PLAN-006](../plans/PLAN-006-studio-image-workspace.md)。*
