import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { buildApp } from '../scripts/build-app.mjs';

test('Studio is a separate immutable App with embedded sample and bounded SDK permissions', async (t) => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'studio-package-test-'));
  t.after(() => rm(outputDir, { recursive: true, force: true }));
  const first = await buildApp({ app: 'studio', outputDir });
  const second = await buildApp({ app: 'studio', outputDir });
  assert.equal(first.sha256, second.sha256);
  const archive = JSON.parse(gunzipSync(await readFile(first.artifactPath)));
  assert.equal(archive.manifest.id, 'cats.studio');
  assert.equal(archive.manifest.contributions.lobbyApps[0].routePath, '/apps/cats.studio');
  assert.deepEqual(archive.manifest.permissions, ['ui.route', 'ui.lobby', 'media.images']);
  const html = Buffer.from(archive.files.find((file) => file.path === 'renderer/index.html').base64, 'base64').toString();
  assert.match(html, /data:image\/jpeg;base64,/); assert.doesNotMatch(html, /\{\{APP_ASSET:|from ['"]\.\/|fetch\(|<script[^>]+src=/);
  assert.match(html, /hostCall\('submit'/); assert.match(html, /範例作品/);
  // The host bridge runs one image call at a time, so nothing may call sdk.images directly outside the queue.
  assert.doesNotMatch(html, /sdk\.images\.(getCapabilities|list|submit|cancel|refresh|delete|read|export)\(/);
  assert.match(html, /<button id="generate"[^>]+disabled/);
  assert.match(html, /id="services"/); assert.match(html, /normalizeCapabilities/);
  // Deletion is feature-detected and a saved image needs explicit confirmation in an in-App dialog.
  assert.match(html, /typeof sdk\?\.images\?\.delete === 'function'/); assert.match(html, /<dialog id="confirm-dialog"/);
  assert.doesNotMatch(html, /window\.confirm|[^.\w]confirm\(/);
  // HTML parsing replaces NUL and mangles other raw control characters, so inline sources must use escapes.
  assert.doesNotMatch(html, /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/);
  // The renderer is model.js and app.js concatenated into one inline module; it must parse as a whole.
  const script = /<script type="module">([\s\S]*)<\/script>/.exec(html)[1];
  const scriptPath = path.join(outputDir, 'renderer.mjs');
  await writeFile(scriptPath, script);
  const check = spawnSync(process.execPath, ['--check', scriptPath], { encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr);
});
