// Studio image fixtures. Schema 1 mirrors the shipped SDK 1.x shape; schema 2 is the
// SPEC-006 proposal and changes when the owners freeze contract 2. No fixture calls a CLI.
export const SCHEMA_ONE_CAPABILITIES = {
  schemaVersion: 1, operation: 'image.generate', aspectRatio: '1:1', maxPromptLength: 2000, maxImageBytes: 8 * 1024 * 1024,
  targets: [{ provider: 'grok', instance: 'native', agentModel: 'grok-4.7' }],
};

const GROK_GENERATE = ['auto', '1:1', '16:9', '9:16', '3:2', '2:3'];
const GROK_COMPOSE = [...GROK_GENERATE, '4:3', '3:4', '2:1', '1:2', '19.5:9', '9:19.5', '20:9', '9:20'];
const config = (id, model, effort) => [{ id, model, effort }];

export const SCHEMA_TWO_CAPABILITIES = {
  schemaVersion: 2, revision: 'fixture-1', maxPromptLength: 2000,
  targets: [
    { id: 'grok-native', provider: 'grok', instanceLabel: 'native', availability: 'available' },
    { id: 'muse-native', provider: 'muse', instanceLabel: 'native', availability: 'available' },
    { id: 'antigravity-native', provider: 'antigravity', instanceLabel: 'native', availability: 'available' },
    { id: 'codex-native', provider: 'codex', instanceLabel: 'native', availability: 'available' },
    { id: 'claude-native', provider: 'claude', instanceLabel: 'native', availability: 'available' },
  ],
  profiles: [
    { id: 'grok-generate', revision: 1, operation: 'image.generate', targetIds: ['grok-native'], agentConfigs: config('grok-4.7-xhigh', 'grok-4.7', 'xhigh'),
      inputs: { min: 0, max: 0 }, aspectRatio: { mode: 'choose', options: GROK_GENERATE } },
    { id: 'grok-edit', revision: 1, operation: 'image.edit', targetIds: ['grok-native'], agentConfigs: config('grok-4.7-xhigh', 'grok-4.7', 'xhigh'),
      inputs: { min: 1, max: 1 }, aspectRatio: { mode: 'source' } },
    { id: 'grok-compose', revision: 1, operation: 'image.compose', targetIds: ['grok-native'], agentConfigs: config('grok-4.7-xhigh', 'grok-4.7', 'xhigh'),
      inputs: { min: 2, max: 8 }, aspectRatio: { mode: 'choose', options: GROK_COMPOSE } },
    { id: 'muse-generate', revision: 1, operation: 'image.generate', targetIds: ['muse-native'], agentConfigs: config('muse-spark-xhigh', 'muse-spark-1.3', 'xhigh'),
      inputs: { min: 0, max: 0 }, aspectRatio: { mode: 'service' } },
    { id: 'muse-edit', revision: 1, operation: 'image.edit', targetIds: ['muse-native'], agentConfigs: config('muse-spark-xhigh', 'muse-spark-1.3', 'xhigh'),
      inputs: { min: 1, max: 1 }, aspectRatio: { mode: 'service' } },
    { id: 'muse-compose', revision: 1, operation: 'image.compose', targetIds: ['muse-native'], agentConfigs: config('muse-spark-xhigh', 'muse-spark-1.3', 'xhigh'),
      inputs: { min: 2, max: 50 }, aspectRatio: { mode: 'service' } },
    { id: 'antigravity-generate', revision: 1, operation: 'image.generate', targetIds: ['antigravity-native'], agentConfigs: config('flash-high', 'gemini-3.8-flash-high', 'high'),
      inputs: { min: 0, max: 0 }, aspectRatio: { mode: 'native', options: ['1:1'] } },
    { id: 'antigravity-edit', revision: 1, operation: 'image.edit', targetIds: ['antigravity-native'], agentConfigs: config('flash-high', 'gemini-3.8-flash-high', 'high'),
      inputs: { min: 1, max: 1 }, aspectRatio: { mode: 'service' } },
    { id: 'codex-generate', revision: 1, operation: 'image.generate', targetIds: ['codex-native'], agentConfigs: config('sol-xhigh', 'gpt-6.1-sol', 'xhigh'),
      inputs: { min: 0, max: 0 }, aspectRatio: { mode: 'service' }, transparentBackground: true },
    { id: 'codex-edit', revision: 1, operation: 'image.edit', targetIds: ['codex-native'], agentConfigs: config('sol-xhigh', 'gpt-6.1-sol', 'xhigh'),
      inputs: { min: 1, max: 1 }, aspectRatio: { mode: 'service' }, transparentBackground: true },
    { id: 'codex-compose', revision: 1, operation: 'image.compose', targetIds: ['codex-native'], agentConfigs: config('sol-xhigh', 'gpt-6.1-sol', 'xhigh'),
      inputs: { min: 2, max: 10 }, aspectRatio: { mode: 'service' } },
  ],
};

