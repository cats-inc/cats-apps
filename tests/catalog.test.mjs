import assert from 'node:assert/strict';
import { createHash, createPrivateKey, generateKeyPairSync } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { encodeAppPackage } from '@cats-inc/cats-platform/app-sdk';
import {
  CATALOG_TTL_MS, buildCatalog, buildCatalogPayload, parseArgs, signCatalog, validateCatalogSource, verifyCatalogEnvelope,
} from '../scripts/build-catalog.mjs';
import { createAndStoreCatalogKey } from '../scripts/new-catalog-key.mjs';

const readJson = async (url) => JSON.parse(await readFile(new URL(url, import.meta.url), 'utf8'));
const vectorKey = await readJson('./fixtures/app-catalog/test-key.json');
const vectorPayload = await readJson('./fixtures/app-catalog/payload.json');
const vectorEnvelope = await readJson('./fixtures/app-catalog/envelope.json');
const publisher = { name: 'Cats test', homepage: 'https://github.com/cats-inc/cats-apps' };
const releaseUrl = (slug, version) => `https://github.com/cats-inc/cats-apps/releases/download/${slug}-v${version}/${slug}-${version}.catsapp`;

function artifact(version, permissions = ['ui.route', 'ui.lobby']) {
  const manifest = {
    schemaVersion: 1, id: 'cats.sample', displayName: 'Sample', version, description: 'A sample App',
    category: 'user-app', trustTier: 'local-user', publisher,
    compatibility: { catsPlatform: '^0.6.0', appSdk: '^1.2.0' },
    entrypoints: { renderer: 'renderer/index.html' },
    contributions: { lobbyApps: [{ id: 'sample', title: 'Sample', routePath: '/apps/cats.sample', icon: 'star' }] },
    permissions,
  };
  const bytes = encodeAppPackage({ manifest, files: [{ path: 'renderer/index.html', data: Buffer.from(`<p>${version}</p>`) }] });
  return { bytes, sha256: createHash('sha256').update(bytes).digest('hex') };
}

function sampleSource(entries, channels = { stable: entries.at(-1).version }) {
  return {
    schemaVersion: 1, publisher,
    apps: [{ id: 'cats.sample', channels, versions: entries.map(({ version, built, ...rest }) => ({
      version, artifact: { url: releaseUrl('sample', version), size: built.bytes.length, sha256: built.sha256 }, ...rest,
    })) }],
  };
}

function servedBy(entries) {
  return async (url) => entries.find((entry) => releaseUrl('sample', entry.version) === url).built.bytes;
}

function ephemeralKey(keyId = 'ephemeral') {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  return { privateKey, keys: [{ keyId, algorithm: 'ed25519', publicKey: publicKey.export({ format: 'jwk' }).x }] };
}

test('the contract vector signs to the exact envelope that Platform verifies', () => {
  const privateKey = createPrivateKey({ key: { kty: 'OKP', crv: 'Ed25519', x: vectorKey.publicKey, d: vectorKey.privateKey }, format: 'jwk' });
  const keys = [{ keyId: vectorKey.keyId, algorithm: vectorKey.algorithm, publicKey: vectorKey.publicKey }];
  // Ed25519 is deterministic, so the same key and payload bytes reproduce the committed envelope.
  assert.deepEqual(signCatalog(vectorPayload, privateKey, keys), vectorEnvelope);
  assert.deepEqual(verifyCatalogEnvelope(vectorEnvelope, keys), vectorPayload);
});

