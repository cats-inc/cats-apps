import { stateLabels, outcomeLabels, answerText, connectionInstruction, questionInstruction } from './model.js';

const root = document.querySelector('#app');
const toast = document.querySelector('#toast');
const connection = globalThis.catsAppConnection;
document.documentElement.dataset.theme = globalThis.catsApp?.theme ?? 'light';
let screen = { kind: 'home' };
let resetScroll = false;
let questions = [];
let hosting = { state: 'disconnected' };
const hostingReady = () => !!hosting.url && ['connected', 'configured'].includes(hosting.state);
let botConnection;
let draft = '';
let draftId = crypto.randomUUID();
let submittedDraft;
let busy = false;
let toastTimer;
let requestSequence = 0;
function navigate(next) { requestSequence++; screen = next; resetScroll = true; render(); }

const node = (tag, attrs = {}, ...children) => {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on')) element.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'class') element.className = value;
    else if (key === 'text') element.textContent = value;
    else if (value !== undefined && value !== false) element.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) if (child !== undefined && child !== null) element.append(child);
  return element;
};
const button = (text, action, primary = false, disabled = false) => node('button', { type: 'button', class: primary ? 'primary' : '', onClick: action, disabled: disabled || busy }, text);
const date = value => new Date(value).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const notify = message => { clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false; toastTimer = setTimeout(() => { toast.hidden = true; }, 3500); };
const errors = { attempt_expired: '這次提問已超過 7 天。請明確建立新問題。', answer_conflict: '已保留原回答，未覆寫衝突回覆。',
  question_limit: '問題庫已達 500 題上限。', ask_data_needs_recovery: '問題資料需要修復，原資料已保留。',
  app_context_revoked: 'App 已停用或更新，請重新開啟。', app_auth_required: '這個畫面已過期，請重新開啟 Ask。' };
