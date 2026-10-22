export const MAX_PROMPT_LENGTH = 2000;
export const SAMPLE_PROMPT = 'A simple flat illustration of one orange cat sitting, solid light blue background, minimal shapes, no text, no letters, no watermark';
export const SAMPLE_IMAGE = '{{APP_ASSET:orange-cat.jpg}}';
export const PROMPT_IDEAS = [
  { label: '角色插畫', en: 'Character', prompt: '一隻橘貓坐在淺藍色背景前，簡單的平面插畫，乾淨線條，沒有文字。', english: SAMPLE_PROMPT },
  { label: '自然風景', en: 'Landscape', prompt: '清晨薄霧中的山間小屋，柔和陽光穿過樹林，寧靜的水彩風景，沒有文字。', english: 'A small cabin in misty mountains at dawn, soft sunlight through trees, a peaceful watercolor landscape, no text.' },
  { label: '產品情境', en: 'Product', prompt: '一只奶油色陶瓷杯放在木桌上，窗邊自然光，溫暖簡潔的產品照片，沒有文字。', english: 'A cream ceramic mug on a wooden table, natural window light, warm minimal product photography, no text.' },
];
// Operation order is display order. Inputs are the only source counts each operation may declare.
export const OPERATIONS = ['image.generate', 'image.edit', 'image.compose'];
const OPERATION_INPUTS = { 'image.generate': [0, 0], 'image.edit': [1, 1], 'image.compose': [2, Infinity] };
const RATIO_MODES = ['choose', 'native', 'service', 'source'];
const RATIO_PATTERN = /^(auto|\d{1,2}(\.\d)?:\d{1,2}(\.\d)?)$/;
const ID_PATTERN = /^[A-Za-z0-9._:/-]{1,128}$/;
const PROVIDER_NAMES = { grok: 'Grok', muse: 'Muse', antigravity: 'Antigravity', codex: 'Codex' };
export const ACTIVE_STATUSES = ['submitting', 'running', 'collecting', 'cancelling'];

export function promptLength(value) {
  return Array.from(value).length;
}

const cleanText = (value, max = 120) => typeof value === 'string' && value.trim() && value.length <= max ? value.trim() : null;
const providerName = (provider, label) => cleanText(label, 40) ?? PROVIDER_NAMES[provider] ?? provider;

function ratioModeOf(raw, operation) {
  const mode = raw?.mode;
  if (!RATIO_MODES.includes(mode) || (mode === 'source' && operation !== 'image.edit')) return null;
  if (mode !== 'choose' && mode !== 'native') return { mode, options: [] };
  const options = Array.isArray(raw.options) ? [...new Set(raw.options)] : [];
  if (!options.length || options.length > 24 || options.some((option) => typeof option !== 'string' || !RATIO_PATTERN.test(option))) return null;
  if (mode === 'native' && (options.length !== 1 || options[0] === 'auto')) return null;
  return { mode, options };
}

function inputsOf(raw, operation) {
  const [min, max] = OPERATION_INPUTS[operation];
  if (operation === 'image.compose') {
    const declaredMin = raw?.min ?? min;
    const declaredMax = raw?.max;
    if (!Number.isInteger(declaredMin) || declaredMin < min || !Number.isInteger(declaredMax) || declaredMax < declaredMin || declaredMax > 100) return null;
    return { min: declaredMin, max: declaredMax };
  }
  if ((raw?.min ?? min) !== min || (raw?.max ?? max) !== max) return null;
  return { min, max };
}

function agentConfigsOf(raw) {
  const configs = (Array.isArray(raw) ? raw : []).filter((config) => config && ID_PATTERN.test(config.id ?? '') && cleanText(config.model, 80))
    .map((config) => ({ id: config.id, model: config.model.trim(), effort: cleanText(config.effort, 24), label: cleanText(config.label, 80) }));
  return configs.length ? configs : null;
}

function emptyCapabilities(schemaVersion, reason) {
  return { schemaVersion, revision: null, maxPromptLength: MAX_PROMPT_LENGTH, services: [], reason };
}

// SDK 1.x: each Grok target becomes one service that can only generate at the native 1:1 ratio.
function fromSchemaOne(raw) {
  if (raw.operation !== 'image.generate' || !Array.isArray(raw.targets)) return emptyCapabilities(1, 'invalid_capabilities');
  const ratio = RATIO_PATTERN.test(raw.aspectRatio ?? '') && raw.aspectRatio !== 'auto' ? raw.aspectRatio : '1:1';
  const targets = raw.targets.filter((target) => cleanText(target?.provider, 40) && ID_PATTERN.test(target?.instance ?? ''));
  const perProvider = new Map();
  for (const target of targets) perProvider.set(target.provider, (perProvider.get(target.provider) ?? 0) + 1);
  const services = targets.map((target) => {
    const name = providerName(target.provider);
    return {
      key: target.instance, provider: target.provider, name,
      alias: perProvider.get(target.provider) > 1 ? target.instance : null,
      account: name, available: true, reason: null,
      operations: [{
        id: 'image.generate', profileId: null, profileRevision: null, inputs: { min: 0, max: 0 },
        ratio: { mode: 'native', options: [ratio] }, transparency: false,
        agentConfigs: [{ id: null, model: cleanText(target.agentModel, 80) ?? '', effort: null, label: null }],
      }],
    };
  });
  return { schemaVersion: 1, revision: null, maxPromptLength: Math.min(MAX_PROMPT_LENGTH, raw.maxPromptLength || MAX_PROMPT_LENGTH), services, reason: null };
}

