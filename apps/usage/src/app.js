import { metric, remaining, quotaIsStale, selectUsage } from './model.js';

const sdk = globalThis.catsApp;
const locale = sdk?.locale || 'zh-TW';
const zh = locale.startsWith('zh');
const word = (cn, en) => zh ? cn : en;
document.documentElement.lang = zh ? 'zh-Hant' : 'en';
document.documentElement.dataset.theme = sdk?.theme === 'dark' ? 'dark' : 'light';
const root = document.getElementById('app');
const filters = { provider: '', instance: '', session: '' };
let snapshot = null;
let busy = false;
let offline = false;
let restarted = false;
let disposed = false;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const date = (value) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const number = (value) => metric(value, locale);
const age = (value) => {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60000));
  return Number.isFinite(minutes) ? minutes < 1 ? word('剛剛', 'just now') : word(`${minutes} 分鐘前`, `${minutes}m ago`) : word('未取得', 'not observed');
};
const money = (costs) => costs.length ? costs.map((cost) => `${esc(cost.currency)} ${cost.amount > 0 && cost.amount < 0.000001 ? '&lt; 0.000001' : new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(cost.amount)}`).join('<br>') : '—';
const options = (values, selected, label) => `<option value="">${label}</option>${[...new Set(values)].sort().map((value) => `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}`;

function targetCard(target) {
  const q = target.quota;
  const stale = offline || quotaIsStale(q);
  const windows = q.windows.map((window) => {
    const value = remaining(window);
    const elapsed = window.resetsAt && Date.parse(window.resetsAt) <= Date.now();
    return `<div class="window"><div class="window-title"><span>${esc(window.id)}${window.windowMinutes ? ` · ${number(window.windowMinutes)} min` : ''}</span><span><strong>${number(value)}${value === null ? '' : '%'}</strong> ${word('剩餘', 'remaining')}</span></div>${value === null ? '' : `<progress value="${value}" max="100" aria-label="${esc(window.id)} ${word('剩餘百分比', 'percent remaining')}"></progress>`}<p>${elapsed ? word('已過預定重設時間，等待供應商新回報', 'Reset time passed; awaiting a new provider report') : `${word('預定重設', 'Resets')} ${date(window.resetsAt)}`}</p></div>`;
  }).join('');
  const guardrails = target.guardrails.filter((rule) => rule.outcome !== 'allowed').map((rule) => `<p class="notice">${esc(rule.outcome)}${rule.cooldownUntil ? ` · ${word('冷卻至', 'cooldown until')} ${date(rule.cooldownUntil)}` : ''}</p>`).join('');
  return `<article class="provider ${stale ? 'stale' : ''}"><div class="provider-header"><div><h3>${esc(target.provider)}</h3><small>${esc(target.instance)} · ${esc(target.backend)}</small></div><span class="badge ${stale || !windows ? 'warn' : ''}">${windows ? stale ? word('舊快照', 'Stale') : word('已回報', 'Reported') : q.status === 'unsupported' ? word('尚未支援', 'Unsupported') : word('尚未回報', 'Not observed')}</span></div>${windows || `<p class="empty">${word('沒有可用的帳戶 quota 回報。未知不代表額度為零。', 'No account quota report is available. Unknown does not mean zero.')}</p>`}${guardrails}<div class="provenance">${word('觀測時間', 'Observed')} ${date(q.observedAt)} · ${age(q.observedAt)}<br>${esc(q.source || word('沒有支援的訊號來源', 'No supported signal source'))}<br>${word('帳戶關聯未驗證；不跨實例加總額度', 'Account linkage unverified; allowances are never summed across instances')}</div></article>`;
}

function render() {
  const selected = snapshot ? selectUsage(snapshot, filters) : null;
  const totals = selected?.totals;
  const incidents = (snapshot?.incidents || []).filter((incident) => (!filters.provider || filters.provider === incident.provider) && (!filters.instance || filters.instance === incident.instance));
  root.setAttribute('aria-busy', String(busy));
  root.innerHTML = `<header><div><p class="kicker">${word('用量總覽', 'A clear view of your usage')}</p><h1>Usage<span class="muted">.</span></h1><p>${word('執行用量與供應商額度，各自清楚呈現。', 'Execution usage. Provider allowance. Clearly separated.')}</p></div><div><button id="refresh" ${busy ? 'disabled' : ''}>${busy ? word('讀取中…', 'Refreshing…') : word('重新整理', 'Refresh')}</button></div></header>
    <div class="status" role="status"><span class="dot ${offline ? 'off' : ''}"></span>${offline ? word('Runtime 無法連線 · 以下保留最後快照', 'Runtime unavailable · showing last snapshot') : snapshot ? `${word('快照更新', 'Snapshot updated')} ${date(snapshot.generatedAt)}` : word('等待 Runtime 快照', 'Waiting for a runtime snapshot')}</div>
    ${offline ? `<p class="notice">${word('無法取得新資料；不會推算或補成 0。重新整理只讀取 Runtime 快取，不會主動查詢供應商帳戶。', 'New data is unavailable; no values are estimated or replaced with zero. Refresh reads the runtime cache, not the provider account.')}</p>` : ''}
    ${restarted ? `<p class="notice">${word('Runtime 已重新啟動，本次用量觀測區間已重設。', 'Runtime restarted. This observation period has reset.')}</p>` : ''}
    ${snapshot?.coverage.truncated ? `<p class="notice">${word('保留資料已截斷；總計不等於完整帳期用量。', 'Retained data was truncated; totals do not cover the full billing period.')}</p>` : ''}
    <div class="toolbar"><label>${word('供應商', 'Provider')}<select id="provider">${options(snapshot?.targets.map((target) => target.provider) || [], filters.provider, word('所有供應商', 'All providers'))}</select></label><label>${word('實例', 'Instance')}<select id="instance">${options(snapshot?.targets.filter((target) => !filters.provider || target.provider === filters.provider).map((target) => target.instance) || [], filters.instance, word('所有實例', 'All instances'))}</select></label><label>${word('執行用量範圍', 'Execution usage scope')}<select id="session">${options(snapshot?.sessions.filter((session) => (!filters.provider || session.provider === filters.provider) && (!filters.instance || session.instance === filters.instance)).map((session) => session.sessionId) || [], filters.session, word('所有觀測到的 Session', 'All observed sessions'))}</select></label></div>
    <div class="metrics">${[[word('輸入 tokens', 'Input tokens'), number(totals?.inputTokens)], [word('輸出 tokens', 'Output tokens'), number(totals?.outputTokens)], [word('總 tokens', 'Total tokens'), number(totals?.totalTokens)]].map(([label, value]) => `<section class="stat"><small>${label}</small><strong>${value}</strong><p>${word('Runtime 已保留的執行回報', 'Retained runtime execution reports')}</p></section>`).join('')}<section class="stat"><small>${word('回報／估算成本', 'Reported / estimated cost')}</small><strong class="cost">${money(totals?.costs || [])}</strong><p>${word('幣別分列 · 非帳單', 'Currencies kept separate · not a bill')}</p></section></div>
    <p class="provenance">${word('用量來源信心', 'Usage source confidence')}: ${Object.entries(totals?.confidence || {}).map(([kind, count]) => `${esc(kind)} ${number(count)}`).join(' · ') || '—'} · ${number(totals?.observations)} ${word('筆回報', 'reports')}</p>
    <div class="section-head"><h2>${word('供應商額度', 'Provider allowance')}</h2><p>${word('供應商被動回報 · 不受 Session 篩選影響', 'Passive provider reports · independent of session filter')}</p></div>
    <div class="providers">${selected?.targets.length ? selected.targets.map(targetCard).join('') : `<div class="empty">${word('目前沒有可呈現的供應商。連接 Runtime 後，執行回報會顯示在這裡。', 'No providers to display. Runtime execution reports will appear here when available.')}</div>`}</div>
    <div class="section-head"><h2>${word('已觀測的 Sessions', 'Observed sessions')}</h2><p>${number(selected?.sessions.length)} ${word('筆保留的 Session 彙總', 'retained session summaries')}</p></div>
    <div class="table-wrap"><table><thead><tr><th>SESSION</th><th>${word('供應商 / 實例', 'PROVIDER / INSTANCE')}</th><th>TOKENS</th><th>${word('成本', 'COST')}</th><th>${word('最後觀測', 'LAST OBSERVED')}</th></tr></thead><tbody>${selected?.sessions.length ? selected.sessions.map((session) => `<tr><td class="id" title="${esc(session.sessionId)}">${esc(session.sessionId)}</td><td>${esc(session.provider)} / ${esc(session.instance)}</td><td>${number(session.usage.totalTokens)}</td><td>${money(session.usage.costs)}</td><td>${date(session.usage.lastObservedAt)}</td></tr>`).join('') : `<tr><td colspan="5">${word('尚無執行用量回報。', 'No execution usage has been reported.')}</td></tr>`}</tbody></table></div>
    ${incidents.length ? `<div class="section-head"><h2>${word('最近限制事件', 'Recent limit incidents')}</h2></div>${incidents.map((incident) => `<p class="notice">${esc(incident.provider)} / ${esc(incident.instance)} · ${esc(incident.classification)} · ${date(incident.observedAt)}${incident.retryAt ? ` · ${word('建議重試', 'Retry after')} ${date(incident.retryAt)}` : ''}</p>`).join('')}` : ''}
    <footer><span>${word('記憶體觀測區間', 'In-memory observation period')} · ${date(snapshot?.coverage.startedAt)} → ${date(snapshot?.generatedAt)}<br>${word('不含其他工具直接執行的用量；尚無持久化歷史。', 'Excludes executions outside this runtime. Durable history is not available.')}</span><span>Usage ${esc(sdk?.version || '0.1.0')}<br>${word('每 30 秒讀取快照 · 不會喚起 CLI', 'Snapshot every 30s · never launches a CLI')}</span></footer>`;
  document.getElementById('refresh').addEventListener('click', () => void refresh());
  for (const name of ['provider', 'instance', 'session']) document.getElementById(name).addEventListener('change', (event) => {
    filters[name] = event.target.value;
    if (name === 'provider') filters.instance = '';
    if (name !== 'session') filters.session = '';
    render();
  });
}

async function refresh() {
  if (busy || disposed) return;
  busy = true; render();
  try {
    if (!sdk || !sdk.sdkVersion.startsWith('1.')) throw new Error('App SDK v1 required.');
    const next = await sdk.usage.getSnapshot();
    if (next.schemaVersion !== 1 || !Array.isArray(next.targets) || !Array.isArray(next.sessions) || !next.coverage || !next.totals) throw new Error('Unsupported usage snapshot.');
    if (snapshot && snapshot.runtime.epoch !== next.runtime.epoch) { restarted = true; filters.session = ''; }
    snapshot = next; offline = false;
  } catch { offline = true; }
  finally { busy = false; if (!disposed) render(); }
}
const timer = setInterval(() => { if (document.visibilityState !== 'hidden') void refresh(); }, 30_000);
window.addEventListener('pagehide', () => { disposed = true; clearInterval(timer); }, { once: true });
void refresh();
