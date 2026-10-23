import { MAX_PROMPT_LENGTH, SAMPLE_PROMPT, SAMPLE_IMAGE, PROMPT_IDEAS, promptLength, normalizeCapabilities, normalizeJob, findOperation, defaultService, validateDraft, buildSubmission, isDefinitiveSubmitError, matchPendingJob, initialSelection, pruneSources, draftSources, fitBox, ratioBox, formatBytes, createCallQueue } from './model.js';

const sdk = globalThis.catsApp;
const zh = !sdk?.locale || sdk.locale.startsWith('zh');
const word = (cn, en) => zh ? cn : en;
document.documentElement.lang = zh ? 'zh-Hant' : 'en';
document.documentElement.dataset.theme = sdk?.theme === 'dark' ? 'dark' : 'light';
const root = document.getElementById('app');

const OPERATION_COPY = {
  'image.generate': { label: word('生成', 'Generate'), verb: word('生成圖片', 'Generate image'), field: word('描述畫面', 'Describe the image'),
    hint: word('從一段描述建立一張新圖片。', 'Create a new image from a description.'),
    placeholder: word('例如：一隻橘貓坐在淺藍色背景前，簡單的平面插畫，沒有文字。', 'For example: an orange cat on a light blue background, a simple flat illustration, no text.') },
  'image.edit': { label: word('修圖', 'Edit'), verb: word('修改圖片', 'Edit image'), field: word('要怎麼改', 'What to change'),
    hint: word('選一張作品當原圖，描述想修改的地方。原圖不會被覆蓋，結果會另存成新作品。', 'Pick a saved image and describe the change. The original stays as it is; the result is saved as a new image.'),
    placeholder: word('例如：把背景換成淡黃色，貓保持不變。', 'For example: make the background pale yellow and keep the cat unchanged.') },
  'image.compose': { label: word('合成', 'Compose'), verb: word('合成圖片', 'Compose image'), field: word('怎麼組合', 'How to combine them'),
    hint: word('依序選兩張以上作品當參考，描述要組成的畫面。描述裡可以用「第 1 張」「第 2 張」指稱。', 'Pick two or more saved images in order and describe the result. Refer to them as image 1, image 2 and so on.'),
    placeholder: word('例如：讓第 1 張的貓坐在第 2 張的屋頂上。', 'For example: put the cat from image 1 on the roof in image 2.') },
};
const STATUS_LABELS = {
  submitting: word('正在送出', 'Submitting'), running: word('生成中', 'Generating'), collecting: word('正在保存', 'Saving'),
  succeeded: word('已保存', 'Saved'), failed: word('未完成', 'Failed'), cancelling: word('正在取消', 'Cancelling'),
  cancelled: word('已取消', 'Cancelled'), interrupted: word('結果待確認', 'Outcome unconfirmed'),
};
const TRANSPARENCY_LABELS = { opaque: word('不透明', 'Opaque'), transparent: word('含透明像素', 'Has transparency'), unknown: word('未知', 'Unknown') };
const OFFLINE_TEXT = word('生成服務暫時無法連線，已保存的作品仍可查看及下載。', 'Generation is unavailable. Saved images can still be viewed and downloaded.');
const REASON_LABELS = { not_configured: word('尚未設定', 'not set up'), not_installed: word('尚未安裝', 'not installed'), disabled: word('已停用', 'disabled'), signed_out: word('尚未登入', 'not signed in') };

function errorText(code, name = word('服務', 'the service')) {
  return ({
    auth_required: word(`請先在 ${name} CLI 登入，再建立新任務。`, `Sign in to ${name} CLI before creating a new request.`),
    quota_exhausted: word(`${name} 額度不足或暫時受到限制。`, `${name} allowance is exhausted or temporarily limited.`),
    privacy_required: word(`${name} 的隱私設定阻擋了生成，請先檢查帳號設定。`, `${name} privacy settings prevented generation. Check your account settings.`),
    generation_refused: word('生成服務拒絕了這次請求，請調整描述。', 'The service declined this request. Adjust the description.'),
    generation_timeout: word('生成逾時，可能已使用額度；沒有自動重試。', 'Generation timed out and may have used allowance. No retry was made.'),
    cli_unavailable: word(`找不到可執行的 ${name} CLI，請檢查 Cats 的 Runtime 設定。`, `${name} CLI could not start. Check Cats Runtime settings.`),
    // Both busy codes are raised before any CLI starts, so no allowance was used.
    image_service_busy: word('生成服務目前忙碌，可能已有圖片在生成。這次沒有產生圖片，也沒有使用額度；請稍後再試。', 'The image service is busy, possibly with another image. Nothing was generated and no allowance was used. Try again later.'),
    runtime_capacity_full: word('Cats 目前開著太多對話，生成服務沒有空位。這次沒有產生圖片，也沒有使用額度；請關閉一些對話或重新啟動 Cats 後再試。', 'Cats has too many conversations open, so the image service has no free slot. Nothing was generated and no allowance was used. Close some conversations or restart Cats, then try again.'),
    execution_interrupted: word('無法確認執行結果，可能已使用額度；沒有重新生成。', 'The outcome is unconfirmed and allowance may have been used. Nothing was regenerated.'),
    invalid_image: word('回傳圖片未通過驗證，未標記為完成。', 'The returned image failed validation.'),
    image_storage_limit: word('作品保存空間已達此版本的上限。', 'The saved-image limit for this version has been reached.'),
    storage_full: word('磁碟空間不足，圖片未保存完成。', 'Disk space is insufficient to save this image.'),
    cancelled: word('任務已取消，已使用的額度不一定會退還。', 'Cancelled. Used allowance may not be refunded.'),
    app_context_revoked: word('App 的存取權已變更，請返回首頁重新開啟。', 'App access changed. Reopen it from Cats Home.'),
    image_not_deletable: word('這項工作還在進行或結果待確認，暫時不能刪除。', 'This work is still in progress or unconfirmed, so it cannot be deleted yet.'),
    image_in_use: word('這張作品已在 Cats Work 中被連結或使用，請先移除連結再刪除。', 'This work is linked or used in Cats Work. Remove the link, then delete it.'),
    image_request_conflict: word('這個請求已用不同內容送出過，沒有重新生成。請重新建立。', 'This request was already sent with different content. Nothing was regenerated; create it again.'),
    source_unavailable: word('選取的作品已無法使用，請重新選擇。', 'A selected image is no longer available. Pick it again.'),
    source_unsupported: word(`${name} 無法使用這張作品當來源。`, `${name} cannot use this image as a source.`),
    source_count_invalid: word('來源張數不符合這個操作的要求。', 'The number of source images does not fit this operation.'),
    option_unsupported: word('這個服務已不支援所選的設定，請重新選擇。', 'The service no longer supports the selected setting. Choose again.'),
    service_unavailable: word('這個服務目前無法使用，請選擇其他服務。', 'This service is unavailable. Choose another service.'),
    operation_unavailable: word('這個操作目前無法使用。', 'This operation is unavailable.'),
    image_service_unavailable: OFFLINE_TEXT,
    submission_unconfirmed: word('送出結果尚未確認。請按「確認送出結果」或重新整理；不會自動再次送出。', 'The submission is unconfirmed. Confirm it or refresh; it is never sent again automatically.'),
  })[code] || word('目前無法完成操作。請重新整理查看狀態；不會自動生成。', 'The operation is unavailable. Refresh to check its status; no image is generated automatically.');
}