// Proposed contract 2 (SPEC-006). Anything malformed is dropped rather than guessed.
function fromSchemaTwo(raw) {
  if (!Array.isArray(raw.targets) || !Array.isArray(raw.profiles)) return emptyCapabilities(2, 'invalid_capabilities');
  const perProvider = new Map();
  const targets = raw.targets.filter((target) => ID_PATTERN.test(target?.id ?? '') && cleanText(target?.provider, 40));
  for (const target of targets) perProvider.set(target.provider, (perProvider.get(target.provider) ?? 0) + 1);
  const services = [];
  for (const target of targets) {
    const operations = [];
    for (const operation of OPERATIONS) {
      const profile = raw.profiles.find((item) => item?.operation === operation && Array.isArray(item.targetIds) && item.targetIds.includes(target.id));
      if (!profile || !ID_PATTERN.test(profile.id ?? '') || !ID_PATTERN.test(String(profile.revision ?? ''))) continue;
      const ratio = ratioModeOf(profile.aspectRatio, operation);
      const declaredInputs = inputsOf(profile.inputs, operation);
      const configs = agentConfigsOf(profile.agentConfigs);
      if (!ratio || !declaredInputs || !configs) continue;
      operations.push({ id: operation, profileId: profile.id, profileRevision: String(profile.revision), inputs: declaredInputs,
        ratio, transparency: profile.transparentBackground === true, agentConfigs: configs });
    }
    const name = providerName(target.provider, target.providerLabel);
    const available = target.availability === 'available' && operations.length > 0;
    if (!operations.length) continue;
    services.push({ key: target.id, provider: target.provider, name,
      alias: perProvider.get(target.provider) > 1 ? cleanText(target.instanceLabel, 40) ?? target.id : null,
      account: name, available, reason: available ? null : (cleanText(target.reason, 40) ?? 'unavailable'), operations });
  }
  return { schemaVersion: 2, revision: cleanText(String(raw.revision ?? ''), 128), maxPromptLength: Math.min(MAX_PROMPT_LENGTH, raw.maxPromptLength || MAX_PROMPT_LENGTH), services, reason: null };
}

export function normalizeCapabilities(raw) {
  if (!raw || typeof raw !== 'object') return emptyCapabilities(null, 'invalid_capabilities');
  if (raw.schemaVersion === 1) return fromSchemaOne(raw);
  if (raw.schemaVersion === 2) return fromSchemaTwo(raw);
  return emptyCapabilities(raw.schemaVersion ?? null, 'unsupported_schema');
}

export function findOperation(capabilities, serviceKey, operationId) {
  const service = capabilities.services.find((item) => item.key === serviceKey) ?? null;
  return { service, operation: service?.operations.find((item) => item.id === operationId) ?? null };
}

// Grok generation without a stored preference (SPEC-006 CAP-07); never a silent switch away from a kept choice.
export function defaultService(capabilities, preferredKey) {
  const usable = capabilities.services.filter((service) => service.available);
  if (preferredKey && capabilities.services.some((service) => service.key === preferredKey)) return preferredKey;
  return (usable.find((service) => service.provider === 'grok') ?? usable[0])?.key ?? null;
}

export function validateDraft(capabilities, draft, works = []) {
  const { service, operation } = findOperation(capabilities, draft.serviceKey, draft.operation);
  if (!service || !service.available) return { ok: false, reason: 'service_unavailable' };
  if (!operation) return { ok: false, reason: 'operation_unavailable' };
  const prompt = (draft.prompt ?? '').trim();
  if (!prompt) return { ok: false, reason: 'prompt_empty' };
  if (promptLength(prompt) > capabilities.maxPromptLength) return { ok: false, reason: 'prompt_too_long' };
  const sources = draft.sourceIds ?? [];
  if (new Set(sources).size !== sources.length || sources.length < operation.inputs.min || sources.length > operation.inputs.max) return { ok: false, reason: 'source_count_invalid' };
  const saved = new Set(works.filter((work) => work.status === 'succeeded').map((work) => work.id));
  if (sources.some((id) => !saved.has(id))) return { ok: false, reason: 'source_unavailable' };
  if (operation.ratio.mode === 'choose' && draft.aspectRatio && !operation.ratio.options.includes(draft.aspectRatio)) return { ok: false, reason: 'option_unsupported' };
  if (draft.transparentBackground && !operation.transparency) return { ok: false, reason: 'option_unsupported' };
  if (operation.agentConfigs.length > 1 && !operation.agentConfigs.some((config) => config.id === draft.agentConfigId)) return { ok: false, reason: 'agent_config_required' };
  return { ok: true, reason: null };
}

