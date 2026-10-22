# ADR-004: Expand Studio with verified image execution profiles

## Status

Proposed — 2026-10-23。使用者要求完成下一階段規劃，交由後續實作者與 UI
設計者接手。本文件提供具體建議基線；尚未實作，也不授權新一輪付費生成或發布。
Decision 1 與 Decision 5 已由 [ADR-005](005-provider-first-studio-image-operations.md)
修訂為「先選服務、操作由 profile 宣告」並納入修圖／合成；其餘決策維持。
[SPEC-006](../specs/SPEC-006-studio-image-workspace.md) 定義行為，
[PLAN-006](../plans/PLAN-006-studio-image-workspace.md) 定義工作順序與啟用門檻。

這是 [ADR-002](002-cli-backed-media-studio-vertical-slice.md) 的下一階段，保留
獨立 `cats.studio` 身分、SDK 邊界及已保存作品。原先已交付的 Grok 單圖版本仍是現況；
四家 provider 的研究成功不等於 Studio 已經支援四家。

## Context

目前介面與執行契約都固定 Grok、1:1、JPEG。新增 provider 下拉選項不足以支援
不同的原生輸出、巢狀生成工具與「圖片完成但代理回合失敗」情況。

獨立檢查的圖片證據如下；這些是單次觀測，不是預設尺寸或品質比較：

| Provider／代理設定 | 原檔 | 重要差異 |
| --- | --- | --- |
| Grok 4.7／xhigh，非 Fast | 1024 × 1024 JPEG | native session 儲存，不直接輸出到 cwd |
| Muse Spark 1.3／xhigh | 1920 × 1280 PNG | 方形構圖意圖沒有得到方圖；圖片完成後回合逾時 |
| Antigravity Gemini 3.8 Flash／high | 1024 × 1024 JPEG | 內建 `image-generator` 子代理呼叫 `generate_image` |
| Codex GPT-6.1-Sol／xhigh | 1254 × 1254 PNG | 生成藏在 native `exec` 內；輸出在 provider-owned 目錄 |

各家的實際圖片模型與單張獨立費用都未知。Claude 這次未暴露生成工具，不納入本期
生成服務選擇。研究中的修圖、參考圖、透明背景與影片宣告尚未完成對應產物驗證。

## Decision

1. **先交付單張文生圖工作區。** 統一建立、預覽、保存作品、下載原檔與複用描述。
   範圍涵蓋 Grok、Muse、Antigravity、Codex；每個 adapter 獨立通過門檻後才開放。
   修圖、匯入、多圖參考、透明生成、影片、語音、批次、排程與自動重試另案處理。
2. **白名單管理可執行的 profile，不靠品牌或 frontier 標籤判定能力。** Runtime
   管理 operation、provider/instance、原生 transport、允許的代理設定、工具與產物收集
   契約、限制及證據版本。一般聊天模型目錄與媒體 API 的模型名稱不能直接成為選項。
   第一批設定固定為上表四組；Grok 明確排除 Fast。新增組合先擴充 Runtime profile
   與驗證，不修改 Studio 的 provider-specific 表單分支。
3. **代理模型與圖片模型分開。** 生成服務是 provider + execution instance；模型與
   effort 是執行代理的設定。圖片模型只有工具真的回報時才記錄，不提供猜測的 Imagen／
   Muse Image／GPT Image 選單。UI 在進階設定說明這個差別，單一核准設定顯示文字，
   多組設定才顯示 Runtime 提供的選項；不開放 raw model ID 或任意 CLI 引數。
4. **介面以創作與結果為主。** 精簡頁首，左側建立設定、右側大型預覽，下方為作品。
   窄視窗改為順序排列。設計者可調整色彩、字體、間距與元件造型，但必須遵守 SPEC
   的能力、狀態、無障礙與操作要求。工程路徑、工具名和 session ID 不放進主要流程。
5. **參數依執行路徑提供。** 首期 Grok／Antigravity 只提供已納入 profile 的原生
   1:1；Muse／Codex 顯示尺寸比例由服務決定。提示詞可描述構圖，但不冒充受約束的
   ratio/size 參數。所有路徑都只要求一張，不提供未驗證的品質、格式、精確像素、張數
   或透明度控制。比例枚舉擴充需要其自身的驗證。
6. **以驗證後的產物判斷圖片是否可用，並保留執行結果。** Runtime 分開記錄 provider
   回合狀態、產物驗證狀態與警示。已確認一張合規圖片、原執行已結束且沒有取消／工具
   違規時，可保存為成功作品並提示「圖片已保存，生成回應逾時」。來源不明的磁碟檔、
   未知工具次數、取消後的遲到圖片不可藉此升格。確認結果只讀取原 attempt，不再生成。
