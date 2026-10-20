#!/usr/bin/env node
// Build and sign the official App catalog. Usage: node scripts/build-catalog.mjs [--output-dir site] [--dry-run]
// Reads catalog/apps.json, downloads every listed artifact to verify it and derive its
// manifest fields, signs the payload with CATALOG_SIGNING_KEY (PKCS#8 PEM) and writes
// <output-dir>/catalog/v1/catalog.json. --dry-run verifies and prints the payload unsigned.
import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeAppPackage } from '@cats-inc/cats-platform/app-sdk';

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), '..');

export const CATALOG_SCHEMA_VERSION = 1;
export const CATALOG_PUBLISHED_PATH = 'catalog/v1/catalog.json';
export const MAX_PAYLOAD_BYTES = 256 * 1024;
export const MAX_ARTIFACT_BYTES = 8 * 1024 * 1024;
export const CATALOG_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_APPS = 64;
const MAX_VERSIONS = 32;
const APP_ID = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const SHA256 = /^[a-f0-9]{64}$/;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
// An immutable `<slug>-vX.Y.Z` release asset named `<slug>-X.Y.Z.catsapp` in this repository.
const ARTIFACT_URL = /^https:\/\/github\.com\/cats-inc\/cats-apps\/releases\/download\/([a-z][a-z0-9-]*)-v(\d+\.\d+\.\d+)\/([a-z][a-z0-9-]*)-(\d+\.\d+\.\d+)\.catsapp$/;

function fail(path, message) { throw new Error(`${path}: ${message}`); }
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function assertKeys(value, path, required, optional = []) {
  if (!isObject(value)) fail(path, 'must be an object.');
  for (const key of required) if (!(key in value)) fail(path, `missing ${key}.`);
  for (const key of Object.keys(value)) if (!required.includes(key) && !optional.includes(key)) fail(path, `unknown field ${key}.`);
}
function text(value, path, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(path, `must be a non-empty string of at most ${max} characters.`);
  return value;
}
function isoDate(value, path) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) fail(path, 'must be an ISO 8601 UTC timestamp.');
  return value;
}
function publisher(value, path) {
  assertKeys(value, path, ['name'], ['homepage']);
  const result = { name: text(value.name, `${path}.name`, 200) };
  if (value.homepage !== undefined) {
    if (typeof value.homepage !== 'string' || !value.homepage.startsWith('https://')) fail(`${path}.homepage`, 'must be an https URL.');
    result.homepage = value.homepage;
  }
  return result;
}

