import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSubmission, createCallQueue, defaultService, draftSources, initialSelection, isDefinitiveSubmitError, matchPendingJob, normalizeCapabilities, normalizeJob, promptLength, pruneSources, ratioText, validateDraft } from '../apps/studio/src/model.js';
import { SCHEMA_ONE_CAPABILITIES, SCHEMA_TWO_CAPABILITIES, SCHEMA_TWO_JOBS, SCHEMA_TWO_TODAY } from './fixtures/studio-image-fixtures.mjs';

const operations = (service) => service.operations.map((operation) => operation.id);
const works = SCHEMA_TWO_JOBS.map(normalizeJob);

test('SDK 1.x capabilities become one Grok service that can only generate at 1:1', () => {
  const capabilities = normalizeCapabilities(SCHEMA_ONE_CAPABILITIES);
  assert.equal(capabilities.schemaVersion, 1);
  assert.equal(capabilities.services.length, 1);
  const [service] = capabilities.services;
  assert.deepEqual({ key: service.key, name: service.name, alias: service.alias, available: service.available }, { key: 'native', name: 'Grok', alias: null, available: true });
  assert.deepEqual(operations(service), ['image.generate']);
  assert.deepEqual(service.operations[0].ratio, { mode: 'native', options: ['1:1'] });
  assert.equal(service.operations[0].transparency, false);
  assert.equal(service.operations[0].agentConfigs[0].model, 'grok-4.7');
  const two = normalizeCapabilities({ ...SCHEMA_ONE_CAPABILITIES, targets: [...SCHEMA_ONE_CAPABILITIES.targets, { provider: 'grok', instance: 'work', agentModel: 'grok-4.7' }] });
  assert.deepEqual(two.services.map((item) => item.alias), ['native', 'work']);
});

test('SDK 1.x submissions carry exactly requestId, instance and the trimmed prompt', () => {
  const capabilities = normalizeCapabilities(SCHEMA_ONE_CAPABILITIES);
  const payload = buildSubmission(capabilities, { requestId: 'r-1', serviceKey: 'native', operation: 'image.generate', prompt: '  一隻橘貓\n在窗邊  ', sourceIds: [], aspectRatio: null, transparentBackground: false, agentConfigId: null });
  assert.deepEqual(payload, { requestId: 'r-1', instance: 'native', prompt: '一隻橘貓\n在窗邊' });
});

test('prompt limits count Unicode code points, not UTF-16 units', () => {
  const capabilities = normalizeCapabilities(SCHEMA_ONE_CAPABILITIES);
  const draft = (prompt) => ({ serviceKey: 'native', operation: 'image.generate', prompt, sourceIds: [] });
  assert.equal(promptLength('🐱'.repeat(3)), 3);
  assert.equal(validateDraft(capabilities, draft('🐱'.repeat(2000))).ok, true);
  assert.equal(validateDraft(capabilities, draft('🐱'.repeat(2001))).reason, 'prompt_too_long');
  assert.equal(validateDraft(capabilities, draft('   ')).reason, 'prompt_empty');
  assert.equal(validateDraft(capabilities, { ...draft('cat'), serviceKey: 'missing' }).reason, 'service_unavailable');
});

test('proposed contract 2 lists only declared operations per service, in display order', () => {
  const capabilities = normalizeCapabilities(SCHEMA_TWO_CAPABILITIES);
  const byProvider = Object.fromEntries(capabilities.services.map((service) => [service.provider, service]));
  assert.deepEqual(Object.keys(byProvider), ['grok', 'muse', 'antigravity', 'codex'], 'a target without profiles is not listed');
  assert.deepEqual(operations(byProvider.grok), ['image.generate', 'image.edit', 'image.compose']);
  assert.deepEqual(operations(byProvider.antigravity), ['image.generate', 'image.edit']);
  assert.equal(byProvider.grok.operations[0].ratio.mode, 'choose');
  assert.equal(byProvider.grok.operations[1].ratio.mode, 'source');
  assert.equal(byProvider.grok.operations[2].ratio.options.length, 14);
  assert.deepEqual(byProvider.muse.operations[2].inputs, { min: 2, max: 50 });
  assert.deepEqual(byProvider.antigravity.operations[0].ratio, { mode: 'native', options: ['1:1'] });
  assert.deepEqual(byProvider.codex.operations.map((operation) => operation.transparency), [true, true, false]);
  assert.equal(defaultService(capabilities, null), 'grok-native');
  assert.equal(defaultService(capabilities, 'codex-native'), 'codex-native');
  const today = normalizeCapabilities(SCHEMA_TWO_TODAY);
  assert.deepEqual(today.services.map((service) => [service.key, operations(service)]), [['grok-native', ['image.generate']]]);
});