function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === null || value === undefined || value === false) continue;
    if (name === 'class') node.className = value;
    else if (name === 'text') node.textContent = value;
    else if (name === 'dataset') Object.assign(node.dataset, value);
    else if (name.startsWith('on')) node.addEventListener(name.slice(2), value);
    else node.setAttribute(name, value === true ? '' : String(value));
  }
  node.append(...present(...children));
  return node;
}
// DOM append/replaceChildren would turn a skipped (null) item into the text "null".
const present = (...items) => items.filter((item) => item !== null && item !== undefined && item !== false);
const button = (label, onclick, attributes = {}) => el('button', { type: 'button', class: 'quiet', onclick, ...attributes, text: label });

// One frame per ratio the control mode can produce; dashed means the service decides.
function glyph(mode, options = [], size = 48) {
  const frames = mode === 'choose' ? [{ width: 0.62, height: 0.62 }, { width: 0.88, height: 0.5 }, { width: 0.5, height: 0.88 }]
    : mode === 'native' ? [ratioBox(options[0], size * 0.72) ?? { width: size * 0.72, height: size * 0.72 }]
      : [{ width: 0.84, height: 0.62, dashed: true }];
  const box = el('span', { class: 'glyph', 'aria-hidden': 'true' });
  box.style.width = box.style.height = `${size}px`;
  for (const frame of frames) {
    const width = frame.width <= 1 ? frame.width * size : frame.width;
    const height = frame.height <= 1 ? frame.height * size : frame.height;
    const part = el('span', { class: frame.dashed ? 'frame dashed' : 'frame' });
    Object.assign(part.style, { width: `${Math.round(width)}px`, height: `${Math.round(height)}px`, left: `${Math.round((size - width) / 2)}px`, top: `${Math.round((size - height) / 2)}px` });
    box.append(part);
  }
  return box;
}
const ratioSummary = (operation) => ({
  choose: word('比例可選', 'Choose a ratio'), native: word(`固定 ${operation.ratio.options[0]}`, `Fixed ${operation.ratio.options[0]}`),
  service: word('比例由服務決定', 'Service decides the ratio'), source: word('沿用原圖比例', 'Keeps the source ratio'),
})[operation.ratio.mode];

root.innerHTML = `
  <h1 class="visually-hidden">${word('Studio 圖片工作室', 'Studio image workspace')}</h1>
  <section class="services" aria-labelledby="services-title">
    <div class="section-row"><h2 id="services-title">${word('選擇服務', 'Choose a service')}</h2><p id="services-note" class="note"></p></div>
    <div id="services" class="service-grid"></div>
    <p id="service-status" class="note" role="status"></p>
  </section>
  <div class="workspace">
    <section class="composer panel" aria-labelledby="operation-title">
      <h2 id="operation-title">${word('能做的事', 'What it can do')}</h2>
      <div id="operations" class="segmented" role="group" aria-label="${word('操作', 'Operation')}"></div>
      <p id="operation-hint" class="note"></p>
      <div id="sources"></div>
      <div class="field">
        <label id="prompt-label" for="prompt">${word('描述畫面', 'Describe the image')}</label>
        <textarea id="prompt" rows="6" aria-describedby="prompt-count submit-hint"></textarea>
        <div class="field-row"><div id="ideas" class="ideas"></div><span id="prompt-count" class="count">0 / ${MAX_PROMPT_LENGTH}</span></div>
      </div>
      <div class="parameters">
        <span id="ratio-label" class="field-label">${word('比例', 'Aspect ratio')}</span>
        <div id="ratio"></div>
        <p id="ratio-note" class="note"></p>
        <div id="transparency"></div>
        <p class="note">${word('每次一張。', 'One image per request.')}</p>
      </div>
      <details id="agent" class="agent"><summary>${word('代理設定', 'Agent settings')}</summary><div id="agent-body"></div>
        <p class="note">${word('這是負責執行的代理，不是圖片模型。圖片模型只有在服務回報時才會出現在作品資訊裡。', 'This agent runs the request; it is not the image model. The image model appears in the image details only when the service reports it.')}</p></details>
      <div class="submit">
        <button id="generate" class="primary" type="button" disabled data-focus-key="generate" aria-describedby="submit-hint usage-note">${word('生成圖片', 'Generate image')}</button>
        <p id="submit-hint" class="note"></p>
        <div id="pending"></div>
        <p id="usage-note" class="note"></p>
        <p id="feedback" role="status" aria-live="polite"></p>
        <button id="refresh" class="quiet small" type="button" data-focus-key="refresh">${word('重新整理', 'Refresh')}</button>
      </div>
    </section>
    <section class="preview panel" aria-labelledby="preview-title">
      <div class="preview-head"><span id="preview-status" class="sample-badge">${word('範例作品', 'Sample image')}</span><h2 id="preview-title"></h2><span id="preview-service" class="note"></span></div>
      <p id="preview-warning" class="warning" role="note" hidden>${word('圖片已保存，但生成回應逾時。沒有自動重試，這張圖可以正常使用。', 'The image was saved, but the generation response timed out. Nothing was retried; the image is ready to use.')}</p>
      <div class="stage">
        <div id="preview-image" class="measured">
          <div class="ruler ruler-x" aria-hidden="true"><span id="ruler-width"></span></div><span aria-hidden="true"></span>
          <button id="expand" class="image-button" type="button" aria-label="${word('放大檢視', 'Enlarge image')}"><img id="sample-image" src="${SAMPLE_IMAGE}" width="1024" height="1024" alt="${word('淺藍色背景前坐著一隻橘貓的平面插畫', 'Flat illustration of an orange cat sitting on a light blue background')}"><span class="corner top-left"></span><span class="corner top-right"></span><span class="corner bottom-left"></span><span class="corner bottom-right"></span></button>
          <div class="ruler ruler-y" aria-hidden="true"><span id="ruler-height"></span></div>
        </div>
        <div id="preview-progress" class="state-view" hidden></div>
        <div id="preview-ended" class="state-view" hidden></div>
      </div>
      <div class="preview-footer"><dl id="preview-facts" class="facts"></dl><div id="preview-actions" class="actions"></div></div>
      <details id="preview-details"><summary>${word('生成資訊', 'Generation details')}</summary><dl id="preview-info" class="info"></dl></details>
      <p id="sample-note" class="note"></p>
    </section>
  </div>
  <section class="library panel" aria-labelledby="library-title">
    <div class="section-row">
      <div><h2 id="library-title">${word('作品', 'Images')}</h2><p id="library-count" class="note"></p></div>
      <div class="filters">
        <label>${word('搜尋描述', 'Search descriptions')}<input id="work-search" type="search" placeholder="${word('例如：橘貓', 'For example: cat')}"></label>
        <label>${word('服務', 'Service')}<select id="work-service"></select></label>
        <label>${word('狀態', 'Status')}<select id="work-status"><option value="all">${word('全部狀態', 'All statuses')}</option><option value="saved">${word('已保存', 'Saved')}</option><option value="open">${word('進行中或待確認', 'In progress or unconfirmed')}</option><option value="ended">${word('未完成或已取消', 'Failed or cancelled')}</option></select></label>
      </div>
    </div>
    <div id="jobs" class="work-grid"></div>
  </section>
  <dialog id="image-dialog" aria-label="${word('圖片預覽', 'Image preview')}"><button type="button" class="dialog-close" aria-label="${word('關閉預覽', 'Close preview')}"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><img src="${SAMPLE_IMAGE}" width="1024" height="1024" alt=""></dialog>
  <dialog id="confirm-dialog" class="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-body"><div class="confirm-body">
    <h2 id="confirm-title">${word('刪除這張作品？', 'Delete this image?')}</h2>
    <p id="confirm-body" class="note">${word('保存的原圖會一起刪除，無法復原。描述可以先用「複用描述」留下來。', 'The saved original is deleted too and cannot be recovered. Use Reuse prompt first to keep the description.')}</p>
    <div class="actions"><button type="button" data-close="keep" class="quiet" autofocus>${word('保留作品', 'Keep image')}</button><button type="button" data-close="delete" class="quiet danger">${word('刪除作品', 'Delete image')}</button></div>
  </div></dialog>
`;