// Validate the promoted source that pull requests edit and return it normalized.
export function validateCatalogSource(source) {
  assertKeys(source, 'source', ['schemaVersion', 'publisher', 'apps']);
  if (source.schemaVersion !== CATALOG_SCHEMA_VERSION) fail('source.schemaVersion', `must be ${CATALOG_SCHEMA_VERSION}.`);
  if (!Array.isArray(source.apps) || !source.apps.length || source.apps.length > MAX_APPS) fail('source.apps', `must list 1-${MAX_APPS} Apps.`);
  const ids = new Set();
  const apps = source.apps.map((app, appIndex) => {
    const path = `source.apps[${appIndex}]`;
    assertKeys(app, path, ['id', 'channels', 'versions']);
    if (typeof app.id !== 'string' || !APP_ID.test(app.id) || app.id.length > 100) fail(`${path}.id`, 'is not a valid App ID.');
    if (ids.has(app.id)) fail(`${path}.id`, `duplicates ${app.id}.`);
    ids.add(app.id);
    if (!Array.isArray(app.versions) || !app.versions.length || app.versions.length > MAX_VERSIONS) fail(`${path}.versions`, `must list 1-${MAX_VERSIONS} versions.`);
    const versions = new Map();
    for (const [versionIndex, entry] of app.versions.entries()) {
      const at = `${path}.versions[${versionIndex}]`;
      assertKeys(entry, at, ['version', 'artifact'], ['notes', 'withdrawn']);
      if (typeof entry.version !== 'string' || !VERSION.test(entry.version)) fail(`${at}.version`, 'must be an exact X.Y.Z version.');
      if (versions.has(entry.version)) fail(`${at}.version`, `duplicates ${entry.version}.`);
      assertKeys(entry.artifact, `${at}.artifact`, ['url', 'size', 'sha256']);
      const match = ARTIFACT_URL.exec(entry.artifact.url ?? '');
      if (!match || match[1] !== match[3] || match[2] !== entry.version || match[4] !== entry.version) {
        fail(`${at}.artifact.url`, 'must be this repository\'s <slug>-vX.Y.Z release asset <slug>-X.Y.Z.catsapp for this version.');
      }
      if (!Number.isSafeInteger(entry.artifact.size) || entry.artifact.size < 1 || entry.artifact.size > MAX_ARTIFACT_BYTES) fail(`${at}.artifact.size`, `must be 1-${MAX_ARTIFACT_BYTES} bytes.`);
      if (typeof entry.artifact.sha256 !== 'string' || !SHA256.test(entry.artifact.sha256)) fail(`${at}.artifact.sha256`, 'must be a lowercase SHA-256.');
      const normalized = { version: entry.version, artifact: { url: entry.artifact.url, size: entry.artifact.size, sha256: entry.artifact.sha256 },
        notes: entry.notes === undefined ? '' : text(entry.notes, `${at}.notes`, 2000) };
      if (entry.withdrawn !== undefined) {
        assertKeys(entry.withdrawn, `${at}.withdrawn`, ['reason', 'at']);
        normalized.withdrawn = { reason: text(entry.withdrawn.reason, `${at}.withdrawn.reason`, 500), at: isoDate(entry.withdrawn.at, `${at}.withdrawn.at`) };
      }
      versions.set(entry.version, normalized);
    }
    assertKeys(app.channels, `${path}.channels`, ['stable'], ['preview']);
    const channels = {};
    for (const channel of ['stable', 'preview']) {
      const selected = app.channels[channel];
      if (selected === undefined) continue;
      if (!versions.has(selected)) fail(`${path}.channels.${channel}`, `selects unlisted version ${selected}.`);
      if (versions.get(selected).withdrawn) fail(`${path}.channels.${channel}`, `selects withdrawn version ${selected}.`);
      channels[channel] = selected;
    }
    return { id: app.id, channels, versions: [...versions.values()] };
  });
  return { schemaVersion: CATALOG_SCHEMA_VERSION, publisher: publisher(source.publisher, 'source.publisher'), apps };
}

export async function downloadArtifact(url, size) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}: ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length !== size) throw new Error(`Artifact size ${bytes.length} does not match the catalog's ${size}: ${url}`);
  return bytes;
}

function manifestFields(manifest) {
  return {
    displayName: manifest.displayName,
    description: manifest.description ?? '',
    icon: manifest.contributions?.lobbyApps?.[0]?.icon ?? null,
    compatibility: { catsPlatform: manifest.compatibility.catsPlatform, appSdk: manifest.compatibility.appSdk },
    permissions: [...manifest.permissions],
    publisher: publisher(manifest.publisher, `${manifest.id}@${manifest.version}.publisher`),
  };
}

// Verify every artifact against its pin and build the payload field by field, so the
// signed bytes depend only on the source, the artifacts and the issue time.
export async function buildCatalogPayload(source, { now = new Date(), fetchArtifact = downloadArtifact } = {}) {
  const catalog = validateCatalogSource(source);
  const issued = Math.floor(now.getTime() / 1000) * 1000;
  const apps = [];
  for (const app of catalog.apps) {
    const versions = [];
    let current;
    for (const entry of app.versions) {
      const bytes = await fetchArtifact(entry.artifact.url, entry.artifact.size);
      if (bytes.length !== entry.artifact.size) throw new Error(`${app.id}@${entry.version}: artifact size does not match the catalog.`);
      const { manifest } = decodeAppPackage(bytes, { id: app.id, version: entry.version, sha256: entry.artifact.sha256 });
      const fields = manifestFields(manifest);
      if (entry.version === app.channels.stable) current = fields;
      versions.push({
        version: entry.version,
        artifact: entry.artifact,
        compatibility: fields.compatibility,
        permissions: fields.permissions,
        publisher: fields.publisher,
        notes: entry.notes,
        ...(entry.withdrawn ? { withdrawn: entry.withdrawn } : {}),
      });
    }
    apps.push({ id: app.id, displayName: current.displayName, description: current.description, icon: current.icon, channels: app.channels, versions });
  }
  return {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    revision: issued / 1000,
    issuedAt: new Date(issued).toISOString(),
    expiresAt: new Date(issued + CATALOG_TTL_MS).toISOString(),
    publisher: catalog.publisher,
    apps,
  };
}

function publicKeyObject(entry) {
  return createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: entry.publicKey }, format: 'jwk' });
}

