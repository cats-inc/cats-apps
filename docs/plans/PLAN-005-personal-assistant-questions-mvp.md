# PLAN-005: Personal Assistant Questions MVP

## Metadata

- Status: Planning documents prepared; feasibility spikes and implementation not started.
- Working identity: Ask / `cats.ask`; no package version or release selected.
- Owner: cats-apps; Platform and Runtime own their corresponding integration work.
- Decision: [ADR-003](../decisions/003-delegate-personal-questions-to-first-party-assistants.md).
- Requirements: [SPEC-004](../specs/SPEC-004-personal-assistant-questions-mvp.md).
- Baseline: [2026-09-29 research](../research/2026-09-29-personal-assistant-delegation-baseline.md).

## Delivery order

先完成原產品能力到 Cats 的最小往返，再固定 SDK／背景服務契約，最後製作與驗收 App。
第一個實驗使用 Gemini Spark 的個人化建議，接著 Grok Bot + X Connector、Meta AI。
若某入口等待帳號設定，可繼續其他入口；三家各自保留驗證結果，不降低原本資料目標。

本輪只交付文件，不改使用者登入、connector 設定、真實狀態、套件版本或 Desktop。
後續執行依使用者當時的授權與帳號可用性前進，不因本計畫自行開始長期排程或部署 relay。

## A0 — Scope and baseline

- [x] 固定提問、非同步回覆與 copy/paste MVP，記錄導覽 SDK／跨產品整合延後。
- [x] 分開使用者在原產品的實測、官方文件及 Cats 端尚未驗證的往返。
- [x] 查核現有 renderer／SDK，確認同文件 drill down 可用，Ask／clipboard bridge 待補。
- [x] 建立 ADR/Spec/Plan 及索引，保留來源與下一步。

完成條件：文件互相連結且狀態一致；不把未做的 spike／產品驗收標示完成。

## A1 — Three product feasibility probes

每家先完成一次最小查詢往返，再測必要的故障／批准情境；不用完整 App 美化作前置。

| Order | Probe | Required observations |
|---|---|---|
| 1 | Spark：使用者已成功問過的興趣／YouTube 個人化建議 | 確切帳號與產品模式、問題交付、Personal Intelligence 與 connector 同任務可用、回傳及批准步驟。 |
| 2 | Grok Bot：依 X Connector 理解自己的發文歷史／授權內容，另測影片摘要 | Bot 與 connector 身分、正確內容、任務觸發與回收；不改接 Grok 網頁版。 |
| 3 | Meta AI：已儲存／自有／授權文章，另測 Reels 摘要 | 確切 Meta 入口、內容範圍及回傳方式；Muse 候選另記，不繼承其他入口證據。 |

- [ ] 為每家建立產品／帳號條件、觸發、個人資料能力、結果回傳、人工步驟、恢復的矩陣。
- [ ] 先檢查正式委派入口；如採 MCP，驗證 custom connector 真正可安裝與呼叫。
      grok.com 的 MCP 文件不作 Grok Bot 能力的替代證據。
- [ ] 驗證 external AI 領取明確的 Cats 問題，使用既有個人脈絡，並經機器通道回傳。
      人工登入／啟動／批准如不可少，記錄為 assisted；人工搬回答案不算整合通過。
- [ ] 確認訊息來源／request 關聯、回覆完整性、可用收據、延遲及產品用量資訊（未知即記未知）。
- [ ] 若需雲端端點，先固定暫時服務的持有人、受限能力、認證與回收方式；不暴露整個 Runtime。
- [ ] 正式入口不足時，記錄具體缺口，再評估 browser DOM bridge；Desktop UI 不作預設方案。
- [ ] 真實私人內容留在使用者授權的資料位置；追蹤文件只寫去識別結果、日期、版本及限制。

進入 A2 的條件：至少一家具備可實作的完整往返，其他入口保留狀態及下一個實驗。
A1 完成條件：三家都有可追溯的可行或受阻結論；只有通過 SPEC AC-01–03 才能宣稱三家完成。
若全部無法往返，保存具體限制並回報；不以公開搜尋、手動搬運或一般模型 API 冒充成功。

## A2 — Owning-repository contracts

依 A1 證據到各 owning repo 建立自己的 worktree、讀取指引並補對應 ADR/Spec/Plan。
本文件記錄依賴，不先配置不存在的跨 repo 文件編號或 API。

- [ ] Platform：固定 App permission／SDK 操作、owner/connection/request 關聯、答覆讀取介面
      及 clipboard 實作。
- [ ] Runtime：固定問答持久化與各產品 adapter 的交付、狀態觀測、回收收據、去重及未知完成處理。
      先評估既有 Core task/run/artifact 的適配程度。
      共通 execution 與產品差異分明，不要求所有助理都有推送、取消或無人值守能力。
- [ ] 固定 Platform request → Runtime execution → 外部問題 → answer 的對應與回覆認證；
      相同回覆重送不重複保存，衝突／過期／跨帳號回覆有明確拒絕或保留規則。
