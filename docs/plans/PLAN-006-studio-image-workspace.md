# PLAN-006: Studio image workspace

## Metadata

| Field | Value |
| --- | --- |
| Status | In progress — A3a 已實作並準備為 Studio 0.3.0；A0～A2、A3b～A5 尚未開始 |
| Owner | cats-apps 整合；Runtime、Platform 各自負責其 repository 的工作 |
| Assigned To | A3a 由 Apps 實作；其餘待使用者安排 |
| Reviewer | 待跨 repository contract review 與獨立實作 review |
| Spec | [SPEC-006](../specs/SPEC-006-studio-image-workspace.md) |
| Decision | [ADR-004](../decisions/004-expand-studio-with-verified-image-profiles.md)、[ADR-005](../decisions/005-provider-first-studio-image-operations.md) |

## Handoff reading order and scope

接手者先讀 workspace／member AGENTS 與自己的 agent-specific instructions，再讀
本 PLAN、SPEC、ADR-004、ADR-005 與 [probe summary](../research/2026-10-23-studio-cli-media-probe-summary.md)。
原始能力／尺寸證據在 [三家實產報告](../research/2026-10-23-three-provider-image-artifact-probe.md)、
[Grok capability probe](../research/2026-10-23-grok-media-capability-probe.md)
及 [Grok sample](../research/2026-10-23-grok47-xhigh-studio-sample.md)；更多 provider
調查遵循 [SOP](../research/2026-10-23-cli-media-probe-playbook.md)。

目標是「先選服務，再做它能做的事」的圖片工作區：四家候選服務的生成，加上有證據的
修圖與合成。不是一次包辦全部多模態功能，也不是只改 CSS。保留 `cats.studio`、既有
作品與 SDK 邊界；不把 Studio renderer 改成 shell／provider API client，不新增 App-owned
server。其他完整 Apps 的服務架構不在這次變更範圍。

### Already established inputs

- [x] 四家有各一張可解碼原圖；模型、格式、尺寸、hash 與證據限制已記錄。
- [x] Muse 有「圖片成功後回合 timeout」案例，且方形構圖意圖得到 3:2 圖片。
- [x] Antigravity child 與 Codex nested exec 的實際生成呼叫已個別核對。
- [x] Grok `image_edit` 單圖／多圖的工具定義與比例差異已讀到；Muse／Codex 的參考輸入
  與 Codex 透明背景只有代理回報。
- [x] 使用者審閱互動設計稿，決定先選服務、操作由 profile 宣告（ADR-005）。

這些不是新 Studio 的 bounded route 或 installed acceptance。沒有新增生成額度；
任何後續 live probe／paid acceptance 先套用當時使用者的明確授權與次數限制。

## Shared Platform service consumer track (proposed, 2026-10-23)

[Platform PLAN-121](../../../cats-platform/docs/plans/PLAN-121-shared-image-service-and-controlled-cat-generation.md)
管理 Studio／Cat 共用圖片服務、有限 Cat grant、資產與 Telegram 送達。
本段只列 Apps consumer 責任；不是新增 A3a 發布工作，也不改已發布版本的狀態。

- [ ] 對照 Platform P0 凍結既有 SDK 1.x／Studio archive 契約；第一階段不要求
      Studio UI／manifest／agent tool 改動，Runtime 仍只用已啟用的 Grok 契約。
- [ ] 配合 Platform P1/P5，以真 built Studio＋host SDK＋隔離 fixtures 驗證提交、
      cancel、reopen、offline/read/export、exact bytes 與 App/account 隔離。
- [ ] 驗證 Studio 未安裝／停用／卸載不撤銷 Cat 的獨立 grant，Studio 也不自動
      看見 Cat 私有作品；既有 Studio 工作與原圖升級後保持同一 IDs/hash。
- [ ] 若後續要把 Cat 作品用於修圖，先定義明確 sharing/source grant，再和 A0/A2
      協調 SDK 契約；不移除目前同 App/account source 限制。

Runtime 的 same-instance／pool／工具重入檢查由 Platform P0/P5 與 Runtime owner
處理；只有具體缺口才新增 Runtime successor。修圖／合成／多 provider 仍走下列
A0～A5，兩條 track 不能互相借用未完成的驗收。

