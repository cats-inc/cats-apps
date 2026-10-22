# SPEC-006: Studio image workspace

## Metadata

| Field | Value |
| --- | --- |
| Status | Draft — 可交接的規劃基線；未實作、未發布 |
| Owner | cats-apps；Runtime／Platform 各自擁有執行與 SDK／保存契約 |
| Reviewer | 後續跨 repository 實作／設計 review；本次未做獨立 review |
| Decision | [ADR-004](../decisions/004-expand-studio-with-verified-image-profiles.md) |
| Plan | [PLAN-006](../plans/PLAN-006-studio-image-workspace.md) |
| Baseline | [SPEC-003](SPEC-003-media-studio-vertical-slice.md) 的已交付單 Grok 圖片功能 |

## Summary

把 `cats.studio` 改為以提示詞、能力相符的生成設定、大型結果預覽與保存作品為核心的
圖片工作區。首期只有單張文生圖，候選路徑為 Grok、Muse、Antigravity、Codex；各自
通過 bounded execution 與收集驗收後才可使用。支援實際 JPEG／PNG、不同長寬比，
以及「圖片成功但生成回應逾時」的可用作品。介面美化與真實 provider 實作可以分工。

## Goals and non-goals

- 生成服務、代理模型／effort、圖片實際規格有清楚而不混淆的呈現。
- 開啟、切換設定、套用範例、複用描述、刷新、重開都不生成；只有明確生成操作建立
  一個 attempt。恢復原 attempt 與建立另一張圖片是不同操作。
- 原有 Grok 作品、原始 bytes、既有 task/run/artifact 與離線讀取保留。
- 本期不做修圖、參考圖／拖放匯入、透明生成開關、影片／音訊、批次、多 provider
  同時生成、佇列、排程、種子／精確像素／品質選項、自動翻譯／改寫提示詞、作品刪除
  或新資產版本樹。不要以尚不可用的按鈕或「即將推出」標籤占據主介面。
- 不修改 Chat composer 問題；那些是既有獨立 issues。這份規劃不改 App 安裝／Market
  架構，不發布或安裝任何版本，也不增加研究生成額度。

## Evidence and initial execution configurations

以下是初始 profile 的建議設定，不是圖片 backend 的 model ID，也不保證本機可用：

| Provider label | Agent configuration | 首期比例控制 | 已觀測原檔；不可當預設值 |
| --- | --- | --- | --- |
| Grok | `grok-4.7` + `xhigh`，非 Fast | 原生 1:1，先固定 | 1024 × 1024 JPEG |
| Muse | `muse-spark-1.3` + `xhigh` | 由服務決定；構圖寫在提示詞 | 1920 × 1280 PNG |
| Antigravity | `gemini-3.8-flash-high` + `high` | child 原生 1:1，先固定 | 1024 × 1024 JPEG |
| Codex | `gpt-6.1-sol` + `xhigh` | 由服務決定；構圖寫在提示詞 | 1254 × 1254 PNG |

Muse 的圖片完成後，回合因 30000ms idle refusal 失敗。Antigravity 只核實 child 的
一組 `generate_image` 引數，完整 schema 未知。Codex 的呼叫在 native `exec` 內。
詳見 [實產報告](../research/2026-10-23-three-provider-image-artifact-probe.md)。
Claude 不列入本期生成服務；不得把未暴露工具解讀成 provider 永久不支援。

## User stories

- 我能選擇一個已設定的服務，描述畫面，明確生成一張，並知道正在做哪個階段。
- 我能看到圖片真正的尺寸和格式，放大、下載原檔，下次開啟仍能找到它。
- 若回應逾時但圖片已保存，我能直接使用它，不必再按一次生成。
- 我可以研究舊作品並把描述放回草稿；換服務或改草稿不會改動既有工作。

## Workspace and visual handoff

以下定義資訊層級與互動，不指定最終色票、字型或元件造型。設計者沿用 Cats 的
light/dark theme 和繁中／英文語系；可重排留白、卡片與作品縮圖，不能變更狀態語意。