const $ = (id) => document.getElementById(id);
const prompt = $('prompt');
const generate = $('generate');
const feedback = $('feedback');
const dialog = $('image-dialog');
const previewImage = $('sample-image');

let capabilities = normalizeCapabilities(null);
let capabilitiesOffline = false;
let jobs = [];
let busy = false;
let disposed = false;
let loaded = false;
let serviceKey = null;
const operationByService = new Map();
const ratioByOperation = new Map();
const agentConfigByOperation = new Map();
let sourceIds = [];
let transparentBackground = false;
let pending = null;
let selectedId = null;
let followedId = null;
let followedStatus = null;
let shownImageId = null;
let jobsSignature = '';
let previewSignature = '';
let pendingShown = false;
let deferredSubmit = false;

const current = () => {
  const service = capabilities.services.find((item) => item.key === serviceKey) ?? null;
  const wanted = operationByService.get(serviceKey);
  return { service, operation: service?.operations.find((item) => item.id === wanted) ?? service?.operations[0] ?? null };
};
const operationKey = () => `${serviceKey}|${current().operation?.id}`;
const savedWorks = () => jobs.filter((job) => job.status === 'succeeded' && job.output);
const editTargets = () => capabilities.services.filter((service) => service.available && service.operations.some((operation) => operation.id === 'image.edit'));
const blocked = () => busy || !!pending || jobs.some((job) => job.active);
// Repeating an identical message would make screen readers announce it again on every poll.
const say = (message) => { if (feedback.textContent !== message) feedback.textContent = message; };
function restoreFocus(key) {
  const active = document.activeElement;
  if (key && (!active || active === document.body)) document.querySelector(`[data-focus-key="${CSS.escape(key)}"]`)?.focus();
}
function keepFocus(render) {
  const key = document.activeElement?.dataset?.focusKey;
  render();
  restoreFocus(key);
}

function draft() {
  const { operation } = current();
  return { serviceKey, operation: operation?.id, prompt: prompt.value, sourceIds: draftSources(operation, sourceIds),
    aspectRatio: operation?.ratio.mode === 'choose' ? ratioByOperation.get(operationKey()) : null,
    transparentBackground: !!operation?.transparency && transparentBackground, agentConfigId: agentConfigByOperation.get(operationKey()) ?? operation?.agentConfigs[0]?.id ?? null };
}

// Every sdk.images call goes through one queue, so the host's one-call and 500 ms rules are never hit.
const calls = createCallQueue((method, args) => sdk.images[method](...args));
const hostCall = (method, args, options) => calls.call(method, args, options);

// Image bytes are read lazily and kept in a small cache; the preview's entry is never evicted.
const imageUrls = new Map();
const imageReads = new Map();
const visibleThumbs = new Set();
function rememberUrl(id, url) {
  const previous = imageUrls.get(id);
  if (previous && previous !== url) URL.revokeObjectURL(previous);
  imageUrls.delete(id); imageUrls.set(id, url);
  for (const [key, value] of imageUrls) {
    if (imageUrls.size <= 36) break;
    if (key === shownImageId || visibleThumbs.has(key)) continue;
    URL.revokeObjectURL(value); imageUrls.delete(key);
  }
}
function imageUrl(id, { urgent = false, wanted = null } = {}) {
  if (imageUrls.has(id)) { const url = imageUrls.get(id); rememberUrl(id, url); return Promise.resolve(url); }
  let entry = imageReads.get(id);
  if (entry) {
    // The preview needs an image a thumbnail already queued: keep that read and move it to the front.
    if (urgent && !entry.forced) {
      entry.forced = true;
      calls.promote((method, args) => method === 'read' && args[0] === id);
    }
    return entry.promise;
  }
  entry = { forced: urgent };
  entry.promise = (async () => {
    try {
      const image = await hostCall('read', [id], { urgent, background: !!wanted, wanted: () => entry.forced || !wanted || wanted() });
      if (disposed) throw new Error('disposed');
      const url = URL.createObjectURL(new Blob([image.bytes], { type: image.mimeType }));
      rememberUrl(id, url); return url;
    } finally { imageReads.delete(id); }
  })();
  imageReads.set(id, entry);
  return entry.promise;
}
function loadThumb(img) {
  if (img.getAttribute('src')) return;
  const id = img.dataset.jobId;
  const wanted = () => img.isConnected && (!thumbObserver || visibleThumbs.has(id));
  imageUrl(id, { wanted }).then((url) => { if (img.isConnected) img.src = url; })
    .catch((error) => { if (error.message !== 'skipped') img.closest('.thumb, .source')?.classList.add('thumb-failed'); });
}
const thumbObserver = 'IntersectionObserver' in globalThis ? new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const id = entry.target.dataset.jobId;
    if (entry.isIntersecting) { visibleThumbs.add(id); loadThumb(entry.target); }
    else visibleThumbs.delete(id);
  }
}, { rootMargin: '240px' }) : null;
function thumbnail(job, maxWidth, maxHeight) {
  const img = el('img', { alt: '', width: job.output.width, height: job.output.height, dataset: { jobId: job.id } });
  const box = fitBox(job.output.width, job.output.height, maxWidth, maxHeight);
  img.style.width = `${box.width}px`; img.style.height = `${box.height}px`;
  if (imageUrls.has(job.id)) img.src = imageUrls.get(job.id);
  else if (thumbObserver) thumbObserver.observe(img);
  else queueMicrotask(() => loadThumb(img));
  return img;
}

function renderServices() {
  const container = $('services'); container.replaceChildren();
  const services = capabilities.services;
  $('services-note').textContent = services.length > 1 ? word('每個服務能做的事不同；選好之後，下方只會出現它支援的操作。', 'Each service can do different things. Pick one and only its operations appear below.')
    : services.length === 1 ? word('目前可用的服務。之後通過驗證的服務會出現在這裡。', 'The service available now. Other services appear here once they are verified.') : '';
  for (const service of services) {
    const first = service.operations[0];
    const label = service.alias ? `${service.name}（${service.alias}）` : service.name;
    const tile = el('button', { type: 'button', class: 'service-tile', 'aria-pressed': service.key === serviceKey ? 'true' : 'false', disabled: !service.available,
      dataset: { service: service.key, focusKey: `service-${service.key}` }, onclick: () => selectService(service.key) },
    glyph(first.ratio.mode, first.ratio.options),
    el('span', { class: 'tile-text' }, el('span', { class: 'tile-name', text: label }),
      el('span', { class: 'note', text: service.available ? ratioSummary(first) : word('暫時無法使用', 'Unavailable') + (REASON_LABELS[service.reason] ? word(`：${REASON_LABELS[service.reason]}`, `: ${REASON_LABELS[service.reason]}`) : '') }),
      el('span', { class: 'verbs' }, ...service.operations.map((operation) => el('span', { class: 'verb', text: OPERATION_COPY[operation.id].label })))));
    container.append(tile);
  }
}