## Workstreams and dependencies

| Workstream | Owner | 交付物 | 可並行／依賴 |
| --- | --- | --- | --- |
| A0 Contract and feasibility | Runtime + Platform + Apps | owners 的 successor 文件、contract 2（含操作、來源、options）fixture/types、adapter 啟用 gate、升級／版本矩陣 | 最先；A3a 不依賴 |
| A1 Native execution | Runtime | 每個「服務 × 操作」的 profiles、bounded runners、來源輸入、matching receipts、原檔驗證與 recovery | 依 A0；與 A2/A3b 並行；逐一啟用 |
| A2 SDK and retained works | Platform | typed bridge、來源授權與解析、受管 PNG/JPEG、job projection、storage upgrade | 依 A0；可先用 Runtime fixtures |
| A3a Studio UI on SDK 1.x | Apps | 先選服務的 built App；能力正規化層同時讀 schema 1 與提案 schema 2；在現有 host 上只出現 Grok 生成 | 立即開始；可獨立合併，不 bump |
| A3b Contract 2 wiring | Apps | 接 A2 的公開 SDK major、manifest compatibility、移除提案 fixture 與實際契約的差異 | 依 A0／A2 |
| A4 Integration and review | 三方整合者 | 真實 package/host fixtures、跨版本驗收、各「服務 × 操作」acceptance evidence | A1/A2/A3b 相容組合完成後 |
| A5 Release preparation | 各 release owner | 原始 bump/PR 中的 notes、versions、pins、upgrade/signing/compatibility | 實作與驗收完成，且另有發布授權時 |

A3a 可以先交付，但不能以 UI 完成宣告 A1／A2 已完成。新 provider 或新操作的
production capability 逐一在通過 gate 後開放，不用等待其他路徑，也不可先放能按的假選項。

## A0 — Freeze contracts and prove bounded routes

- [ ] Runtime 與 Platform 各建立／更新其 owning ADR/SPEC/PLAN successor，回鏈本套文件；
  原 ADR-042／SPEC-033／PLAN-043 與 ADR-120／SPEC-119／PLAN-111 保留交付歷史。
- [ ] 凍結 SPEC 的 capability/profile/operation/agentConfig/target 關係、`inputs`、
  `aspectRatio` 模式與 enum、`transparentBackground`、canonical submit（含 `sourceIds`）、
  schema 2 job/output/warning、idempotency hash、safe error codes 與 read/export 型別。
  寫可共用的 sanitized contract vectors，避免 Apps／Platform 各自發明 enum。
- [ ] 實際查明四條 native transport 的限制手段：工具 allowlist、媒體呼叫上限、
  parent/child 限制、回合／deadline、取消、更新策略及 CLI version evidence。
  先使用 fake process／保留的 sanitized records；不要為了驗證旗標自動產圖。
- [ ] 對 Muse 的空 normalized arguments、Codex nested `exec`、Antigravity child
  correlation 提出可信、可界定大小的事件擷取方式，不靠掃 home、讀 thinking 或 regex
  找任意圖片路徑。建立能力不足時的不可用 reason。
- [ ] 修圖／合成：查明各服務可接受的來源形式（Grok 附件／路徑／data URL、Muse 本機
  `image_paths`、Codex reference paths、Antigravity 未知）、格式／大小限制，以及能否
  把來源放在 attempt 專屬位置而不擴大 provider 讀取範圍。做不到的操作不啟用。
- [ ] 檢查 media budget 是否真的在執行前生效。若 CLI 只能靠 prompt 或事後數工具，
  該 route 記為尚不可啟用，先完成其他 route；不得宣稱有硬性費用限制。
- [ ] 列出 contract 2 的 SDK major、Runtime/Platform/Studio 0.x minor 邊界與 storage
  migration。決定 exact versions 的 owner 和發布時機；這個階段不 bump、不發布。
- [ ] 記錄 Usage／Ask 等現有 Apps 的 SDK／host 相容與升級策略、過舊 package 的明確
  compatibility UX，不能因更新 Studio 而默默停用其他官方 Apps。

**Exit:** 三方共享一份可供 fixtures 驗證的契約；每個「服務 × 操作」有可執行或尚不可
啟用的具體理由。未解的 CLI 能力不阻止 A3a，但阻止該 route 的 live enablement。