test('malformed or unavailable contract 2 entries fail closed instead of being guessed', () => {
  const capabilities = normalizeCapabilities({
    ...SCHEMA_TWO_CAPABILITIES,
    targets: [...SCHEMA_TWO_CAPABILITIES.targets.map((target) => target.provider === 'muse' ? { ...target, availability: 'unavailable', reason: 'not_configured' } : target)],
    profiles: SCHEMA_TWO_CAPABILITIES.profiles.map((profile) => {
      if (profile.id === 'grok-generate') return { ...profile, aspectRatio: { mode: 'source' } };
      if (profile.id === 'codex-compose') return { ...profile, inputs: { min: 1, max: 4 } };
      if (profile.id === 'antigravity-generate') return { ...profile, aspectRatio: { mode: 'native', options: ['auto'] } };
      return profile;
    }),
  });
  const byProvider = Object.fromEntries(capabilities.services.map((service) => [service.provider, service]));
  assert.deepEqual(operations(byProvider.grok), ['image.edit', 'image.compose'], 'source ratio is only valid for edits');
  assert.deepEqual(operations(byProvider.codex), ['image.generate', 'image.edit'], 'compose needs at least two sources');
  assert.deepEqual(operations(byProvider.antigravity), ['image.edit'], 'a native ratio cannot be auto');
  assert.deepEqual({ available: byProvider.muse.available, reason: byProvider.muse.reason }, { available: false, reason: 'not_configured' });
  assert.deepEqual(normalizeCapabilities({ schemaVersion: 3 }).services, []);
  assert.equal(normalizeCapabilities({ schemaVersion: 3 }).reason, 'unsupported_schema');
  assert.equal(normalizeCapabilities(null).reason, 'invalid_capabilities');
});

test('contract 2 submissions keep source order and send only declared options', () => {
  const capabilities = normalizeCapabilities(SCHEMA_TWO_CAPABILITIES);
  const base = { requestId: 'r-2', prompt: '讓第 1 張的貓坐在第 2 張的屋頂上。', agentConfigId: null, transparentBackground: false };
  const compose = buildSubmission(capabilities, { ...base, serviceKey: 'grok-native', operation: 'image.compose', sourceIds: ['job-agy-1', 'job-grok-1'], aspectRatio: '16:9' }, works);
  assert.deepEqual(compose, { requestId: 'r-2', targetId: 'grok-native', profileId: 'grok-compose', profileRevision: '1', agentConfigId: 'grok-4.7-xhigh',
    operation: 'image.compose', prompt: base.prompt, sourceIds: ['job-agy-1', 'job-grok-1'], options: { aspectRatio: '16:9' } });
  const auto = buildSubmission(capabilities, { ...base, serviceKey: 'grok-native', operation: 'image.generate', sourceIds: [], aspectRatio: 'auto' }, works);
  assert.deepEqual(auto.options, {}, 'auto is the service default and is omitted');
  const edit = buildSubmission(capabilities, { ...base, serviceKey: 'codex-native', operation: 'image.edit', sourceIds: ['job-grok-1'], transparentBackground: true }, works);
  assert.deepEqual({ sources: edit.sourceIds, options: edit.options }, { sources: ['job-grok-1'], options: { transparentBackground: true } }, 'a Grok image can be edited by Codex');
  const draft = { ...base, serviceKey: 'grok-native', operation: 'image.edit', aspectRatio: null };
  assert.equal(validateDraft(capabilities, { ...draft, sourceIds: [] }, works).reason, 'source_count_invalid');
  assert.equal(validateDraft(capabilities, { ...draft, sourceIds: ['job-grok-2'] }, works).reason, 'source_unavailable', 'a failed job is not a source');
  assert.equal(validateDraft(capabilities, { ...draft, operation: 'image.compose', sourceIds: ['job-grok-1', 'job-grok-1'] }, works).reason, 'source_count_invalid');
  assert.equal(validateDraft(capabilities, { ...draft, operation: 'image.generate', sourceIds: [], aspectRatio: '7:3' }, works).reason, 'option_unsupported');
  assert.equal(validateDraft(capabilities, { ...draft, serviceKey: 'muse-native', operation: 'image.generate', sourceIds: [], transparentBackground: true }, works).reason, 'option_unsupported');
  assert.throws(() => buildSubmission(capabilities, { ...draft, sourceIds: [] }, works), /source_count_invalid/);
});

