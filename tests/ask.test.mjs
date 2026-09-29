import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createStore } from '../apps/ask/server/store.mjs';
import { start } from '../apps/ask/server/service.mjs';
import { answerText, questionInstruction } from '../apps/ask/src/model.js';

const answer = { outcome: 'partial', answer: '中文第一行\n第二行 <script>alert(1)</script>', sources: [{ title: 'Fixture', url: 'https://example.com/post' }], limitations: '沒有收藏時間戳', evidence: 'Fixture connector' };
async function directory(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'cats-ask-test-'));
  t.after(() => rm(root, { recursive: true, force: true })); return root;
}
async function prepared(store, text = '最新三篇書籤') {
  const question = await store.create({ question: text, clientRequestId: randomUUID() });
  return { question, attempt: await store.prepare(question.id) };
}
const identity = ({ requestId, attemptId, attemptToken }) => ({ requestId, attemptId, attemptToken });

test('question and answer retries persist one original receipt; mismatches and conflicts cannot overwrite', async t => {
  const store = await createStore(await directory(t));
  const input = { clientRequestId: randomUUID(), question: '  我的書籤  ' };
  const [a, b] = await Promise.all([store.create(input), store.create(input)]);
  assert.equal(a.id, b.id); assert.equal(store.list().length, 1);
  await assert.rejects(store.create({ ...input, question: 'changed' }), /request_conflict/);
  const attempt = identity(await store.prepare(a.id));
  await assert.rejects(store.submit(attempt, answer), /not_fetched/);
  await assert.rejects(store.fetchAttempt({ ...attempt, attemptToken: '0'.repeat(64) }), /unknown_attempt/);
  assert.equal((await store.fetchAttempt(attempt)).question, '我的書籤');
  const receipt = await store.submit(attempt, answer);
  const duplicate = await store.submit(attempt, answer);
  assert.equal(duplicate.receiptId, receipt.receiptId); assert.equal(duplicate.duplicate, true);
  await assert.rejects(store.submit(attempt, { ...answer, answer: 'other' }), /answer_conflict/);
  assert.deepEqual(store.get(a.id).response.content, answer);
  assert.equal(JSON.stringify(store.list()).includes(attempt.attemptToken), false);
  await store.close();
});

test('restart marks unknown delivery, never re-asks; a late answer stays on its original attempt', async t => {
  const root = await directory(t);
  let clock = new Date('2026-09-29T00:00:00Z');
  let store = await createStore(root, { now: () => clock });
  const first = await prepared(store); await store.fetchAttempt(identity(first.attempt)); await store.close();
  store = await createStore(root, { now: () => clock });
  assert.equal(store.get(first.question.id).state, 'unconfirmed');
  assert.deepEqual(await store.prepare(first.question.id), first.attempt);
  const second = await prepared(store, first.question.question);
  await store.submit(identity(first.attempt), answer);
  assert.equal(store.get(first.question.id).state, 'succeeded');
  assert.equal(store.get(second.question.id).state, 'awaiting_assistant');
  clock = new Date('2026-10-08T00:00:00Z');
  await assert.rejects(store.fetchAttempt(identity(second.attempt)), /expired/);
  assert.equal((await store.submit(identity(first.attempt), answer)).duplicate, true);
  const oldToken = store.connection().token; await store.rotate();
  assert.equal(store.authenticate(oldToken), false);
  await assert.rejects(store.submit(identity(first.attempt), answer), /unknown_attempt/);
});

test('malformed persisted data is preserved; dangerous source URLs are rejected', async t => {
  const root = await directory(t); const store = await createStore(root);
  const { attempt } = await prepared(store); await store.fetchAttempt(identity(attempt));
  await assert.rejects(async () => store.submit(identity(attempt), { ...answer, sources: [{ title: 'bad', url: 'javascript:alert(1)' }] }));
  await store.close();
  const backup = await readFile(path.join(root, 'ask.json.backup'));
  await writeFile(path.join(root, 'ask.json'), '{invalid');
  await assert.rejects(createStore(root), /needs_recovery/);
  assert.equal(await readFile(path.join(root, 'ask.json'), 'utf8'), '{invalid');
  assert.deepEqual(await readFile(path.join(root, 'ask.json.backup')), backup);
});

test('real MCP transport authenticates, retrieves one question and stores an idempotent answer', async t => {
  const root = await directory(t); const service = await start({ dataDir: root });
  const server = createServer(service.handle);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await service.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const connection = await (await fetch(`${base}/api/connection`)).json();
  const create = await fetch(`${base}/api/questions`, { method: 'POST', body: JSON.stringify({ question: 'Fixture only', clientRequestId: randomUUID() }) });
  const question = await create.json();
  const attempt = identity(await (await fetch(`${base}/api/questions/${question.id}/prepare`, { method: 'POST' })).json());
  assert.equal((await fetch(`${base}/mcp`, { method: 'POST', body: '{}' })).status, 401);
  const client = new Client({ name: 'ask-test', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(`${base}/mcp`), {
    requestInit: { headers: { Authorization: `Bearer ${connection.token}` } },
  });
  t.after(() => client.close()); await client.connect(transport);
  assert.deepEqual((await client.listTools()).tools.map(tool => tool.name).sort(), ['cats_get_question', 'cats_submit_answer']);
  const fetched = await client.callTool({ name: 'cats_get_question', arguments: attempt });
  assert.equal(fetched.structuredContent.question, 'Fixture only');
  const submitted = await client.callTool({ name: 'cats_submit_answer', arguments: { ...attempt, response: answer } });
  assert.equal(submitted.structuredContent.accepted, true);
  const duplicate = await client.callTool({ name: 'cats_submit_answer', arguments: { ...attempt, response: answer } });
  assert.equal(duplicate.structuredContent.receiptId, submitted.structuredContent.receiptId);
  const persisted = await (await fetch(`${base}/api/questions/${question.id}`)).json();
  assert.equal(persisted.state, 'succeeded'); assert.deepEqual(persisted.response.content, answer);
  assert.match(answerText(persisted), /中文第一行\n第二行/);
  assert.match(answerText(persisted), /https:\/\/example.com\/post/);
  assert.match(questionInstruction(attempt), new RegExp(attempt.attemptId));
});
