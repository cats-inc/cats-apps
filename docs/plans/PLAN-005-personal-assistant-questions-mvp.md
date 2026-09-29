# PLAN-005: Personal Assistant Questions MVP

## Metadata

- Status: Shared-ingress candidate implemented and independently reviewed. Local Platform/Mobile/two-App and installed Ask Windows Electron fixtures pass; live external tunnel/Bot and other-OS acceptance remain pending.
- Working identity: Ask / `cats.ask`; initial unpublished development package 0.1.0; no release selected.
- Delivery: commit, push and auto-merge PR authorized on 2026-09-29; no package publication or version bump.
- Owner: cats-apps; Platform and Runtime own their corresponding integration work.
- Decision: [ADR-003](../decisions/003-delegate-personal-questions-to-first-party-assistants.md).
- Requirements: [SPEC-004](../specs/SPEC-004-personal-assistant-questions-mvp.md).
- Baseline: [2026-09-29 research](../research/2026-09-29-personal-assistant-delegation-baseline.md).

## Delivery order

Grok Bot + X Connector 的人工啟動／MCP 回傳已通過獨立 probe，先交付此入口。
初版完整套件與元件宿主已有本機 fixture 證據；下一步先修正為 Platform／Mobile／
所有 Apps 共用入口，再重驗 `cats.ask` 套件。Ask 直接擁有自己的 API／儲存／MCP；SDK 僅用於宿主能力。
Gemini Spark 與 Meta AI 保留各自驗證，不因同品牌或一般 API 成功而啟用。

使用者先前已授權開 worktree 實作；共用入口文件先行後，已核對 Code Canvas MCP
提案並完成本機候選實作。Code 內部 MCP 不經公開入口；App MCP 由共用路由轉送。
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
| 1 | Grok Bot：自己的三篇已儲存書籤，另測影片摘要 | MCP 往返收據已核對；最新儲存順序僅推論，影片理解、自動觸發與產品恢復未驗證。 |
| 2 | Spark：使用者已成功問過的興趣／YouTube 個人化建議 | 確切帳號與產品模式、問題交付、Personal Intelligence 與 connector 同任務可用、回傳及批准步驟。 |
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
Platform ADR-125／SPEC-122／PLAN-115 已記錄協調契約；協調 worktree 已實作執行能力。

- [x] Platform：固定多前端／多服務／worker manifest、同 App 直接 HTTP／串流、
      原型 origin／授權、整體安裝更新／啟停／移除與 clipboard 能力；
      A4a 已補共用入口與新 sandbox 的本機驗收，真實外網另驗。
- [x] Apps：固定 Ask 自有 API／資料 schema、adapter 交付、MCP 領取／回傳、
      狀態觀測、收據、去重與未知完成處理。Runtime 只在需要共通執行能力時參與。
- [x] 固定 Ask request → 外部問題 → answer 的對應與回覆認證；
      相同回覆重送不重複保存，衝突／過期／跨 connection 或 attempt 回覆有明確規則。
      這不證明 X／其他 provider 帳號與 Cats connection 已驗證綁定。
- [ ] 另驗證實際助理／provider 帳號對應與帳號切換；connection/attempt token
      的成功核對不能代替外部帳號身分證據。
- [x] 固定 host 停機時的保留／重送／輪詢責任。無持續接收端時，UX 不承諾停機後即時接收。
- [x] 固定數值限制：問題／回答大小、等待期限、並行／佇列、保留量與 bounded logging。
      這些必須在 executable schema／storage 實作前有數值，不保留為無限預設。
- [ ] 明定使用者刪除／保留答案的規則；數量與逾時上限不等於資料刪除政策。
- [ ] 判斷相容性與資料升級。若影響既有資料，先定義驗證、備份、原子替換與失敗恢復測試；
      不以重設資料或只 bump 版本替代。版本需求先記錄，發布另依授權執行。

完成條件：具體契約、擁有者、限制及 fixture strategy 可供實作；至少一個 A1 入口通過。

## A3 — Complete App hosting and Ask services

