# ADR-002: CLI-backed Media Studio Vertical Slice

## Status

Proposed — 2026-09-28。使用者已選定先撰寫垂直切片的 ADR／SPEC／PLAN；
本文件提出實作邊界，尚未代表介面已核定、功能已實作或 CLI 實測已完成。

## Context

一般使用者需要透過用途、描述、參考圖與預覽操作來產圖、修圖、產生短片。
Cats 已有官方 App 套件與 CLI 執行基礎，可以把這些操作串成同一段創作流程。

使用者提供的 9/12 spike 自述將 `image_gen`、`image_edit`、
`image_to_video`、`reference_to_video` 歸於 Grok Build／xAI Imagine。
本次依使用者要求，先接受這些能力作為規劃假設，後續再測。
[既有研究報告](../research/2025-09-12-five-cli-media-final-report.md)
保留原始日期與觀察；它及對話自述都不等同目前安裝版本的端到端驗證。

本次檢視的程式基線：

- Runtime 的 [Grok adapter](../../../cats-runtime/src/backends/cli/providers/grok.ts)
  已列出上述工具名稱，並有非互動 CLI 啟動與事件處理機制。
  名稱存在不表示媒體輸入、輸出收取及圖生影片已通過 Cats 實測。
- Platform 的 [App SDK](../../../cats-platform/packages/app-sdk/browser.d.ts)
  目前為 1.2.0，提供 Usage 讀取、quota refresh 與 Lobby navigation；
  尚未提供安裝型 App 所需的生成任務與素材介面。
- [官方套件邊界](../../../cats-platform/docs/app-packages.md)要求 App
  使用隔離 renderer 與受控 SDK；App 不直接取得 host filesystem 或 Runtime 金鑰。

## Decision

1. 建立一個同時承載圖片與影片的官方 App，暫稱 **Cats Studio**。
   規劃用 slug／ID 為 `studio`／`cats.studio`，首次建立套件與持久化資料前
   定案。它是 Lobby Apps 下的工具，沿用 ADR-001 的套件與發布邊界。
2. 第一個垂直切片只接 Grok CLI，完成：描述生圖 → 修改圖片 → 選圖生成短片
   → 預覽／下載 → 重開 App 後仍可取得作品。每一步由使用者明確操作。
   外部圖片匯入也可作為修圖或圖生影片的起點。
3. 首版生成基線為 1:1 圖片與 6 秒／480p 短片，須經 spike 驗證後啟用。
   此處是最小驗收組合，並非宣稱 CLI 只能支援這組參數。
   其他 provider、更多參數、`reference_to_video`、多圖／語音與長片剪輯延後。
4. 執行路徑固定為 App → Platform App SDK → Runtime → CLI。
   若 CLI 沒有可直接呼叫的媒體 RPC，Runtime 透過受約束的 agent 任務要求
   CLI 使用原生媒體工具，接收事件與結構化產物。工具名不得被當成可直接
   從 App 呼叫的現成 API；也不改用直接 provider API 來繞過 CLI 限制。
5. App 提交有型別的創作意圖與素材 ID，不提交 shell command、任意 URL、
   CLI startup args、憑證或本機絕對路徑。SDK 提供受限的任務／素材能力，
   不為此 App 開放一般 terminal、任意 MCP proxy 或 server entrypoint。
6. Platform 負責 App 身分、權限、作品與版本資料、任務對應、素材保存及交付。
   任務控制重用現有 Core task/run 與持久化能力；新增的是 App 所需的投影與
   metadata。Runtime 負責 CLI 執行、provider 差異、取消／逾時、事件與產物驗證。
   各 owner 在 PLAN-003 Phase 1 固定資料對應，避免建立第二套任務排程器。
7. 任務與作品生命週期不依附 renderer。關閉頁面不取消任務；host 重啟後
   顯示保存的作品，對執行中任務先核對狀態，不自動重送可能已計費的生成。
   成功產物由 host 保存於 App 資料區，不能僅引用 CLI 的 session 暫存路徑。
