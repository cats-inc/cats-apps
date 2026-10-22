# ADR-005: Provider-first Studio image operations

## Status

Proposed — 2026-10-23。使用者審閱 Studio 互動設計稿後，要求改為「先選服務，再做它能做的
事」，並把修圖納入同一個工作區。本決策修訂 [ADR-004](004-expand-studio-with-verified-image-profiles.md)
的 Decision 1（只做文生圖）與 Decision 5（比例只有原生 1:1 或自動），其餘 ADR-004
決策維持。行為定義在 [SPEC-006](../specs/SPEC-006-studio-image-workspace.md)，工作順序在
[PLAN-006](../plans/PLAN-006-studio-image-workspace.md)。不授權新的付費生成、版本 bump 或發布。

## Context

四家候選服務能做的事不同，證據等級也不同（見
[probe summary](../research/2026-10-23-studio-cli-media-probe-summary.md)）：

| 服務 | 生成 | 修圖（一張原圖） | 合成（多張參考） | 比例 |
| --- | --- | --- | --- | --- |
| Grok | 已實產 | `image_edit` 已定義，未實產 | `image_edit` 多圖已定義，未實產 | 生成 6 種、多圖 14 種；單圖修圖沿用原圖比例 |
| Muse | 已實產 | `image_paths` 僅回報 | `image_paths` 最多 50 張，僅回報 | 無結構化欄位 |
| Antigravity | 已實產（子代理） | 子代理描述提到，引數未知 | 未發現 | 只觀測到 1:1 |
| Codex | 已實產 | reference paths 僅回報 | 僅回報 | 無結構化欄位；`transparent_background` 僅回報 |

ADR-004 以「操作」為固定前提（只有文生圖），服務只是下拉選項。若把修圖加進同一個
表單而不先決定服務，畫面必須顯示一半服務做不到的控制項，或在送出後才拒絕。比例、
參考張數與透明背景也都是「服務 × 操作」才確定的屬性，不能共用一組選項。

## Decision

1. **選擇順序是服務 → 操作 → 該操作的輸入。** 服務是 provider + execution instance；
   選定後只顯示該服務已啟用的操作。沒有任何服務支援的操作不出現；某服務不支援的
   操作不以停用按鈕或「即將推出」佔位。
2. **操作是 profile 的一部分。** 首批操作詞彙為 `image.generate`（無原圖）、
   `image.edit`（恰好一張原圖）與 `image.compose`（兩張以上、有順序的參考）。每個
   profile 宣告自己的操作、輸入張數上下限、可提交的 options 與限制。Studio 只渲染
   宣告的內容，不保存 provider 專屬分支或模型白名單（延續 ADR-004 Decision 2）。
3. **比例依操作宣告，分四種模式。** `choose`（列出 profile 的比例 enum）、`native`
   （服務固定）、`service`（由服務決定，構圖寫在描述）、`source`（沿用原圖）。
   Grok 生成與多圖合成使用各自的 enum；單圖修圖為 `source`。比例 enum 擴充仍需
   該操作自己的驗證。
4. **原圖與參考只來自已保存作品。** Renderer 只傳作品 ID；Platform 依 App／account／
   version 授權並取得保存的原檔，Runtime 依 profile 轉成該服務可接受的輸入，放在
   本次 attempt 的受管位置並做 containment 檢查。不接受任意路徑、URL 或拖放匯入；
   本機檔案匯入需要 Platform 另立 host-side picker 權限決策。
5. **跨服務使用作品是允許的，但不偷偷轉檔。** 任何服務產出的作品都可以當另一服務的
   原圖，前提是符合該 profile 宣告的輸入格式與大小。不符合時以安全原因拒絕；只有
   profile 明確宣告並驗證過的轉換才可以執行。
