# SPEC-004: Personal Assistant Questions MVP

## Metadata

- Status: Shared-ingress candidate implemented (2026-09-29). Local Platform/Mobile/two-App integration and installed Ask Windows Electron fixtures pass. Live external tunnel/Bot, other operating systems and other providers remain pending; no release selected.
- Owner: cats-apps for all Ask UI/services/data/MCP and package; cats-platform for component hosting/lifecycle and host capabilities; cats-runtime for optional shared execution capabilities.
- Working identity: **Ask**, `cats.ask`, source slug `ask`; initial unpublished development package 0.1.0. No release authorized.
- Decision: [ADR-003](../decisions/003-delegate-personal-questions-to-first-party-assistants.md).
- Plan: [PLAN-005](../plans/PLAN-005-personal-assistant-questions-mvp.md).
- Evidence: [2026-09-29 baseline](../research/2026-09-29-personal-assistant-delegation-baseline.md).

## Summary

提供一個 Cats App，向使用者已有的 Gemini Spark、Grok Bot、Meta AI 提問，
取得該產品在使用者身分與授權範圍下能產生的回答，並提供複製按鈕。
使用者自行將回答貼到 Chat、Code、Work 或其他地方。

## Confirmed user context

以下保留使用者的產品需求；Grok Bot 書籤往返已有 probe 證據，其他能力分別驗證：

- Gemini Spark 能依據對使用者的了解，提供興趣、偏好及 YouTube 推薦等高階建議。
  Google Workspace 原始資料 API 不代表同等的個人化能力。
- Meta 的目標包括已儲存貼文、自己的內容、有權限閱讀的文章與 Reels 摘要。
- Grok Bot 設定 X Connector 後，能理解這個使用者的發文歷史並處理相關內容。
  使用者確認 Grok 網頁版的 X connector 無法達成相同目標；兩者不得視為等價入口。
  使用者後續澄清自己未發文，實際驗收改查三篇已儲存書籤；不宣稱測過自有發文歷史。
- 核心價值包含第一方 AI 的個人化理解、使用者授權內容及其整理判斷能力。
  公開貼文搜尋或單純模型 API 的成功，不足以驗證本 MVP。

## Target products and content

| Product | Cats integration acceptance |
|---|---|
| Gemini Spark | 由 Cats 提問，仍能使用原產品的個人化能力，回傳包含推薦理由的回答。 |
| Grok Bot + X Connector | 在正確 Bot／X 授權環境查詢；發文歷史、私人／儲存內容及影片各依實際可用範圍驗收。 |
| Meta AI | 記錄確切產品入口與可用內容範圍；已儲存貼文、自己的內容、授權文章及 Reels 逐項觀測。 |

Grok 網頁版、Grok Build CLI、一般模型 API 不作 Grok Bot 的等價替代。
Meta Muse 若成為候選，需獨立入口證據，不因品牌相同自動承接 Meta AI 的能力。

## Functional requirements

| ID | Requirement |
|---|---|
| FR-01 | 獨立 App 入口，呈現助理選擇、問題輸入、問答清單、詳情與小型複製按鈕。清單與詳情在同一已載入文件內切換。 |
| FR-02 | 助理選項以產品及使用者連線辨識，呈現未設定／未驗證、可使用、需要操作或不支援；一般 provider 可用不代表個人助理可用。 |
| FR-03 | 明確送出才建立執行；保存 request identity 後交付。開 App、切頁、重開、查詢狀態及複製不自動再次提問。 |
| FR-04 | 支援非同步狀態與重新讀取。沒有外部確認時顯示等待，不推測已開始；登入、批准等要求顯示具體下一步。 |
| FR-05 | 保存完整回答文字／Markdown、原問題、產品／連線、時間及已提供的引用。保留推薦理由與不確定性；來源欄位允許缺省。 |
| FR-06 | 區分有回答、部分回答、查無內容與無權限。助理回覆「無法存取」可記錄，但不能算該私人內容能力驗收通過。 |
| FR-07 | 使用者按下複製後，複製所選回答的本文及其中連結；成功確認後才顯示已複製，失敗保留可選取文字並明示未成功。 |
| FR-08 | App 離頁／關閉後，背景任務不依賴 renderer 存活；重開讀取已保存狀態／回答。host 停機期間能否回收依 transport 證據呈現。 |
| FR-09 | 每個 attempt 固定目標與問題。再次提問建立明確的新 attempt；相同回覆的重送去重，不覆蓋另一筆問題或另一個帳號的答案。 |
| FR-10 | Platform 執行 App/owner hosting 與宿主能力授權；Ask 後端執行 connection/attempt/question 權限與回覆驗證；Runtime 僅授權實際使用的 Runtime 能力。回覆本文只作資料顯示，不執行其中腳本、指令或自動發布。 |