async function api(path, options = {}) {
  if (!connection) throw new Error('請從支援多元件 App 的 Cats Desktop 開啟 Ask。');
  const response = await fetch(new URL(path.replace(/^\//, ''), new URL(connection.baseUrl, location.href)), { ...options, cache: 'no-store', credentials: 'omit',
    headers: { ...connection.headers, ...(options.body ? { 'content-type': 'application/json' } : {}) } });
  const result = await response.json();
  if (!response.ok) throw new Error(errors[result.error] ?? '暫時無法連到 Ask。問題不會自動重送，請稍後再試。');
  return result;
}
async function copy(text) {
  try { await globalThis.catsApp.clipboard.writeText(text); notify('已複製'); }
  catch { notify('無法寫入剪貼簿，請選取文字後複製。'); return false; }
  return true;
}
async function action(operation) {
  if (busy) return;
  busy = true;
  root.querySelectorAll('button').forEach(button => { button.disabled = true; });
  try { await operation(); } catch (error) { notify(error.message); }
  finally { busy = false; render(); }
}
function header(title, subtitle) {
  return node('header', {}, node('div', {}, node('div', { class: 'eyebrow' }, 'CATS / ASK'), node('h1', {}, title),
    node('p', { class: 'muted' }, subtitle)), screen.kind === 'home'
      ? button('返回 Cats', () => globalThis.catsApp?.openLobby())
      : button('← 問題庫', () => navigate({ kind: 'home' })));
}
function home() {
  return [header('讓你的助理，帶回答案。', '從你有權限看到的內容，問一個與自己有關的問題。'),
    node('button', { class: 'provider', type: 'button', onClick: () => navigate({ kind: 'compose' }) },
      node('span', { class: 'mark', 'aria-hidden': 'true' }, '↗'),
      node('span', { class: 'grow' }, node('strong', {}, 'Ask Grok Bot'), node('small', {}, 'X 書籤、可閱讀的貼文，以及你的問題')),
      node('span', { class: 'badge' }, '需在 Bot 啟動'), node('span', { class: 'arrow', 'aria-hidden': 'true' }, '›')),
    node('p', { class: 'meta' }, 'Gemini Spark 與 Meta AI 尚未接入。'),
    node('h2', { class: 'section-heading' }, '最近的問題'),
    questions.length ? node('ul', { class: 'recent' }, questions.map(question => node('li', {}, recentRow(question))))
      : node('div', { class: 'card empty' }, '第一個問題，從你最新收藏的三篇貼文開始。')];
}
function recentRow(question) {
  return node('button', { type: 'button', onClick: () => openQuestion(question.id) },
    node('span', {}, node('span', { class: 'question' }, question.question), node('small', {}, `Grok Bot · ${date(question.createdAt)}`)),
    node('span', { class: `badge ${question.state === 'succeeded' ? 'ok' : ''}` }, stateLabels[question.state]));
}
function tutorial() {
  const connected = hostingReady();
  return node('details', { class: 'card', open: !botConnection?.lastContactAt },
    node('summary', {}, '首次設定：連接 Grok Bot'),
    node('ol', { class: 'steps' },
      node('li', {}, node('h3', {}, '確認 Cats 遠端連線'),
        node('p', {}, 'Ask 使用 Cats 的共用入口。完成一次遠端連線設定，Mobile 與其他 Apps 也能使用；接收回答時需保持 Cats 開啟。'),
        connected ? node('p', { class: 'badge ok' }, hosting.state === 'connected' ? 'Cats 入口已連線' : '入口已設定，請由 Bot 確認可連線')
          : node('p', { class: 'notice' }, hosting.state === 'migration_required' ? '請先在 Cats 設定中選擇要沿用的連線。' : 'Cats 遠端入口尚未就緒。'),
        node('div', { class: 'row actions' },
          button('開啟 Cats 遠端連線設定', () => action(() => globalThis.catsApp.openRemoteAccess())),
          button('重新檢查', () => action(refresh))),
        connected ? node('p', { class: 'meta' }, hosting.url) : null),
      node('li', {}, node('h3', {}, '將 Cats Ask 加入 Grok Bot'),
        node('p', {}, '先在 Grok Bot 連好 X Connector。複製下方設定指令到 Bot，讓它新增 Cats Ask；不需要更動 X Connector。'),
        button('複製 Bot 連線指令', () => hostingReady() && botConnection
          ? copy(connectionInstruction(hosting.url, botConnection.token)) : notify('Cats 遠端入口尚未就緒。'), false, !connected || !botConnection),
        node('p', { class: 'secret-note' }, '指令包含專用連線憑證，只貼到自己的 Grok Bot。網址改變或重設連線後需更新一次。')),
      node('li', {}, node('h3', {}, '每次提問，貼上執行指令'),
        node('p', {}, '建立問題後，複製該題的執行指令給 Bot。問題會先保存在這裡；貼上才會開始，不會自動喚醒 Bot。'))),
    botConnection?.lastContactAt ? node('p', { class: 'meta' }, `最近收到 Bot 讀取：${date(botConnection.lastContactAt)}`) : null);
}
function compose() {
  const textarea = node('textarea', { maxlength: 8000, placeholder: '例如：請總結我最新儲存的三篇 X 書籤，附上原文連結，並說明你判斷收藏順序的依據。', 'aria-label': '你的問題' });
  textarea.value = draft;
  const count = node('span', { class: 'meta' }, `${draft.length} / 8000`);
  textarea.addEventListener('input', () => { draft = textarea.value; count.textContent = `${draft.length} / 8000`; });
  const submit = () => action(async () => {
    if (!draft.trim()) { textarea.focus(); return; }
    const submitted = draft;
    if (submittedDraft !== undefined && submittedDraft !== submitted) draftId = crypto.randomUUID();
    submittedDraft = submitted;
    const question = await api('/api/questions', { method: 'POST', body: JSON.stringify({ clientRequestId: draftId, question: submitted }) });
    if (draft === submitted) draft = '';
    draftId = crypto.randomUUID(); submittedDraft = undefined;
    requestSequence++; screen = { kind: 'detail', question }; resetScroll = true;
    questions = (await api('/api/questions').catch(() => ({ questions }))).questions;
  });
  return [header('Ask Grok Bot', '透過已授權的 X Connector，讀取你的內容。'), tutorial(),
    node('section', { class: 'card' }, node('h2', {}, '你想問什麼？'), textarea,
      node('div', { class: 'composer-footer' }, count, button('建立問題', submit, true))),
    node('p', { class: 'meta' }, '建立後會先保存。你可以離開這個頁面，回來查看完整回答與來源。')];
}
async function openQuestion(id) {
  const sequence = ++requestSequence;
  try { const question = await api(`/api/questions/${id}`); if (sequence === requestSequence) { screen = { kind: 'detail', question }; resetScroll = true; render(); } }
  catch (error) { notify(error.message); }
}
function detail() {
  const question = screen.question;
  const content = question.response?.content;
  const prepared = screen.instruction;
  return [header('你的問題', `Grok Bot · ${date(question.createdAt)}`),
    node('section', { class: 'card' }, node('span', { class: `badge ${content ? 'ok' : ''}` }, stateLabels[question.state]),
      node('p', { class: 'question-body' }, question.question)),
    content ? node('section', { class: 'card' }, node('div', { class: 'row between' }, node('h2', {}, outcomeLabels[content.outcome]), button('複製回答', () => copy(answerText(question)), true)),
      node('div', { class: 'answer-body' }, content.answer),
      content.sources.length ? node('div', {}, node('h3', { class: 'section-heading' }, '來源'), node('ul', { class: 'sources' }, content.sources.map(source =>
        node('li', {}, node('span', {}, source.title), ' ', button('複製連結', () => copy(source.url)), node('div', { class: 'meta' }, source.url))))) : null,
      content.limitations ? node('div', { class: 'notice' }, node('strong', {}, '限制'), node('div', { class: 'answer-body' }, content.limitations)) : null,
      content.evidence ? node('details', {}, node('summary', {}, '查詢依據'), node('p', { class: 'answer-body' }, content.evidence)) : null,
      node('p', { class: 'meta' }, `收到回答：${date(question.response.receivedAt)}`))
      : node('section', { class: 'card' }, node('h2', {}, '交給 Grok Bot'),
        node('p', { class: 'muted' }, question.state === 'unconfirmed'
          ? '上次連線中斷，尚未確認是否完成。Ask 不會自動重問；原執行指令仍對應同一題，Bot 可交回遲到的答案。'
          : '問題已保存。將執行指令貼到 Grok Bot，完成後答案會出現在這裡。'),
        !hostingReady() ? node('p', { class: 'notice' }, '回覆通道尚未連線。請先完成 Grok Bot 設定。') : null,
        prepared ? node('div', {}, button('複製 Bot 執行指令', () => copy(prepared), true),
          node('details', { class: 'actions' }, node('summary', {}, '查看執行指令'), node('pre', {}, prepared)))
          : button('準備 Bot 執行指令', () => action(async () => {
            const attempt = await api(`/api/questions/${question.id}/prepare`, { method: 'POST' });
            requestSequence++; screen = { kind: 'detail', question: await api(`/api/questions/${question.id}`), instruction: questionInstruction(attempt) };
          }), true, !hostingReady()),
        node('div', { class: 'actions' }, button('連線設定', () => navigate({ kind: 'compose' })))),
    node('div', { class: 'row' }, button('以這個問題重新提問', () => { draft = question.question; draftId = crypto.randomUUID(); navigate({ kind: 'compose' }); }),
      node('span', { class: 'meta' }, '重新建立會產生獨立問題，原回答仍會保留。'))];
}
function render() {
  const active = document.activeElement;
  const editing = active?.tagName === 'TEXTAREA' ? { start: active.selectionStart, end: active.selectionEnd } : null;
  const tutorialOpen = root.querySelector('details.card')?.open;
  root.replaceChildren(...(screen.kind === 'home' ? home() : screen.kind === 'compose' ? compose() : detail()));
  const tutorialNode = root.querySelector('details.card');
  if (tutorialNode && tutorialOpen !== undefined) tutorialNode.open = tutorialOpen;
  if (editing) {
    const textarea = root.querySelector('textarea');
    textarea?.focus({ preventScroll: true }); textarea?.setSelectionRange(editing.start, editing.end);
  }
  if (resetScroll) { window.scrollTo(0, 0); resetScroll = false; }
}
async function refresh() {
  const sequence = requestSequence;
  const [list, ingress, bot] = await Promise.all([api('/api/questions'), api('/_cats/ingress'), api('/api/connection')]);
  const listChanged = JSON.stringify(questions) !== JSON.stringify(list.questions);
  const hostingChanged = JSON.stringify(hosting) !== JSON.stringify(ingress) || JSON.stringify(botConnection) !== JSON.stringify(bot);
  questions = list.questions; hosting = ingress; botConnection = bot;
  if (screen.kind === 'home' && listChanged && !busy) render();
  if (screen.kind === 'compose' && hostingChanged && !busy) render();
  if (screen.kind === 'detail') {
    const id = screen.question.id;
    const question = await api(`/api/questions/${id}`);
    if (sequence !== requestSequence || screen.kind !== 'detail' || screen.question.id !== id || busy) return;
    const changed = JSON.stringify(screen.question) !== JSON.stringify(question);
    screen.question = question; if (changed || hostingChanged) render();
  }
}
function initialize() {
  return refresh().then(render).catch(error => root.replaceChildren(node('section', { class: 'card' },
    node('h1', {}, 'Ask'), node('p', { class: 'error' }, error.message), button('重試', initialize))));
}
void initialize();
setInterval(() => { if (!document.hidden && !busy) void refresh().catch(() => {}); }, 5000);
