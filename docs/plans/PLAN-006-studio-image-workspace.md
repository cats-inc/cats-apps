# PLAN-006: Studio image workspace

## Metadata

| Field | Value |
| --- | --- |
| Status | Planned — 本次只完成規劃；所有實作階段尚未開始 |
| Owner | cats-apps 整合；Runtime、Platform 各自負責其 repository 的工作 |
| Assigned To | 待使用者安排實作者與 UI 設計者；本文件不代表已委派 agent |
| Reviewer | 待跨 repository contract review 與獨立實作 review |
| Spec | [SPEC-006](../specs/SPEC-006-studio-image-workspace.md) |
| Decision | [ADR-004](../decisions/004-expand-studio-with-verified-image-profiles.md) |

## Handoff reading order and scope

接手者先讀 workspace／member AGENTS 與自己的 agent-specific instructions，再讀
本 PLAN、SPEC、ADR 與 [probe summary](../research/2026-10-23-studio-cli-media-probe-summary.md)。
原始能力／尺寸證據在 [三家實產報告](../research/2026-10-23-three-provider-image-artifact-probe.md)
及 [Grok sample](../research/2026-10-23-grok47-xhigh-studio-sample.md)；更多 provider
調查遵循 [SOP](../research/2026-10-23-cli-media-probe-playbook.md)。

目標是四家候選路徑的單張文生圖工作區。不是一次包辦全部多模態功能，也不是只改 CSS。
保留 `cats.studio`、既有作品與 SDK 邊界；不把 Studio renderer 改成 shell／provider
API client，不新增 App-owned server。其他完整 Apps 的服務架構不在這次變更範圍。

### Already established inputs

- [x] 四家有各一張可解碼原圖；模型、格式、尺寸、hash 與證據限制已記錄。
- [x] Muse 有「圖片成功後回合 timeout」案例，且方形構圖意圖得到 3:2 圖片。
- [x] Antigravity child 與 Codex nested exec 的實際生成呼叫已個別核對。
- [x] 初始四組代理設定、原生 ratio 與 automatic ratio 的 UI 區別有具體提案。

這些不是新 Studio 的 bounded route 或 installed acceptance。沒有新增生成額度；
任何後續 live probe／paid acceptance 先套用當時使用者的明確授權與次數限制。

## Workstreams and dependencies

| Workstream | Owner | 交付物 | 可並行／依賴 |
| --- | --- | --- | --- |
| A0 Contract and feasibility | Runtime + Platform + Apps | owners 的 successor 文件、contract 2 fixture/types、adapter 啟用 gate、升級／版本矩陣 | 最先；UI 可用提案 fixtures 起稿，型別凍結前不接 live |
| A1 Native execution | Runtime | profiles、bounded runners、matching receipts、原檔驗證與 recovery | 依 A0；與 A2/A3 並行；四個 provider 逐一啟用 |
| A2 SDK and retained works | Platform | typed bridge、受管 PNG/JPEG、job projection、storage upgrade | 依 A0；可先用 Runtime fixtures，不等全部 adapters |
| A3 UI and visual design | Apps / UI designer | 建立區、結果預覽、作品、能力設定與完整狀態的 built App | 立即可用 fixtures；最後接 A2 的公開 SDK |
| A4 Integration and review | 三方整合者 | 真實 package/host fixtures、跨版本驗收、各 profile acceptance evidence | A1/A2/A3 相容組合完成後 |
| A5 Release preparation | 各 release owner | 原始 bump/PR 中的 notes、versions、pins、upgrade/signing/compatibility | 實作與驗收完成，且另有發布授權時 |

設計者可以先完成 A3 的畫面，但不能以美化完成宣告 A1／A2 已完成。
第一個可整合切片是新版 UI＋Grok regression＋PNG/非方形 fixtures；新 provider 的
production capability 逐一在通過 gate 後開放，不用等待其他路徑，也不可先放能按的假選項。

## A0 — Freeze contracts and prove bounded routes

