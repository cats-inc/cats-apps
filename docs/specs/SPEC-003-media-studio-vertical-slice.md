# SPEC-003: Media Studio Vertical Slice

## Metadata

- Status: Implemented single-image slice; isolated and installed Desktop acceptance passed (2026-09-28).
- Owner: cats-apps; Platform owns SDK and saved works; Runtime owns CLI execution.
- Decision: [ADR-002](../decisions/002-cli-backed-media-studio-vertical-slice.md).
- Plan: [PLAN-003](../plans/PLAN-003-media-studio-vertical-slice.md).

## Approved scope

使用者已核准完整實作與必要的 SDK／Runtime／Desktop 更新，並確認 Studio 是 Cats Home
上與 Usage 並列的獨立 App。本輪固定 `cats.studio` / Studio 0.1.0，僅單張 1:1 生圖。
原提案的修圖、圖片匯入、影片與版本 lineage 延後；App 安裝／移除 UX 另案規劃。

流程為描述 → 明確按下生成 → 任務狀態 → 圖片預覽／下載 → 重開取回。
每次只允許一次 CLI invocation、一輪模型呼叫及一次 image_gen；沒有自動重試或 fallback。
頁面初始顯示先前 spike 的橘貓範例，清楚標示來源，不當成本次生成。

## Functional contract

| ID | Requirement |
| --- | --- |
| FR-01 | 獨立 Home 入口、route `/apps/cats.studio`、返回 Home；保留 Usage |
| FR-02 | 2000 字元以內描述、靈感範例、Grok instance 選擇、固定 1:1／1 張；沒有精確像素保證 |
| FR-03 | 正在送出／生成／保存、成功／失敗、取消中／已取消、結果未確認皆可辨識 |
| FR-04 | 先持久化 request，再執行；同 requestId 不會多次生成；離頁或重開只查詢既有任務 |
| FR-05 | 保存驗證後 JPEG；预覽、放大、下載、複用描述；Runtime 離線仍可讀已保存作品 |
| FR-06 | 失敗保留描述；明示登入、privacy、額度、逾時、磁碟與未確認結果；不聲稱免費 |
| FR-07 | 取消持久化意圖並等待程序結束；取消網路失敗只能重送取消，不能再送生成 |
| FR-08 | App／帳號／啟用狀態／版本與權限隔離；renderer 不取得 token、shell、URL 或本機路徑 |

## Ownership and limits

App uses SDK 1.3 `images.getCapabilities/list/submit/cancel/refresh/read/export` with
`media.images`, `ui.route`, `ui.lobby`; minimum Platform/Desktop is `^0.5.11`.
`refresh` only recovers the existing result. Host owns existing Core task/run/artifact
records plus retained images outside the immutable package. Runtime owns bounded execution
receipts and native Grok process/collection. No existing data schema is replaced.

Runtime limits: one active image execution, shared pool/selection/metering admission,
5-minute timeout, 2 MiB process output, JPEG up to 8 MiB and 4 megapixels, square only,
500 receipts. Host keeps at most 100 jobs per App/account with one active job.
No queue, deletion/retention UI, image edits or video operations are exposed in this slice.

Contracts: [Platform SPEC-119](../../../cats-platform/docs/specs/SPEC-119-app-image-generation.md)
and [Runtime SPEC-033](../../../cats-runtime/docs/specs/SPEC-033-bounded-image-generation.md).

## Acceptance evidence and limits

The [earlier one-image spike](../../../cats-runtime/docs/research/2026-09-28-grok-single-image-spike.md)
proved native Grok 1.0.41 image output (1024×1024 JPEG). Its one permitted paid attempt is
already used. No additional live CLI generation is authorized for this implementation.

Built-package browser acceptance uses the real host/SDK and an isolated fixture Runtime:
submit, blob preview, byte-identical download, reload, offline library, cancellation,
narrow viewport, CSP isolation, and Home navigation. Runtime separately tests native pipe
framing using a local fake process, strict JPEG validation and durable cancellation/idempotency.
These checks do not claim a new paid App → real CLI end-to-end run.