function renderOperation() {
  const { service, operation } = current();
  const copy = OPERATION_COPY[operation?.id ?? 'image.generate'];
  $('operation-title').textContent = service ? word(`${service.name} 能做的事`, `What ${service.name} can do`) : word('能做的事', 'What it can do');
  const operations = $('operations'); operations.replaceChildren();
  // A single operation needs no switch; the heading and hint already name it.
  for (const item of service?.operations.length > 1 ? service.operations : []) {
    operations.append(el('button', { type: 'button', 'aria-pressed': item.id === operation?.id ? 'true' : 'false', dataset: { focusKey: `operation-${item.id}` }, onclick: () => selectOperation(item.id), text: OPERATION_COPY[item.id].label }));
  }
  $('operation-hint').textContent = operation ? copy.hint : '';
  $('prompt-label').textContent = copy.field;
  prompt.placeholder = copy.placeholder;
  generate.textContent = copy.verb;
  const ideas = $('ideas'); ideas.replaceChildren();
  if (!operation || operation.id === 'image.generate') {
    for (const idea of PROMPT_IDEAS) ideas.append(el('button', { type: 'button', class: 'chip', onclick: () => applyPrompt(word(idea.prompt, idea.english)), text: word(idea.label, idea.en) }));
  }
  renderSources(); renderParameters(); renderAgent();
  $('usage-note').textContent = service ? word(`使用 ${service.account} CLI 的登入帳號與額度。每次只送出一張，不會自動重試；實際費用依服務回報。`,
    `Uses your ${service.account} CLI sign-in and allowance. Each request sends one image with no automatic retry. Actual charges depend on the service.`) : '';
}

function renderSources({ reveal = false } = {}) {
  const container = $('sources');
  const scrolled = container.querySelector('.source-list')?.scrollLeft;
  container.replaceChildren();
  const { operation } = current();
  if (!operation || operation.inputs.max === 0) return;
  const works = savedWorks();
  const picked = draftSources(operation, sourceIds);
  const single = operation.inputs.max === 1;
  const count = single ? (picked.length ? word('已選 1 張', '1 selected') : word('選 1 張', 'Pick 1'))
    : word(`已選 ${picked.length} 張（需要 ${operation.inputs.min}–${operation.inputs.max} 張）`, `${picked.length} selected (${operation.inputs.min}–${operation.inputs.max} needed)`);
  container.append(el('div', { class: 'field-row' }, el('span', { id: 'sources-label', class: 'field-label', text: single ? word('原圖', 'Source image') : word('參考圖（依選取順序）', 'Reference images, in order') }), el('span', { class: 'note', text: count })));
  if (!works.length) { container.append(el('p', { class: 'note', text: word('還沒有已保存的作品。先生成一張，再回來修改。', 'No saved images yet. Generate one first, then come back to edit it.') })); return; }
  const list = el('div', { class: 'source-list', role: 'group', 'aria-labelledby': 'sources-label' });
  for (const work of works) {
    const position = picked.indexOf(work.id);
    list.append(el('button', { type: 'button', class: 'source', 'aria-pressed': position >= 0 ? 'true' : 'false', dataset: { focusKey: `source-${work.id}` },
      'aria-label': `${position >= 0 ? word(`第 ${position + 1} 張，`, `Image ${position + 1}, `) : ''}${work.name}：${work.prompt}`, onclick: () => toggleSource(work.id) },
    thumbnail(work, 72, 72), position >= 0 && !single ? el('span', { class: 'order', text: String(position + 1) }) : null));
  }
  container.append(list, el('p', { class: 'note', text: word('可以使用任何服務產生的作品。', 'Images from any service can be used.') }));
  // Keep a stable order so picks never move under the pointer; reveal the first pick only when it was set elsewhere.
  const first = list.querySelector('[aria-pressed="true"]');
  list.scrollLeft = reveal || scrolled === undefined ? Math.max(0, (first?.offsetLeft ?? 8) - 8) : scrolled;
}

function renderParameters() {
  const { operation } = current();
  const ratio = $('ratio'); ratio.replaceChildren();
  const transparency = $('transparency'); transparency.replaceChildren();
  if (!operation) { $('ratio-note').textContent = ''; return; }
  const { mode, options } = operation.ratio;
  if (mode === 'choose') {
    const key = operationKey();
    if (!options.includes(ratioByOperation.get(key))) ratioByOperation.set(key, options.includes('auto') ? 'auto' : options[0]);
    const chosen = ratioByOperation.get(key);
    const label = (option) => option === 'auto' ? word('自動', 'Auto') : option;
    if (options.length <= 8) {
      ratio.append(el('div', { class: 'ratio-options', role: 'group', 'aria-labelledby': 'ratio-label' }, ...options.map((option) => {
        const box = option === 'auto' ? null : ratioBox(option, 16);
        const mark = el('span', { class: box ? 'ratio-mark' : 'ratio-mark dashed', 'aria-hidden': 'true' });
        mark.style.width = `${box?.width ?? 15}px`; mark.style.height = `${box?.height ?? 15}px`;
        return el('button', { type: 'button', class: 'ratio-option', 'aria-pressed': option === chosen ? 'true' : 'false', dataset: { focusKey: `ratio-${option}` }, onclick: () => { ratioByOperation.set(key, option); keepFocus(renderParameters); controls(); } }, mark, el('span', { text: label(option) }));
      })));
    } else {
      const select = el('select', { 'aria-labelledby': 'ratio-label', onchange: (event) => { ratioByOperation.set(key, event.target.value); controls(); } },
        ...options.map((option) => el('option', { value: option, text: option === 'auto' ? word('自動（由服務決定）', 'Auto (service decides)') : option })));
      select.value = chosen; ratio.append(select);
    }
  } else {
    let text = { native: word(`${options[0]}（服務固定）`, `${options[0]} (fixed by the service)`), service: word('由服務決定', 'Decided by the service'), source: word('沿用原圖比例', 'Same as the source image') }[mode];
    const source = mode === 'source' ? savedWorks().find((work) => work.id === draftSources(operation, sourceIds)[0]) : null;
    if (source) text = word(`沿用原圖比例（${source.output.width} × ${source.output.height}）`, `Same as the source (${source.output.width} × ${source.output.height})`);
    const box = mode === 'native' ? ratioBox(options[0], 20) : source ? ratioBox(`${source.output.width}:${source.output.height}`, 20) : null;
    const mark = el('span', { class: box ? 'ratio-mark' : 'ratio-mark dashed', 'aria-hidden': 'true' });
    mark.style.width = `${box?.width ?? 22}px`; mark.style.height = `${box?.height ?? 17}px`;
    ratio.append(el('p', { class: 'ratio-fixed' }, mark, el('span', { text })));
  }
  $('ratio-note').textContent = {
    choose: word('「自動」交給服務決定；選定比例時，實際尺寸以保存結果為準。', 'Auto lets the service decide. With a chosen ratio, the saved result shows the actual size.'),
    native: word('這個服務固定產生這個比例。', 'This service always produces this ratio.'),
    service: word('想要的構圖請寫在描述裡，實際尺寸以保存結果為準。', 'Describe the composition you want; the saved result shows the actual size.'),
    source: word('修圖會沿用原圖的比例。', 'Edits keep the source image ratio.'),
  }[mode];
  if (operation.transparency) {
    const checkbox = el('input', { id: 'transparent', type: 'checkbox', onchange: (event) => { transparentBackground = event.target.checked; } });
    checkbox.checked = transparentBackground;
    transparency.append(el('label', { class: 'check', for: 'transparent' }, checkbox, el('span', {}, el('span', { text: word('透明背景', 'Transparent background') }),
      el('span', { class: 'note', text: word('這是向服務提出的要求。保存後會檢測圖片是否真的含透明像素。', 'This is a request to the service. The saved image is checked for real transparency.') }))));
  }
}