// Sign the exact payload bytes. The key must match a committed public key, so a
// rotated or mistyped secret fails here instead of publishing an unverifiable catalog.
export function signCatalog(payload, privateKey, keys) {
  const key = typeof privateKey === 'string' ? createPrivateKey(privateKey) : privateKey;
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('The catalog signing key must be Ed25519.');
  const publicKey = createPublicKey(key).export({ format: 'jwk' }).x;
  const entry = keys.find((candidate) => candidate.algorithm === 'ed25519' && candidate.publicKey === publicKey);
  if (!entry) throw new Error('The signing key matches no public key in catalog/signing-keys.json.');
  const bytes = Buffer.from(JSON.stringify(payload), 'utf8');
  if (bytes.length > MAX_PAYLOAD_BYTES) throw new Error(`Catalog payload exceeds ${MAX_PAYLOAD_BYTES} bytes.`);
  return { algorithm: 'ed25519', keyId: entry.keyId, payload: bytes.toString('base64'), signature: sign(null, bytes, key).toString('base64') };
}

// Check a signature before trusting any payload content; returns the parsed payload.
export function verifyCatalogEnvelope(envelope, keys) {
  assertKeys(envelope, 'envelope', ['algorithm', 'keyId', 'payload', 'signature']);
  if (envelope.algorithm !== 'ed25519') throw new Error('Unsupported catalog signature algorithm.');
  const entry = keys.find((candidate) => candidate.keyId === envelope.keyId && candidate.algorithm === 'ed25519');
  if (!entry) throw new Error(`Unknown catalog signing key: ${envelope.keyId}`);
  if (typeof envelope.payload !== 'string' || !BASE64.test(envelope.payload) || envelope.payload.length > Math.ceil(MAX_PAYLOAD_BYTES / 3) * 4) {
    throw new Error('Catalog payload is not bounded base64.');
  }
  if (typeof envelope.signature !== 'string' || !BASE64.test(envelope.signature)) throw new Error('Catalog signature is not base64.');
  const bytes = Buffer.from(envelope.payload, 'base64');
  const signature = Buffer.from(envelope.signature, 'base64');
  if (signature.length !== 64 || !verify(null, bytes, publicKeyObject(entry), signature)) throw new Error('Catalog signature is invalid.');
  return JSON.parse(bytes.toString('utf8'));
}

export function parseArgs(argv) {
  const options = { outputDir: resolve(root, 'site'), dryRun: false };
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === '--dry-run') options.dryRun = true;
    else if (argv[index] === '--output-dir' && argv[index + 1] && !argv[index + 1].startsWith('--')) options.outputDir = resolve(argv[++index]);
    else throw new Error(`Invalid argument: ${argv[index]}`);
  }
  return options;
}

export async function buildCatalog({
  outputDir, dryRun = false, signingKey = process.env.CATALOG_SIGNING_KEY, now = new Date(), fetchArtifact,
  sourcePath = join(root, 'catalog/apps.json'), keysPath = join(root, 'catalog/signing-keys.json'),
} = {}) {
  const source = JSON.parse(await readFile(sourcePath, 'utf8'));
  const payload = await buildCatalogPayload(source, { now, fetchArtifact });
  if (dryRun) return { payload };
  if (!signingKey?.trim()) throw new Error('CATALOG_SIGNING_KEY is not set. Store the Ed25519 key as that repository secret with scripts/new-catalog-key.mjs.');
  const { keys } = JSON.parse(await readFile(keysPath, 'utf8'));
  const envelope = signCatalog(payload, signingKey, keys);
  verifyCatalogEnvelope(envelope, keys);
  const catalogPath = join(outputDir, CATALOG_PUBLISHED_PATH);
  await mkdir(dirname(catalogPath), { recursive: true });
  await writeFile(catalogPath, `${JSON.stringify(envelope, null, 2)}\n`);
  return { payload, envelope, catalogPath };
}

if (resolve(process.argv[1] ?? '') === scriptPath) {
  if (process.argv.includes('--help')) process.stdout.write('Usage: node scripts/build-catalog.mjs [--output-dir site] [--dry-run]\n');
  else {
    buildCatalog(parseArgs(process.argv.slice(2))).then(({ payload, envelope, catalogPath }) => {
      const summary = { revision: payload.revision, expiresAt: payload.expiresAt, keyId: envelope?.keyId ?? null, catalogPath: catalogPath ?? null,
        apps: payload.apps.map((app) => `${app.id}@${app.channels.stable}`) };
      process.stdout.write(`${JSON.stringify(envelope ? summary : payload, null, 2)}\n`);
    }).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
  }
}