test('the build derives manifest fields, pins every artifact and stamps the issue time', async () => {
  const entries = [
    { version: '1.0.0', built: artifact('1.0.0'), withdrawn: { reason: 'Replaced.', at: '2026-10-01T00:00:00.000Z' } },
    { version: '1.1.0', built: artifact('1.1.0', ['ui.route', 'ui.lobby', 'media.images']), notes: 'Adds images.' },
  ];
  const now = new Date('2026-10-20T08:30:15.750Z');
  const payload = await buildCatalogPayload(sampleSource(entries), { now, fetchArtifact: servedBy(entries) });
  assert.equal(payload.revision, Math.floor(now.getTime() / 1000));
  assert.equal(payload.issuedAt, '2026-10-20T08:30:15.000Z');
  assert.equal(Date.parse(payload.expiresAt) - Date.parse(payload.issuedAt), CATALOG_TTL_MS);
  const [app] = payload.apps;
  assert.deepEqual({ id: app.id, displayName: app.displayName, description: app.description, icon: app.icon, channels: app.channels },
    { id: 'cats.sample', displayName: 'Sample', description: 'A sample App', icon: 'star', channels: { stable: '1.1.0' } });
  assert.deepEqual(app.versions.map((version) => [version.version, version.notes, version.withdrawn?.reason ?? null]),
    [['1.0.0', '', 'Replaced.'], ['1.1.0', 'Adds images.', null]]);
  assert.deepEqual(app.versions[1].permissions, ['ui.route', 'ui.lobby', 'media.images']);
  assert.deepEqual(app.versions[1].compatibility, { catsPlatform: '^0.6.0', appSdk: '^1.2.0' });
  assert.deepEqual(Object.keys(app.versions[1]), ['version', 'artifact', 'compatibility', 'permissions', 'publisher', 'notes']);
  // The same inputs and issue time produce the same signed bytes.
  const again = await buildCatalogPayload(sampleSource(entries), { now, fetchArtifact: servedBy(entries) });
  assert.equal(JSON.stringify(again), JSON.stringify(payload));
});

test('the build rejects an artifact that does not match its pin', async () => {
  const good = { version: '1.0.0', built: artifact('1.0.0') };
  const other = artifact('1.0.0', ['ui.route']);
  await assert.rejects(buildCatalogPayload(sampleSource([good]), { fetchArtifact: async () => other.bytes }), /SHA-256|size/);
  const source = sampleSource([good]);
  source.apps[0].id = 'cats.other';
  await assert.rejects(buildCatalogPayload(source, { fetchArtifact: servedBy([good]) }), /identity\/version mismatch/);
});

test('the source is strict about versions, channels and release URLs', () => {
  const entry = (version) => ({ version, artifact: { url: releaseUrl('sample', version), size: 10, sha256: 'a'.repeat(64) } });
  const source = (app) => ({ schemaVersion: 1, publisher, apps: [{ id: 'cats.sample', channels: { stable: '1.0.0' }, versions: [entry('1.0.0')], ...app }] });
  assert.equal(validateCatalogSource(source({})).apps[0].versions[0].notes, '');
  const rejected = [
    [{ versions: [entry('1.0.0'), entry('1.0.0')] }, /duplicates 1\.0\.0/],
    [{ channels: { stable: '2.0.0' } }, /unlisted version/],
    [{ channels: { stable: '1.0.0', beta: '1.0.0' } }, /unknown field beta/],
    [{ versions: [{ ...entry('1.0.0'), withdrawn: { reason: 'Broken.', at: '2026-10-01T00:00:00.000Z' } }] }, /withdrawn version/],
    [{ versions: [{ ...entry('1.0.0'), artifact: { ...entry('1.0.0').artifact, url: releaseUrl('sample', '1.0.1') } }] }, /release asset/],
    [{ versions: [{ ...entry('1.0.0'), artifact: { ...entry('1.0.0').artifact, url: 'https://github.com/cats-inc/cats-apps/releases/download/latest/sample-1.0.0.catsapp' } }] }, /release asset/],
    [{ versions: [{ ...entry('1.0.0'), artifact: { ...entry('1.0.0').artifact, url: 'https://example.com/sample-v1.0.0/sample-1.0.0.catsapp' } }] }, /release asset/],
    [{ versions: [{ ...entry('1.0.0'), artifact: { ...entry('1.0.0').artifact, sha256: 'A'.repeat(64) } }] }, /SHA-256/],
    [{ versions: [{ ...entry('1.0.0'), extra: true }] }, /unknown field extra/],
    [{ id: 'Cats.Sample' }, /valid App ID/],
  ];
  for (const [app, message] of rejected) assert.throws(() => validateCatalogSource(source(app)), message);
});