## Minimal UX

1. 第一個可用入口為 Ask Grok Bot，首頁同時列出既有提問。
2. 點擊後在 App 內 drill down：上方為可收合的首次連線 tutorial，下方為 composer。
   教學協助使用者在 Bot 設定 Cats connector；不要求另外安裝或管理 Ask 後端。
3. 按「建立提問」保存 request，顯示「複製 Bot 執行指令」。使用者貼到 Bot 啟動；
   Bot 領取指定問題、使用 X Connector，再透過 Ask MCP 回傳。Submit 不假稱喚醒 Bot。
4. 詳情呈現原問題、狀態、完整回答與限制，以及複製回答。重開讀取同一紀錄。
5. 再次查詢由使用者明確送出。Gemini Spark／Meta 待各自驗證再啟用；不作靜默 fallback。

來源連結至少保留為可選取、可複製的文字；外部連結開啟介面不是本次前置依賴。
影片／Reels 以助理回傳的文字摘要為驗收內容，不新增影片下載或播放器。

## Proposed records and state semantics

以下是概念契約，Ask API/schema、必要的宿主 SDK 能力、大小／並行限制及儲存方式在 PLAN-005 A2 固定。

| Record | Required meaning |
|---|---|
| Connection | owner、具體產品、助理／帳號環境的非敏感識別、可用狀態、已驗證能力及觀測時間；建立連線不代表已驗證所有資料權限。 |
| Question / attempt | 穩定 request ID、問題本文、固定 connection、狀態、時間、可用時的外部收據、需要使用者操作的原因；明確重問才產生新 attempt。 |
| Answer | 所屬 attempt、回答本文、回答時間／接收時間、來源產品／連線、可選引用、完整／部分／無權限／無內容等結果。 |

| State | Required observation |
|---|---|
| queued | 本機已保存問題，尚未確認交付。 |
| awaiting_assistant | 問題已可供外部助理取得或已交付，尚未觀測執行開始。 |
| running | 選定 transport 確認該 attempt 正在執行；無此證據的 adapter 可跳過此狀態。 |
| needs_user | 明確需要登入、啟動、批准或其他人工作業；保留前一階段供完成後續接。 |
| succeeded | 回覆已核對 attempt/connection 並持久保存；另記結果是否真的含所需內容。 |
| failed | 有明確的終止失敗證據，且保留問題與可理解原因。 |
| unconfirmed | 逾時、斷線或重啟後無法確認外部是否完成；可查詢／回收同一次執行，禁止偷偷重送。 |

允許 queued → awaiting_assistant → succeeded，無需虛構 running。
needs_user 完成後依收據續接；unconfirmed 收到有效遲到回覆可轉為 succeeded。
重複的相同回覆保持原結果；衝突回覆保留原結果並回報，不以最後寫入任意覆蓋。
遲到回覆只能完成原 attempt，不能填到使用者後來重問的新 attempt。

## Host and Runtime integration requirements

- Ask 是單一安裝與更新單位，可含多個 frontend/service/worker。全部元件由 App
  套件宣告與交付，Desktop 統一啟停、修復與移除；後端不是第二個安裝項目。
- Ask 前端直接用一般 HTTP／串流操作自己的連線、提問、清單與答案 API。
  Platform 提供 sandbox 隔離、共用入口路由、身分／權限與啟動資訊，不為每個 Ask
  operation 增加 SDK 方法。平台可做透明路由，但不擁有 Ask API 的 domain schema。
  SDK 留給 clipboard、宿主導覽及其他 Cats 能力；其方法與授權由 Platform 固定。
- 複製必須在真實 sandboxed App 驗證。必要時提供由使用者點擊觸發、只寫文字的
  host clipboard bridge；不需要讀取剪貼簿或放寬一般網路／同源權限。
- 問答資料由 Ask 後端持有，放在套件 bytes 以外的 App data directory。Ask 負責
  schema／migration，Platform 協調整個 App 的更新、備份與啟用。共通 Runtime
  儲存可依實際需要採用，不能因為需要持久化就將 Ask domain 搬到 Runtime。
  私人答案不寫入 Cats 產品知識文件。
- 外部登入與資料 connector 留在對方產品。Ask 前端能存取自身宣告 API，無需取得
  外部 provider token 或宿主權限；對外回覆通道限制到指定 owner/connection/attempt。
- Ask adapter 負責產品入口與執行收據。正式 API、MCP 領取／回傳、事件或排程只是
  候選。三家分別固定啟動、可讀資料、回收及人工批准的能力矩陣。
