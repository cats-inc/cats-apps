# PLAN-004: Independent App Distribution

## Metadata

- Status: Planned; documentation only, implementation/publication not started.
- Owner: cats-apps；宿主生命周期／Market／SDK 由 cats-platform 負責。
- Governing decision: [Platform ADR-121](../../../cats-platform/docs/decisions/121-distribute-apps-independently-with-host-owned-lifecycle.md).
- Requirements: [Platform SPEC-120](../../../cats-platform/docs/specs/SPEC-120-app-market-and-lifecycle.md).
- Joint delivery: [Platform PLAN-112](../../../cats-platform/docs/plans/PLAN-112-app-market-and-lifecycle.md).

## Accepted product policy

Usage 隨 Desktop 預裝啟用，同時刊登 Market；移除／停用後 Home 仍有恢復入口。
Studio 不預裝，未安裝時無 Home placeholder，已安裝停用時保留卡片，移除後消失。
Home placeholder、出貨政策、信任、下載與清理都由宿主處理，不放進 Usage／Studio renderer。
兩者使用同一種 `.catsapp`，原始碼留在同一 repo，各自 version／build／release。

## Desktop management clarification (accepted, 2026-09-29)

Apps Marketplace 是 Desktop 的獨立頁面，Home 提供醒目入口。使用者在商店探索、
查看介紹與直接安裝，不必繞到 Settings 才能完成。Home 另保留已安裝 App 啟動卡片
與既定恢復入口。

Settings > Apps 聚焦已安裝清單、權限、機器層級設定、啟停、更新、修復與移除。
商店詳情也可提供合適的操作，兩者共用同一 Desktop lifecycle service／狀態，
不把 Settings 路徑當成唯一管理授權條件。Plugin 則維持 Settings > Plugins 獨立分頁，
Home 若提供 Plugin 管理捷徑則保持小型入口；Apps 商店不受這個小捷徑規則限制。

一般瀏覽器開啟 cats-platform 網頁，不因此取得這台 Desktop 的套件管理權限。
限制要由宿主管理操作的授權契約實施，不能只藏按鈕、信任 owner 登入、localhost
或前端傳入的環境旗標。瀏覽器／遠端呼叫不得自行觸發安裝或其他套件變更。
管理服務程式仍可由 cats-platform 持有；「repo 擁有服務」與「允許哪個 client 操作」分開。

已安裝 App 是否可由授權網頁使用，以及一般 App 內偏好設定，與這個管理限制分開決定。
本補充不改 Usage／Studio 的出貨、Home 卡片、格式或 SDK 能力，也不宣稱目前已限制網頁。
本次協同更新 Platform ADR-121／SPEC-120／PLAN-112 的管理要求與驗收項目；
context 的具體簽發／傳遞／撤銷契約、實作與驗收仍由 Platform 後續完成。

## Baseline and scope

現有 shared builder 能選取單一 App；`<slug>-vX.Y.Z` tag workflow 已可產生 `.catsapp`、
lock 與來源紀錄。Usage 0.4.0 已發布，Studio 0.1.0 有本機 artifact 與安裝驗證，
本計畫不把它當成已公開上架。公開 Desktop 0.5.13 bundle 仍只有 Usage。

新增官方目錄 metadata／promotion、相容性 fixtures、source-free SDK 開發與 App 更新演練。
不新增影片／修圖、第三方商店或任意 App 執行器，也不再呼叫真 Grok 生圖。

## A1 — Versioned SDK consumption and fixtures

- [x] 與 Platform 固定可取得的 SDK 開發產物、schema／能力型別與最低／candidate host matrix。
      以 exact-pin 的 `@cats-inc/cats-platform` devDependency 取得 `./app-sdk`；每個 App
      驗證宣告的最低 host／SDK，以及範圍接受時 pin 的 host。低於首個 SDK 版本的最低 host 以 pin 版本的
      規則檢查，舊 host 規則不重跑。
- [x] 以版本化契約驗證兩個 App，不 import sibling private source、不附帶宿主特權 bridge。
- [ ] 補最低能力不可用的可理解畫面；安裝或開啟 App 不自動呼叫生成／provider 登入。
- [ ] 更新 docs，區分 renderer build、host integration fixtures 與實際 provider acceptance。
- [ ] 與 Platform 固定 Desktop management context 與拒絕一般 browser mutation 的契約；
      App SDK 不提供 lifecycle 管理權，復原／Market 入口不繞過宿主授權。

## A2 — Official catalog content and promotion

- [ ] 維護 Usage／Studio 介紹、圖示、權限摘要、需求與中英文 release notes。
- [ ] 每版本記錄 App ID、immutable URL、size、SHA-256、來源 commit、相容範圍與所需能力。
- [ ] stable／preview 指向已驗證精確版本，與 GitHub repo-wide latest 分開。
- [ ] 實作 catalog schema 檢查與已發布 artifact identity 檢查，拒絕重複／覆寫版本。
- [ ] promotion workflow 產生遞增 revision／expiry、簽章並原子發布目錄；key 不進 repo。
- [ ] 用暫存 key 測試換 key、撤回／恢復版本、過期與錯誤 metadata；正式 trust 由 Platform 決定。

Catalog promotion 是發布動作，App tag 發布不自動選入目錄或 Desktop；目錄撤回也不刪作品。
本機 fixture endpoint 與 key 不能混入正式 metadata。公開 endpoint／key 管理在發布準備時確定。

## A3 — Independent release candidates

