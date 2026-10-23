#!/usr/bin/env node
// Write a standalone Studio preview driven by fixture capabilities and jobs. Development only:
// it never calls a CLI, is not an installed-host acceptance and is never part of a package.
// Usage: node scripts/testing/preview-studio.mjs [--fixture target|today|sdk1] [--theme light|dark] [--locale zh-TW|en] [--output <file>]
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { buildApp } from '../build-app.mjs';
import { SCHEMA_ONE_CAPABILITIES, SCHEMA_TWO_CAPABILITIES, SCHEMA_TWO_JOBS, SCHEMA_TWO_TODAY } from '../../tests/fixtures/studio-image-fixtures.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const usage = 'Usage: node scripts/testing/preview-studio.mjs [--fixture target|today|sdk1] [--theme light|dark] [--locale zh-TW|en] [--output <file>]\n';

export function parseArgs(argv) {
  const options = { fixture: 'target', theme: 'light', locale: 'zh-TW', output: null };
  for (let index = 0; index < argv.length; index++) {
    const key = { '--fixture': 'fixture', '--theme': 'theme', '--locale': 'locale', '--output': 'output' }[argv[index]];
    if (!key || !argv[index + 1] || argv[index + 1].startsWith('--')) throw new Error(`Invalid argument: ${argv[index]}`);
    options[key] = argv[++index];
  }
  if (!['target', 'today', 'sdk1'].includes(options.fixture) || !['light', 'dark'].includes(options.theme)) throw new Error('Unsupported fixture or theme.');
  options.output = resolve(options.output ?? join(root, 'dist', 'studio-preview', `${options.fixture}-${options.theme}.html`));
  return options;
}

function legacyJobs(jobs) {
  return jobs.filter((job) => job.provider === 'grok' && job.operation === undefined).map(({ targetId, options, warnings, sources, executionOutcome, agentEffort, ...job }) => ({ ...job, schemaVersion: 1, instance: 'native' }));
}

export async function previewHtml({ fixture = 'target', theme = 'light', locale = 'zh-TW' } = {}) {
  const outputDir = await mkdtemp(join(tmpdir(), 'studio-preview-'));
  try {
    const { artifactPath } = await buildApp({ app: 'studio', outputDir });
    const archive = JSON.parse(gunzipSync(await readFile(artifactPath)));
    const html = Buffer.from(archive.files.find((file) => file.path === 'renderer/index.html').base64, 'base64').toString();
    const sample = (await readFile(join(root, 'apps', 'studio', 'assets', 'orange-cat.jpg'))).toString('base64');
    const capabilities = { target: SCHEMA_TWO_CAPABILITIES, today: SCHEMA_TWO_TODAY, sdk1: SCHEMA_ONE_CAPABILITIES }[fixture];
    const jobs = fixture === 'target' ? SCHEMA_TWO_JOBS : fixture === 'today' ? SCHEMA_TWO_JOBS.filter((job) => job.provider === 'grok' && job.operation === undefined) : legacyJobs(SCHEMA_TWO_JOBS);
    const data = JSON.stringify({ capabilities, jobs, sample, theme, locale, schemaVersion: capabilities.schemaVersion }).replaceAll('<', '\\u003c');
    return html.replace('<script type="module">', `<script>${fixtureSdk(data)}</script>\n  <script type="module">`);
  } finally { await rm(outputDir, { recursive: true, force: true }); }
}

