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
  const button = element('query'); button.dataset = { queryQuota: 'default' };
  const root = element('app'); root.setAttribute = () => {}; root.querySelectorAll = () => [button];
  const emptyUsage = { observations: 0, costs: [], confidence: {} };
  const snapshot = { schemaVersion: 1, generatedAt: new Date().toISOString(), runtime: { epoch: 'fixture' }, coverage: {},
    totals: emptyUsage, targets: [{ provider: 'codex', instance: 'default', backend: 'cli', usage: emptyUsage,
      quota: { status: 'unavailable', windows: [] }, guardrails: [] }], sessions: [], incidents: [] };
  let queries = 0; let reads = 0; let mode = 'updated'; let timer; let hidden;
  const context = vm.createContext({ ...model, console, Intl, Date, Map, Set, Number,
    document: { documentElement: { dataset: {} }, getElementById: element, visibilityState: 'visible' },
    window: { addEventListener(_type, callback) { hidden = callback; } },
    setInterval(callback) { timer = callback; return 1; }, clearInterval() {}, setTimeout() { return 2; }, clearTimeout() {},
    catsApp: { locale: 'zh-TW', theme: 'light', sdkVersion: '1.1.0', version: '0.1.1', usage: {
      async getSnapshot() { reads++; return structuredClone(snapshot); },
      async refreshQuota(target) {
        queries++; assert.deepEqual(JSON.parse(JSON.stringify(target)), { provider: 'codex', instance: 'default' });
        if (mode === 'reject') throw new Error('PRIVATE');
        if (mode === 'updated') snapshot.targets[0].quota = { status: 'available', freshness: 'fresh',
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