function renderAgent() {
  const body = $('agent-body'); body.replaceChildren();
  const { operation } = current();
  if (!operation) return;
  const configs = operation.agentConfigs;
  if (configs.length > 1) {
    const key = operationKey();
    const select = el('select', { id: 'agent-config', onchange: (event) => { agentConfigByOperation.set(key, event.target.value); controls(); } },
      ...configs.map((config) => el('option', { value: config.id, text: config.label ?? [config.model, config.effort].filter(Boolean).join(word('，', ', ')) })));
    select.value = agentConfigByOperation.get(key) ?? configs[0].id;
    body.append(el('label', { class: 'field-label', for: 'agent-config', text: word('代理模型與推理強度', 'Agent model and effort') }), select);
    return;
  }
  const [config] = configs;
  body.append(el('dl', { class: 'info' }, el('dt', { text: word('代理模型', 'Agent model') }), el('dd', { text: config.model || word('依服務設定', 'Set by the service') }),
    config.effort ? el('dt', { text: word('推理強度', 'Effort') }) : null, config.effort ? el('dd', { text: config.effort }) : null));
}

function controls() {
  const validation = validateDraft(capabilities, draft(), jobs);
  const length = promptLength(prompt.value.trim());
  $('prompt-count').textContent = `${length} / ${capabilities.maxPromptLength}`;
  $('prompt-count').classList.toggle('over', length > capabilities.maxPromptLength);
  generate.disabled = blocked() || !validation.ok;
  const hints = {
    service_unavailable: word('這個服務暫時無法使用，請選擇其他服務。', 'This service is unavailable. Choose another service.'),
    prompt_too_long: word(`描述超過 ${capabilities.maxPromptLength} 字，請縮短。`, `The description is over ${capabilities.maxPromptLength} characters.`),
    source_count_invalid: current().operation?.inputs.max === 1 ? word('選一張作品當原圖。', 'Pick one saved image as the source.') : word(`依序選 ${current().operation?.inputs.min} 張以上作品。`, `Pick at least ${current().operation?.inputs.min} saved images in order.`),
  };
  $('submit-hint').textContent = !blocked() && !validation.ok ? hints[validation.reason] ?? '' : (jobs.some((job) => job.active) ? word('已有圖片正在處理。可以先寫下一份描述，完成後再送出。', 'An image is in progress. You can write the next description and send it afterwards.') : '');
  $('refresh').disabled = busy;
  renderPending();
}

function renderPending() {
  const unconfirmed = !!pending?.unconfirmed;
  if (unconfirmed !== pendingShown) {
    pendingShown = unconfirmed;
    keepFocus(() => {
      const container = $('pending'); container.replaceChildren();
      if (unconfirmed) container.append(el('p', { class: 'note', text: word('送出結果尚未確認。按「確認送出結果」只會以同一個請求向 Cats 確認，不會建立第二張。', 'The submission is unconfirmed. Confirm sends the same request again so Cats can match it; no second image is created.') }),
        button(word('確認送出結果', 'Confirm submission'), () => void send(), { id: 'confirm-submit', dataset: { focusKey: 'pending-confirm' } }));
    });
  }
  const confirm = $('confirm-submit');
  if (confirm) confirm.disabled = busy;
}

function applyPrompt(value) { prompt.value = value; prompt.focus(); controls(); }
function selectService(key) { serviceKey = key; say(''); keepFocus(() => { renderServices(); renderOperation(); }); controls(); }
function selectOperation(id) {
  operationByService.set(serviceKey, id);
  keepFocus(() => { renderServices(); renderOperation(); }); controls();
}
function toggleSource(id) {
  const { operation } = current();
  const position = draftSources(operation, sourceIds).indexOf(id);
  if (operation.inputs.max === 1) sourceIds = position >= 0 ? [] : [id];
  else if (position >= 0) sourceIds = sourceIds.filter((item) => item !== id);
  else if (sourceIds.length >= operation.inputs.max) { say(word(`這個服務最多使用 ${operation.inputs.max} 張參考。`, `This service accepts up to ${operation.inputs.max} references.`)); return; }
  else sourceIds = [...sourceIds, id];
  renderSources(); renderParameters(); controls();
  document.querySelector(`[data-focus-key="source-${CSS.escape(id)}"]`)?.focus();
}
function editWork(job) {
  const target = editTargets().find((service) => service.key === serviceKey) ?? editTargets()[0];
  if (!target) return;
  serviceKey = target.key; operationByService.set(target.key, 'image.edit'); sourceIds = [job.id];
  renderServices(); renderOperation(); renderSources({ reveal: true }); controls(); prompt.focus();
  say(word('已選為原圖。描述想要的修改。', 'Selected as the source. Describe the change.'));
}
function reuse(job) { applyPrompt(job.prompt); say(word('描述已放回草稿，還沒有送出。', 'The description is back in the draft and has not been sent.')); }

// Background polls are quiet: they never disable controls, so focus and pointer targets stay put.
// A user action that arrives during a poll waits for it instead of being dropped. A poll never waits, and a
// user action during another user action is dropped (its controls are disabled), never replayed afterwards.
let working = Promise.resolve();
let workingQuiet = false;
async function perform(action, { quiet = false } = {}) {
  while (busy && workingQuiet && !quiet && !disposed) await working;
  if (busy || disposed) return;
  const focusKey = document.activeElement?.dataset?.focusKey;
  busy = true; workingQuiet = quiet; if (!quiet) controls();
  let done;
  working = new Promise((resolve) => { done = resolve; });
  try { await action(); } catch (error) { if (!disposed) say(errorText(error.message, current().service?.name)); }
  finally {
    busy = false; done();
    if (!disposed) {
      keepFocus(() => { controls(); renderJobs(); renderPreview(); }); restoreFocus(focusKey);
      if (deferredSubmit) { deferredSubmit = false; if (!generate.disabled) submitDraft(draft()); }
    }
  }
}

function requestId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
function upsert(raw) { const job = normalizeJob(raw); jobs = [job, ...jobs.filter((entry) => entry.id !== job.id)]; return job; }
function follow(job) { selectedId = job.id; followedId = job.id; followedStatus = null; announce(); }

// A lost response keeps the exact payload; resending the same requestId returns the original attempt.
async function send() {
  await perform(async () => {
    try {
      const job = upsert(await hostCall('submit', [pending.payload]));
      pending = null; follow(job); schedule();
    } catch (error) {
      if (isDefinitiveSubmitError(error.message)) { pending = null; throw error; }
      pending.unconfirmed = true;
      throw new Error('submission_unconfirmed');
    }
  });
}
function submitDraft(values) {
  if (blocked()) return;
  try { pending = { payload: buildSubmission(capabilities, { ...values, requestId: requestId() }, jobs), unconfirmed: false }; }
  catch (error) { say(errorText(error.message, current().service?.name)); return; }
  void send();
}
function retry(job) {
  const { service, operation } = findOperation(capabilities, job.serviceKey, job.operation);
  if (!service?.available || !operation) { say(errorText(service ? 'operation_unavailable' : 'service_unavailable', job.name)); return; }
  // Generate another repeats the original agent configuration or refuses; it never swaps it silently.
  const config = operation.agentConfigs.find((item) => item.id === job.agentConfigId) ?? (operation.agentConfigs.length === 1 && !job.agentConfigId ? operation.agentConfigs[0] : null);
  if (!config) { say(errorText('option_unsupported', job.name)); return; }
  submitDraft({ serviceKey: job.serviceKey, operation: job.operation, prompt: job.prompt, sourceIds: job.sources.map((source) => source.id),
    aspectRatio: operation.ratio.mode === 'choose' && operation.ratio.options.includes(job.requestedRatio) ? job.requestedRatio : null,
    transparentBackground: operation.transparency && job.requestedTransparency, agentConfigId: config.id });
}