- [x] Platform 先通過兩個前端、兩個服務與 worker 的單 App fixture；整體安裝與
      更新／停用／移除，前端直接呼叫 App API，不新增 Ask domain SDK 方法。
- [x] 先實作 request 持久化、執行交付、status/read 與完整回答保存，離開 renderer 後仍可處理。
- [ ] 以隔離 fixture 測成功／部分／無權限／無內容、needs_user 與 unconfirmed。
- [ ] 驗證重複送出、回覆重送、衝突／遲到回覆、停機恢復及重問建立新 attempt。
- [ ] 驗證 disabled/version/account/connection 變更後的讀取與回覆收取政策，不洩漏其他帳號結果。
- [x] 原型與 A4a opaque sandbox 的 Windows Electron clipboard 都已通過。
- [ ] 將其他通過 A1 的入口依同一問答契約接入，各自保留能力差異與驗收狀態。

完成條件：App 元件與直接通訊契約通過 focused checks，已有 fixture 與真實 transport 證據。
安裝後不需要使用者再開 terminal server 或分開安裝後端。

## A4 — Ask App and package

- [x] 新增獨立 `apps/ask`，同套件包含全部 Ask 前後端／MCP；消費版本化 host contract。
      自有 API 使用一般 HTTP／串流，宿主能力使用 SDK；不 import sibling 私有 source。
- [x] 實作助理選擇、問題輸入、清單／詳情、狀態及小型複製按鈕；同文件 UI 切換。
- [x] 保留問題、完整回答、理由與可選引用；文字安全呈現，不從回答自動執行動作。
- [x] 開啟／重開／refresh 只讀既有紀錄；明確按下送出才提問。
- [x] 尚未驗證或失去權限的入口顯示可理解狀態；不靜默選另一個產品。
- [ ] 確定需要的最小 host/SDK 契約後，依 release authorization 設定新套件版本與相容範圍。
      開發 fixture／原型先使用隔離輸出，不改現有 App 或 Desktop 版本。
- [x] 用既有 builder 產生候選並驗證 actual archive；不以 source 頁面取代套件驗收。

## A4a — Shared Platform ingress correction (next)

- [x] 更新 ADR／SPEC／PLAN：整個 Platform、Mobile 與所有 Apps 共用一個入口，
      `/apps/<appId>/` 路由由宿主持有；每個 App 仍是單一套件與生命週期。
- [x] 配合 Platform PLAN-115 P4 固定 reachable base URL、view grant、shared
      ingress status/setup 的精確 bootstrap 契約；自有 API 保持一般 fetch。
- [x] Tutorial 移除 Ask 專屬 ngrok token/setup；顯示 Platform 共用入口狀態，
      未設定時帶到 host 設定，完成後產生 `/apps/cats.ask/mcp` connector 指令。
- [x] 在 opaque sandbox 驗證 fetch／Copy／drill down／重新開啟，處理 grant 撤銷，
      不依賴 server localhost 或 Platform cookie。導航 SDK／答案深連結仍延後。
- [x] 配合 host 設定遷移與 URL 變更，保留既有 Ask data／receipt；需要使用者更新
      Bot connector 時清楚顯示，不自動重新提問或重設資料。
- [ ] 通過 AC-10：單一外部入口上的 Platform/Mobile + Ask + 第二個 App/MCP，
      跨 App／auth 拒絕與 Ask 停用時其他服務不中斷；再做真實 Grok Bot 往返。

## A5 — Acceptance and handoff

- [ ] 對照 SPEC AC-01–10，分別記錄三家實際往返、assist steps、內容類型與未驗證限制。
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

2026-09-29 共用入口候選：Apps 16 tests、Ask archive build、文件檢查通過。
Platform 的真實 router fixture 通過 Mobile auth + 兩個 App/MCP，同一入口上的
跨權限拒絕、單 App 停用與 owner session 撤銷。此為本機轉送側測試，未宣稱
外網 tunnel 或真實 Bot 已通過此版本。Platform 另測設定備份、原子寫入失敗與重啟恢復。