// Only generation is verified today; "today" keeps the SDK 1.x-equivalent subset.
export const SCHEMA_TWO_TODAY = {
  ...SCHEMA_TWO_CAPABILITIES,
  targets: SCHEMA_TWO_CAPABILITIES.targets.filter((target) => target.provider === 'grok'),
  profiles: SCHEMA_TWO_CAPABILITIES.profiles.filter((profile) => profile.id === 'grok-generate')
    .map((profile) => ({ ...profile, aspectRatio: { mode: 'native', options: ['1:1'] } })),
};

const job = (fields) => ({ schemaVersion: 2, requestId: `request-${fields.id}`, error: null, warnings: [], sources: [], options: {},
  executionOutcome: 'completed', createdAt: '2026-10-23T05:00:00.000Z', updatedAt: '2026-10-23T05:01:00.000Z', ...fields });
const png = (width, height, bytes, transparency = 'opaque') => ({ mimeType: 'image/png', width, height, bytes, sha256: null, transparency });
const jpeg = (width, height, bytes) => ({ mimeType: 'image/jpeg', width, height, bytes, sha256: null });

// Newest first, like images.list().
export const SCHEMA_TWO_JOBS = [
  job({ id: 'job-codex-edit', provider: 'codex', targetId: 'codex-native', operation: 'image.edit', status: 'interrupted', error: 'execution_interrupted',
    prompt: '替第一張的橘貓加上一條紅色圍巾。', sources: [{ id: 'job-grok-1', sha256: null }], executionOutcome: null, output: null, createdAt: '2026-10-23T06:31:00.000Z' }),
  job({ id: 'job-grok-edit', provider: 'grok', targetId: 'grok-native', operation: 'image.edit', status: 'succeeded', agentModel: 'grok-4.7', agentEffort: 'xhigh',
    prompt: '把背景換成淡黃色，貓保持不變。', sources: [{ id: 'job-grok-1', sha256: null }], output: jpeg(1024, 1024, 93_120), createdAt: '2026-10-23T06:20:00.000Z' }),
  job({ id: 'job-agy-1', provider: 'antigravity', targetId: 'antigravity-native', status: 'succeeded', agentModel: 'gemini-3.8-flash-high', agentEffort: 'high',
    prompt: '一隻橘貓坐在月光下的屋頂上，淡紫色夜空，極簡平面插畫，沒有文字。', options: { aspectRatio: '1:1' }, output: jpeg(1024, 1024, 326_878), createdAt: '2026-10-23T06:12:00.000Z' }),
  job({ id: 'job-codex-1', provider: 'codex', targetId: 'codex-native', status: 'succeeded', agentModel: 'gpt-6.1-sol', agentEffort: 'xhigh',
    prompt: '一隻橘貓抱著毛線球，薄荷綠背景，圓潤的貼紙風格，沒有文字。', output: png(1254, 1254, 1_264_820), createdAt: '2026-10-23T05:58:00.000Z' }),
  job({ id: 'job-muse-1', provider: 'muse', targetId: 'muse-native', status: 'succeeded', agentModel: 'muse-spark-1.3', agentEffort: 'xhigh',
    warnings: ['response_timeout_after_image'], executionOutcome: 'failed',
    prompt: '一隻橘貓趴在窗台上，窗外是傍晚的粉橘色天空，簡單的平面插畫，沒有文字。', output: png(1920, 1280, 1_252_742), createdAt: '2026-10-23T05:29:00.000Z' }),
  job({ id: 'job-grok-2', provider: 'grok', targetId: 'grok-native', status: 'failed', error: 'quota_exhausted', agentModel: 'grok-4.7', agentEffort: 'xhigh',
    prompt: '一隻橘貓在書架上打盹，暖色調水彩插畫，沒有文字。', options: { aspectRatio: '1:1' }, executionOutcome: 'failed', output: null, createdAt: '2026-10-23T05:20:00.000Z' }),
  job({ id: 'job-grok-1', provider: 'grok', targetId: 'grok-native', status: 'succeeded', agentModel: 'grok-4.7', agentEffort: 'xhigh',
    prompt: 'A simple flat illustration of one orange cat sitting, solid light blue background, minimal shapes, no text, no letters, no watermark',
    options: { aspectRatio: '1:1' }, output: jpeg(1024, 1024, 85_413), createdAt: '2026-10-22T21:05:00.000Z' }),
  job({ id: 'job-muse-source', provider: 'muse', targetId: 'muse-native', status: 'failed', error: 'invalid_image_source',
    agentModel: 'muse-spark-1.3', agentEffort: 'xhigh', prompt: '三花貓靠近壁爐取暖的油畫。',
    output: null, executionOutcome: null, createdAt: '2026-10-22T20:00:00.000Z' }),
];