- [ ] Runtime 與 Platform 各建立／更新其 owning ADR/SPEC/PLAN successor，回鏈本套文件；
  原 ADR-042／SPEC-033／PLAN-043 與 ADR-120／SPEC-119／PLAN-111 保留交付歷史。
- [ ] 凍結 SPEC 的 capability/profile/agentConfig/target 關係、canonical submit、
  schema 2 job/output/warning、idempotency hash、safe error codes 與 read/export 型別。
  寫可共用的 sanitized contract vectors，避免 Apps／Platform 各自發明 enum。
- [ ] 實際查明四條 native transport 的限制手段：工具 allowlist、媒體呼叫上限、
  parent/child 限制、回合／deadline、取消、更新策略及 CLI version evidence。
  先使用 fake process／保留的 sanitized records；不要為了驗證旗標自動產圖。
- [ ] 對 Muse 的空 normalized arguments、Codex nested `exec`、Antigravity child
  correlation 提出可信、可界定大小的事件擷取方式，不靠掃 home、讀 thinking 或 regex
  找任意圖片路徑。建立能力不足時的不可用 reason。
- [ ] 檢查 media budget 是否真的在執行前生效。若 CLI 只能靠 prompt 或事後數工具，
  該 route 記為尚不可啟用，先完成其他 route；不得宣稱有硬性費用限制。
- [ ] 列出 contract 2 的 SDK major、Runtime/Platform/Studio 0.x minor 邊界與 storage
  migration。決定 exact versions 的 owner 和發布時機；這個階段不 bump、不發布。
- [ ] 記錄 Usage／Ask 等現有 Apps 的 SDK／host 相容與升級策略、過舊 package 的明確
  compatibility UX，不能因更新 Studio 而默默停用其他官方 Apps。

**Exit:** 三方共享一份可供 fixtures 驗證的契約；每個 profile 有可執行或尚不可啟用的
具體理由。未解的 CLI 能力不阻止 UI 美化，但阻止該 route 的 live enablement。

## A1 — Runtime profiles, execution and collection

- [ ] 將 Grok 專用 catalog/profile/service 提取為 operation-specific 執行策略，仍由
  Runtime 管理；不另建模型目錄。首批代理設定遵循 SPEC，Grok 不得改回 Fast／Low。
- [ ] 延續 shared selection、worker capacity、metering、singleton、shutdown 與單一
  image active slot；對 capabilities 與 submit 使用一致 preflight，不新增 paid probe。
- [ ] 實作 Grok profile，先以現有 bounded flow 作回歸基準；保留既有 collection-only
  recovery 語意，不用新 attempt 取代舊成功或失敗的圖片。
- [ ] Muse：一個原生媒體呼叫、matching result 與 cwd-relative 圖片來源的可驗證綁定；
  成功 result 後 timeout 能安全結束執行、驗證原 PNG，並保留 execution warning。
- [ ] Codex：從有界 native events 取得 nested `exec` 的生成 evidence 與 output hint，
  不把 general exec/shell 權限整包開放給媒體 profile，也不執行 provider API fallback。
- [ ] Antigravity：只允許一次指定 image-generator child、一次媒體呼叫；管理父子
  取消／結束與 native artifact locator，不把 Workspace 當 output directory。
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
- [ ] request identity 包含 profile revision、target/config、prompt/options；先持久化
  再 dispatch，lost POST/double click/reload/reconnect 都只恢復原 request。
- [ ] 維持 Core task/run/artifact authority、App/account/version/package digest 隔離、
  disable/remove revocation；不額外建立 Studio job database 或可由 renderer 決定的路徑。
- [ ] 正確接收／保存／read／export PNG 與 JPEG；原檔 extension/MIME/hash 相符，匯出
  byte-identical；不得沿用硬寫 `.jpg`／`image/jpeg` 的路徑與 header。
- [ ] 增加 warnings 和 execution outcome projection；cancel 意圖在保存 race 中優先。
  refresh/list/reopen 只能讀／收集原 attempt；磁碟滿後也不得再次生成。
