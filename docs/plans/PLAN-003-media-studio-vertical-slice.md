# PLAN-003: Media Studio Vertical Slice

## Metadata

| Field | Value |
|-------|-------|
| Status | Draft — single-image adapter spike passed; App implementation and remaining live validation pending |
| Owner | cats-apps coordinates product acceptance; each member owns its implementation |
| Assigned To | Unassigned |
| Reviewer | Unassigned; independent review pending |
| Related decision | [ADR-002](../decisions/002-cli-backed-media-studio-vertical-slice.md) |

## Related Spec

[SPEC-003: Media Studio Vertical Slice](../specs/SPEC-003-media-studio-vertical-slice.md)

## Overview

先驗證 Grok 的最小非互動媒體鏈路，再固定跨 repo 契約，接上 Runtime、Platform
與 App，最後用真實安裝套件走完生成到持久化作品。2026-09-28 已依使用者縮減後的
範圍完成一次生圖 adapter spike；App 實作與完整驗收仍待完成，沒有發布。

**目前 live 範圍**：因本月 Grok 額度有限，使用者只允許一次最基本的生圖，
成功或失敗都停止，不重試、不修圖、不生影片。此次額度已用於下述單張圖片；
其餘 live 項目延後，不因原計畫列有三個動作就自動續跑。

第一條驗收固定為 `I1 生圖 → I2 修圖 → 選定 I2 → V1 短片 → 匯出 → 重開取回`。
其他 provider 與影片模式延後，不用擴大範圍來繞過 Grok 必要能力缺口。

## Implementation Phases

### Phase 0: Verify the CLI Media Path — cats-runtime

#### Completed bounded image spike

- [x] 使用 Runtime Grok adapter 的啟動參數與事件解析，在 Windows native 的
      Grok 1.0.41 執行一次 `image_gen`：一輪模型呼叫、一張圖片、無重試。
- [x] 驗證 1024×1024 JPEG、98,234 bytes、可解碼與副本雜湊一致。
      CLI 在工具完成後因 `max-turns 1` 停止，不能把該退出碼解讀成圖片生成失敗。
- [x] 保存 [Runtime evidence](../../../cats-runtime/docs/research/2026-09-28-grok-single-image-spike.md)。
      模型回報成本為 US$0.00761872，未單獨量得圖片費用或帳號剩餘額度變化。

#### Remaining CLI verification — deferred

- [ ] 讀取 Runtime 的 AGENTS／CODEX／相關指南，沿用既有 Grok adapter 與
      provider fixture 慣例；確認測試 CLI 版本、Windows native、instance 與登入狀態。
- [ ] 安排後續 live probe 的輸入與生成次數，使用獨立測試 workspace。
      不把自述重問一次當成實測，不改帳號／全域 privacy 設定來隱藏失敗。
- [ ] 透過 Cats 採用的 headless 啟動方式依序測 `image_gen`、`image_edit`、
      `image_to_video`，以 I1／I2／V1 保存輸入、原始事件、結果與雜湊。
- [ ] 驗證圖生影片確實接收選定 I2，並記錄比例、實際像素、時長、codec、
      480p 語意與可容許時長誤差。確認檔案位置與 session 外輸出的安全收取方式。
- [ ] 確認原生工具限制／權限方式，並判定 CLI 是否能穩定交付結構化產物。
      確認取消、逾時、privacy 阻擋與用量的可觀測性；未知項目記為 unknown。
- [ ] 將日期、OS、CLI 版本、transport、測試命令、去識別化 events 與
      artifact metadata 記錄於 Runtime research／fixtures，連回 SPEC-003。
      既有 9/12 報告保留為輸入證據，不改寫為本次實測結果。

**Deliverables**：三個必要動作的真實產物與相容性紀錄，或可重現的阻擋原因。
**Gate**：必要動作無法透過 Runtime 的 CLI 路徑執行時，不宣告切片可實作完成；
保持 capability 不可用並調整規劃。不得默默改接 provider HTTP API。