test('signatures fail closed for tampering, unknown keys and other algorithms', () => {
  const { privateKey, keys } = ephemeralKey();
  const envelope = signCatalog(vectorPayload, privateKey, keys);
  assert.deepEqual(verifyCatalogEnvelope(envelope, keys), vectorPayload);
  const tampered = Buffer.from(JSON.stringify({ ...vectorPayload, revision: vectorPayload.revision + 1 })).toString('base64');
  assert.throws(() => verifyCatalogEnvelope({ ...envelope, payload: tampered }, keys), /signature is invalid/);
  assert.throws(() => verifyCatalogEnvelope({ ...envelope, keyId: 'missing' }, keys), /Unknown catalog signing key/);
  assert.throws(() => verifyCatalogEnvelope({ ...envelope, algorithm: 'rsa' }, keys), /Unsupported/);
  assert.throws(() => verifyCatalogEnvelope({ ...envelope, extra: 1 }, keys), /unknown field extra/);
  assert.throws(() => verifyCatalogEnvelope(envelope, ephemeralKey().keys.map((key) => ({ ...key, keyId: 'ephemeral' }))), /signature is invalid/);
  // A secret that matches no committed public key never produces a catalog.
  assert.throws(() => signCatalog(vectorPayload, ephemeralKey().privateKey, keys), /matches no public key/);
});

test('the build writes a verifiable catalog at the published path and needs the secret', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'catalog-build-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const outputDir = path.join(dir, 'site');
  assert.deepEqual(parseArgs(['--output-dir', outputDir, '--dry-run']), { outputDir, dryRun: true });
  assert.throws(() => parseArgs(['--output']), /Invalid argument/);
  const entries = [{ version: '1.0.0', built: artifact('1.0.0') }];
  const sourcePath = path.join(dir, 'apps.json');
  const keysPath = path.join(dir, 'signing-keys.json');
  const { privateKey, keys } = ephemeralKey();
  await writeFile(sourcePath, JSON.stringify(sampleSource(entries)));
  await writeFile(keysPath, JSON.stringify({ schemaVersion: 1, keys }));
  const options = { outputDir, sourcePath, keysPath, fetchArtifact: servedBy(entries) };
  await assert.rejects(buildCatalog({ ...options, signingKey: '' }), /CATALOG_SIGNING_KEY is not set/);
  const pem = privateKey.export({ format: 'pem', type: 'pkcs8' });
  const { catalogPath, payload } = await buildCatalog({ ...options, signingKey: pem });
  assert.equal(path.relative(outputDir, catalogPath).split(path.sep).join('/'), 'catalog/v1/catalog.json');
  assert.deepEqual(verifyCatalogEnvelope(JSON.parse(await readFile(catalogPath, 'utf8')), keys), payload);
  assert.equal((await buildCatalog({ ...options, signingKey: '', dryRun: true })).payload.apps[0].id, 'cats.sample');
});

test('the committed catalog source and key list are well formed', async () => {
  const committed = validateCatalogSource(await readJson('../catalog/apps.json'));
  assert.deepEqual(committed.apps.map((app) => app.id), ['cats.usage', 'cats.studio']);
  const { keys } = await readJson('../catalog/signing-keys.json');
  for (const key of keys) {
    assert.equal(key.algorithm, 'ed25519');
    assert.match(key.publicKey, /^[A-Za-z0-9_-]{43}$/);
    assert.notEqual(key.publicKey, vectorKey.publicKey, 'The test-only vector key must never be trusted.');
  }
});

test('the key script stores the secret before publishing its public key', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'catalog-key-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const keysPath = path.join(dir, 'signing-keys.json');
  await writeFile(keysPath, JSON.stringify({ schemaVersion: 1, keys: [] }));
  await assert.rejects(createAndStoreCatalogKey('rotated-key', { keysPath, storeSecret: async () => { throw new Error('gh failed'); } }), /gh failed/);
  assert.deepEqual(JSON.parse(await readFile(keysPath, 'utf8')).keys, []);
  let secret = '';
  const entry = await createAndStoreCatalogKey('rotated-key', { keysPath, storeSecret: async (value) => { secret = value; } });
  assert.match(secret, /^-----BEGIN PRIVATE KEY-----/);
  assert.deepEqual(JSON.parse(await readFile(keysPath, 'utf8')).keys, [entry]);
  const envelope = signCatalog(vectorPayload, secret, [entry]);
  assert.equal(envelope.keyId, 'rotated-key');
  await assert.rejects(createAndStoreCatalogKey('rotated-key', { keysPath, storeSecret: async () => {} }), /already exists/);
  await assert.rejects(createAndStoreCatalogKey('No', { keysPath, storeSecret: async () => {} }), /Key ID must be/);
});
