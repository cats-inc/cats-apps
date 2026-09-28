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

## Baseline and scope

現有 shared builder 能選取單一 App；`<slug>-vX.Y.Z` tag workflow 已可產生 `.catsapp`、
lock 與來源紀錄。Usage 0.4.0 已發布，Studio 0.1.0 有本機 artifact 與安裝驗證，
本計畫不把它當成已公開上架。公開 Desktop 0.5.13 bundle 仍只有 Usage。

新增官方目錄 metadata／promotion、相容性 fixtures、source-free SDK 開發與 App 更新演練。
不新增影片／修圖、第三方商店或任意 App 執行器，也不再呼叫真 Grok 生圖。

## A1 — Versioned SDK consumption and fixtures

- [ ] 與 Platform 固定可取得的 SDK 開發產物、schema／能力型別與最低／candidate host matrix。
- [ ] 以版本化契約驗證兩個 App，不 import sibling private source、不附帶宿主特權 bridge。
- [ ] 補最低能力不可用的可理解畫面；安裝或開啟 App 不自動呼叫生成／provider 登入。
- [ ] 更新 docs，區分 renderer build、host integration fixtures 與實際 provider acceptance。

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

文件驗證：`npm run check:docs` 通過（38 份 Markdown、155 個本機目標，無略過 sibling links），
`git diff --check` 通過。獨立唯讀審查無剩餘阻擋；未執行 App build／tests 或新的 provider 呼叫。

*Last updated: 2026-09-28*