### Phase 1: Freeze Owner Contracts — cats-platform + cats-runtime + cats-apps

- [ ] 定案暫稱 Cats Studio、slug `studio`、ID `cats.studio`，再建立套件／資料。
- [ ] Platform／Runtime 先讀各自 repo 規範與 governing ADR，再建立或更新
      owner ADR／SPEC／PLAN，分配當地文件編號；回鏈這三份 Apps 文件。
      本計畫不預占其他 repo 編號，也不把跨 repo 提案宣告為已核定 SDK。
- [ ] 對應既有 Core task/run/artifact、App data root 與 Runtime session。
      固定任務控制、request 去重、素材／版本 metadata 的單一權威來源。
- [ ] 固定 submit/read/cancel、素材匯入／預覽／匯出、作品列表、capabilities
      的 typed contract、錯誤碼、grant、身份綁定與撤權流程。
- [ ] 固定有限資源與期限：prompt、輸入／輸出 bytes、像素、queue、
      執行／收取時間、polling、分頁；列出超限回應並加入 owner spec。
- [ ] 固定媒體 bytes 交付方式，實證隔離 renderer／CSP 下的圖片顯示、
      影片播放／seek、下載、revocation，避免在小型 JSON bridge 塞完整影片。
- [ ] 固定 request idempotency、CLI dispatch 與保存順序；涵蓋 host crash、
      CLI 結果遲到、取消競爭、unknown completion 及 collect-only recovery。
- [ ] 決定 SDK／host 最低相容邊界。預設採相容增量；若破壞 0.x 公開契約則
      記錄下一 minor，穩定 SDK 破壞契約記錄下一 major；本階段不 bump／release。
- [ ] 固定新資料 schema 與存放 owner；若修改既有 schema，設計備份、
      驗證、原子替換、重複啟動與失敗復原測試，禁止 reset 作為升級手段。

**Deliverables**：可實作的 owner 契約與版本／資料策略，以及同步更新的 SPEC-003。
**Gate**：不得以 renderer 的臨時 fetch／shell／路徑存取繞過未完成的 SDK。

### Phase 2: Implement Runtime Execution and Collection — cats-runtime

- [ ] 以明確的 operation、參數與受控素材建立 bounded CLI task，沿用 Grok
      adapter 的執行／事件解析；provider 特殊處理留在 Runtime。
- [ ] 實作經驗證的能力 profile、實際參數驗證、instance 執行限制與 sanitized
      錯誤。拒絕不支援的動作，不自動換 provider、改 privacy 或重送生成。
- [ ] 正規化 task/tool/result events；將三個動作與相應 native tool／run 綁定。
- [ ] 驗證輸出真實路徑、格式、bytes、解碼／時長與來源；安全交付給 host。
      CLI session 外輸出只能從該 run 的可信事件收取，不能任意掃描目錄。
- [ ] 實作取消／逾時／程序收尾、產物交付確認與 collect-only retry。
      保留 recoverable 產物直到 host 接收確認或明確失敗處理。
- [ ] 以去識別化 fixtures 驗證成功、缺檔、拒絕、privacy、登入、額度、
      逾時、late result 與 malformed output，執行 owner 規範要求的相關檢查。

**Deliverables**：可透過 host 呼叫的真實 CLI 執行／產物契約與測試。

### Phase 3: Implement App Jobs and Media Delivery — cats-platform

- [ ] 增加 executable App SDK、types、host operation allowlist 與權限檢查；
      保留 SDK 1.2 的 Usage 行為，不把 reserved server/action executor 算成完成。
- [ ] 持久化提交、Core run 對應、request fingerprint、作品與版本關係；
      先記錄再 dispatch，網路重送回原 job，重啟不隱藏地重複生成。
- [ ] 將匯入圖片保存成受控快照；把 Runtime 產物原子保存至 package 之外，
      再發佈可見 artifact／作品記錄，處理磁碟不足與收取中斷。