// Exact payloads: SDK 1.x accepts only requestId/instance/prompt; contract 2 carries declared options only.
export function buildSubmission(capabilities, draft, works = []) {
  const validation = validateDraft(capabilities, draft, works);
  if (!validation.ok) throw new Error(validation.reason);
  const { service, operation } = findOperation(capabilities, draft.serviceKey, draft.operation);
  const prompt = draft.prompt.trim();
  if (capabilities.schemaVersion === 1) return { requestId: draft.requestId, instance: service.key, prompt };
  const options = {};
  if (operation.ratio.mode === 'choose' && draft.aspectRatio && draft.aspectRatio !== 'auto') options.aspectRatio = draft.aspectRatio;
  if (operation.transparency && draft.transparentBackground) options.transparentBackground = true;
  const config = operation.agentConfigs.find((item) => item.id === draft.agentConfigId) ?? operation.agentConfigs[0];
  return { requestId: draft.requestId, targetId: service.key, profileId: operation.profileId, profileRevision: operation.profileRevision,
    agentConfigId: config.id, operation: operation.id, prompt, sourceIds: [...(draft.sourceIds ?? [])], options };
}

const greatestDivisor = (a, b) => (b ? greatestDivisor(b, a % b) : a);
export function ratioText(width, height) {
  if (!(width > 0 && height > 0)) return null;
  const divisor = greatestDivisor(width, height);
  const [a, b] = [width / divisor, height / divisor];
  return a <= 32 && b <= 32 ? `${a}:${b}` : `${(width / height).toFixed(2)}:1`;
}

export function fitBox(width, height, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / width, maxHeight / height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function ratioBox(ratio, max) {
  const match = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(ratio ?? '');
  if (!match) return null;
  return fitBox(Number(match[1]), Number(match[2]), max, max);
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FORMATS = { 'image/jpeg': 'JPEG', 'image/png': 'PNG' };
const TRANSPARENCY = { opaque: 'opaque', 'has-transparency': 'transparent', unknown: 'unknown' };

function normalizeOutput(raw) {
  if (!raw || !FORMATS[raw.mimeType] || !(raw.width > 0) || !(raw.height > 0)) return null;
  const transparency = raw.mimeType === 'image/jpeg' ? 'opaque' : (TRANSPARENCY[raw.transparency] ?? 'unknown');
  return { mimeType: raw.mimeType, format: FORMATS[raw.mimeType], bytes: raw.bytes ?? null, width: raw.width, height: raw.height,
    ratio: ratioText(raw.width, raw.height), transparency, sha256: raw.sha256 ?? null, mediaModel: cleanText(raw.mediaModel, 80) };
}

// Schema 1 jobs are Grok generations; their instance is the service key. Contract 2 jobs name their target.
export function normalizeJob(job) {
  const schemaTwo = job?.schemaVersion === 2;
  const operation = schemaTwo && OPERATIONS.includes(job.operation) ? job.operation : 'image.generate';
  const provider = cleanText(job?.provider, 40) ?? 'grok';
  const sources = schemaTwo && Array.isArray(job.sources) ? job.sources.filter((source) => ID_PATTERN.test(source?.id ?? '')).map((source) => ({ id: source.id, sha256: source.sha256 ?? null })) : [];
  const options = schemaTwo && job.options && typeof job.options === 'object' ? job.options : {};
  return {
    id: job.id, requestId: job.requestId, prompt: typeof job.prompt === 'string' ? job.prompt : '',
    provider, name: providerName(provider, job.providerLabel), serviceKey: schemaTwo ? job.targetId : job.instance,
    alias: schemaTwo ? cleanText(job.instanceLabel, 40) : null, operation, status: job.status, error: job.error ?? null,
    warnings: Array.isArray(job.warnings) ? job.warnings.filter((warning) => typeof warning === 'string') : [],
    executionOutcome: cleanText(job.executionOutcome, 24), createdAt: job.createdAt, updatedAt: job.updatedAt,
    agentModel: cleanText(job.agentModel, 80), agentEffort: cleanText(job.agentEffort, 24), sources,
    requestedRatio: schemaTwo ? (typeof options.aspectRatio === 'string' ? options.aspectRatio : null) : '1:1',
    requestedTransparency: options.transparentBackground === true,
    output: job.status === 'succeeded' ? normalizeOutput(job.output) : null,
    active: ACTIVE_STATUSES.includes(job.status),
  };
}