test('jobs report measured format, ratio, transparency, warnings and lineage', () => {
  const legacy = normalizeJob({ schemaVersion: 1, id: 'a', requestId: 'r', prompt: 'cat', instance: 'native', provider: 'grok', agentModel: 'grok-4.7', status: 'succeeded',
    createdAt: 'x', updatedAt: 'x', error: null, output: { mimeType: 'image/jpeg', bytes: 85413, width: 1024, height: 1024, sha256: 'h' } });
  assert.deepEqual({ operation: legacy.operation, serviceKey: legacy.serviceKey, format: legacy.output.format, ratio: legacy.output.ratio, transparency: legacy.output.transparency, requested: legacy.requestedRatio },
    { operation: 'image.generate', serviceKey: 'native', format: 'JPEG', ratio: '1:1', transparency: 'opaque', requested: '1:1' });
  const byId = Object.fromEntries(works.map((job) => [job.id, job]));
  assert.deepEqual({ format: byId['job-muse-1'].output.format, ratio: byId['job-muse-1'].output.ratio, warnings: byId['job-muse-1'].warnings },
    { format: 'PNG', ratio: '3:2', warnings: ['response_timeout_after_image'] });
  assert.equal(byId['job-codex-1'].output.ratio, '1:1');
  assert.deepEqual(byId['job-grok-edit'].sources, [{ id: 'job-grok-1', sha256: null }]);
  assert.equal(byId['job-codex-edit'].output, null);
  assert.equal(normalizeJob({ ...SCHEMA_TWO_JOBS[3], output: { ...SCHEMA_TWO_JOBS[3].output, transparency: 'has-transparency' } }).output.transparency, 'transparent');
  assert.equal(normalizeJob({ ...SCHEMA_TWO_JOBS[3], output: { ...SCHEMA_TWO_JOBS[3].output, mimeType: 'image/gif' } }).output, null, 'unverified formats are not shown as images');
  assert.equal(ratioText(1001, 997), '1.00:1');
});

test('free-form instance names are kept and malformed requested ratios are dropped', () => {
  const capabilities = normalizeCapabilities({ ...SCHEMA_ONE_CAPABILITIES, targets: [{ provider: 'grok', instance: 'work account', agentModel: 'grok-4.7' }] });
  assert.deepEqual(capabilities.services.map((service) => service.key), ['work account']);
  assert.deepEqual(buildSubmission(capabilities, { requestId: 'r', serviceKey: 'work account', operation: 'image.generate', prompt: 'cat', sourceIds: [] }), { requestId: 'r', instance: 'work account', prompt: 'cat' });
  assert.equal(normalizeCapabilities({ ...SCHEMA_ONE_CAPABILITIES, targets: [{ provider: 'grok', instance: 'bad\nname' }] }).services.length, 0);
  assert.equal(normalizeJob({ ...SCHEMA_TWO_JOBS[2], options: { aspectRatio: '<b>' } }).requestedRatio, null);
});

test('submission outcomes: only definitive errors drop a pending request; a listed requestId resolves it', () => {
  for (const code of ['invalid_image_request', 'image_service_busy', 'image_request_conflict', 'source_unavailable']) assert.equal(isDefinitiveSubmitError(code), true, code);
  for (const code of ['network_error', 'Too many pending app requests.', undefined]) assert.equal(isDefinitiveSubmitError(code), false, String(code));
  const pending = { payload: { requestId: 'request-job-grok-1' }, unconfirmed: true };
  assert.equal(matchPendingJob(pending, works)?.id, 'job-grok-1');
  assert.equal(matchPendingJob({ payload: { requestId: 'unknown' } }, works), null);
  assert.equal(matchPendingJob(null, works), null);
});