- Platform、Cats Mobile 與所有 Apps 共用一個 public origin／HTTPS port／tunnel。
  Platform 持有入口設定、路由與 tunnel 生命週期；Ask 掛載 `/apps/cats.ask/`，
  私有 API 為 `/apps/cats.ask/api/...`，MCP 為 `/apps/cats.ask/mcp`。內部服務可
  使用動態 loopback port／IPC，不能將 localhost URL 交給遠端瀏覽器或 Mobile。
  停用／更新／移除 Ask 只撤銷自己的路由及 grant，不停止共用 tunnel 或其他 App。
  Runtime 原有 MCP 不作 Ask 公開入口；沒有分開安裝 backend／tunnel App 的流程。
- 共用入口的 private API 仍需 owner/App/generation grant，使用一般 fetch 與
  `credentials: omit`；MCP 使用 Ask connection／attempt 認證，不能交換使用。
  Host shell 驗證 viewer，App 文件採 opaque sandbox；path prefix 不構成隔離。
  Platform 負責 CORS／CSRF／frame bridge／URL 邊界，依 Platform SPEC-122 驗收。
  遠端開 App 不賦予安裝或管理原生元件的權限；Desktop 管理邊界保持獨立。
- Tutorial 只顯示 host 提供的共用入口狀態及 Ask endpoint，必要時開啟 Platform
  remote-access 設定。App 不收取、保存或管理 ngrok／Tailscale 帳號憑證。
  公開 URL 改變時顯示重新設定 Bot connector 的步驟；保留問題、答案與收據，
  不自動重問。Platform 負責原型 ingress 設定的驗證、備份、原子遷移及失敗恢復。
- 系統需區分本機 request 去重與外部執行去重。確認不了外部收據時，保留 unconfirmed；
  使用者明確重問才建立可能產生新用量的 attempt。
- 私人回答不進追蹤中的測試 fixture、研究附件或日誌；驗收報告保留去識別的結論。

## Deferred scope

- 答案的 Cats 深層連結，以及 App 內部頁面和宿主上一頁／下一頁同步。
  後續由 cats-platform 評估導覽 SDK；使用者明確要求本 MVP 不做。
- 「用於 Chat／Code／Work」、跨產品自動帶入、共用答案搜尋工具、通知後自動續跑，
  以及將答案自動加入長期記憶。MVP 採使用者自行複製／貼上。
- 完整斷網排隊／同步、持續運作的雲端代管承諾、進階分類、答案比較與使用者定期排程管理。
  若 transport 需要對方排程領取問題，可作整合設定，不擴張為 App 的排程產品功能。
- 對來源社群發布、按讚、修改收藏或刪除內容；本 MVP 查詢與回傳答案即可。
- 新影片播放器／下載器、Market 或 Desktop 發布。Platform 通用 App 多元件執行
  是本 App 的必要前置，依 Platform SPEC-122 交付；不再以延後 server/worker 為由
  要求使用者分開啟動後端。

## Acceptance

| ID | Acceptance evidence |
|---|---|
| AC-01 | 實際 Cats request → Gemini Spark → Cats 回覆，包含使用者認可的個人化推薦與理由；記錄人工步驟，不要求與歷史推薦逐字一致。 |
| AC-02 | 實際 Grok Bot + X Connector 查詢與回收，使用者可核對自己的內容／歷史；記錄所測內容種類，沒有 Grok 網頁／模型 API 替換。 |
| AC-03 | 實際 Meta AI 指定入口往返，核對所測授權內容／Reels 摘要；列出已驗證與未取得的範圍。 |
| AC-04 | 尚未通過往返的入口仍標示未驗證或不可用；任一家成功不標示三家完成。 |
| AC-05 | 使用真實 built package 與隔離 host 測試清單 → 詳情 → 返回、離頁後完成及重開讀取。 |
| AC-06 | Desktop 中按複製後貼到測試文字區，中文、換行、連結與長回答保持一致；clipboard 拒絕時不顯示成功。 |
| AC-07 | 重送 request、重複／遲到／衝突回覆、斷線與重啟不混答、不默默重新提問；無收據時保持 unconfirmed。 |
| AC-08 | 錯 owner/connection/attempt 與撤銷權限的呼叫被拒絕；惡意回答只作資料顯示。 |
| AC-09 | 確認實際最小 host/SDK/Runtime 相容契約，安裝不呼叫 provider；測試只用隔離 registry/state。 |
| AC-10 | 同一公開 origin／port／tunnel 同時服務 Platform、遠端 Mobile、Ask 及另一個 App/MCP。Ask URL 不含 server localhost；停用 Ask 不影響其他服務；跨 App token 與未授權私有 API 被拒絕，於新 sandbox 重新驗證 Copy。 |