## A1 — Runtime profiles, execution and collection

- [ ] 將 Grok 專用 catalog/profile/service 提取為 operation-specific 執行策略，仍由
  Runtime 管理；不另建模型目錄。首批代理設定遵循 SPEC，Grok 不得改回 Fast／Low。
- [ ] 延續 shared selection、worker capacity、metering、singleton、shutdown 與單一
  image active slot；對 capabilities 與 submit 使用一致 preflight，不新增 paid probe。
- [ ] 有界媒體操作的 worker 名額：閒置的聊天 worker 會佔滿 `maxSessions` 且不回收
  （2026-10-23 實例：10 個閒置研究對話讓 Studio 生圖立即以 busy 失敗）。設計讓有界操作
  回收最久未用的閒置 worker 或保留名額，並加入閒置回收；先確認停止閒置 worker 後聊天
  session 能安全續接。已先改為回報 `runtime_capacity_full`，預設名額上調到 50。
- [ ] 實作 Grok 生成 profile，先以現有 bounded flow 作回歸基準；保留既有 collection-only
  recovery 語意，不用新 attempt 取代舊成功或失敗的圖片。
- [ ] Muse：一個原生媒體呼叫、matching result 與 cwd-relative 圖片來源的可驗證綁定；
  成功 result 後 timeout 能安全結束執行、驗證原 PNG，並保留 execution warning。
- [ ] Codex：從有界 native events 取得 nested `exec` 的生成 evidence 與 output hint，
  不把 general exec/shell 權限整包開放給媒體 profile，也不執行 provider API fallback。
- [ ] Antigravity：只允許一次指定 image-generator child、一次媒體呼叫；管理父子
  取消／結束與 native artifact locator，不把 Workspace 當 output directory。
- [ ] 修圖／合成：依 A0 結果逐一實作來源輸入（attempt 專屬位置、containment、清理），
  Grok 單圖修圖不送比例、多圖合成送 enum 內比例；每個操作有自己的 fixtures。
- [ ] 收集合規來源到 Runtime data root，保留 provider 原檔；完整 PNG/JPEG 解碼與
  MIME、byte/pixel/edge limits、hash、alpha 量測及來源 containment checks。
- [ ] 實作 turn outcome／artifact outcome 分離；只在來源、次數、停止、取消檢查全部
  通過後允許 saved-with-warning。未知或違規不能透過這條路升格。
- [ ] Runtime schema 1→2 upgrade：validate/backup/atomic replace/failure recovery/
  repeated restart；保留 job IDs、原 JPEG 與 historical agent metadata，不重新執行。

**Exit:** 啟用中的每個 profile 通過受管 runner/collector fixtures，並有針對其實際
bounded route 的 acceptance 證據。若沒有新的 live-call 授權，回報 fixture 完成與 live
gate 未完成，保持該新 profile 不可用；不得把既有 Chat probe 改名為 App acceptance。

## A2 — Platform SDK, persistence and delivery

- [ ] 依 A0 更新公開 SDK types、實際 injected bridge、Runtime client projections、
  host routes 與契約 vectors；保留 `media.images` 的 scoped permission。
- [ ] request identity 包含 profile revision、target/config、operation、有順序的來源、
  prompt/options；先持久化再 dispatch，lost POST/double click/reload/reconnect 都只恢復
  原 request。
- [ ] 來源授權與解析：只接受同一 App/account 已成功保存的作品；把保存原檔與 SHA-256
  交給 Runtime；撤銷／不存在回 `source_unavailable`；job 保存來源快照。
- [ ] 維持 Core task/run/artifact authority、App/account/version/package digest 隔離、
  disable/remove revocation；不額外建立 Studio job database 或可由 renderer 決定的路徑。
- [ ] 正確接收／保存／read／export PNG 與 JPEG；原檔 extension/MIME/hash 相符，匯出
  byte-identical；不得沿用硬寫 `.jpg`／`image/jpeg` 的路徑與 header。
- [ ] 增加 warnings、execution outcome 與量測 transparency projection；cancel 意圖在
  保存 race 中優先。refresh/list/reopen 只能讀／收集原 attempt；磁碟滿後也不得再次生成。