- [ ] migration 位於 owner 的既有 state/store 升級機制，保留 foreign Core fields、IDs、
  original artifacts，對失敗、重啟與 unsupported downgrade 提供測試／明確錯誤。
- [ ] 更新真正 package/host smoke harness 的 fixtures，保留離線圖片與 Usage/Ask 啟用
  相容案例；不直接對真實 profile 寫 synthetic Core records。

**Exit:** 實際 renderer SDK 與 host 使用 fixtures 可完整走四家狀態；文件型別本身不算
功能驗收。公開 SDK dev pin／package compatibility 在正式 release preparation 時協調。

## A3 — Studio UI and visual design

- [ ] 先以 SPEC 的 wireframe／states 做 light/dark 的 desktop/narrow 設計；提供建立、
  sample、生成中、保存中、一般成功、saved-with-warning、失敗、待確認、取消與離線畫面。
- [ ] 縮小 hero；建立設定／大型預覽／作品三區。實作 capability-driven service 選擇、
  進階代理設定與正確 ratio 模式，不顯示未驗證功能或 raw model ID 輸入。
- [ ] 草稿與 active request 分離；靈感、複用描述只填草稿，切服務不產圖，不回寫既有工作。
  明確提交才選取新工作；背景 polling 不搶走使用者選中的舊作品。
- [ ] 實際 format/dimensions/ratio 預覽，原圖 contain／放大／下載；sample 清楚標記。
  保留目前 Grok sample 的原始來源，不把新 probe 圖片偷偷換成產品預設圖。
- [ ] 作品卡及 prompt/provider/status 篩選，含進行中與失敗項；lazy reads、bounded blob
  lifecycle、空狀態、保存上限提示；無刪除／無限歷史／batch 功能。
- [ ] 用 safe provider-specific 原因取代所有硬編碼 Grok 的通用錯誤文案；`refresh` 與
  「再生成一張」分開，後者只在結果已確認後明確建立另一個 request。
- [ ] 完成 labels/focus/Escape/dialog return、Unicode count、zh/en、keyboard、文字放大、
  reduced motion 和 SPEC 的四種視窗尺寸；不得用 CSS 隱藏方式掩蓋不可用操作。
- [ ] 接 A2 的公開 SDK entry；Apps 不 import sibling implementation、不複製 SDK 型別。

**Design freedom:** 色彩、圖示、字型、卡片樣式、動畫及細部 spacing 交給設計者；保留
本 SPEC 的能力邊界與狀態語意。沒有依據的 cost/ETA／成功率不能作為設計裝飾。

## A4 — Acceptance and independent review

- [ ] 逐條完成 SPEC AC-01～AC-10，列出 owner、命令、fixture/native 證據與未測平台。
- [ ] 用 actual `.catsapp`＋real host/SDK＋隔離 Runtime/Core 做互動驗收，不能用
  standalone HTML 或直接 browser localhost tab 冒充 installed Desktop 的 bridge。
- [ ] 驗證舊作品升級後開啟、原檔匯出及 offline/reopen；同時保護 Usage／Ask 的既有行為。
- [ ] 獨立 review 覆蓋 execution budgets、path/correlation、migration/cancel races 與
  UI 狀態；作者自跑 tests 只算 validation。無 reviewer 時明確記錄，不假稱完成。
- [ ] 若使用者安排實際安裝／live acceptance，記錄精確 App/SDK/Platform/Runtime/CLI
  identity、允許的生成次數與結果；不在普通 UI 測試中自動消耗帳號額度。

### Required fixture scenarios

