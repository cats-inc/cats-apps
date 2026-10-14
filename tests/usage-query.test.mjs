import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import * as model from '../apps/usage/src/model.js';

test('Codex button alone queries; polling stays passive; real windows, failures and cooldown remain truthful', async () => {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } });
    return elements.get(id);
  };
  const button = element('query'); button.dataset = { queryQuota: 'default', queryProvider: 'codex' };
  const root = element('app'); root.setAttribute = () => {}; root.querySelectorAll = () => [button];
  const emptyUsage = { observations: 0, costs: [], confidence: {} };
  const snapshot = { schemaVersion: 1, generatedAt: new Date().toISOString(), runtime: { epoch: 'fixture' }, coverage: {},
    totals: emptyUsage, targets: [{ provider: 'codex', instance: 'default', backend: 'cli', usage: emptyUsage,
      quota: { status: 'unavailable', windows: [], refreshSupported: true }, guardrails: [] }], sessions: [], incidents: [] };
  let queries = 0; let reads = 0; let mode = 'updated'; let timer; let hidden;
  const context = vm.createContext({ ...model, console, Intl, Date, Map, Set, Number,
    document: { documentElement: { dataset: {} }, getElementById: element, visibilityState: 'visible' },
    window: { addEventListener(_type, callback) { hidden = callback; } },
    setInterval(callback) { timer = callback; return 1; }, clearInterval() {}, setTimeout() { return 2; }, clearTimeout() {},
    catsApp: { locale: 'zh-TW', theme: 'light', sdkVersion: '1.2.0', version: '0.2.0', usage: {
      async getSnapshot() { reads++; return structuredClone(snapshot); },
      async refreshQuota(target) {
        queries++; assert.deepEqual(JSON.parse(JSON.stringify(target)), { provider: 'codex', instance: 'default' });
        if (mode === 'reject') throw new Error('PRIVATE');
        if (mode === 'updated') snapshot.targets[0].quota = { status: 'available', freshness: 'fresh', refreshSupported: true,
          observedAt: new Date().toISOString(), source: 'codex.account/rateLimits/read', limitId: 'codex',
          windows: [{ id: 'primary', windowMinutes: 10080, usedPercent: 10, resetsAt: '2099-01-01T00:00:00Z' }] };
        return { status: mode, nextRefreshAt: mode === 'cooldown' ? new Date(Date.now() + 60_000).toISOString() : null, snapshot: structuredClone(snapshot) };
      },
    } },
  });
  const source = (await readFile(new URL('../apps/usage/src/app.js', import.meta.url), 'utf8')).replace(/^import .*;\s*/u, '');
  vm.runInContext(source, context);
  const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
  await settle();
  assert.equal(queries, 0); assert.match(root.innerHTML, /查詢最新額度/);
  timer(); await settle(); assert.equal(queries, 0); assert.equal(reads, 2);
  button.listeners.click(); await settle();
  assert.equal(queries, 1); assert.match(root.innerHTML, /90%/); assert.match(root.innerHTML, /7 天/);
  assert.doesNotMatch(root.innerHTML, /5 小時/);
  mode = 'auth_required'; button.listeners.click(); await settle();
  assert.match(root.innerHTML, /請先在此實例的 Codex CLI 登入/); assert.match(root.innerHTML, /90%/); assert.match(root.innerHTML, /舊快照/);
  mode = 'reject'; button.listeners.click(); await settle();
  assert.doesNotMatch(root.innerHTML, /PRIVATE/); assert.match(root.innerHTML, /90%/);
  mode = 'cooldown'; button.listeners.click(); await settle();
  const count = queries; button.listeners.click(); await settle(); assert.equal(queries, count);
  hidden(); timer(); await settle(); assert.equal(queries, count);
});