```text
Studio · 圖片工作室                                  返回 Cats Home
┌ 建立圖片（約 300–340px） ┐ ┌ 結果預覽（剩餘空間）                  ┐
│ 生成服務                 │ │ 範例／進度／選取作品                   │
│ 提示詞                   │ │ 按原比例顯示圖片                      │
│ 靈感捷徑                 │ │ 狀態、尺寸／格式、下載原檔、放大        │
│ 比例／單張提示            │ │ 描述與生成資訊按需展開                  │
│ 進階：代理模型與 effort   │ └─────────────────────────────────────┘
│ 生成圖片                 │
└─────────────────────────┘
作品：搜尋描述／服務篩選／狀態篩選 → 縮圖與進行中的工作
```

| 區域 | 必須呈現與行為 |
| --- | --- |
| 頁首 | Studio、圖片工作區身分、返回 Cats Home；移除占據首屏的大型宣傳 hero |
| 生成服務 | 顯示友善 provider 名稱；有多個 execution instances 時加使用者可辨認的 alias。只有一個時不展示 `native` 等 raw ID |
| 模型設定 | 進階區標「代理模型」「推理強度」，說明這不是圖片模型。只有一組核准設定顯示文字，多組才有 selector；effort 僅能選該模型允許的組合 |
| 提示詞 | 必填、2000 Unicode code points；保留換行。靈感與複用描述只更新草稿，並把焦點放回輸入，不呼叫模型 |
| 參數 | 每次一張。Grok／Antigravity 標原生 1:1；Muse／Codex 標「比例由服務決定」。沒有像素／格式／品質／透明度的假選單 |
| 生成按鈕 | 文案「生成圖片」；空白／超長、目標不可用、未確認提交、已有執行時不可再次送出。Enter 換行；不新增自動送出捷徑 |
| 使用說明 | 簡短說明使用所選 CLI 帳號與額度、不自動重試；不顯示推測價格、免費承諾或虛構進度百分比 |
| 結果區 | `object-fit: contain`，不裁切／拉伸／重編碼；sample、執行中與已保存作品視覺可區辨。顯示實際格式、寬高、必要警示 |
| 作品卡 | 縮圖或工作狀態、描述摘要、服務、時間；成功提供預覽／下載原檔／複用描述；失敗保留描述與原因 |
| 資訊詳情 | 顯示提交時代理設定、要求比例或自動、實測比例／bytes、圖片模型與媒體費用（未回報則未知）。不呈現來源絕對路徑／token／session ID |

桌面約 960px 以上採雙欄，窄版依序呈現建立、結果、作品；不出現水平溢出。
1078 × 632 的實際 Desktop viewport 應能直接看見提示詞與主要操作；較短畫面允許
設定區捲動，不能讓按鈕或 chips 覆蓋輸入／結果。至少檢查 1280 × 800、1078 × 632、
768 × 1024、360 × 800。舊版圖片 library 不能因新尺寸變成固定正方形裁圖。

所有控制項有 label／keyboard focus；對比、dark theme、文字放大和 reduced motion
必須可用。狀態使用溫和的 live announcement；每次 polling 不可重複朗讀整份列表。
放大預覽支援 Escape、關閉後焦點返回觸發按鈕。Blob URL 在切換／離頁時釋放；縮圖
依可見範圍延遲載入，不一次解碼全部 100 張原檔。

## Capability and selection requirements

| ID | Requirement |
| --- | --- |
| CAP-01 | Runtime 是可執行 profiles 與代理選項的唯一來源；Studio 不另存 provider/model 白名單、不複製聊天 model catalog |
| CAP-02 | profile 綁 operation、provider/native transport、允許的 agent configurations、限制、工具／delegation 規則、收集／解碼版本及 evidence reference |
| CAP-03 | 初期四組設定如上。未實作／無法限制的 adapter 不可列為可生成；已實作但未安裝、未設定、停用、暫不可用可顯示清楚不可選原因 |
| CAP-04 | capability GET 只讀設定／已知可用性，不執行模型、不登入、不查憑證、不產圖。`available` 表示可接受提交，不保證額度或 entitlement |
| CAP-05 | 選擇值必須是 profile、target、agent config 的有效組合。`grok/native` 不能出現在「圖片模型」欄位；Antigravity child 的 Model tier 不是 Imagen/Veo 選項 |
| CAP-06 | capability 變更或服務失聯保留草稿與可辨認的選擇，不悄悄換 provider、model、effort 或 Fast。按下生成時重新驗證；設定過期就拒絕並要求重新選擇 |
| CAP-07 | 首次沒有偏好時選可用 Grok 設定；不可用則要求選擇其他可用服務，不自動呼叫替代服務。沒有可用服務時仍可看保存作品 |
| CAP-08 | 除非 Runtime profile 提供受約束參數，表單不提交 ratio／size／model 等猜測欄位。第一期只開原生 1:1 或自動比例；更多 ratios 另驗證後加入 |

