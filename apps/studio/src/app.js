import { MAX_PROMPT_LENGTH, SAMPLE_PROMPT, SAMPLE_IMAGE, PROMPT_IDEAS, promptLength } from './model.js';

const sdk = globalThis.catsApp;
const zh = !sdk?.locale || sdk.locale.startsWith('zh');
const word = (cn, en) => zh ? cn : en;
document.documentElement.lang = zh ? 'zh-Hant' : 'en';
document.documentElement.dataset.theme = sdk?.theme === 'dark' ? 'dark' : 'light';
const root = document.getElementById('app');

root.innerHTML = `
  <header class="page-header">
    <div class="brand"><span class="brand-mark" aria-hidden="true">S</span><div><h1>Studio</h1><p>${word('圖片工作室', 'Image studio')}</p></div></div>
    <div class="header-actions"><span class="preview-badge">${word('圖片', 'Images')}</span><button id="home" class="quiet" type="button">${word('返回 Cats Home', 'Back to Cats Home')}</button></div>
  </header>
  <section class="intro"><p class="eyebrow">A LITTLE SPACE TO CREATE</p><h2>${word('把想像，變成一張圖。', 'A little imagination. A new image.')}</h2><p>${word('從一句描述開始，慢慢調整成你喜歡的樣子。', 'Start with a description. Make it your own.')}</p></section>
  <div class="workspace">
    <section class="composer panel" aria-labelledby="create-title">
      <div class="section-heading"><h3 id="create-title">${word('描述你的畫面', 'Describe your image')}</h3><span class="step">01</span></div>
      <form id="create-form">
        <label for="prompt">${word('想畫些什麼？', 'What would you like to see?')}</label>
        <textarea id="prompt" maxlength="${MAX_PROMPT_LENGTH}" rows="7" aria-describedby="prompt-tip prompt-count" placeholder="${word('例如：一隻橘貓坐在淺藍色背景前，簡單的平面插畫，沒有文字。', 'For example: an orange cat on a light blue background, a simple flat illustration, no text.')}"></textarea>
        <div class="input-caption"><span id="prompt-tip">${word('加上主體、場景與風格，讓想像更清楚。', 'Include a subject, setting and style.')}</span><span id="prompt-count">0 / ${MAX_PROMPT_LENGTH}</span></div>
        <p class="idea-label">${word('需要一點靈感？', 'Need a starting point?')}</p><div class="ideas">${PROMPT_IDEAS.map((idea, index) => `<button class="chip" type="button" data-idea="${index}">${word(idea.label, idea.en)}</button>`).join('')}</div>
        <div class="settings"><div><span class="setting-label">${word('圖片比例', 'Aspect ratio')}</span><strong><span class="square" aria-hidden="true"></span>1:1 <span class="muted">${word('正方形', 'Square')}</span></strong></div><div><span class="setting-label">${word('每次張數', 'Images per request')}</span><strong>1 <span class="muted">${word('張', 'image')}</span></strong></div></div>
        <label for="target">${word('生成服務', 'Generation service')}</label><select id="target" disabled><option>${word('讀取中…', 'Loading…')}</option></select>
        <button id="generate" class="primary" type="button" disabled aria-describedby="generation-note">${word('生成圖片', 'Generate image')} <span aria-hidden="true">↗</span></button>
        <p class="availability" id="generation-note">${word('使用 Grok CLI 的登入帳號與生成額度。每次按下只提交一張，不會自動重試；實際費用依服務回報。', 'Uses your Grok CLI sign-in and generation allowance. Each click requests one image, with no automatic retry. Actual charges depend on the service.')}</p>
        <p id="service-status" role="status" class="availability"></p><button id="refresh" type="button" class="quiet">${word('重新整理', 'Refresh')}</button>
      </form>
    </section>
    <section class="preview panel" aria-labelledby="preview-title">
      <div class="section-heading"><h3 id="preview-title">${word('圖片預覽', 'Image preview')}</h3><span class="sample-badge">${word('範例作品', 'Sample image')}</span></div>
      <button class="image-button" id="expand" type="button" aria-label="${word('放大範例圖片', 'Enlarge sample image')}"><img id="sample-image" src="${SAMPLE_IMAGE}" width="1024" height="1024" alt="${word('淺藍色背景前坐著一隻橘貓的平面插畫', 'Flat illustration of an orange cat sitting on a light blue background')}"><span class="expand-hint">${word('點擊放大', 'Click to enlarge')} ↗</span></button>
      <div class="image-info"><div><h4>${word('一隻橘貓，一點想像。', 'One orange cat. A little imagination.')}</h4><p>JPEG <span aria-hidden="true">·</span> 1024 × 1024</p></div><button id="reuse" class="quiet" type="button">${word('套用描述', 'Use prompt')}</button></div>
      <p class="sample-note">${word('先前實測產生的範例圖片。修改左側描述不會改變這張範例。', 'An image from an earlier generation test. Editing the prompt does not change this sample.')}</p>
    </section>
  </div>
  <section class="library panel" aria-labelledby="library-title"><div class="section-heading"><h3 id="library-title">${word('最近作品', 'Recent images')}</h3><span class="muted">${word('保存在這台電腦', 'Saved on this computer')}</span></div><div id="jobs" aria-live="polite"></div></section>
  <footer>${word('先從一張圖片開始。', 'Start with a single image.')}<span>Studio ${sdk?.version || '0.1.0'}</span></footer>
  <p id="feedback" role="status" aria-live="polite"></p>
  <dialog id="image-dialog" aria-label="${word('圖片預覽', 'Image preview')}"><button type="button" class="dialog-close" aria-label="${word('關閉預覽', 'Close preview')}">×</button><img src="${SAMPLE_IMAGE}" width="1024" height="1024" alt="${word('淺藍色背景前的橘貓插畫', 'Orange cat illustration on a light blue background')}"></dialog>
`;

