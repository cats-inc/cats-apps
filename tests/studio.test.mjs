import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
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
  assert.match(html, /sdk\.images\.submit/); assert.match(html, /範例作品/);
  assert.match(html, /<button id="generate"[^>]+disabled/);
});