## Proposed contract 2 — owner handoff, not an existing SDK

以下名稱是跨 repository 的具體設計基線。A0 需由 owners 一起凍結型別與 error codes，
並記錄在 Runtime／Platform 自己的 successor 文件；不可把這些欄位直接傳給現有 SDK
1.x。現有 source SDK 1.5.0 的 images API 仍是 Grok／JPEG schema 1。

| Data / operation | 必要內容 |
| --- | --- |
| `images.getCapabilities()` | `schemaVersion: 2`、能力 revision、operation `image.generate`；targets 內含 opaque target ID、provider、instance label、availability/reason；profiles 內含 ID/revision、可用 target/config 關係、代理 label/resolved ID/effort、比例 native/automatic 模式、limits |
| `images.submit(input)` | exact typed payload：`requestId`, `targetId`, `profileId`, `profileRevision`, `agentConfigId`, `prompt`, `options`；options 首期只允許 profile 宣告的 `aspectRatio: "1:1"`，automatic 時省略。不可傳 raw CLI args、API URL/key、cwd 或 destination |
| `images.list/cancel/refresh` | 方法用途沿用；回傳 schema 2 jobs。`refresh` 只查原 receipt／重新收集原檔，不 POST 生成。cancel 作用於整個父子樹 |
| Job identity/config snapshot | request/job IDs、provider/instance label、operation、profile/revision/config、提交時 requested/resolved agent model/effort、prompt、原生比例要求或 automatic、timestamps。配置快照不可隨 catalog 更新而改寫 |
| Job lifecycle | `submitting/running/collecting/succeeded/failed/cancelling/cancelled/interrupted`；使用者取消意圖、safe error、warnings，以及獨立的 provider `executionOutcome`（含未知） |
| Output | 至多一張：verified `image/jpeg` 或 `image/png`、bytes、width、height、SHA-256、量測的 transparency（opaque/has-transparency/unknown）。圖片模型與媒體費用可為 null；未回報不當作零 |
| `images.read(id)` | verified original ArrayBuffer + actual MIME；不回傳檔案路徑、provider URL、raw transcript 或憑證 |
| `images.export(id)` | host 決定安全檔名及 JPEG/PNG 副檔名；輸出與保存原檔 byte-identical，不因預覽大小重新壓縮 |

Platform 先持久化完整 canonical request，再以 App/account/requestId 派生固定 Runtime
ID。相同 ID、相同 canonical payload 回傳原 attempt；任何設定／描述／options 改變
皆 conflict。trim 外圍空白，保留內部文字與換行；不得偷偷翻譯、改寫或改配置後重送。
Runtime HTTP／internal types 採相同語意；具體 routes 與 typed projections 由 A0
一起更新，保留既有 auth、CSRF、package digest 與 account/App/version 授權。

## Execution, collection and recovery

| ID | Requirement |
| --- | --- |
| EX-01 | 每個 explicit request 只允許一個 native parent attempt、一次媒體生成、零自動重試／fallback；Antigravity 允許一個 `image-generator` child，禁止 child 再委派 |
| EX-02 | 生成前必須能強制工具、delegation、媒體次數與 deadline。不得只以提示詞、事後驗收或「第一張收到了就算成功」充當機械限制。能力不足的路徑保持不可用並記錄原因 |
| EX-03 | 延續一個全域 image active slot、每 App/account 一個 active job、無 queue，並接既有 selection／pool／metering／shutdown。Antigravity child 算在父 attempt 的工作與取消邊界內 |
| EX-04 | 初始上限：prompt 2000 code points、全 attempt 含 child/收集 5 分鐘、受管事件輸出 2 MiB、單圖 8 MiB／4,000,000 pixels／單邊 4096。這是接受上限，不是可選生成尺寸；不因超標自動轉檔／縮圖再冒充原檔 |
| EX-05 | 記錄原生 session/tool call/result 的 exact correlation，包含 parent-child chain 或 nested exec。filename、mtime、assistant 自述、cwd 目錄猜測均不足以證明來源；不得廣掃 provider home 或讀 model thinking |
| EX-06 | 對 matching result 指定來源做 realpath／containment、regular file、symlink/hardlink、讀取前後穩定性、大小與完整解碼檢查；收集 roots 由可信 profile/runtime 決定，renderer 不可控制。不可從任意 assistant 路徑讀檔 |
| EX-07 | 檢查格式 signature、完整 PNG/JPEG decode、尺寸、bytes/hash、單圖數量。native 媒體模型只在實際回報時記錄；代理設定與 media cost 分開，保留未知 |
| EX-08 | 不同 provider 的 idle/progress 行為由 media profile 處理；不可為此全域放寬 Chat timeout。圖片結果完成後 final prose 缺失不應觸發另一張生成 |
| EX-09 | 只在原執行已安全結束、無取消、工具與來源合規、驗證與 atomic persistence 成功後發布作品。回合 failed 但原圖符合上述條件，可 job succeeded + executionOutcome failed + warning `response_timeout_after_image` |
| EX-10 | 缺 matching evidence、超出工具數、來源不明、解碼失敗或取消時不套 EX-09。未知結果保持 interrupted；refresh/reopen 只能讀原 attempt，不補跑 CLI |

