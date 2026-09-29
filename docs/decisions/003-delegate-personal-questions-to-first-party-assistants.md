# ADR-003: Delegate Personal Questions to First-party Assistants

## Status

Proposed — 2026-09-29. The user confirmed the MVP scope and requested ADR/Spec/Plan
work. Product requirements below preserve that scope; transport and host/runtime
contracts remain proposals pending feasibility evidence. Planning uses **Ask** /
`cats.ask`; no package version, implementation or release is declared.

## Context

使用者需要 Gemini Spark 已具備的個人化理解與推薦，以及 Grok Bot、Meta AI
在使用者身分／connector 授權下取得的內容。使用者已在原產品實測相關能力；
Cats 到這些產品的完整往返尚未驗證。資料 API、公眾貼文搜尋及同品牌模型 API
不能證明取得相同的個人脈絡。Grok 網頁版與 Grok Bot 必須分別辨識。

現行 Cats App 可以在單一 sandboxed HTML 文件中切換清單與詳情。可執行 SDK 1.3
提供 Usage、圖片工作與返回 Lobby，尚無 Ask 任務或文字 clipboard 介面。
一般 storage/action/navigation 型別的存在不表示已實作。檢查基準與官方入口資料
記在 [feasibility baseline](../research/2026-09-29-personal-assistant-delegation-baseline.md)。

## Decision

1. 規劃獨立 Cats App **Ask**，工作套件 ID `cats.ask`、source slug `ask`。
   MVP 流程為選擇個人助理 → 提問 → 查看狀態／回答 → 按小型複製按鈕。
2. 委派對象是具體的產品、使用者連線及助理環境。Gemini Spark、Grok Bot、Meta AI
   分開驗證；不得將 Grok 網頁版、Grok Build CLI 或通用模型 API 當成 Grok Bot fallback。
   Meta Muse 若成為候選，另記其產品入口與驗證，不自動承接 Meta AI 能力。
3. 採非同步任務語意，快回覆可立即顯示。外部開始執行必須有觀測依據；
   排隊、等待助理、需要使用者操作與結果未確認不能混為「查詢中」。
4. 優先驗證正式委派入口，或由外部助理透過受限 connector 領取問題及回傳結果。
   MCP 是候選傳輸，不代表有喚醒能力、可與私人資料工具同時使用，或可免批准回傳。
   觸發、查詢能力、回傳是三個各自需要通過的契約。
5. App renderer 經版本化 Platform SDK 操作。Platform 擁有 App/owner 授權、
   文字複製與問答讀取介面；Runtime 擁有通用 workspace 持久化能力、委派執行、
   外部通訊 adapter、回收及執行收據。具體儲存與投影契約由後續兩個 owning repo
   文件固定；此 ADR 不宣稱它們已有 Ask API。
6. 問答生命週期由背景服務持有。離開 App 可重開查看；純本機 host 停機時，
   不承諾仍能接收回覆。雲端回覆如何保留、重送與重啟後回收必須由選定 transport 證明。
7. 先保存 request identity 再送出；同一 request 的本機重試與回覆接收須去重。
   外部缺乏去重或查詢收據時，結果不明不得自動再次提問。不能宣稱跨供應商 exactly-once。
8. 回答保存本文、原問題、來源產品／連線、時間與已有引用。個人化理由可以是助理判斷；
   不強迫每句推薦附原始資料連結，也不把回答當成完整資料匯出或經核實的使用者記憶。
9. MVP 由使用者複製／貼上到 Chat、Code、Work。導覽 SDK、答案深層連結、宿主歷史同步、
   跨產品交付、共用答案檢索及自動長期記憶明確延後。

## Consequences

- Ask 可專注驗證使用者已有的第一方能力，UI 與每家產品的接法分離。
- 同一 App 可逐個接入三個產品，但每個入口都有獨立驗收；第一個成功不代表三家完成。
- 使用者在原產品登入、啟動或批准的步驟可能仍存在，需呈現且納入驗收。
- 需要 Platform/Runtime 能力補充；現有 SDK 無法僅靠新增一份 renderer 完成此功能。
- 雲端助理若需回呼本機，需受限且可達的端點或 relay。部署方式、認證、版本及保留策略
  在 transport spike 後固定；本次不開 tunnel、不保留連接埠、不部署服務。
- App 內多層 drill down 可用本地 UI 狀態完成，沒有導覽 SDK 的前置依賴。

## Alternatives considered

| Alternative | Assessment |
|---|---|
| 使用原始資料 API／一般搜尋自行重建答案 | 可處理其他用途，但無法證明使用了原助理的個人化理解和授權環境，不作本 MVP 替代驗收。 |
| 以同步 provider completion 包住所有產品 | 無法如實表示人工批准、延後觸發及不明完成狀態；採背景任務加即時呈現。 |
| 直接控制已登入頁面的 DOM | 保留為正式入口不足時的候選，須另記身分保持、頁面變動、回覆完整性與恢復證據。 |
| Desktop UI automation | 使用者不希望作首選；只作後續明確評估的 fallback，不預設已選定。 |
| 讓使用者從原助理手動搬回答案 | 可供對照測試；不構成 Cats 交付問題並回收答案的整合成功。 |
| 先建跨產品知識庫與自動注入 | 超出使用者指定的 copy/paste MVP，延後。 |

## References

- [SPEC-004](../specs/SPEC-004-personal-assistant-questions-mvp.md)
- [PLAN-005](../plans/PLAN-005-personal-assistant-questions-mvp.md)
- [Repository boundaries](../architecture.md)
- [Versioned App package foundation](001-own-official-utility-apps-and-coordinate-desktop-distribution.md)

*Created: 2026-09-29. Last updated: 2026-09-29.*
