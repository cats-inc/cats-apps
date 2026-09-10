import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { buildApp, parseArgs } from '../scripts/build-app.mjs';
import { aggregateUsage, metric, quotaIsStale, remaining, selectUsage } from '../apps/usage/src/model.js';

test('unknown is not zero, currency totals remain separate, invalid percentages stay unknown', () => {
  assert.equal(metric(null), '—'); assert.equal(metric(0), '0'); assert.equal(metric(NaN), '—');
  assert.equal(remaining({ usedPercent: 0 }), 100); assert.equal(remaining({ usedPercent: 101 }), null);
  assert.deepEqual(aggregateUsage([{ observations: 1, inputTokens: 0, costs: [{ currency: 'USD', amount: 1 }] },
    { observations: 1, outputTokens: 5, costs: [{ currency: 'EUR', amount: 2 }] }]), {
    observations: 2, inputTokens: 0, outputTokens: 5, totalTokens: null,
    costs: [{ currency: 'USD', amount: 1 }, { currency: 'EUR', amount: 2 }],
    confidence: { reported: 0, aggregated: 0, estimated: 0, unknown: 0 },
  });
});

test('age/reset makes a quota stale but never refills its allowance', () => {
  const quota = { observedAt: '2026-09-10T00:00:00Z', freshness: 'fresh', windows: [{ usedPercent: 95, resetsAt: '2026-09-10T00:01:00Z' }] };
  assert.equal(quotaIsStale(quota, Date.parse('2026-09-10T00:00:30Z')), false);
  assert.equal(quotaIsStale(quota, Date.parse('2026-09-10T00:02:00Z')), true);
  assert.equal(remaining(quota.windows[0]), 5);
});

test('session filtering changes execution totals, not provider quota', () => {
  const usage = { observations: 1, totalTokens: 42, costs: [] };
  const target = { provider: 'codex', instance: 'default', usage, quota: { windows: [{ usedPercent: 30 }] } };
  const snapshot = { totals: usage, targets: [target], sessions: [{ ...target, sessionId: 'a' }, { ...target, sessionId: 'b' }] };
  const selected = selectUsage(snapshot, { provider: 'codex', instance: '', session: 'a' });
  assert.equal(selected.sessions.length, 1); assert.equal(selected.targets[0], target); assert.equal(selected.totals.totalTokens, 42);
});

test('build emits deterministic source-free archives with matching pins and rejects version drift', async () => {
  const outputDir = await mkdtemp(join(tmpdir(), 'usage-build-test-'));
  const first = await buildApp({ outputDir, version: '0.1.1' });
  const second = await buildApp({ outputDir });
  assert.equal(first.sha256, second.sha256);
  const envelope = JSON.parse(gunzipSync(await readFile(first.artifactPath)).toString('utf8'));
  assert.equal(envelope.manifest.displayName, 'Usage'); assert.equal(envelope.manifest.id, 'cats.usage');
  assert.deepEqual(envelope.files.map((file) => file.path), ['LICENSE', 'renderer/index.html']);
  const html = Buffer.from(envelope.files[1].base64, 'base64').toString('utf8');
  assert.ok(html.includes('globalThis.catsApp')); assert.ok(!html.includes('/* APP_SCRIPT */'));
  assert.doesNotMatch(html, /from ['"]\.\.\/|localhost:|<script[^>]+src=|<link[^>]+href=/);
  const lock = JSON.parse(await readFile(first.lockPath, 'utf8'));
  assert.equal(lock.apps[0].sha256, first.sha256);
  await assert.rejects(buildApp({ outputDir, version: '0.2.0' }), /match exactly/);
  assert.throws(() => parseArgs(['--version']), /Invalid argument/);
});