// Contract 2 exactly as the Platform host (SDK 1.7.0) projects Runtime SPEC-038 for generation. Keep in step with
// cats-platform presentImageJob/capabilities; the proposal above still carries the unfrozen edit/compose shapes.
export const HOST_CONTRACT_TWO_CAPABILITIES = {
  schemaVersion: 2, revision: '3f2a9c1d0b7e6a54', maxPromptLength: 2000, maxImageBytes: 8 * 1024 * 1024,
  targets: [
    { id: 'grok/native', provider: 'grok', instanceLabel: 'native', availability: 'available' },
    { id: 'muse/native', provider: 'muse', instanceLabel: 'native', availability: 'available' },
  ],
  profiles: [
    { id: 'grok-generate', revision: 1, operation: 'image.generate', targetIds: ['grok/native'], inputs: { min: 0, max: 0 },
      agentConfigs: [{ id: 'grok-4.7-xhigh', model: 'grok-4.7', effort: 'xhigh' }], aspectRatio: { mode: 'native', options: ['1:1'] } },
    { id: 'muse-generate', revision: 1, operation: 'image.generate', targetIds: ['muse/native'], inputs: { min: 0, max: 0 },
      agentConfigs: [{ id: 'muse-spark-1.3-xhigh', model: 'muse-spark-1.3', effort: 'xhigh' }], aspectRatio: { mode: 'service' } },
  ],
};
export const HOST_CONTRACT_TWO_JOB = {
  schemaVersion: 2, id: '0f0e0d0c-0b0a-4908-8706-050403020100', requestId: '11111111-2222-4333-8444-555555555555', provider: 'muse',
  targetId: 'muse/native', instanceLabel: 'native', operation: 'image.generate', profileId: 'muse-generate', profileRevision: '1',
  agentConfigId: 'muse-spark-1.3-xhigh', agentModel: 'muse-spark-1.3', agentEffort: 'xhigh', prompt: 'A cat', sources: [], options: {},
  status: 'succeeded', error: null, warnings: [], executionOutcome: 'stopped_after_image',
  output: { mimeType: 'image/png', bytes: 1242589, width: 1920, height: 1280, sha256: 'bbcf2c079111bc91db218217aec40c60bcb2365f3529ebd36a6d1d33a814d8f0', transparency: 'opaque' },
  createdAt: '2026-10-23T05:00:00.000Z', updatedAt: '2026-10-23T05:00:19.000Z',
};