const prompt = document.getElementById('prompt');
const feedback = document.getElementById('feedback');
const updateCount = () => {
  document.getElementById('prompt-count').textContent = `${promptLength(prompt.value)} / ${MAX_PROMPT_LENGTH}`;
};
const applyPrompt = (value) => { prompt.value = value; updateCount(); prompt.focus(); };
prompt.addEventListener('input', updateCount);
for (const button of root.querySelectorAll('[data-idea]')) {
  button.addEventListener('click', () => {
    const idea = PROMPT_IDEAS[Number(button.dataset.idea)];
    applyPrompt(word(idea.prompt, idea.english));
  });
}
document.getElementById('reuse').addEventListener('click', () => applyPrompt(SAMPLE_PROMPT));
const dialog = document.getElementById('image-dialog');
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.getElementById('expand').addEventListener('click', () => dialog.showModal());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
document.getElementById('home').addEventListener('click', async () => {
  try {
    if (!sdk?.openLobby) throw new Error('Host unavailable');
    await sdk.openLobby();
  } catch { feedback.textContent = word('無法返回首頁，請使用 Cats 的首頁入口。', 'Could not return home. Use the Cats Home navigation.'); }
});

const generate = document.getElementById('generate');
const target = document.getElementById('target');
const status = document.getElementById('service-status');
const refreshButton = document.getElementById('refresh');
let capabilities = null;
let jobs = [];
let busy = false;
let pending = null;
let selectedId = null;
let pendingPreviewId = null;
let imageUrl = null;
let disposed = false;
const active = (job) => ['submitting', 'running', 'collecting', 'cancelling'].includes(job.status);
const labels = {
  submitting: word('正在送出', 'Submitting'), running: word('生成中', 'Generating'), collecting: word('正在保存', 'Saving'),
  succeeded: word('已完成', 'Ready'), failed: word('未完成', 'Failed'), cancelling: word('正在取消', 'Cancelling'),
  cancelled: word('已取消', 'Cancelled'), interrupted: word('執行中斷，結果待確認', 'Interrupted; outcome unconfirmed'),
};
const errorText = (code) => ({
  auth_required: word('請先在 Grok CLI 登入，再建立新任務。', 'Sign in to Grok CLI before creating a new request.'),
  quota_exhausted: word('Grok 額度不足或暫時受到限制。', 'Grok allowance is exhausted or temporarily limited.'),
  privacy_required: word('Grok 的隱私設定阻擋了生成，請先檢查帳號設定。', 'Grok privacy settings prevented generation. Check your account settings.'),
  generation_refused: word('生成服務拒絕了這次請求，請調整描述。', 'The service declined this request. Adjust the description.'),
  generation_timeout: word('生成逾時，可能已使用額度；沒有自動重試。', 'Generation timed out and may have used allowance. No retry was made.'),
  cli_unavailable: word('找不到可執行的 Grok CLI，請檢查 Cats 的 Runtime 設定。', 'Grok CLI could not start. Check Cats Runtime settings.'),
  image_service_busy: word('已有生成任務在執行，請稍後再試。', 'A generation is already running. Try again later.'),
  execution_interrupted: word('無法確認執行結果，可能已使用額度；沒有重新生成。', 'The outcome is unconfirmed and allowance may have been used. Nothing was regenerated.'),
  invalid_image: word('回傳圖片未通過驗證，未標記為完成。', 'The returned image failed validation.'),
  image_storage_limit: word('作品保存空間已達此版本的上限。', 'The saved-image limit for this version has been reached.'),
  storage_full: word('磁碟空間不足，圖片未保存完成。', 'Disk space is insufficient to save this image.'),
  cancelled: word('任務已取消，已使用的額度不一定會退還。', 'Cancelled. Used allowance may not be refunded.'),
  app_context_revoked: word('App 的存取權已變更，請返回首頁重新開啟。', 'App access changed. Reopen it from Cats Home.'),
})[code] || word('目前無法完成操作。請重新整理查看狀態；不會自動生成。', 'The operation is unavailable. Refresh to check its status; no image is generated automatically.');
function controls() {
  const ready = !!capabilities?.targets.length;
  generate.disabled = busy || !ready || !prompt.value.trim() || !!pending || jobs.some(active);
  target.disabled = busy || !ready || jobs.some(active);
  refreshButton.disabled = busy;
}
prompt.addEventListener('input', controls);
for (const button of root.querySelectorAll('[data-idea], #reuse')) button.addEventListener('click', controls);
function showJobs() {
  const container = document.getElementById('jobs'); container.replaceChildren();
  if (!jobs.length) {
    const empty = document.createElement('p'); empty.className = 'availability';
    empty.textContent = word('還沒有作品。右側的橘貓是先前產生的範例。', 'No saved images yet. The orange cat is an existing sample.');
    container.append(empty); return;
  }
  for (const job of jobs) {
    const row = document.createElement('article'); row.className = 'job-row';
    const description = document.createElement('div');
    const title = document.createElement('p'); title.className = 'job-prompt'; title.textContent = job.prompt;
    const detail = document.createElement('p'); detail.className = 'availability';
    detail.textContent = `${labels[job.status] || job.status} · Grok / ${job.instance} · ${new Date(job.createdAt).toLocaleString(zh ? 'zh-TW' : 'en')}${job.error ? ` — ${errorText(job.error)}` : ''}`;
    description.append(title, detail); row.append(description);
    const actions = document.createElement('div'); actions.className = 'job-actions';
    const button = (label, action) => {
      const item = document.createElement('button'); item.type = 'button'; item.className = 'quiet'; item.textContent = label;
      item.disabled = busy; item.addEventListener('click', () => void action()); actions.append(item);
    };
    if (job.status === 'succeeded') {
      button(word('預覽', 'Preview'), () => showImage(job));
      button(word('下載', 'Download'), () => perform(() => sdk.images.export(job.id)));
    }
    if (active(job) && job.status !== 'cancelling') button(word('取消', 'Cancel'), () => perform(async () => {
      await sdk.images.cancel(job.id); jobs = (await sdk.images.list()).jobs;
    }));
    if (job.status === 'interrupted') button(word('確認結果', 'Check outcome'), () => perform(async () => {
      await sdk.images.refresh(job.id); jobs = (await sdk.images.list()).jobs;
    }));
    button(word('複用描述', 'Reuse prompt'), () => { applyPrompt(job.prompt); controls(); });
    row.append(actions); container.append(row);
  }
}
async function perform(action) {
  if (busy || disposed) return;
  busy = true; controls(); showJobs();
  try { await action(); feedback.textContent = ''; }
  catch (error) { feedback.textContent = errorText(error.message); }
  finally { busy = false; if (!disposed) { controls(); showJobs(); } }
}
async function loadImage(job) {
  const image = await sdk.images.read(job.id);
  if (disposed) return;
  const nextUrl = URL.createObjectURL(new Blob([image.bytes], { type: image.mimeType }));
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = nextUrl; selectedId = job.id;
  document.getElementById('sample-image').src = nextUrl;
  document.getElementById('sample-image').alt = job.prompt;
  dialog.querySelector('img').src = nextUrl; dialog.querySelector('img').alt = job.prompt;
  document.getElementById('expand').setAttribute('aria-label', word('放大生成圖片', 'Enlarge generated image'));
  root.querySelector('.sample-badge').textContent = word('已保存', 'Saved');
  root.querySelector('.image-info h4').textContent = job.prompt;
  root.querySelector('.image-info p').textContent = `JPEG · ${job.output.width} × ${job.output.height}`;
  root.querySelector('.sample-note').textContent = word('此圖片已保存，重新開啟 Studio 仍可查看及下載。', 'Saved. Reopen Studio to view or download this image.');
}
async function showImage(job) { await perform(() => loadImage(job)); }
document.getElementById('reuse').addEventListener('click', () => {
  const job = jobs.find((entry) => entry.id === selectedId);
  if (job) { applyPrompt(job.prompt); controls(); }
});
async function refresh(recheck = false) {
  await perform(async () => {
    if (!sdk?.images) throw new Error('image_service_unavailable');
    jobs = (await sdk.images.list()).jobs;
    if (pending && jobs.some((job) => job.requestId === pending.requestId)) pending = null;
    const latest = jobs.find((job) => job.status === 'succeeded');
    const pendingPreview = jobs.find((job) => job.id === pendingPreviewId && job.status === 'succeeded');
    if (pendingPreview) { await loadImage(pendingPreview); pendingPreviewId = null; }
    else if (!selectedId && latest) await loadImage(latest);
    if (!capabilities || recheck) {
      try { capabilities = await sdk.images.getCapabilities(); }
      catch { capabilities = null; status.textContent = word('生成服務暫時無法連線，已保存的作品仍可查看及下載。', 'Generation is unavailable. Saved images can still be viewed and downloaded.'); return; }
      const selected = target.value; target.replaceChildren();
      for (const item of capabilities.targets) {
        const option = document.createElement('option'); option.value = item.instance; option.textContent = `Grok / ${item.instance}`;
        target.append(option);
      }
      if (capabilities.targets.some((item) => item.instance === selected)) target.value = selected;
      status.textContent = capabilities.targets.length ? word('每次只生成一張正方形圖片，實際尺寸依結果而定。', 'One square image per request. Actual dimensions depend on the result.')
        : word('尚未設定支援生圖的 Grok CLI。請先到 Cats 的 Runtime 設定完成安裝與登入。', 'No compatible Grok CLI is configured. Install and sign in through Cats Runtime settings.');
    }
  });
}
function requestId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
generate.addEventListener('click', () => {
  if (generate.disabled) return;
  pending = { requestId: requestId(), prompt: prompt.value.trim(), instance: target.value };
  void perform(async () => {
    try {
      const job = await sdk.images.submit(pending);
      jobs = [job, ...jobs.filter((entry) => entry.id !== job.id)]; pending = null;
      pendingPreviewId = job.id;
    } catch (error) {
      if (['invalid_image_request', 'image_service_busy', 'image_storage_limit', 'app_context_revoked'].includes(error.message)) pending = null;
      else status.textContent = word('送出結果尚未確認，請重新整理任務；不會自動再次送出。', 'Submission is unconfirmed. Refresh the job list; it will not be sent again automatically.');
      throw error;
    }
  });
});
refreshButton.addEventListener('click', () => void refresh(true));
const polling = setInterval(() => { if (!busy) void refresh(); }, 3000);
window.addEventListener('pagehide', () => { disposed = true; clearInterval(polling); if (imageUrl) URL.revokeObjectURL(imageUrl); });
void refresh();