- [ ] 挑選未使用的 Usage／Studio 版本，依各自 manifest、package 與 workspace lock 同步。
- [ ] 因 host registry schema 2 預計需要下一 Desktop minor，重新驗證相容範圍；
      既有 Usage ^0.5.0／Studio ^0.5.11 不可直接宣稱支援 0.6，也不可覆寫舊 artifact。
- [ ] 使用既有 build pipeline 建立一次候選，下載後驗證相同 bytes；所有 catalog／Desktop pins
      都取已發布來源，不拿另一 OS rebuild 的 hash 替代。
- [ ] 若需修改 manifest／renderer，發布新 App 版本；相同 ID 的本機 Studio 交由宿主保留資料轉接。
- [ ] 以兩個可區分版本驗證獨立更新；App 改動不需要重打已相容的 Desktop。

以上版本選擇與真正 publication 必須在取得本次 App release 授權後執行，本輪只規劃。

## A4 — Joint acceptance

- [ ] 新 Desktop 只預裝 Usage，離線直接開啟；Studio 只在 Market 可發現。
- [ ] Usage 停用／移除／placeholder 重裝與修復；Market 與 bundle 都驗證同一包格式。
- [ ] Studio 安裝／停用／移除／重裝保留作品，取消與清理由宿主提供真實狀態。
- [ ] 壞包與錯 hash 能恢復或拒絕；新版本不相容／新增權限時明確處理。
- [ ] Market 更新後 Desktop 舊 bundled 包不蓋回；手動移除不被 Desktop 升級復活。
- [ ] 產物／SDK checks 與各 OS installed acceptance 分開記錄，補 source／hash／host matrix。
- [ ] Desktop Settings／Home 捷徑／Market 共用管理狀態；一般 browser 即使 owner 登入，
      直接呼叫 lifecycle mutation 仍被拒絕，registry／package／process 無變更。
- [ ] Home 的醒目入口直接開獨立 Apps Marketplace，探索／詳情／安裝不跳往 Settings；
      安裝完成同步 Home 與 Settings 已安裝清單，兩個入口不各自維護 installer。
- [ ] 驗證 localhost、偽造前端環境旗標、App iframe 均無法取得 Desktop 管理權限；
      已授權 Desktop 操作照常可用。上述 host 驗收由 Platform 提供隔離證據。

所有 fixture 使用暫存 registry／profile，資料回收驗收不動使用者作品或 provider 帳號。

## Publication order and responsibility

1. 準備宿主能力／migration、SDK 開發產物與 Apps 候選；完成隔離 review／validation。
2. 在對應授權內發布必要 SDK 與 App immutable artifacts，確認來源與下載 bytes。
3. 發布有相容篩選的官方 Catalog；尚未升級的 host 不可安裝不相容的新 App。
4. Platform 另外更新 Usage exact pin 並發布新 Desktop；Studio 不加入預裝清單。
5. 後續相容 App 更新只需 App release＋catalog promotion；不需要重發 Desktop。

## Resume checkpoint

2026-09-28：使用者要求規劃文件，尚未改 build／workflow、SDK 依賴、manifest 或 App 版本。
接續 Platform M0 固定契約後執行 A1／A2；發布前依 [App release SOP](../deployment.md) 驗證。

原始提案文件驗證：`npm run check:docs` 通過（38 份 Markdown、155 個本機目標，無略過 sibling links），
`git diff --check` 通過。獨立唯讀審查無剩餘阻擋；未執行 App build／tests 或新的 provider 呼叫。

2026-09-28 Desktop 管理界線補充：只更新 Apps 側文件，Platform 契約同步與實作尚未進行。
同日澄清：Apps Marketplace 必須獨立且由 Home 醒目進入；Settings 負責已安裝管理，
Desktop 管理權限不代表商店必須放進 Settings。
此補充未經獨立審查，驗證只涵蓋 Markdown 連結與 diff，不代表上述 host 存取限制已生效。
本補充的 `npm run check:docs` 通過（38 份 Markdown、156 個本機目標，無略過 sibling links）；
`git diff --check` 通過。未執行產品測試、build 或安裝。

2026-09-29：使用者要求完成這份補充的 commit／PR 與 auto-merge；同步 Platform 規劃，
保留實作與 acceptance 未完成的狀態。本次獨立唯讀審查無阻擋，已將 Home 小型捷徑
明確限定為 Plugin 管理入口。`npm run check:docs` 通過（38 份 Markdown、156 個本機目標，
無略過 sibling links）；兩 repo 6 份變更文件的 35 個本機檔案／anchor 目標檢查通過，
使用對應 worktree 核對跨 repo 連結。兩 repo 的 `git diff --check` 通過。
這些是文件驗證，未執行產品測試、build、安裝或 provider 呼叫，不代表 host 限制已生效。

2026-09-29：依 Platform ADR-123 改用已發布的 `@cats-inc/cats-platform/app-sdk`。
`build-app.mjs` 保留 renderer 組裝、版本檢查、lock 與 provenance，自製的 gzip envelope
改為 SDK 的 `encodeAppPackage`，並在寫出前以 `validateRendererAppPackage` 檢查宣告的最低
host，以及範圍接受時 pin 的 host。新增 `tests/sdk-build.test.mjs`，CI 與 release workflow
先執行 `npm ci --ignore-scripts`。以 registry 上的 Platform 0.6.0 驗證：12 項 App 測試通過。
沒有改 App 版本、manifest 或 release。

*Last updated: 2026-09-29*