// Browser-side fake of the injected catsApp SDK with simulated job phases and generated image bytes.
function fixtureSdk(data) {
  return `(() => {
  const fixture = ${data};
  const jobs = fixture.jobs.map((job) => ({ ...job }));
  const now = () => new Date().toISOString();
  const outputs = { grok: ['image/jpeg', 1024, 1024], muse: ['image/png', 1920, 1280], antigravity: ['image/jpeg', 1024, 1024], codex: ['image/png', 1254, 1254] };
  const colors = ['#c3e6f0', '#f5e3a3', '#d6d0f0', '#bfe3cf', '#f6cbae', '#f2d3dc'];
  const later = (ms, fn) => setTimeout(fn, ms);
  const find = (id) => { const job = jobs.find((item) => item.id === id); if (!job) throw new Error('invalid_image_request'); return job; };
  const target = (input) => fixture.schemaVersion === 1 ? { provider: 'grok', instance: input.instance } : { provider: fixture.capabilities.targets.find((item) => item.id === input.targetId)?.provider, targetId: input.targetId };
  async function image(job) {
    if (job.id === 'job-grok-1') return { bytes: Uint8Array.from(atob(fixture.sample), (c) => c.charCodeAt(0)).buffer, mimeType: 'image/jpeg' };
    const { width, height, mimeType } = job.output;
    const canvas = new OffscreenCanvas(width, height); const context = canvas.getContext('2d');
    const transparent = job.output.transparency === 'has-transparency';
    if (!transparent) { context.fillStyle = colors[[...job.id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % colors.length]; context.fillRect(0, 0, width, height); }
    const unit = Math.min(width, height);
    context.fillStyle = '#e8833a'; context.beginPath(); context.arc(width / 2, height / 2 - unit * 0.12, unit * 0.13, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.ellipse(width / 2, height / 2 + unit * 0.16, unit * 0.17, unit * 0.2, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#1f2e29'; context.font = Math.round(unit * 0.045) + 'px sans-serif'; context.textAlign = 'center';
    context.fillText('fixture ' + (mimeType === 'image/png' ? 'PNG ' : 'JPEG ') + width + ' x ' + height, width / 2, height - unit * 0.06);
    const blob = await canvas.convertToBlob({ type: mimeType, quality: 0.9 });
    return { bytes: await blob.arrayBuffer(), mimeType };
  }
  function advance(job, status, extra = {}) { if (job.status === 'cancelling' || job.status === 'cancelled') return; Object.assign(job, { status, updatedAt: now() }, extra); }
  globalThis.catsApp = {
    locale: fixture.locale, theme: fixture.theme, version: 'preview',
    async openLobby() {},
    media: { images: {
      async getCapabilities() { return fixture.capabilities; },
      async list() { return { jobs: jobs.map((job) => ({ ...job })) }; },
      async submit(input) {
        const existing = jobs.find((job) => job.requestId === input.requestId);
        if (existing) return { ...existing };
        if (jobs.some((job) => ['submitting', 'running', 'collecting', 'cancelling'].includes(job.status))) throw new Error('image_service_busy');
        const where = target(input);
        const [mimeType, width, height] = outputs[where.provider] ?? outputs.grok;
        const source = input.sourceIds?.length === 1 && where.provider === 'grok' ? jobs.find((job) => job.id === input.sourceIds[0])?.output : null;
        const transparency = input.options?.transparentBackground ? 'has-transparency' : 'opaque';
        const output = { mimeType, width: source?.width ?? width, height: source?.height ?? height, bytes: 180000, sha256: null, transparency };
        const job = { schemaVersion: fixture.schemaVersion, id: 'job-' + input.requestId.slice(0, 8), requestId: input.requestId, prompt: input.prompt, ...where,
          operation: input.operation, sources: (input.sourceIds ?? []).map((id) => ({ id, sha256: null })), options: input.options ?? {}, warnings: [], executionOutcome: null,
          agentModel: null, status: 'submitting', error: null, output: null, createdAt: now(), updatedAt: now() };
        if (fixture.schemaVersion === 1) { delete job.operation; delete job.sources; delete job.options; delete job.warnings; delete job.executionOutcome; delete job.targetId; }
        jobs.unshift(job);
        later(600, () => advance(job, 'running'));
        later(4200, () => advance(job, 'collecting'));
        later(5600, () => advance(job, 'succeeded', { output, ...(where.provider === 'muse' ? { warnings: ['response_timeout_after_image'], executionOutcome: 'failed' } : { executionOutcome: 'completed' }) }));
        return { ...job };
      },
      async cancel(id) { const job = find(id); Object.assign(job, { status: 'cancelling', updatedAt: now() }); later(1200, () => Object.assign(job, { status: 'cancelled', error: 'cancelled', updatedAt: now() })); return { ...job }; },
      async refresh(id) {
        const job = find(id);
        if (job.status === 'interrupted') Object.assign(job, { status: 'succeeded', error: null, executionOutcome: 'completed', updatedAt: now(), output: { mimeType: 'image/png', width: 1254, height: 1254, bytes: 1300000, sha256: null, transparency: 'opaque' } });
        return { ...job };
      },
      async read(id) { const job = find(id); if (!job.output) throw new Error('invalid_image_request'); return image(job); },
      async export() { return { downloaded: true }; },
      async delete(id) {
        const job = find(id);
        if (!['succeeded', 'failed', 'cancelled'].includes(job.status)) throw new Error('image_not_deletable');
        jobs.splice(jobs.indexOf(job), 1); return { deleted: true };
      },
    } },
  };
})();`;
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--help')) process.stdout.write(usage);
  else {
    try {
      const options = parseArgs(process.argv.slice(2));
      const html = await previewHtml(options);
      await mkdir(dirname(options.output), { recursive: true });
      await writeFile(options.output, html);
      process.stdout.write(`${options.output}\n`);
    } catch (error) { process.stderr.write(`${error.message}\n${usage}`); process.exitCode = 1; }
  }
}