2 MiB 是受管結構化事件／text budget，不應直接把 large inline base64 混入無界日誌。
若某 CLI 在傳輸層內嵌圖片，adapter 必須有可證明有界的 binary 處理及獨立 8 MiB
限制；做不到即不啟用，不能直接提高 stdout cap 或截斷到無法建立 tool correlation。
原生 provider transcript 可存在其自有目錄，但 collector 只讀原 attempt 的有界必要
部分，不能把整份 system context／thinking／帳號資料保存成 Studio receipt。

## UI states and actions

| 情境 | 顯示與允許動作 |
| --- | --- |
| 尚無作品 | 已標明來源的既有 Grok sample 或空預覽；換提示詞不修改 sample，不視為新生成 |
| 正在送出 | 顯示所選服務與描述快照；禁止第二次送出；遺失 response 保留同一 requestId |
| 生成中 | 可顯示 elapsed time／實際階段及取消；不顯示虛構完成百分比或剩餘秒數 |
| 正在保存 | 說明正在保存圖片，不當作需要再生成；取消仍優先於尚未發布的成功 |
| 已保存 | 顯示實際格式／寬高，預覽／放大／下載原檔／複用描述可用 |
| 已保存且回應逾時 | 圖片正常可用；一則非阻擋警示「圖片已保存，但生成回應逾時。」詳情保留執行結果，沒有自動重試 |
| 失敗、沒有可用圖片 | 保留描述和 provider-specific safe 原因；先可確認原結果。使用者明確按「再生成一張」才建立新 requestId，可能再次使用額度 |
| 結果待確認 | 顯示「確認結果」；只讀取原 attempt。禁止把相同 request 視為未送出並自動重建 |
| 正在取消／已取消 | 等父子程序結束；取消網路失敗可重送取消，不能重送生成；不承諾退還額度 |
| Runtime 離線／服務不可用 | 草稿保留、新生成停用、既有已保存圖仍可讀／下載；capability refresh 不觸發帳號 probe |
| 保存失敗／磁碟滿 | 保留原 receipt 與可恢復來源；確認結果只做 collection，不再生成 |

建立與草稿是不同狀態：執行中的 config/prompt 不可變；可編輯下一份草稿，但 active／
未確認 attempt 解決前仍禁止另一筆提交。使用者選了舊作品後，背景 polling 不得偷換
預覽；明確提交新工作時才把結果區切到該工作，避免新描述搭配舊圖片。篩選作品或
返回頁面不取消既有執行。篩選是目前 App/account 至多 100 jobs 的本地視圖，不假稱
有無限歷史；保存上限延續既有政策，不自動刪舊作品。

## Persistence, compatibility and security

- Runtime 保留至多 500 receipts，Platform 至多 100 jobs/App/account；原圖存在可變
  data roots，與 immutable App package 分離。不得依目前 renderer 版本重寫歷史的
  agentModel、effort、圖片規格或來源。預覽與匯出同樣驗證 App/account/version 權限。
- 新 schema 2 的 migration 分別由 Runtime／Platform owner 執行：先驗證 schema 1、
  備份、建立並驗證新檔、atomic replace、失敗保留原檔。保留 IDs、Core 關聯、prompt、
  timestamps、hash、bytes、既有 JPEG；不刪除 provider 原檔。不明格式 fail closed，
  不清空資料。重啟冪等；舊 running/interrupted 不重新生成。