- [ ] 固定 host 停機時的保留／重送／輪詢責任。無持續接收端時，UX 不承諾停機後即時接收。
- [ ] 固定數值限制：問題／回答大小、等待期限、並行／佇列、保留量、刪除規則與 bounded logging。
      這些必須在 executable schema／storage 實作前有數值，不保留為無限預設。
- [ ] 判斷相容性與資料升級。若影響既有資料，先定義驗證、備份、原子替換與失敗恢復測試；
      不以重設資料或只 bump 版本替代。版本需求先記錄，發布另依授權執行。

完成條件：具體契約、擁有者、限制及 fixture strategy 可供實作；至少一個 A1 入口通過。

## A3 — Host/Runtime vertical slice

- [ ] 先實作 request 持久化、執行交付、status/read 與完整回答保存，離開 renderer 後仍可處理。
- [ ] 以隔離 fixture 測成功／部分／無權限／無內容、needs_user 與 unconfirmed。
- [ ] 驗證重複送出、回覆重送、衝突／遲到回覆、停機恢復及重問建立新 attempt。
- [ ] 驗證 disabled/version/account/connection 變更後的讀取與回覆收取政策，不洩漏其他帳號結果。
- [ ] 在真正的 App sandbox 驗證文字複製；若 browser clipboard 不可用，實作受限 host bridge。
- [ ] 將其他通過 A1 的入口依同一問答契約接入，各自保留能力差異與驗收狀態。

完成條件：服務與 SDK 的 focused tests/build 通過；已有可用 fixture 與一條真實 transport 證據。

## A4 — Ask App and package

- [ ] 新增獨立 `apps/ask`，消費實際可取得的版本化 SDK；不 import sibling 私有 source。
- [ ] 實作助理選擇、問題輸入、清單／詳情、狀態及小型複製按鈕；同文件 UI 切換。
- [ ] 保留問題、完整回答、理由與可選引用；文字安全呈現，不從回答自動執行動作。
- [ ] 開啟／重開／refresh 只讀既有紀錄；明確按下送出才提問。
- [ ] 尚未驗證或失去權限的入口顯示可理解狀態；不靜默選另一個產品。
- [ ] 確定需要的最小 host/SDK 契約後，依 release authorization 設定新套件版本與相容範圍。
      開發 fixture／原型先使用隔離輸出，不改現有 App 或 Desktop 版本。
- [ ] 用既有 builder 產生候選並驗證 actual archive；不以 source 頁面取代套件驗收。

## A5 — Acceptance and handoff

- [ ] 對照 SPEC AC-01–09，分別記錄三家實際往返、assist steps、內容類型與未驗證限制。
- [ ] 使用隔離 registry/state 執行 built package 的清單／詳情、重開、失敗恢復與 clipboard 測試。
- [ ] 針對實際 Desktop host 驗證中文、換行、連結及長回答貼上內容；其他 OS 另列未驗證。
- [ ] 記錄程式 focused checks、fixture、真實產品往返與 installed acceptance 的不同證據。
- [ ] 更新各 repo 狀態，完成獨立審查；不把工作分支文件或本機產物描述為已發布功能。

本計畫不要求 Market、導覽 SDK、跨產品注入或完整離線同步完成，才算本 MVP 可驗收。

## Risks and planned responses

| Risk | Response |
|---|---|
| 可提問但不能在同任務讀私人資料或回傳 | A1 分別驗證三個環節；保留原產品實測，不偷換資料目標。 |
| MCP 回傳每次都要批准 | 接受可觀測的 needs_user，記錄人工頻率；不把外送回覆偽裝為唯讀工具。 |
| 一家延遲／帳號限制卡住 | 繼續其他入口，但保持整體三家驗收未完成。 |
| 本機關閉錯失回覆 | A2 固定保存／重送責任；回收不了保持 unconfirmed，不自動重問。 |
| iframe 複製失敗 | 驗證 actual package，必要時補 host clipboard；明確拒絕時保留可選取本文。 |

## Resume checkpoint

2026-09-29：在 `.claude/worktrees/ask-mvp-scope`、分支 `docs/ask-mvp-scope` 完成首輪文件草稿。
下一步為 A1 的 Spark 個人化查詢往返驗證；Grok Bot 與 Meta AI 保持同等 MVP 目標。
未建立 App、部署 relay、設定第三方 connector、呼叫個人助理或改寫使用者資料。

文件驗證：

- `npm run check:docs` 通過：42 Markdown files、158 local targets；worktree 外 37 個 sibling links 由標準檢查略過。
- 本輪 13 份新增／修改文件另作連結映射檢查：112 個本地與 7 個 sibling targets 全部存在；無尾端空白或缺少結尾換行。
- `git diff --check` 通過。主 checkout 留在乾淨的 `main`。
- 本輪為文件工作，未執行 App builds/tests、真實產品往返或獨立審查。
- 使用者後續已授權 commit 與 PR，通過 repository checks 後自動合併；產品實作仍未開始。

*Created: 2026-09-29. Last updated: 2026-09-29.*