AC-01–03 需分別記錄真實帳號的最小往返證據；fixture 成功只能證明程式處理，不能代替。
登入、產品端批准或人工啟動可標示為 assisted；人工搬運回答不能算回收通道成功。
任何入口仍未通過時，應回報其狀態與下一個實驗；不得將部分完成描述為完整三家支援。

## Shared-ingress candidate checkpoint (2026-09-29)

Ask uses the Platform's `/apps/cats.ask/` mount. Its relative bootstrap base URL
and view bearer authorize direct HTTP with credentials omitted; MCP uses its
separate connection/attempt credentials. The tutorial shows shared readiness and
the complete `/apps/cats.ask/mcp` URL, and opens host setup through
`catsApp.openRemoteAccess()`. It never collects a tunnel authtoken.

Copy uses the permission-checked `catsApp.clipboard.writeText` bridge.
Connection-state refresh preserves composer text/focus, and initialization retry
does not reload a consumed launch ticket. Actual installed Windows Electron
acceptance includes opaque-frame isolation, close/MCP reply/reopen, real
clipboard paste, denial feedback and host setup navigation. See PLAN-005 for
archive identity and remaining live external acceptance.

## Historical local Grok prototype (before shared ingress)

The implementation branch introduces the initial private Ask package identity
`0.1.0`; this is not a release or a bump of an existing App. Its archive requires
the unpublished Platform component contract (envelope 2), in addition to the
manifest version ranges. Current published renderer-only hosts cannot install it.
Development acceptance consumes a built/versioned Platform candidate package,
never imports sibling source. The final released host minimum remains a release gate.

Ask owns one HTML frontend and one bundled service containing private `/api` and
external `/mcp`. Its state is `ask.json` schema 1 in the host-provided generation
directory. Writes are serialized and atomically replace the file after retaining
a validated previous-state backup; malformed data is not reset. The App migration
validates recognized schema 1; later schema changes must add an explicit migration.

One local connection has a random bearer credential. Each question has a distinct
request ID, attempt ID and secret; MCP never lists questions. Connection rotation
revokes old attempts. Fetch and submit require all identities to match. Equal
answer retries return the original receipt; conflicting answers preserve it.
Reopening changes unresolved `awaiting_assistant` to `unconfirmed` and never sends
anything. Preparing the same question returns the same attempt; explicit re-asking
creates a separate record.

Numeric bounds: 8,000 question characters; 64,000 answer characters; 20 HTTPS
sources with 2,000-character URLs; 4,000 characters each for evidence/limitations;
500 questions; 32 MiB state; 512 KiB request body; 8 simultaneous MCP requests;
120 MCP requests/minute/connection; unanswered attempts expire after 7 days.
Completed identical receipts remain retrievable after expiry. No source content,
question text, connection secret or answer is written to product logs.

The UI offers Ask Grok Bot, a collapsible first-connection tutorial, composer,
question detail and recent questions. Creating a question saves it first.
Preparing and copying its instruction are explicit actions; the user pastes into
Bot to initiate. The prototype tutorial configures per-App ngrok ingress; this
must be replaced by shared Platform ingress status/setup and an `AddMcpServer`
instruction using `/apps/cats.ask/mcp`. That UI correction is not implemented.
Bot's X Connector remains untouched.
Answers, sources, evidence and limitations render as text and can be copied.
Gemini Spark and Meta AI remain unavailable pending their separate real proofs.

## Compatibility and open decisions

新 SDK 能力優先採相容新增，保留現有 App 契約。若需破壞既有公開或持久資料契約，
在 owning repo 記錄所需版本邊界；資料升級需驗證、備份、原子替換及失敗恢復。
初始實作版本見上節；這次共用入口文件修訂不設定或更動套件版本、不發布。
宿主發布最低版本在實作與安裝證據出現後才固定。

待完成：Platform 共用入口／sandbox 與精確 bootstrap 契約、候選套件真實 Bot 往返、
Spark／Meta 的 transport／帳號／批准驗證及實際 release 相容下限。Ask 初版資料
schema、數值上限與 unconfirmed 策略已在上節固定；後續依 PLAN-005 驗收。

## References

- [App/package ownership](../architecture.md)
- [Official App package requirements](SPEC-001-official-utility-app-packages.md)
- [Existing Studio App slice](SPEC-003-media-studio-vertical-slice.md)

*Created: 2026-09-29. Last updated: 2026-09-29.*
