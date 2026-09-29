import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { decodeAppPackage, supportsVersion } from '@cats-inc/cats-platform/app-sdk';
import { buildApp, minimumVersion, validateHosts } from '../scripts/build-app.mjs';

const rootManifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

test('the Platform SDK is an exact-pinned development dependency', () => {
  // A range could silently change the encoder, and with it every App's bytes.
  assert.match(rootManifest.devDependencies['@cats-inc/cats-platform'], /^\d+\.\d+\.\d+$/);
});

test('declared compatibility ranges resolve to their floor in the host grammar', () => {
  for (const [range, floor] of [['^0.5.0', '0.5.0'], ['^0.5.11', '0.5.11'], ['0.5.x', '0.5.0'], ['1.x', '1.0.0'], ['0.5.3', '0.5.3'], ['^1.3.0', '1.3.0']]) {
    assert.equal(minimumVersion(range), floor, range);
  }
  for (const range of ['>=0.5.0', '~0.5.0', '*', '^0.5.0-beta.1', '0.5']) assert.throws(() => minimumVersion(range), /Unsupported/, range);
});

for (const app of ['usage', 'studio']) {
  test(`${app} builds with the SDK encoder and passes its floor and, when accepted, the SDK host`, async (t) => {
    const outputDir = await mkdtemp(path.join(tmpdir(), `${app}-sdk-build-`));
    t.after(() => rm(outputDir, { recursive: true, force: true }));
    const manifest = JSON.parse(await readFile(new URL(`../apps/${app}/cats.app.json`, import.meta.url), 'utf8'));
    const built = await buildApp({ app, outputDir });
    const bytes = await readFile(built.artifactPath);
    assert.equal(decodeAppPackage(bytes, built).manifest.id, manifest.id);
    const provenance = JSON.parse(await readFile(path.join(outputDir, `${app}-${manifest.version}.provenance.json`), 'utf8'));
    assert.deepEqual(provenance.validatedHosts[0], {
      platformVersion: minimumVersion(manifest.compatibility.catsPlatform),
      appSdkVersion: minimumVersion(manifest.compatibility.appSdk),
    });
    assert.equal(provenance.builtWith.package, '@cats-inc/cats-platform');
    const hostAccepted = supportsVersion(provenance.builtWith.version, manifest.compatibility.catsPlatform)
      && supportsVersion(provenance.builtWith.appSdk, manifest.compatibility.appSdk);
    assert.equal(provenance.validatedHosts.some((host) => host.platformVersion === provenance.builtWith.version
      && host.appSdkVersion === provenance.builtWith.appSdk), hostAccepted);
    assert.throws(() => validateHosts(bytes, { ...manifest.compatibility, catsPlatform: '>=0.5.0' }), /Unsupported compatibility range/);
  });
}