- 歷史配置無法還原時標 unknown／historical，不把目前 Grok 4.7/xhigh pin 套到先前
  Fast/Low 作品。原先 collection-only recovery 仍只能恢復同一張既有圖。
- 本設計改變公開 request／capability／output 型別，預定新 App SDK major；Runtime、
  Platform、Studio 仍在 0.x，breaking public/persisted requirements 需下一 minor。
  owner 在 release preparation 決定確切版本／artifact pins／App compatibility
  ranges，連同 Usage／Ask 的可啟用相容矩陣一起驗收；不可只更新 Studio 然後讓舊
  Apps 因 SDK 不相容消失。此規劃不執行 bump／發布／安裝，也不靠舊 API alias 猜測執行。
- 沿用 opaque iframe、nonce-bound bridge、scoped grants、host-managed downloads。
  Studio 不取得 shell、provider credentials、絕對來源路徑或任意 provider network。
  prompt、服務標籤與回傳原因都以文字安全呈現，不執行其中的 HTML、script 或連結指令。

## Acceptance criteria

| ID | 可觀察的完成條件 |
| --- | --- |
| AC-01 | 四組 capability fixtures 呈現正確 label、代理設定及 ratio 模式；沒有圖片模型假選單，未實作／不可限制的 route 無法提交 |
| AC-02 | 一次明確生成只產生一個 canonical attempt；double click、重開、refresh、斷線及重送相同 ID 不增加 CLI/media calls；改 payload 同 ID 得 conflict |
| AC-03 | 1024² JPEG、1920×1280 PNG、1254² PNG 皆完整預覽、放大、讀出正確 MIME／尺寸並 byte-identical 匯出，不裁切或錯標 JPEG |
| AC-04 | Muse fixture：成功 tool result 後 turn timeout，原執行結束 → 保存原圖且顯示 warning；缺 correlation／額外生成時不能被判成功；全程零自動重試 |
| AC-05 | Antigravity 的 parent→指定 child→單圖及 Codex nested exec 有 fixture coverage；未知／多 child、額外生成、其他工具／模型無法繞過預先限制 |
| AC-06 | 取消在生成／收集／保存 race 中均優先，父子程序停止前不假稱取消完成；取消後遲到圖不能成為成功作品 |
| AC-07 | 舊 Grok schema 1 jobs／原檔升級後可讀、IDs與hash不變；malformed、寫入失敗、重啟及不支援 downgrade 有測試，不重跑原 job |
| AC-08 | 真正 built package＋host SDK 在隔離 registry/Core/Runtime fixtures 驗證四服務、offline/reopen/filter/reuse/error/cancel/narrow/light/dark/keyboard，以及 Usage/Ask 相容性 |
| AC-09 | 跨 App/account/version、停用／移除、path escape、偽 MIME／損壞／超大圖片、外來 session／tool result 均拒絕；不洩漏 path／credentials／raw transcripts |
| AC-10 | 每個 production-enabled profile 有實際 bounded route 的 acceptance receipt（有適用授權時）；既有 Chat probes 和 fixtures 不冒充此證據。沒有該證據仍可做設計 fixture，但不可宣稱 provider 已上線 |

## Dependencies and unresolved engineering gates

Runtime 的 successor contract／adapter proofs、Platform 的 successor SDK／storage
migration、公開 SDK 的 exact pin 與新 App manifest 必須一起交付。既有 owner baseline：
[Runtime SPEC-033](../../../cats-runtime/docs/specs/SPEC-033-bounded-image-generation.md)、
[Platform SPEC-119](../../../cats-platform/docs/specs/SPEC-119-app-image-generation.md)。

A0 必須查明 Muse／Codex 的生成前機械限制與有界結果擷取、Antigravity parent/child
控制及取消，以及這些能力是否存在於目標 CLI transport。現有研究沒有證明答案；不得
為了照表開放四家而省略此 gate。除這些 owner-level 工程核實外，主要 UX 決策已在上文
給出基線，視覺設計者不必自行決定計費、重試、取消或資料安全策略。

*Created: 2026-10-23。Related plan: [PLAN-006](../plans/PLAN-006-studio-image-workspace.md)。*
