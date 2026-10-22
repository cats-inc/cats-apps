import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSubmission, defaultService, normalizeCapabilities, normalizeJob, promptLength, ratioText, validateDraft } from '../apps/studio/src/model.js';
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
