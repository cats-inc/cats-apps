# SPEC-004: Personal Assistant Questions MVP

## Metadata

- Status: Draft technical contract; user-confirmed MVP scope (2026-09-29). No implementation or Cats-to-assistant acceptance yet.
- Owner: cats-apps for App UI/package; cats-platform for App SDK/host capabilities; cats-runtime for provider execution capabilities.
- Working identity: **Ask**, `cats.ask`, source slug `ask`; no package version assigned.
- Decision: [ADR-003](../decisions/003-delegate-personal-questions-to-first-party-assistants.md).
- Plan: [PLAN-005](../plans/PLAN-005-personal-assistant-questions-mvp.md).
- Evidence: [2026-09-29 baseline](../research/2026-09-29-personal-assistant-delegation-baseline.md).

## Summary

提供一個 Cats App，向使用者已有的 Gemini Spark、Grok Bot、Meta AI 提問，
取得該產品在使用者身分與授權範圍下能產生的回答，並提供複製按鈕。
使用者自行將回答貼到 Chat、Code、Work 或其他地方。

## Confirmed user context

以下是使用者在本次討論提供的實測經驗，尚未由 Cats 的整合流程重現：

- Gemini Spark 能依據對使用者的了解，提供興趣、偏好及 YouTube 推薦等高階建議。
  Google Workspace 原始資料 API 不代表同等的個人化能力。
- Meta 的目標包括已儲存貼文、自己的內容、有權限閱讀的文章與 Reels 摘要。
- Grok Bot 設定 X Connector 後，能理解這個使用者的發文歷史並處理相關內容。
  使用者確認 Grok 網頁版的 X connector 無法達成相同目標；兩者不得視為等價入口。
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
| FR-10 | App/account/connection 權限由 host/runtime 執行；回覆本文作為資料顯示，不能執行其中腳本、指令或自動發布到其他產品。 |

## Minimal UX

1. 選擇已設定的個人助理，輸入問題並送出；不可用入口顯示原因。
2. 清單保留問題、助理、時間與目前狀態；使用者可以繼續操作其他項目。
3. 詳情呈現原問題、回答及需要使用者完成的步驟；完成後可複製。
4. 再次查詢由使用者明確送出。MVP 不提供多助理自動 fan-out 或自動持續追問。

來源連結至少保留為可選取、可複製的文字；外部連結開啟介面不是本次前置依賴。
影片／Reels 以助理回傳的文字摘要為驗收內容，不新增影片下載或播放器。

## Proposed records and state semantics

以下是概念契約，實際 schema、SDK 方法、大小／並行限制及儲存方式在 PLAN-005 A2 固定。

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

- SDK 至少需覆蓋連線／能力讀取、提問、列出／讀取既有任務與答案，以及文字複製。
  實際名稱與授權在 Platform 文件固定；不得把這份概念清單宣稱為現有 SDK。
- 複製必須在真實 sandboxed App 驗證。必要時提供由使用者點擊觸發、只寫文字的
  host clipboard bridge；不需要讀取剪貼簿或放寬一般網路／同源權限。
- 問答資料保存在可更新套件以外的服務端儲存。通用持久化屬 Runtime workspace
  substrate；優先評估既有 task/run/artifact 原語，Platform 提供 App 權限與讀取介面。
  不另建通用知識庫，也不把這些私人答案寫入 Cats 產品知識文件。
- 外部登入與資料 connector 留在對方產品。Ask renderer 不接觸 cookie、token、
  shell 或任意 URL fetch；對外回覆通道限制到指定 owner/connection/attempt。
- Runtime adapter 負責產品入口與執行收據。正式 API、MCP 領取／回傳、事件或排程只是
  候選。三家分別固定啟動、可讀資料、回收及人工批准的能力矩陣。
- 若需 public endpoint／relay，先固定部署持有人、驗證、端點範圍、保留與失聯恢復。
  本機 Runtime 原有 MCP 端點不能直接當成已符合雲端產品 connector 要求。
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
- 新影片播放器／下載器、通用 App server/worker 執行器、Market 或 Desktop 發布。

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

AC-01–03 需分別記錄真實帳號的最小往返證據；fixture 成功只能證明程式處理，不能代替。
登入、產品端批准或人工啟動可標示為 assisted；人工搬運回答不能算回收通道成功。
任何入口仍未通過時，應回報其狀態與下一個實驗；不得將部分完成描述為完整三家支援。

## Compatibility and open decisions

新 SDK 能力優先採相容新增，保留現有 App 契約。若需破壞既有公開或持久資料契約，
在 owning repo 記錄所需版本邊界；資料升級需驗證、備份、原子替換及失敗恢復。
本輪不設定 App 版本、不 bump、不發布；宿主最低版本在實作證據出現後才固定。

尚待決定：每家 transport、部署方式、帳號可用性、批准流程、SDK／資料 schema、
資料保留／刪除與上限，以及無收據時的恢復策略。以上由 PLAN-005 分階段解除。

## References

- [App/package ownership](../architecture.md)
- [Official App package requirements](SPEC-001-official-utility-app-packages.md)
- [Existing Studio App slice](SPEC-003-media-studio-vertical-slice.md)

*Created: 2026-09-29. Last updated: 2026-09-29.*