- [ ] migration 位於 owner 的既有 state/store 升級機制，保留 foreign Core fields、IDs、
  original artifacts，舊作品 operation 為生成；對失敗、重啟與 unsupported downgrade
  提供測試／明確錯誤。
- [ ] 更新真正 package/host smoke harness 的 fixtures，保留離線圖片與 Usage/Ask 啟用
  相容案例；不直接對真實 profile 寫 synthetic Core records。

**Exit:** 實際 renderer SDK 與 host 使用 fixtures 可完整走四家與各操作狀態；文件型別
本身不算功能驗收。公開 SDK dev pin／package compatibility 在正式 release preparation 時協調。

## A3a — Studio UI on SDK 1.x

能力正規化與提交建構集中在 `apps/studio/src/model.js`，可被 Node 單元測試直接 import；
`app.js` 只負責 DOM 與 SDK 呼叫。這讓 schema 1 production 行為與 schema 2 提案 fixtures
共用同一個 UI，A3b 只需修改正規化層。

- [x] 能力正規化：schema 1 → 每個 Grok target 一個服務、只有生成、原生 1:1；schema 2
  提案 → 服務、操作、比例模式與 enum、來源上下限、透明背景、代理設定、不可用原因；
  未知 schema 或格式錯誤 fail closed（沒有可用服務，作品仍可讀）。
- [x] 提交建構：schema 1 只送 `requestId`/`instance`/`prompt`；schema 2 依 SPEC 提案，
  只帶宣告的 options。描述以 code points 驗證，來源張數依操作驗證。
- [x] Job 正規化：缺 operation 視為生成；format 由 MIME 決定；寬高、比例、bytes、
  量測透明度（JPEG 為不透明、未量測 PNG 為未知）、warning、來源與執行結果。
- [x] 畫面：服務卡、操作、來源挑選、描述與靈感、比例模式、透明背景、代理設定、送出、
  結果預覽與量測尺規、放大、作品篩選與卡片，依 SPEC 的狀態表提供動作。
- [x] 草稿與 active request 分離；切服務／操作不產圖、不改既有工作。明確提交才選取新
  工作；背景 polling 不搶走使用者選中的舊作品。
- [x] 送出結果未確認時保留同一 requestId 與 payload；「確認送出結果」以相同 payload
  重送（Platform 依 requestId 回傳原 attempt，不同 payload 為 conflict）。
- [x] Provider-specific safe 錯誤文案取代硬編碼 Grok 文字；`refresh`／確認結果與
  「再生成一張」分開，後者只在使用者明確按下時建立新 request。
- [x] 作品縮圖依可見範圍延遲讀取、限制同時讀取數與 blob 快取大小，切換／離頁釋放。
- [x] 完成 labels/focus/Escape/dialog return、Unicode count、zh/en、keyboard、文字放大、
  reduced motion、light/dark 和 SPEC 的四種視窗尺寸；不得用 CSS 隱藏方式掩蓋不可用操作。
- [x] 測試：model 單元測試（兩種 schema、提交形狀、驗證、job 正規化）、package test；
  另提供只用於開發的 schema 2 fixture 預覽，不進 package。
- [x] Platform 的 `scripts/testing/check-studio-app.mts` 配合新選擇器更新（Platform PR），
  同時接受舊版 Studio 的 select 與新版服務按鈕，以實際 package＋host 驗收 AC-13；這個
  harness 從不呼叫 CLI。
- [x] 不 bump Studio 版本、不改 manifest compatibility、不發布；發布另依 A5。

**Design freedom:** 色彩、圖示、字型、卡片樣式、動畫及細部 spacing 交給設計者；保留
SPEC 的能力邊界與狀態語意。沒有依據的 cost/ETA／成功率不能作為設計裝飾。

## A3b — Contract 2 wiring

- [ ] 依 A0 凍結的型別調整正規化層與提交建構，刪除與實際契約不符的提案欄位處理。
- [ ] 接 A2 的公開 SDK entry 與 exact pin；Apps 不 import sibling implementation、不複製 SDK 型別。
- [ ] 依 A5 的相容矩陣更新 manifest `compatibility.appSdk`，並保留 SDK 1.x host 的明確提示。

