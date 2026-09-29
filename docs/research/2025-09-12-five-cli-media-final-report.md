# 五大 CLI 多媒體能力最終實測報告 - 2025-09-12

測試人：sammykenny2
測試主題：台北賽博龐克夜市 1:1 低解析文生圖 -> 6秒 480p 圖生影片
測試語言：繁體中文 prompt

---

## 一、實測總表

| CLI | 開發商 | 生圖 (文生圖) | 生影片 | 額度/門檻 | 實測檔案路徑 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Antigravity** | Google | **Yes**，`generate_image` -> **Imagen 3 寫死**，不能改模型ID | **No 原生**，要自備 `GOOGLE_API_KEY` 刷 **Veo 2** / Veo 3，約 $1.75-2.5 / 5秒 | settings.json 不能改模型ID，需額外付費Key | 無，需付費才有 |
| **Grok Build** | xAI | **Yes**，`image_gen` -> **xAI Imagine**，支援 1:1, 16:9, 9:16, 3:2, 2:3 | **Yes (唯一全通)**，`image_to_video` 6秒/10秒 480p/720p 圖生影片 + `reference_to_video` 1-15秒 | **必須關掉 /privacy (ZDR)**，否則報錯 `Video generation tools are unavailable under zero data retention (ZDR)`。或自備 S3/GCS bucket | 圖：`~/.grok/sessions/.../images/1.jpg`，影片：關閉privacy後成功生成 (videos/ 目錄) |
| **Codex** | OpenAI | **Yes**，`image_gen__imagegen` -> **gpt-image-2** (官方記載)，無比例/解析度參數，只能靠prompt暗示 | **No 原生**，無 Sora 工具 | 吃 Codex Pro 一般額度，測試時已用26%剩74%，credits 0 | `~/.codex/generated_images/01a091f5-1234-7122-8327-1f183874bed2/exec-861f1776-2c54-4fab-b45a-412fb93dbb8f.png` (1254x1254, 2.6M PNG) |
| **Claude Code** | Anthropic | **No**，工具清單無生圖工具，僅有上傳截圖/傳送檔案。可用 Bash 接本機 ImageMagick/Pillow 或外部 SD/Replicate | **No**，最接近是 Chrome gif_creator 錄製瀏覽器操作成GIF，非AI生成 | 需自備外部模型/API | 無 |
| **Muse** | Meta | **No** | **No** | 需靠 fb-knowledge.md 等外掛珍藏 | 無 |
| **Cursor** | Cursor | 未測試 | 未測試 | - | - |

---

## 二、各家詳細自白

### 1. Grok Build (xAI Grok 4.6)
- 原生工具：image_gen, image_edit, image_to_video, reference_to_video
- 生圖限制：只能選長寬比 (auto, 1:1, 16:9, 9:16...)，不能指定 1024x1024 精確像素
- 生影片限制：只有圖生影片，6秒或10秒，480p預設，720p需明講
- 失敗案例：開著 /privacy (ZDR) 時，`image_to_video` 會失敗，提示：`Video generation tools are unavailable under zero data retention (ZDR). To enable, either turn off /privacy mode to disable ZDR or supply a user-hosted storage bucket.`
- 成功案例：關掉 /privacy 後，6秒 480p 圖生影片成功

### 2. Codex (OpenAI)
- 原生工具：image_gen__imagegen (13個核心工具之一)
- 模型：官方記載 gpt-image-2，工具未回傳模型識別資訊
- 限制：無法直接設定比例/解析度/品質，無最低成本設定
- 實測：台北賽博龐克夜市圖成功，1254x1254 2.6M，路徑如上
- 影片：無此原生工具

### 3. Claude Code
- 搜尋結果：整份工具清單 (150+個介面) 裡沒有任何圖片或影片生成工具
- 可行替代：Bash執行本機已安裝工具、Artifact產生HTML/SVG、Chrome截圖
- 實測：目前額度內無法免費生成，因為根本無此原生工具

### 4. Antigravity (Google)
- 開發商：Google DeepMind 實驗性 CLI，與 Cursor 無直接關係
- 生圖：generate_image / generate_video 皆寫死 Imagen 3
- 影片：需額外 GOOGLE_API_KEY 刷 Veo 2

### 5. Muse
- 無原生 generate_image/video 工具

### 6. Cursor
- 本次未測試，不列入結論

---

## 三、最終結論

> 想在 CLI 額度內，不接外部 Key 就跑完 文生圖 -> 圖生影片 全鏈路，目前只有 Grok Build 做到，但代價是關掉 ZDR。
> Codex 只能到圖，Antigravity 的圖被 Imagen 3 綁死影片要自費，Meta 跟 Claude Code 純寫Code不碰生成。

測試 Prompt 範本 (繁中) 已驗證可用，詳見對話紀錄。