- [ ] 提供 app-scoped 素材 preview／export 與分頁作品查詢，實作影片 seek／
      bounded delivery；驗證來源、身份、CSP、版本與撤權。
- [ ] 處理離頁、enable/disable/uninstall、host/runtime restart、更新保留資料。
      若變更既有資料格式，完成 Phase 1 的 upgrade／failure recovery 測試。
- [ ] 在隔離 registry/profile 測試真正 `.catsapp`，以 fixture Runtime
      驗證 sdk handshake、素材／任務存取、錯誤、offline 與 Usage 回歸。

**Deliverables**：真正安裝的 App 可用的 SDK／任務／素材能力。
Phase 2／3 可依固定契約使用 fixtures 交錯開發，但真實整合 gate 必須使用兩者。

### Phase 4: Implement the Creative Flow — cats-apps

- [ ] 建立 `apps/studio/` 的 manifest、workspace package 與 renderer；
      相容範圍以實際 host SDK 契約設定，App 版本獨立於 Usage／Desktop。
- [ ] 生圖頁提供描述、1:1、可用性提示與提交狀態；修圖頁選來源圖片及修改描述，
      顯示原圖／版本比較；影片頁顯示選定圖片、動作描述與 6 秒／480p 基線。
- [ ] 提供圖片匯入、作品庫、任務狀態、取消／明確重試、預覽／播放／下載與
      設定複用；刷新、切頁與開 App 不觸發生成。
- [ ] 顯示未知成本、實際產物尺寸及可處理的錯誤；尚未驗證的參數保持不可選。
- [ ] 沿用 `scripts/build-app.mjs --app studio` 支援的 renderer 結構，必要時
      做最小建置調整；擴充 CI 的 App 選擇與測試，保留 Usage 產物與版本。
- [ ] 驗證繁中、鍵盤、窄視窗、input 保留及作品 lineage；執行 App 的行為測試、
      實際 studio build 與文件檢查，不用只測 mock 畫面取代 SDK 整合。

**Deliverables**：一個可安裝、獨立版本的候選 `.catsapp`，尚未發布或選入 Desktop。

### Phase 5: End-to-End Acceptance and Review — all owners

- [ ] 將候選套件裝入隔離 host registry；使用者的正式 App registry 不作測試資料庫。
- [ ] 在 Windows native 跑 AC-01 至 AC-09：經 UI 實際生 I1、改 I2、由 I2 生 V1，
      驗證 lineage、事件、可播放檔案及匯出雜湊。
- [ ] 驗證離頁持續工作、host restart、CLI session 清理後作品仍在、
      duplicate submit／cancel／retry、保存失敗、revocation 與相容性。
- [ ] Fixture 故障注入不重複消耗 live generation；真實 CLI、fixture 與 UI
      結果分開記錄，未通過的 OS／transport 保持未驗證。
- [ ] 由獨立 reviewer 檢視跨 repo 契約、SDK／權限、持久化與失敗處理；
      修正發現後執行相應驗證。作者檢查與測試不冒稱獨立 review。
- [ ] 更新本 spec／plan、owner 文件與索引，列出已通過與仍受阻的驗收。
      名稱、實際相容版本、資料格式與已知限制需可從 repo 恢復。

**Deliverables**：有證據的完成判定或明確未完成項目。
**Release boundary**：完成候選套件與驗收不等於發布；App bump/tag/release、
Desktop pin／release 與更新正式安裝，依既有發布授權分別處理。

## Files to Create/Modify

以下為實作範圍，不表示這些改動已存在。新模組路徑由 Phase 1 依 owner 架構決定。