## A4 — Acceptance and independent review

- [ ] 逐條完成 SPEC AC-01～AC-13，列出 owner、命令、fixture/native 證據與未測平台。
- [ ] 用 actual `.catsapp`＋real host/SDK＋隔離 Runtime/Core 做互動驗收，不能用
  standalone HTML 或直接 browser localhost tab 冒充 installed Desktop 的 bridge。
- [ ] 驗證舊作品升級後開啟、原檔匯出及 offline/reopen；同時保護 Usage／Ask 的既有行為。
- [ ] 獨立 review 覆蓋 execution budgets、path/correlation、來源授權、migration/cancel
  races 與 UI 狀態；作者自跑 tests 只算 validation。無 reviewer 時明確記錄，不假稱完成。
- [ ] 若使用者安排實際安裝／live acceptance，記錄精確 App/SDK/Platform/Runtime/CLI
  identity、允許的生成次數與結果；不在普通 UI 測試中自動消耗帳號額度。

### Required fixture scenarios

| Fixture | 預期結果／主要 AC |
| --- | --- |
| Four profiles, one/multiple configs, unavailable target, changed revision | 正確服務卡與操作；不 silent fallback；AC-01 |
| Lost submit response, repeated request ID, reload, changed payload/sources/options | 一個 attempt；不同 payload conflict；AC-02 |
| Grok square JPEG, Muse 1920×1280 PNG, Codex 1254² PNG | 真實 metadata／原比例／原 bytes；AC-03 |
| Muse successful tool → timeout | safe stop 後 succeeded + warning；不重跑；AC-04 |
| Timeout + foreign/missing result, extra media call | 不成功、不自動 regenerate；AC-04/09 |
| AgY child control, Codex nested exec, oversized inline image/event | 機械限制與有界 evidence；AC-05 |
| Cancel before spawn, during child, during save, late image | cancel precedence、父子停止、無遲到成功；AC-06 |
| schema 1 JPEG success/failure/interrupted, malformed/ENOSPC/restart | 原 IDs/hash 保留、operation 為生成、失敗恢復、不 replay；AC-07 |
| Actual package, offline, filter/reuse, keyboard/theme/narrow | UI/bridge／既有 Apps 不回歸；AC-08 |
| App/account/version mismatch, revoked package, path escape/bad image, foreign work as source | 拒絕且不洩漏私密資料；AC-09 |
| Grok single edit, Grok multi-reference, Muse 50-reference cap, cross-provider source, revoked source, unsupported source format | 張數與順序、比例模式、`source_*` 錯誤、原圖不變；AC-11 |
| Codex transparent request with opaque and with alpha result | 量測值顯示；AC-12 |
| Current SDK 1.x host with new Studio | 只有 Grok 生成、1.x payload、harness 通過；AC-13 |

## Implementation starting points

以下是已存在的 source 入口，供接手者找 ownership；不是本次已修改的檔案清單。

| Member | 現有入口 | 預期工作 |
| --- | --- | --- |
| Apps | `apps/studio/src/{app.js,model.js,style.css,index.html}` | 能力正規化、提交建構、先選服務 UI、實際 MIME/尺寸 |
| Apps | `tests/studio.test.mjs`, `apps/studio/cats.app.json` | package regression；後續 exact compatibility／manifest |
| Runtime | `src/core/media/{contracts.ts,ImageGenerationService.ts}` | schema/profile/operation/selection/receipt/recovery |
| Runtime | `src/catalogs/media-profiles.json`, `src/backends/cli/media/grokImage.ts`, `src/http/routes/images.ts` | profile registry、provider strategies、來源輸入、MIME-aware routes |
| Runtime | `tests/image-generation.test.ts` 與 provider fixtures | fake native processes、correlation、budget、來源、migration |
| Platform | `src/runtime/images.ts`, `src/platform/apps/images.ts` | projections、來源授權、Core persistence、PNG paths、取消與升級 |
| Platform | `packages/app-sdk`, public `src/app-sdk` entry、實際 bridge | contract 2 型別與可執行 SDK |
| Platform | `tests/app-images.test.js`, `tests/app-sdk-*`, `scripts/testing/check-studio-app.mts` | host/account/SDK/package coverage 與 browser fixtures |