const elapsed = (from) => {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(from)) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
const operationLabel = (job) => `${job.alias ? `${job.name}（${job.alias}）` : job.name} ${OPERATION_COPY[job.operation].label}`;
function facts(list, rows) {
  const pairs = rows.filter(Boolean).map(([term, value]) => [el('dt', { text: term }), el('dd', { text: value })]);
  list.replaceChildren(...(list.classList.contains('facts') ? pairs.map((pair) => el('div', {}, ...pair)) : pairs.flat()));
}

function previewLoading(message, retry) {
  const progress = $('preview-progress');
  let note = progress.querySelector('.loading-note');
  if (!note) { note = el('p', { class: 'note loading-note' }); progress.replaceChildren(note); }
  note.textContent = message;
  // The retry button stays in place across attempts so keyboard focus is not lost.
  if (retry && !progress.querySelector('.loading-retry')) progress.append(button(word('重新讀取', 'Read again'), retry, { class: 'quiet loading-retry', dataset: { focusKey: 'preview-read' } }));
}
async function showImage(job) {
  let url;
  try { url = await imageUrl(job.id, { urgent: true }); }
  catch {
    if (disposed || selectedId !== job.id) return;
    previewLoading(word('無法讀取這張圖片。可以重新讀取，或稍後重新整理。', 'This image could not be read. Try again or refresh later.'), () => {
      previewLoading(word('正在讀取圖片…', 'Loading the image…')); void showImage(job);
    });
    return;
  }
  if (disposed || selectedId !== job.id) return;
  shownImageId = job.id;
  previewImage.src = url; previewImage.alt = job.prompt;
  previewImage.width = job.output.width; previewImage.height = job.output.height;
  const dialogImage = dialog.querySelector('img');
  dialogImage.src = url; dialogImage.alt = job.prompt; dialogImage.width = job.output.width; dialogImage.height = job.output.height;
  const measured = $('preview-image');
  measured.hidden = false; $('preview-progress').hidden = true;
  const zoom = document.querySelector('[data-focus-key="preview-zoom"]');
  if (zoom) zoom.disabled = false;
  measured.classList.remove('is-fresh'); void measured.offsetWidth; measured.classList.add('is-fresh');
}

function renderPreview(force = false) {
  const job = jobs.find((entry) => entry.id === selectedId) ?? null;
  if (selectedId && !job) selectedId = null;
  // Running jobs change updatedAt on every poll; their view only depends on the status.
  const signature = JSON.stringify([selectedId, job?.status, job?.active ? null : job?.updatedAt, job?.warnings, blocked(), editTargets().length]);
  if (!force && signature === previewSignature) return;
  previewSignature = signature;
  const status = $('preview-status');
  const imageView = $('preview-image'); const progress = $('preview-progress'); const ended = $('preview-ended');
  const actions = $('preview-actions'); actions.replaceChildren();
  $('preview-warning').hidden = !(job?.warnings.includes('response_timeout_after_image'));
  imageView.hidden = !!job && !job.output; progress.hidden = !job?.active; ended.hidden = !job || job.active || !!job.output;
  $('preview-details').hidden = !job;
  status.classList.toggle('attention', !!job?.warnings.length);
  if (!job) {
    status.textContent = word('範例作品', 'Sample image');
    $('preview-title').textContent = word('一隻橘貓，一點想像。', 'One orange cat. A little imagination.');
    $('preview-service').textContent = '';
    if (shownImageId) { shownImageId = null; previewImage.src = SAMPLE_IMAGE; previewImage.width = previewImage.height = 1024; dialog.querySelector('img').src = SAMPLE_IMAGE; }
    previewImage.alt = word('淺藍色背景前坐著一隻橘貓的平面插畫', 'Flat illustration of an orange cat sitting on a light blue background');
    dialog.querySelector('img').alt = previewImage.alt;
    $('ruler-width').textContent = '1024 px'; $('ruler-height').textContent = '1024 px';
    $('preview-image').querySelector('.image-button').classList.remove('checker');
    facts($('preview-facts'), [[word('格式', 'Format'), 'JPEG'], [word('尺寸', 'Size'), '1024 × 1024'], [word('比例', 'Ratio'), '1:1'], [word('透明度', 'Transparency'), TRANSPARENCY_LABELS.opaque]]);
    actions.append(button(word('放大檢視', 'Enlarge'), openDialog, { dataset: { focusKey: 'preview-zoom' } }), button(word('複用描述', 'Reuse prompt'), () => reuse({ prompt: SAMPLE_PROMPT }), { dataset: { focusKey: 'preview-reuse' } }));
    $('sample-note').textContent = word('先前實測產生的範例圖片。修改左側描述不會改變這張範例。', 'An image from an earlier generation test. Editing the prompt does not change this sample.');
    return;
  }
  status.textContent = job.warnings.length && job.output ? word('已保存，有提醒', 'Saved with a note') : STATUS_LABELS[job.status] ?? job.status;
  $('preview-title').textContent = job.prompt;
  $('preview-service').textContent = operationLabel(job);
  $('sample-note').textContent = job.output ? word('此圖片已保存，重新開啟 Studio 仍可查看及下載。', 'Saved. Reopen Studio to view or download this image.') : '';
  facts($('preview-info'), [
    [word('描述', 'Description'), job.prompt], [word('服務與操作', 'Service and operation'), operationLabel(job)],
    [word('代理設定', 'Agent'), [job.agentModel, job.agentEffort].filter(Boolean).join(word('，推理強度 ', ', effort ')) || word('未記錄', 'Not recorded')],
    [word('要求的比例', 'Requested ratio'), job.requestedRatio ? (job.requestedRatio === 'auto' ? word('自動', 'Auto') : job.requestedRatio) : word('由服務決定', 'Decided by the service')],
    job.sources.length ? [word('基於', 'Based on'), job.sources.map((source, index) => {
      const origin = jobs.find((entry) => entry.id === source.id);
      return word(`第 ${index + 1} 張：`, `Image ${index + 1}: `) + (origin ? `${origin.name}「${origin.prompt.slice(0, 24)}${origin.prompt.length > 24 ? '…' : ''}」` : word('已不在作品列表', 'no longer listed'));
    }).join(word('；', '; '))] : null,
    job.requestedTransparency ? [word('要求透明背景', 'Requested transparency'), word('是', 'Yes')] : null,
    job.output ? [word('檔案大小', 'File size'), formatBytes(job.output.bytes) ?? word('未知', 'Unknown')] : null,
    [word('圖片模型', 'Image model'), job.output?.mediaModel ?? word('服務未回報', 'Not reported')],
    [word('媒體費用', 'Media cost'), word('服務未回報', 'Not reported')],
    [word('生成回應', 'Generation response'), job.warnings.includes('response_timeout_after_image') ? word('逾時（圖片已在逾時前完成）', 'Timed out after the image was finished')
      : job.executionOutcome ?? (job.status === 'succeeded' ? word('已完成', 'Completed') : STATUS_LABELS[job.status] ?? job.status)],
  ]);
  if (job.output) {
    $('ruler-width').textContent = `${job.output.width} px`; $('ruler-height').textContent = `${job.output.height} px`;
    $('preview-image').querySelector('.image-button').classList.toggle('checker', job.output.format === 'PNG');
    facts($('preview-facts'), [[word('格式', 'Format'), job.output.format], [word('尺寸', 'Size'), `${job.output.width} × ${job.output.height}`],
      [word('比例', 'Ratio'), job.output.ratio], [word('透明度', 'Transparency'), TRANSPARENCY_LABELS[job.output.transparency]]]);
    actions.append(...present(button(word('放大檢視', 'Enlarge'), openDialog, { dataset: { focusKey: 'preview-zoom' }, disabled: shownImageId !== job.id }),
      button(word('下載原檔', 'Download original'), () => perform(() => hostCall('export', [job.id])), { dataset: { focusKey: 'preview-download' } }),
      editTargets().length ? button(word('以此修圖', 'Edit this image'), () => editWork(job), { class: 'quiet emphasis', dataset: { focusKey: 'preview-edit' } }) : null,
      button(word('複用描述', 'Reuse prompt'), () => reuse(job), { dataset: { focusKey: 'preview-reuse' } }),
      deleteButton(job, 'preview-delete')));
    if (shownImageId !== job.id) {
      imageView.hidden = true; progress.hidden = false; progress.replaceChildren();
      previewLoading(word('正在讀取圖片…', 'Loading the image…'));
      void showImage(job);
    }
    return;
  }
  facts($('preview-facts'), []);
  if (job.active) {
    const notes = {
      submitting: word('請求送達前不會重複送出。', 'The request is not sent twice while it is being delivered.'),
      running: word('可以取消，已使用的額度不一定會退還。服務沒有回報進度，所以不顯示百分比。', 'You can cancel; used allowance may not be refunded. The service reports no progress, so no percentage is shown.'),
      collecting: word('圖片已產生，正在檢查並保存原檔。取消仍會優先處理。', 'The image exists and the original is being checked and saved. Cancelling still takes priority.'),
      cancelling: word('正在等待服務停止。取消完成前不會顯示新圖片。', 'Waiting for the service to stop. No new image appears before cancelling finishes.'),
    };
    const box = (job.requestedRatio !== 'auto' && ratioBox(job.requestedRatio, 220)) || ratioBox('4:3', 220);
    const frame = el('div', { class: 'progress-frame' }, el('span', { id: 'elapsed', class: 'count large', text: job.status === 'running' ? elapsed(job.createdAt) : '…' }));
    Object.assign(frame.style, { width: `${box.width}px`, height: `${box.height}px` });
    progress.replaceChildren(...present(frame, el('p', { class: 'state-title', text: STATUS_LABELS[job.status] }), el('p', { class: 'note', text: notes[job.status] }),
      ['running', 'collecting'].includes(job.status) ? button(word('取消', 'Cancel'), () => perform(async () => { upsert(await hostCall('cancel', [job.id])); await reload(); }), { dataset: { focusKey: 'preview-cancel' } }) : null));
    return;
  }
  const reason = job.status === 'interrupted' ? word('無法確認執行結果，可能已使用額度；沒有重新生成。「確認結果」只會讀取原請求。', 'The outcome is unconfirmed and allowance may have been used. Nothing was regenerated; Check outcome only reads the original request.')
    : errorText(job.error ?? job.status, job.name);
  ended.replaceChildren(...present(el('p', { class: 'state-title', text: { failed: word('這次沒有產生圖片', 'No image this time'), interrupted: STATUS_LABELS.interrupted, cancelled: STATUS_LABELS.cancelled }[job.status] ?? STATUS_LABELS[job.status] }),
    el('p', { class: 'note', text: reason }),
    el('div', { class: 'actions' }, job.status === 'interrupted' ? button(word('確認結果', 'Check outcome'), () => perform(async () => { upsert(await hostCall('refresh', [job.id])); await reload(); }), { dataset: { focusKey: 'preview-check' } }) : null,
      ['failed', 'cancelled'].includes(job.status) ? button(word('再生成一張', 'Generate another'), () => retry(job), { disabled: blocked(), dataset: { focusKey: 'preview-retry' } }) : null,
      button(word('複用描述', 'Reuse prompt'), () => reuse(job), { dataset: { focusKey: 'preview-reuse' } }),
      deleteButton(job, 'preview-delete')),
    ['failed', 'cancelled'].includes(job.status) ? el('p', { class: 'note', text: word('「再生成一張」會建立新的請求，可能再次使用額度。', 'Generate another creates a new request and may use allowance again.') }) : null));
}