8. 以可驗證的檔案作為成功依據。產物須綁定該次 run、通過型別／大小／解碼
   等檢查，並完成保存；助手文字宣稱完成、退出碼為零或孤立路徑都不夠。
   原圖與每次修改版獨立保存，影片可追溯到選定的圖片版本。
9. UI 只提供該安裝版本與執行方式已驗證的能力；未知能力保持不可用並說明原因。
   圖片比例不能冒充精確像素或最低價格保證；未知成本／額度不顯示為免費。
   遇到登入、額度或 privacy 阻擋，回報可處理的狀態，不自動切換 provider、
   改全域 privacy 設定或另接付費服務。
10. 以新的 SDK 能力增量交付，保留現有 Usage 契約。SDK 1.2.0 本身不足以
    執行此 App；套件宣告實際新增能力的最低相容版本。相容新增依各 repo SOP
    選擇版本，破壞 0.x 公開契約須跨 minor，穩定 SDK 破壞性變更須跨 major。
    本規劃不指定新版本號，也不進行 bump、tag、發布或 Desktop App pin 變更。
11. 持久化格式須有版本。新 App 首次初始化不改寫 Usage 資料；若修改既有
    host／Runtime schema，須由資料 owner 提供驗證、備份、原子替換、失敗復原
    與重複啟動測試。不得以刪除資料重新初始化作為升級路徑。

## Consequences

### Positive

- 圖片、修改版本與影片共用作品脈絡，使用者可連續創作。
- App 操作與 provider 執行有清楚邊界，未來可逐一加入通過驗證的 CLI。
- 第一條流程同時驗證任務、素材、SDK 與安裝套件是否真正接通。

### Negative

- 需要跨 cats-apps、cats-platform、cats-runtime 實作，只有 App 頁面不夠。
- CLI agent 執行具有延遲與不確定性，必須處理失敗、結果驗證和重試。
- 素材保存、背景任務與重新開啟體驗增加 host 的持久化工作。

### Neutral

- CLI 自有登入／生成服務條件持續適用；App 不承諾訂閱包含所有生成費用。
- 品牌名稱仍暫定；Grok-first 是交付順序，不是通用 SDK 的 provider 限制。
- 本 ADR 補充 Apps ADR-001，不取代 Platform／Runtime owner 的介面決策。

## Alternatives Considered

### 分成圖片 App 與影片 App

入口單純，但首版即重複素材匯入、版本與作品管理，且切斷圖片轉影片流程。
先以同一 App 交付，未來有獨立需求再評估拆分。

### 只增加聊天指令或 skill

可快速示範 CLI 生成，但無法完整提供一般使用者需要的參考圖、版本比較、
可恢復任務與作品庫。Skill 可輔助執行，不取代 App 與 SDK。

### App 直接跑 CLI 或串生成服務 API

縮短早期串接路徑，但跨越現有套件權限與 provider 執行邊界，並產生另一套
憑證／程序管理。維持 Runtime 執行、Platform 授權與交付。

### 首版同時接多家 CLI 與所有影片模式

涵蓋面較大，但參數、事件、產物與錯誤差異使驗收範圍失去界線。
先完成 Grok 的三個動作，再以同樣的驗證門檻擴充。

## References

- [ADR-001](001-own-official-utility-apps-and-coordinate-desktop-distribution.md)
- [SPEC-003](../specs/SPEC-003-media-studio-vertical-slice.md)
- [PLAN-003](../plans/PLAN-003-media-studio-vertical-slice.md)
- [Platform ADR-114](../../../cats-platform/docs/decisions/114-separate-official-app-sources-and-coordinate-desktop-distribution.md)
- [Platform SPEC-115](../../../cats-platform/docs/specs/SPEC-115-versioned-official-app-packages-and-telemetry-bridge.md)
- [Earlier capability proposal](../../../cats-platform/docs/research/2026-03-24-image-video-gen-as-cat-capability.md)
  為歷史草案；其中「Runtime 不需改動」不作為本切片的完成依據。

*Created: 2026-09-28*