6. **結果永遠是新作品，並記錄來源。** Job 記錄操作與有順序的來源 ID 及其 SHA-256；
   原圖不被修改或覆蓋。冪等性比對包含操作、來源與 options，任何改變都是 conflict。
   這是單層「基於」關係，不是版本樹 UI。
7. **透明背景只在 profile 宣告時提供，結果以量測為準。** 要求透明與實際含透明像素
   是不同事實；保存後顯示量測值（不透明／含透明像素／未知）。
8. **每個「服務 × 操作」各自通過門檻。** 修圖與合成不繼承生成的 bounded-route
   acceptance。EX-01 的「一次媒體呼叫、零重試」適用於每個操作；未證明能在生成前限制
   的操作保持不可用。
9. **Studio UI 先在 SDK 1.x 上交付。** Studio 以一個能力正規化層讀取 schema 1
   （Grok、生成、原生 1:1）與提案中的 schema 2。對 SDK 1.x host 只會出現 Grok 生成，
   行為與現有 Platform／Runtime 契約相容；schema 2 路徑以 fixtures 驗證，等 SDK
   major 與各 owner 的 A0 凍結後再接上。影片等其他媒體操作仍另案，但沿用同一個
   operation／profile 框架。

## Consequences

### Positive

- 使用者先看到服務真正能做的事，不會填完表單才被拒絕。
- 新操作或新 provider 由 Runtime profile 宣告即可出現，Studio 不加 provider 分支。
- 修圖、合成與跨服務接力使用同一套作品、來源與冪等規則。
- UI 改版可以先在目前的 SDK 1.x 上發布，不必等待四家 adapter。

### Negative

- contract 2 範圍變大：操作、來源、options 與量測透明度都要跨三個 repository 凍結。
- 每個新操作都需要自己的 bounded-route 證據，啟用速度比只做生成慢。
- 來源轉成各服務輸入（附件、路徑、data URL）是 Runtime 的新收集／隔離工作。
- 現有 Platform 的 Studio 瀏覽器驗收腳本依賴舊 UI 選擇器，需要配合更新。

### Neutral

- 生成仍是預設操作；沒有偏好時仍選可用的 Grok（SPEC-006 CAP-07）。
- 單次觀測的尺寸仍不是預設值或保證；比例模式描述控制方式，不描述結果。

## Alternatives Considered

### Alternative 1: 操作優先（先選生成或修圖，再選服務）

- **Pros**: 符合「我要修圖」的直覺；操作入口固定。
- **Cons**: 選完操作後可用服務會變少或變成零；比例、張數、透明度仍要依服務重排。
- **Why rejected**: 使用者明確要求先選 provider；能力差異集中在服務層，先選服務才不需要顯示做不到的選項。

### Alternative 2: 單一萬用表單，送出後由服務拒絕不支援的欄位

- **Pros**: 前端最簡單。
- **Cons**: 違反「不顯示未驗證功能」；拒絕可能發生在已使用額度之後。
- **Why rejected**: 與 ADR-004 的能力白名單與 EX-02 生成前限制衝突。

### Alternative 3: 開放本機檔案匯入當原圖

- **Pros**: 修圖用途更廣。
- **Cons**: 需要新的 host 權限、檔案大小／格式驗證與隱私邊界；renderer 不能取得路徑。
- **Why rejected**: 這期以已保存作品為來源；匯入另立 Platform 決策。

## References

- [ADR-004](004-expand-studio-with-verified-image-profiles.md)、[SPEC-006](../specs/SPEC-006-studio-image-workspace.md)、[PLAN-006](../plans/PLAN-006-studio-image-workspace.md)
- [Grok capability probe](../research/2026-10-23-grok-media-capability-probe.md)
- [Eight-session probe](../research/2026-10-23-eight-session-cli-media-probe.md)
- [Three-provider artifact probe](../research/2026-10-23-three-provider-image-artifact-probe.md)

---

*Decision proposed: 2026-10-23*
*Decision makers: owner（設計審閱與方向）*