| Fixture | 預期結果／主要 AC |
| --- | --- |
| Four profiles, one/multiple configs, unavailable target, changed revision | 正確 selectors；不 silent fallback；AC-01 |
| Lost submit response, repeated request ID, reload, changed payload | 一個 attempt；不同 payload conflict；AC-02 |
| Grok square JPEG, Muse 1920×1280 PNG, Codex 1254² PNG | 真實 metadata／原比例／原 bytes；AC-03 |
| Muse successful tool → timeout | safe stop 後 succeeded + warning；不重跑；AC-04 |
| Timeout + foreign/missing result, extra media call | 不成功、不自動 regenerate；AC-04/09 |
| AgY child control, Codex nested exec, oversized inline image/event | 機械限制與有界 evidence；AC-05 |
| Cancel before spawn, during child, during save, late image | cancel precedence、父子停止、無遲到成功；AC-06 |
| schema 1 JPEG success/failure/interrupted, malformed/ENOSPC/restart | 原 IDs/hash 保留、失敗恢復、不 replay；AC-07 |
| Actual package, offline, filter/reuse, keyboard/theme/narrow | UI/bridge／既有 Apps 不回歸；AC-08 |
| App/account/version mismatch, revoked package, path escape/bad image | 拒絕且不洩漏私密資料；AC-09 |

## Implementation starting points

以下是已存在的 source 入口，供接手者找 ownership；不是本次已修改的檔案清單。

| Member | 現有入口 | 預期工作 |
| --- | --- | --- |
| Apps | `apps/studio/src/{app.js,model.js,style.css,index.html}` | workspace、draft/job 狀態、能力 UI、實際 MIME/尺寸 |
| Apps | `tests/studio.test.mjs`, `apps/studio/cats.app.json` | package regression；後續 exact compatibility／manifest |
| Runtime | `src/core/media/{contracts.ts,ImageGenerationService.ts}` | schema/profile/selection/receipt/recovery |
| Runtime | `src/catalogs/media-profiles.json`, `src/backends/cli/media/grokImage.ts`, `src/http/routes/images.ts` | profile registry、provider strategies、MIME-aware routes |
| Runtime | `tests/image-generation.test.ts` 與 provider fixtures | fake native processes、correlation、budget、migration |
| Platform | `src/runtime/images.ts`, `src/platform/apps/images.ts` | projections、Core persistence、PNG paths、取消與升級 |
| Platform | `packages/app-sdk`, public `src/app-sdk` entry、實際 bridge | contract 2 型別與可執行 SDK |
| Platform | `tests/app-images.test.js`, `tests/app-sdk-*`, `scripts/testing/check-studio-app.mts` | host/account/SDK/package coverage 與 browser fixtures |

## Validation and delivery rules

實作者先讀各 member 的 testing guide，跑 affected scope；docs-only 只需 diff/reference
檢查。Runtime 使用 focused Vitest 與必要 build/catalog checks，Platform 跑受影響
SDK/image/host/migration tests，Apps 跑 Studio/package 與公開 SDK pin checks。完整
CI／release preflight 依 owning repo 規定，不為普通文案改動重跑全部服務測試。

本次交接文件只做 Markdown／引用驗證，不代表上述尚未實作的測試通過。source 工作
用 member 內 `.claude/worktrees/`，不動他人的 worktree／未提交資料。

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
| CLI 無法機械限制生成／delegation | 該 profile 不啟用；不放寬成任意聊天 agent |
| 有檔案但沒有可信 call correlation | 保留未知，不掃目錄找一張來補成功 |
| SDK schema 變更破壞其他 Apps | A0 相容矩陣與 A4 實際 package 驗收；release coordination |
| migration 中斷／磁碟滿／歷史配置未知 | validate＋backup＋atomic replacement；unknown 不補成現行設定 |
| 視覺設計與工程各自發明成功／重試流程 | 共同使用 SPEC states、contract fixtures 與 AC IDs |

## Progress log

| Date | Update |
| --- | --- |
| 2026-10-23 | 依使用者要求完成 ADR/SPEC/PLAN 規劃與交接；A0～A5 尚未實作。四家 Chat 產物證據已存在，不能替代新 bounded route acceptance |

*Created: 2026-10-23。首個實作動作：A0 owners contract/feasibility review；UI 可並行使用 fixtures。*