function renderJobs(force = false) {
  const query = $('work-search').value.trim().toLocaleLowerCase();
  const service = $('work-service').value || 'all';
  const status = $('work-status').value;
  const signature = JSON.stringify([jobs.map((job) => [job.id, job.status, job.active ? null : job.updatedAt]), selectedId, query, service, status, blocked(), editTargets().length]);
  if (!force && signature === jobsSignature) return;
  jobsSignature = signature;
  const providers = [...new Map(jobs.map((job) => [job.provider, job.name])).entries()];
  const serviceSelect = $('work-service');
  serviceSelect.replaceChildren(el('option', { value: 'all', text: word('全部服務', 'All services') }), ...providers.map(([provider, name]) => el('option', { value: provider, text: name })));
  serviceSelect.value = providers.some(([provider]) => provider === service) ? service : 'all';
  $('library-count').textContent = word(`保存在這台電腦。${jobs.length} 件，最多保存 100 件。`, `Saved on this computer. ${jobs.length} of up to 100.`);
  const container = $('jobs'); container.replaceChildren();
  const visible = jobs.filter((job) => (serviceSelect.value === 'all' || job.provider === serviceSelect.value)
    && (status === 'all' || (status === 'saved' && job.output) || (status === 'open' && (job.active || job.status === 'interrupted')) || (status === 'ended' && ['failed', 'cancelled'].includes(job.status)))
    && (!query || job.prompt.toLocaleLowerCase().includes(query)));
  if (!jobs.length) container.append(el('p', { class: 'note', text: word('還沒有作品。右側的橘貓是先前產生的範例。', 'No saved images yet. The orange cat is an existing sample.') }));
  else if (!visible.length) container.append(el('p', { class: 'note', text: word('沒有符合條件的作品。換個關鍵字，或清除篩選。', 'No images match. Try another keyword or clear the filters.') }));
  for (const job of visible) {
    const note = job.warnings.includes('response_timeout_after_image') ? word('圖片已保存，但生成回應逾時。', 'Saved, but the generation response timed out.')
      : job.status === 'failed' ? errorText(job.error, job.name) : job.status === 'interrupted' ? errorText('execution_interrupted') : job.status === 'cancelled' ? word('已使用的額度不一定會退還。', 'Used allowance may not be refunded.') : '';
    const select = () => { selectedId = job.id; keepFocus(() => { renderJobs(true); renderPreview(true); }); };
    container.append(el('article', { class: job.id === selectedId ? 'work selected' : 'work', 'aria-current': job.id === selectedId ? 'true' : null },
      el('button', { type: 'button', class: 'thumb', onclick: select, dataset: { focusKey: `view-${job.id}` }, 'aria-label': `${job.output ? word('預覽', 'Preview') : word('查看', 'View')}：${job.prompt}` },
        job.output ? thumbnail(job, 196, 124) : el('span', { class: 'thumb-status', text: STATUS_LABELS[job.status] ?? job.status })),
      el('p', { class: 'work-prompt', text: job.prompt }),
      el('p', { class: 'note' }, el('span', { text: operationLabel(job) }), el('span', { class: 'count', text: job.output ? `${job.output.width} × ${job.output.height} ${job.output.format}` : new Date(job.createdAt).toLocaleString(zh ? 'zh-TW' : 'en') })),
      note ? el('p', { class: job.status === 'failed' ? 'note danger' : job.warnings.length ? 'note attention' : 'note', text: note }) : null,
      el('div', { class: 'actions' },
        job.output ? button(word('下載', 'Download'), () => perform(() => hostCall('export', [job.id])), { disabled: busy, dataset: { focusKey: `download-${job.id}` } }) : null,
        job.output && editTargets().length ? button(word('修圖', 'Edit'), () => editWork(job), { dataset: { focusKey: `edit-${job.id}` } }) : null,
        job.status === 'interrupted' ? button(word('確認結果', 'Check outcome'), () => perform(async () => { upsert(await hostCall('refresh', [job.id])); await reload(); }), { disabled: busy, dataset: { focusKey: `check-${job.id}` } }) : null,
        ['failed', 'cancelled'].includes(job.status) ? button(word('再生成一張', 'Generate another'), () => retry(job), { disabled: blocked(), dataset: { focusKey: `retry-${job.id}` } }) : null,
        button(word('複用描述', 'Reuse prompt'), () => reuse(job), { dataset: { focusKey: `reuse-${job.id}` } }),
        deleteButton(job, `delete-${job.id}`))));
  }
}