## Validation and delivery rules

實作者先讀各 member 的 testing guide，跑 affected scope；docs-only 只需 diff/reference
檢查。Runtime 使用 focused Vitest 與必要 build/catalog checks，Platform 跑受影響
SDK/image/host/migration tests，Apps 跑 Studio/package 與公開 SDK pin checks。完整
CI／release preflight 依 owning repo 規定，不為普通文案改動重跑全部服務測試。

source 工作用 member 內 `.claude/worktrees/`，不動他人的 worktree／未提交資料。

## A5 — Release preparation (separate authorization)

- [ ] 在原始 bump commit/PR 一起準備確切 App/SDK/Platform/Runtime versions、source /
  artifact pins、release notes、相容矩陣、migration/backups/recovery 與適用 signing。
- [ ] 明確區分 source implementation、published package、Desktop selection、installed
  version；發布 App 不代表已更新 Desktop，SDK major 不可冒充既有 minor 相容。
- [ ] 只有使用者另行授權才 bump／publish／install；發布後依 shared release guide
  查 hosted evidence，清理並結束，不加 status-only commit 或改寫已發布 Release。

## Risks and handling

| Risk | 處理 |
| --- | --- |
| CLI 無法機械限制生成／delegation | 該「服務 × 操作」不啟用；不放寬成任意聊天 agent |
| 有檔案但沒有可信 call correlation | 保留未知，不掃目錄找一張來補成功 |
| 來源輸入擴大 provider 讀取範圍 | 只複製本次來源到 attempt 專屬位置；做不到即不啟用修圖／合成 |
| SDK schema 變更破壞其他 Apps | A0 相容矩陣與 A4 實際 package 驗收；release coordination |
| migration 中斷／磁碟滿／歷史配置未知 | validate＋backup＋atomic replacement；unknown 不補成現行設定 |
| 提案 schema 2 與凍結契約不同 | 差異只存在 Studio 的正規化層；A3b 修改並以 vectors 驗證 |
| 視覺設計與工程各自發明成功／重試流程 | 共同使用 SPEC states、contract fixtures 與 AC IDs |

## Progress log

| Date | Update |
| --- | --- |
| 2026-10-23 | 依使用者要求完成 ADR/SPEC/PLAN 規劃與交接；A0～A5 尚未實作。四家 Chat 產物證據已存在，不能替代新 bounded route acceptance |
| 2026-10-23 | 使用者審閱互動設計稿，採用 ADR-005：先選服務、操作由 profile 宣告，納入修圖／合成；A3 拆成可先在 SDK 1.x 交付的 A3a 與接 contract 2 的 A3b |
| 2026-10-23 | A3a 實作：`model.js` 能力正規化／提交建構／job 正規化與先選服務 UI。`npm test`、`npm run check:docs` 通過；fixture 預覽檢查四家服務、修圖／合成、透明背景、深色與 360／1078 寬。Platform `check-studio-app.mts`（選擇器相容更新）以實際 archive＋host＋fixture Runtime 驗收新 UI 與 main 的舊 UI，各 2 次送出、0 次 CLI。未 bump、未發布；schema 2 只以提案 fixtures 驗證 |
| 2026-10-23 | 使用者授權以 Studio 0.3.0 發布 A3a，並在發布後以目錄 PR 把 `channels.stable` 指到 0.3.0，用現有 Desktop 0.9.1 的 Market 驗證「不升 Desktop、單獨更新 App」。版本欄位、release notes 與預期 SHA-256 見 [deployment](../deployment.md#studio-030--provider-first-image-workspace-2026-10-23)；不改 Desktop pins |
| 2026-10-23 | 使用者在 Desktop 0.9.1 以 Market 更新到 0.3.0 後回報：外殼與 App 重複顯示名稱／返回鈕／版本，且一次生成因 Runtime worker 名額被閒置對話佔滿而立即失敗。改為外殼負責 App 身分（Platform）、Studio 0.3.1 移除自己的標題列與頁尾並改寫忙碌文案（Apps）、Runtime 回報 `runtime_capacity_full` 並把預設名額上調到 50；名額回收列入 A1 |

*Created: 2026-10-23。首個實作動作：A3a；A0 owners contract/feasibility review 可並行。*