test('first open selects the latest saved image; sources are pruned and limited per operation', () => {
  assert.equal(initialSelection(works), 'job-grok-edit', 'interrupted and failed jobs are skipped');
  assert.equal(initialSelection([]), null);
  assert.deepEqual(pruneSources(['job-grok-1', 'job-grok-2', 'gone'], works), { kept: ['job-grok-1'], removed: ['job-grok-2', 'gone'] });
  const capabilities = normalizeCapabilities(SCHEMA_TWO_CAPABILITIES);
  const grok = capabilities.services.find((service) => service.provider === 'grok');
  const [generate, edit, compose] = grok.operations;
  assert.deepEqual(draftSources(generate, ['a', 'b']), [], 'picks made for compose are not sent with a generation');
  assert.deepEqual(draftSources(edit, ['a', 'b']), ['a']);
  assert.deepEqual(draftSources(compose, ['a', 'b']), ['a', 'b']);
  assert.equal(validateDraft(capabilities, { serviceKey: 'grok-native', operation: 'image.generate', prompt: 'cat', sourceIds: draftSources(generate, ['job-grok-1']) }, works).ok, true);
});

test('host calls run one at a time, foreground first, spaced from the previous call of a method finishing', async () => {
  let clock = 0; const log = []; const sleeps = []; let inFlight = 0; let release;
  const queue = createCallQueue(async (method, args) => {
    inFlight++; assert.equal(inFlight, 1, 'one call at a time');
    log.push(`${method}:${args[0] ?? ''}@${clock}`);
    if (args[0] === 'slow') await new Promise((resolve) => { release = resolve; });
    clock += 100; inFlight--; return `${method}-${args[0] ?? ''}`;
  }, { now: () => clock, sleep: async (ms) => { sleeps.push(ms); clock += ms; } });
  const slow = queue.call('read', ['slow'], { background: true });
  const thumbs = ['a', 'b'].map((id) => queue.call('read', [id], { background: true }));
  const skipped = queue.call('read', ['gone'], { background: true, wanted: () => false });
  await Promise.resolve();
  const user = queue.call('submit', ['draft']);
  const preview = queue.call('read', ['shown'], { urgent: true });
  release();
  assert.equal(await slow, 'read-slow'); assert.equal(await user, 'submit-draft'); assert.equal(await preview, 'read-shown');
  assert.deepEqual(await Promise.all(thumbs), ['read-a', 'read-b']);
  await assert.rejects(skipped, /skipped/);
  // The urgent preview read goes first and the submit ahead of every background read; each repeat of read
  // starts 550 ms after the previous read finished, not after it started.
  assert.deepEqual(log, ['read:slow@0', 'read:shown@650', 'submit:draft@750', 'read:a@1300', 'read:b@1950']);
  assert.deepEqual(sleeps, [550, 450, 550]);
});

test('a waiting background read yields to newer foreground calls, can be promoted, and closing settles the queue', async () => {
  let clock = 1000; const log = []; let wake = null;
  const queue = createCallQueue(async (method, args) => { log.push(args.length ? `${method}:${args[0]}` : method); clock += 10; return method; },
    { now: () => clock, sleep: (ms) => new Promise((resolve) => { wake = () => { wake = null; clock += ms; resolve(); }; }) });
  const tick = () => new Promise((resolve) => setImmediate(resolve));
  await queue.call('read', ['first']);
  const thumb = queue.call('read', ['thumb'], { background: true });
  const later = queue.call('read', ['later'], { background: true });
  const shown = queue.call('read', ['shown'], { background: true });
  await tick(); assert.ok(wake, 'the thumbnail read waits for the read spacing');
  const list = queue.call('list');
  assert.equal(queue.promote((method, args) => method === 'read' && args[0] === 'shown'), true);
  assert.equal(queue.promote((method, args) => args[0] === 'missing'), false);
  wake(); await Promise.all([list, shown]);
  assert.deepEqual(log, ['read:first', 'read:shown', 'list'], 'the promoted read and the list call went before the waiting thumbnail read');
  await tick(); assert.ok(wake, 'the thumbnail read waits again');
  queue.close(); wake();
  await assert.rejects(thumb, /disposed/); await assert.rejects(later, /disposed/);
  await assert.rejects(queue.call('list'), /disposed/);
  assert.deepEqual(log, ['read:first', 'read:shown', 'list']);
});