for (const kiroSupported of [false, true]) test(`provider gates/cooldowns on ${kiroSupported ? 'Kiro-capable' : 'older'} SDK host`, async () => {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } });
    return elements.get(id);
  };
  const providers = ['codex', 'copilot', 'claude', 'antigravity', 'kiro', 'cursor'];
  const buttons = providers.map((provider) => Object.assign(element(`query-${provider}`), {
    dataset: { queryQuota: 'default', queryProvider: provider },
  }));
  const root = element('app'); root.setAttribute = () => {}; root.querySelectorAll = () => buttons;
  const emptyUsage = { observations: 0, costs: [], confidence: {} };
  const snapshot = { schemaVersion: 1, generatedAt: new Date().toISOString(), runtime: { epoch: 'fixture' }, coverage: {},
    totals: emptyUsage, targets: providers.map((provider) => ({ provider, instance: 'default', backend: 'cli', usage: emptyUsage,
      quota: { status: 'unavailable', windows: [], refreshSupported: provider !== 'cursor' && (provider !== 'kiro' || kiroSupported) }, guardrails: [] })), sessions: [], incidents: [] };
  const queries = []; let timer; let hide;
  const context = vm.createContext({ ...model, console, Intl, Date, Map, Set, Number,
    document: { documentElement: { dataset: {} }, getElementById: element, visibilityState: 'visible' },
    window: { addEventListener(_type, fn) { hide = fn; } },
    setInterval(fn) { timer = fn; return 1; }, clearInterval() {}, setTimeout() { return 2; }, clearTimeout() {},
    catsApp: { locale: 'zh-TW', theme: 'light', sdkVersion: kiroSupported ? '1.4.0' : '1.3.0', usage: {
      async getSnapshot() { return structuredClone(snapshot); },
      async refreshQuota(target) {
        queries.push(JSON.parse(JSON.stringify(target)));
        const quota = snapshot.targets.find((entry) => entry.provider === target.provider).quota;
        Object.assign(quota, { status: 'available', freshness: 'fresh', observedAt: new Date().toISOString() });
        quota.windows = target.provider === 'copilot' ? [
          { id: 'premium_interactions', unit: 'requests', used: 0, limit: 1500, remaining: 1500, usedPercent: 0 },
          { id: 'chat', unit: 'requests', used: 0, unlimited: true },
        ] : target.provider === 'kiro' ? [{ id: 'credits', unit: 'credits', used: 0.37, limit: 1000, remaining: 999.63, usedPercent: 0.037, resetsOn: '2099-11-01', resetsAt: null }] : [{ id: 'weekly', usedPercent: target.provider === 'claude' ? 6 : 22, windowMinutes: 10080, resetsAt: '2099-11-01T00:00:00Z' }];
        return { status: 'updated', nextRefreshAt: new Date(Date.now() + 60000).toISOString(), snapshot: structuredClone(snapshot) };
      },
    } },
  });
  vm.runInContext((await readFile(new URL('../apps/usage/src/app.js', import.meta.url), 'utf8')).replace(/^import .*;\s*/u, ''), context);
  const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
  await settle(); timer(); await settle();
  assert.equal(queries.length, 0);
  assert.doesNotMatch(root.innerHTML, /data-query-provider="cursor"/);
  const supported = kiroSupported ? [0, 1, 2, 3, 4] : [0, 1, 2, 3];
  for (const index of supported) { buttons[index].listeners.click(); await settle(); }
  const expected = supported.map(index => providers[index]);
  assert.deepEqual(queries, expected.map((provider) => ({ provider, instance: 'default' })));
  if (kiroSupported) {
    assert.match(root.innerHTML, /已用 0.37 \/ 1,000 credits · 剩餘 999.63/);
    assert.match(root.innerHTML, /99\.963% 剩餘/);
    assert.match(root.innerHTML, /回報重設日期.*2099.*未提供確切時間/);
  } else {
    assert.doesNotMatch(root.innerHTML, /data-query-provider="kiro"/);
    buttons[4].listeners.click(); await settle();
    assert.equal(queries.length, 4);
    assert.match(root.innerHTML, /預定重設/);
    assert.doesNotMatch(root.innerHTML, /回報重設日期/);
  }
  assert.match(root.innerHTML, /1,500 requests/); assert.match(root.innerHTML, /不限額/);
  assert.match(root.innerHTML, /94%/); assert.match(root.innerHTML, /78%/);
  buttons[1].listeners.click(); buttons[5].listeners.click(); await settle(); assert.equal(queries.length, expected.length);
  hide(); buttons[0].listeners.click(); timer(); await settle(); assert.equal(queries.length, expected.length);
});