| Owning repo / path | Planned action | Purpose |
|-------------------|----------------|---------|
| cats-apps `apps/studio/` | Create after identity freeze | manifest、package、renderer、操作與作品 UI |
| cats-apps `tests/`、`package.json`、`package-lock.json` | Extend | App workspace 與行為測試；不更動 Usage 版本 |
| cats-apps `scripts/build-app.mjs`、`.github/workflows/ci.yaml` | Reuse / extend as needed | 選定 App 的建置／驗證，不新增發布捷徑 |
| cats-platform `packages/app-sdk/` | Extend | 真正可執行 SDK 與 browser types |
| cats-platform `src/platform/apps/`、`src/app/server/appPackageRoutes.ts` | Extend | enabled/version/grant 綁定與媒體交付 |
| cats-platform `src/core/` and existing persistence modules | Extend existing records | task/run/artifact 對應與恢復；不另起排程系統 |
| cats-runtime `src/backends/cli/providers/grok.ts` and provider tests | Extend only where needed | CLI 控制、事件、產物與相容性 |
| cats-runtime execution/workspace modules | Extend | bounded execution、產物驗證與交付確認 |
| Each owner's `docs/` | Add/update | owner 契約、研究證據、驗收與升級策略 |

## Technical Decisions

- 單一 App、Grok-first、三個動作，以 [ADR-002](../decisions/002-cli-backed-media-studio-vertical-slice.md)為提案依據。
- 類型化操作經公開 SDK，CLI credentials／執行留在 Runtime；作品長期保存由 host 負責。
- 首版採單 target 有界執行、持久化 idempotency 與明確重試，避免重複生成。
- 原始／修改圖片不可互相覆寫；影片關聯到固定的圖片版本。
- 本任務只新增規劃文件；所有 executable contracts、版本及發布狀態保持現況。

## Testing Strategy

| Layer | Meaningful checks | Acceptance |
|-------|-------------------|------------|
| Runtime | 三工具 fixture、實際 CLI 產物、取消／逾時、路徑／格式驗證、收取重試 | AC-02、06、07 |
| Platform | request 去重／crash window、權限／撤權、原子保存、跨 App 拒絕、更新／migration | AC-01、05、06、08、09 |
| App | 指定來源版本、提交語意、input 保留、階段／錯誤、複用／重試、鍵盤操作 | AC-03、06、07、09 |
| Installed host UI | 真實套件／SDK、圖片／影片／seek／下載、離頁／重啟、窄視窗 | AC-01 至 AC-09 |

各 repo 執行當時 `docs/testing.md` 與 CI 要求的檢查。文件階段只跑
`npm run check:docs`、diff／連結檢查；應用程式測試、build 與 live probe 留到實作。
若新測試需要 live generation，先明確設定測試範圍，不能在一般 CI 隱藏呼叫帳號。

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| TUI 與 headless 能力不同 | 阻擋首版 | Phase 0 經實際 Runtime 路徑驗證，失敗保持未支援 |
| CLI 自述成功但產物不可用 | 虛假完成 | native event／run 綁定、解碼與保存成功才算完成 |
| privacy／額度／登入限制 | 任務無法執行 | 可辨識錯誤與設定引導，不自動改帳號設定 |
| 提交／重啟導致重複生成 | 額外消耗與混亂 | 持久化去重、查既有 run、unknown 不自動重送 |
| CLI 清理或更新刪掉作品 | 資料遺失 | host 獨立保存、交付確認、schema upgrade 與恢復測試 |
| sandbox 無法播放或大檔塞爆 bridge | UX 無法交付 | Phase 1 先證明媒體傳輸與 codec，不到最後才接 |
| 首版功能膨脹 | 延後完整流程 | 固定三動作／一組參數，額外 provider 與模式延後 |

## Progress Log

| Date | Update |
|------|--------|
| 2026-09-28 | 建立 ADR-002／SPEC-003／PLAN-003 草稿與索引；能力依使用者提供的 spike 暫作假設。未開始實作、live probe 或獨立 review。 |
| 2026-09-28 | 使用者將當次 spike 縮為單張圖片，已完成一次模型／image_gen 呼叫與 JPEG 驗證。Phase 0 部分完成；修圖、影片與 App／SDK 驗收延後，不再自動生成。 |

*Created: 2026-09-28*