// Deletion exists only on hosts whose SDK provides it, and only for finished work.
const canDelete = (job) => typeof sdk?.images?.delete === 'function' && ['succeeded', 'failed', 'cancelled'].includes(job.status);
function deleteButton(job, focusKey) {
  return canDelete(job) ? button(word('刪除', 'Delete'), () => void deleteWork(job), { class: 'quiet danger', disabled: blocked(), dataset: { focusKey } }) : null;
}
const confirmDialog = $('confirm-dialog');
// The sandboxed frame has no allow-forms, so a form[method=dialog] would never close; buttons close it directly.
for (const choice of confirmDialog.querySelectorAll('[data-close]')) choice.addEventListener('click', () => confirmDialog.close(choice.dataset.close));
function confirmDeletion() {
  return new Promise((resolve) => {
    confirmDialog.addEventListener('close', () => resolve(confirmDialog.returnValue === 'delete'), { once: true });
    confirmDialog.returnValue = '';
    confirmDialog.showModal();
  });
}
async function deleteWork(job) {
  // A saved image is gone for good once deleted; failed and cancelled work holds no image.
  if (job.output && !(await confirmDeletion())) return;
  const position = jobs.findIndex((entry) => entry.id === job.id);
  await perform(async () => {
    await hostCall('delete', [job.id]);
    jobs = jobs.filter((entry) => entry.id !== job.id);
    if (selectedId === job.id) selectedId = null;
    if (followedId === job.id) followedId = null;
    const url = imageUrls.get(job.id);
    imageUrls.delete(job.id);
    if (url) setTimeout(() => URL.revokeObjectURL(url), 0);
    if (sourceIds.includes(job.id)) { sourceIds = sourceIds.filter((id) => id !== job.id); renderSources(); renderParameters(); }
    say(word('已刪除。', 'Deleted.'));
  });
  if (jobs.some((entry) => entry.id === job.id)) return; // The deletion failed; the message says why.
  const next = jobs[Math.min(position, jobs.length - 1)];
  (next && document.querySelector(`[data-focus-key="view-${CSS.escape(next.id)}"]`) || $('work-search')).focus();
}

function announce() {
  const job = jobs.find((entry) => entry.id === followedId);
  if (!job || job.status === followedStatus) return;
  followedStatus = job.status;
  if (job.status === 'succeeded') say(job.warnings.length ? word('圖片已保存，但生成回應逾時。', 'Saved, but the generation response timed out.') : word('圖片已保存。', 'Image saved.'));
  else say(job.status === 'failed' ? errorText(job.error, job.name) : STATUS_LABELS[job.status]);
}

async function reload() {
  jobs = (await hostCall('list')).jobs.map(normalizeJob);
  if (pending && !pending.unconfirmed) return;
  const matched = matchPendingJob(pending, jobs);
  if (matched) { pending = null; follow(matched); }
}

async function loadCapabilities() {
  try { capabilities = normalizeCapabilities(await hostCall('getCapabilities')); capabilitiesOffline = false; }
  catch { capabilities = normalizeCapabilities(null); capabilitiesOffline = true; }
  // Offline keeps the user's choice so it survives until capabilities return (CAP-06).
  if (!capabilitiesOffline) {
    const previous = serviceKey;
    serviceKey = defaultService(capabilities, serviceKey);
    if (previous && previous !== serviceKey) say(word('原本選的服務已不在清單中，請確認目前選擇的服務。', 'The service you picked is no longer listed. Check the selected service.'));
  }
  $('service-status').textContent = capabilitiesOffline ? OFFLINE_TEXT
    : capabilities.services.some((service) => service.available) ? ''
      : capabilities.reason === 'unsupported_schema' ? word('這個版本的 Cats 提供的生成服務格式不受支援，已保存的作品仍可查看及下載。', 'This Cats version offers an unsupported generation format. Saved images can still be viewed and downloaded.')
        : word('尚未設定支援生圖的服務。請先到 Cats 的 Runtime 設定完成安裝與登入。', 'No image service is configured. Install and sign in through Cats Runtime settings.');
  keepFocus(() => { renderServices(); renderOperation(); });
}

async function refresh(recheck = false) {
  await perform(async () => {
    if (!sdk?.images) throw new Error('image_service_unavailable');
    await reload();
    if (!loaded) selectedId ??= initialSelection(jobs);
    if (!loaded || recheck) await loadCapabilities();
    loaded = true;
    const { kept, removed } = pruneSources(sourceIds, jobs);
    if (removed.length) { sourceIds = kept; keepFocus(() => { renderSources(); renderParameters(); }); say(errorText('source_unavailable')); }
    announce();
  }, { quiet: !recheck });
}

function openDialog() { if (!$('preview-image').hidden) dialog.showModal(); }
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
$('expand').addEventListener('click', openDialog);
let dialogOpener = null;
dialog.addEventListener('close', () => { dialogOpener?.focus(); dialogOpener = null; });
document.addEventListener('click', (event) => { if (event.target.closest?.('#expand, #preview-actions button')) dialogOpener = event.target.closest('button'); }, true);
prompt.addEventListener('input', controls);
// A click that lands during a quiet poll is honoured once the poll ends, never dropped or repeated.
generate.addEventListener('click', () => { if (generate.disabled) return; if (busy) deferredSubmit = true; else submitDraft(draft()); });
$('refresh').addEventListener('click', () => void refresh(true));
for (const id of ['work-search', 'work-service', 'work-status']) $(id).addEventListener('input', () => renderJobs());

let timer = null;
// Each poll picks its delay when it is scheduled; submitting reschedules so the first status update comes quickly.
function schedule() {
  clearTimeout(timer);
  if (disposed) return;
  timer = setTimeout(async () => { try { if (!busy) await refresh(); } finally { schedule(); } }, jobs.some((job) => job.active) || pending ? 3000 : 10000);
}
const ticker = setInterval(() => {
  const job = jobs.find((entry) => entry.id === selectedId);
  if (job?.status === 'running' && $('elapsed')) $('elapsed').textContent = elapsed(job.createdAt);
}, 1000);
window.addEventListener('pagehide', () => {
  disposed = true; clearTimeout(timer); clearInterval(ticker); thumbObserver?.disconnect(); calls.close();
  for (const url of imageUrls.values()) URL.revokeObjectURL(url);
  imageUrls.clear();
});
renderOperation(); controls(); renderPreview();
void refresh().finally(schedule);