7. **延續 App → Platform SDK → Runtime → native CLI。** Runtime 負責媒體執行、
   既有容量／selection／metering、原生父子關聯、限制、收集及解碼；Platform 負責
   App/account/version 權限、既有 Core task/run/artifact、保存與下載；Studio 負責
   創作 UI。這期不新增 Studio server、通用工作系統、直接 provider HTTP fallback
   或來源路徑輸入欄位，也不改變其他完整 App 可以擁有服務的架構。
8. **必須能在生成前限制媒體工作。** 每 request 一個原生父執行、一個生成呼叫、
   零重試；Antigravity 額外允許一個指定類型的 child。控制／結果傳遞工具另行受限，
   不把「一個媒體呼叫」誤寫成所有 CLI 都只能一個推理回合。只有 prompt 約束或事後
   數出多次生成，不能當成費用上限。無法證明可強制限制的 adapter 不列為可用。
9. **保留原始 JPEG／PNG 與舊作品。** Runtime 驗證 MIME、解碼、尺寸、bytes、hash，
   Platform 以正確副檔名保存與匯出，Studio 依實際比例預覽。cwd／workspace 不作為
   統一輸出契約。原始 provider 檔案不搬走；收集是複製已確認的 bytes 到受管儲存。
10. **明確處理新契約與升級。** SPEC 的 submission／capability／receipt schema 2
    是新契約，不能把 SDK 1.x 的 Grok/JPEG literal 型別直接改寬後宣稱相容。以新版
    App SDK major，以及受影響 0.x 元件的下一 minor 作為預定 breaking boundary；
    實作團隊在發版前列明相容矩陣與確切版本，不在本次文件提交 bump 或發布。資料
    owner 必須提供驗證、備份、atomic replacement、失敗恢復及重啟測試的一次性升級。
    不新增過時 execution API 的猜測式 fallback；既有官方 Apps 的啟用相容性也必須驗收。

## Consequences

### Positive

- 美化可以依 fixture 狀態先行，不必等待全部 provider adapter 完成。
- 新 provider／模型組合由具體執行契約加入，前端不維護第二份模型清單。
- Muse 的逾時與非方形輸出有清楚的產品行為，不會導致重複付費或丟棄有效作品。
- 後續修圖／影片有 operation/profile 邊界可擴充，當前不必實作未驗證功能。

### Negative

- 這是跨 Apps／Platform／Runtime 的功能；單獨換皮無法完成交付。
- 三個新 adapter 的機械限制與收集方式仍有工程風險，尤其是 nested/custom tools。
- schema／SDK 的 breaking boundary 帶來協調升級成本，不能只發布新版 Studio。
- 首版不開放一般聊天目錄的全部模型，也不承諾固定圖片尺寸或原生圖片模型選擇。

### Neutral

- 模型／effort 的初始 pin 只是已觀測的執行設定，不代表最佳品質或最低媒體費用。
- 能力讀取不呼叫模型、不產圖、不證明帳號仍有額度；實際執行仍可能拒絕。
- 已保存圖片離線可讀，建立新圖需要當時可用的 host／Runtime／provider。

## Alternatives Considered

| 方案 | 優點 | 不採用的原因 |
| --- | --- | --- |
| 直接列出四家 provider 和全部聊天模型 | 上線表單快、自由度高 | 無法代表對應操作、budget、collection 或 entitlement；容易誤導 |
| 只把 Grok 表單改漂亮 | 範圍小 | 沒有處理已證實的 PNG／非方形／巢狀工具及回合失敗問題 |
| renderer 直接讀 provider 目錄或呼叫 API | 繞過收集層 | 暴露檔案／憑證，另引計費與權限，違反既有邊界 |
| 先統一支援所有圖片／影片／音訊操作 | 表面上完整 | 工具宣告不等於實產驗證，需求與驗收範圍失控 |

## References

- [五家 provider 證據總表](../research/2026-10-23-studio-cli-media-probe-summary.md)
- [三家單圖實產](../research/2026-10-23-three-provider-image-artifact-probe.md)
- [可重複 probe SOP](../research/2026-10-23-cli-media-probe-playbook.md)
- [Runtime ADR-042](../../../cats-runtime/docs/decisions/042-bound-native-image-generation.md)
- [Platform ADR-120](../../../cats-platform/docs/decisions/120-scope-app-image-jobs-and-assets.md)
- [App 相容性與發布](../deployment.md#host-and-sdk-compatibility)

*Created: 2026-10-23。規劃文件，尚待實作前的跨 repository contract review。*