Windows Electron 已使用 actual archive 驗證建立、close、MCP get/submit、reopen、
Copy／貼上、Copy 拒絕提示及開啟 host 設定；opaque frame 無法讀 host DOM/cookie/storage。
新 archive SHA-256：
`0f3853ca845b5435faf2f091b79049d5f960c4f3921565501d06eb1bed91e217`。
消費 build/pack 的候選 SDK tarball，未 import sibling source，release pin 未改。
獨立審查修正設定導覽權限、連線狀態過期、一次性 ticket 重試與 host 關閉競態；
複查無剩餘 blocker。未 commit、發布、改真實 profile 或重新查詢私人 X 內容。
下一步為 A4a 最後一項的真實外網／Bot 驗收，再依發布授權處理 host/SDK 相容邊界。
文件檢查：43 Markdown／161 local targets；兩 repo 的 9 份本輪修改文件另查
59 個映射目標，全數存在；兩邊 whitespace check 通過。

歷史 checkpoint — 2026-09-29 共用入口修正：當時 ADR/SPEC/PLAN 先行，A4a／Platform P4 尚未實作。
以下為先前獨立 App origin／ingress 的歷史 fixture，不能作為 AC-10 或新 sandbox
驗收；程式保留在原 worktrees，未發布。此次只做文件 diff／link 與獨立審查。

本次文件檢查：`check:docs` 通過（43 Markdown、161 local targets，39 個 sibling
links 由標準檢查略過）；兩 repo 的 36 份修改文件另作映射檢查，1,244 個本地／
sibling targets 全部存在；兩邊 whitespace check 通過。獨立審查修正 ingress
ownership 衝突、外部帳號驗證與刪除政策的過度完成描述、憑證區分及編輯殘字；
複查無剩餘 blocker。這些檢查不構成共用入口或新 sandbox 的實作驗收。

2026-09-29 implementation: `feat/ask-mvp` / Platform `feat/app-components`。
Apps 16 tests、Usage build、Ask archive build 與文件檢查通過。協調 SDK 由 Platform
build 後 pack 成 tarball，再以 no-save 安裝；既有 release pin 未改。
Windows Electron 的實際套件 create → close → MCP get/submit → reopen → Copy →
paste 已通過（中文、換行、連結及字面 script 文字）；回覆使用隔離 fixture，
無真實 X 內容。Archive SHA-256：
`9e362b428837928457bbb6b3d0aa85e645fa344625d16d7cfe61c53c4933b6f6`。
Store/transport 覆蓋重複／衝突、過期／遲到、重啟 unconfirmed、connection rotation
及跨 attempt 拒絕。兩邊獨立審查修正後無 blocker。未 commit、發布、安裝到真實
profile 或測試此版本的 live Bot；ngrok 真實帳號連線、macOS/Linux 與其他助理待驗證。
最後文件檢查通過：42 Markdown、159 local targets；兩個 worktree 的修改文件另作
跨 repo 映射連結檢查，441 個目標全部存在；兩邊 `git diff --check` 通過。

2026-09-29 後續：Grok Bot synthetic 與 authenticated bookmarks probe 已回傳並核對收據；
save order 僅由陣列推論、影片理解未驗證、Bot 仍由使用者啟動。Cursor CLI OAuth／
41 個工具探索通過，但資料呼叫為 `client-not-enrolled`，不作可用 fallback。
詳細證據見 [Runtime 研究記錄](https://github.com/cats-inc/cats-runtime/blob/main/docs/research/2026-09-29-cats-ask-mcp-probe.md)。
實驗程式仍保留在本機 spike worktree，未隨文件提交。
本次修正 App ownership：一個套件可含多前後端，統一管理；下一步為 A2／A3。
文件檢查：`npm run check:docs` 通過（42 份 Markdown、159 個 local targets）；
跨 worktree 映射檢查另涵蓋 36 份修改文件的 1,338 個目標，全部存在。獨立審查指出
授權與 migration ownership 舊條款，修正後複查無 blocker。未執行 App build/test、
改寫真實 registry 或發布產品；使用者後續授權文件直接 commit/push 到 main。
這些檢查不是多元件執行驗收。
以下保留首輪文件的歷史 checkpoint，不能當成目前尚未做 probe 的狀態。

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
