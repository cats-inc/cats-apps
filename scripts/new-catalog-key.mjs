#!/usr/bin/env node
// Create an App catalog signing key. Usage:
//   node scripts/new-catalog-key.mjs --key-id cats-apps-catalog-2027-01 [--secret-name NAME]
// The private key goes straight to `gh secret set <secret-name>` on its stdin and is never
// printed or written to disk. Only after gh succeeds is the public key appended to
// catalog/signing-keys.json, for the publish workflow and Platform's trust root.
// The first key is stored as CATALOG_SIGNING_KEY; later keys default to a name derived from
// their key ID. An existing secret is never overwritten, so a rotation can never replace
// the key that is currently signing.
import { spawn } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), '..');
export const KEY_ID_PATTERN = /^[a-z0-9][a-z0-9.-]{2,63}$/;
export const SECRET_NAME_PATTERN = /^[A-Z][A-Z0-9_]{0,99}$/;
export const DEFAULT_SECRET_NAME = 'CATALOG_SIGNING_KEY';

export function secretNameForKey(keyId) {
  return `${DEFAULT_SECRET_NAME}_${keyId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}
const REPOSITORY = 'cats-inc/cats-apps';

export function createCatalogKey(keyId) {
  if (!KEY_ID_PATTERN.test(keyId ?? '')) throw new Error('Key ID must be 3-64 lowercase letters, digits, dots or hyphens.');
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return {
    entry: { keyId, algorithm: 'ed25519', publicKey: publicKey.export({ format: 'jwk' }).x },
    privateKeyPem: privateKey.export({ format: 'pem', type: 'pkcs8' }),
  };
}

export async function appendPublicKey(keysPath, entry) {
  const keys = JSON.parse(await readFile(keysPath, 'utf8'));
  if (keys.keys.some((key) => key.keyId === entry.keyId)) throw new Error(`Key ID already exists: ${entry.keyId}`);
  keys.keys.push(entry);
  await writeFile(keysPath, `${JSON.stringify(keys, null, 2)}\n`);
}

function listRepositorySecrets() {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('gh', ['secret', 'list', '-R', REPOSITORY, '--json', 'name', '--jq', '.[].name'], { stdio: ['ignore', 'pipe', 'inherit'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0
      ? resolvePromise(output.split(/\r?\n/).filter(Boolean))
      : reject(new Error(`gh secret list exited with ${code}.`))));
  });
}

function setRepositorySecret(secretName, value) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('gh', ['secret', 'set', secretName, '-R', REPOSITORY], { stdio: ['pipe', 'ignore', 'inherit'] });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolvePromise() : reject(new Error(`gh secret set exited with ${code}.`))));
    child.stdin.end(value);
  });
}

export async function createAndStoreCatalogKey(keyId, {
  secretName,
  keysPath = resolve(root, 'catalog/signing-keys.json'),
  listSecrets = listRepositorySecrets,
  storeSecret = setRepositorySecret,
} = {}) {
  const keys = JSON.parse(await readFile(keysPath, 'utf8'));
  if (keys.keys.some((key) => key.keyId === keyId)) throw new Error(`Key ID already exists: ${keyId}`);
  const { entry, privateKeyPem } = createCatalogKey(keyId);
  const name = secretName ?? (keys.keys.length ? secretNameForKey(keyId) : DEFAULT_SECRET_NAME);
  if (!SECRET_NAME_PATTERN.test(name)) throw new Error('Secret name must be uppercase letters, digits or underscores.');
  if ((await listSecrets()).includes(name)) throw new Error(`Secret ${name} already exists; choose a new name so the signing key is not replaced.`);
  await storeSecret(name, privateKeyPem);
  try {
    await appendPublicKey(keysPath, entry);
  } catch (error) {
    // The secret is already stored; keep its public half recoverable.
    throw new Error(`${error.message} The secret ${name} was stored; add this public key by hand: ${JSON.stringify(entry)}`);
  }
  return { entry, secretName: name };
}

export function parseKeyArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    const key = { '--key-id': 'keyId', '--secret-name': 'secretName' }[argv[index]];
    if (!key || !argv[index + 1] || argv[index + 1].startsWith('--')) throw new Error(`Invalid argument: ${argv[index]}`);
    options[key] = argv[++index];
  }
  if (!options.keyId) throw new Error('Missing --key-id.');
  return options;
}

if (resolve(process.argv[1] ?? '') === scriptPath) {
  const usage = 'Usage: node scripts/new-catalog-key.mjs --key-id <id> [--secret-name NAME]\n';
  if (process.argv.includes('--help')) process.stdout.write(usage);
  else {
    Promise.resolve().then(() => parseKeyArgs(process.argv.slice(2))).then(({ keyId, secretName }) =>
      createAndStoreCatalogKey(keyId, { secretName }).then(({ entry, secretName: stored }) => {
        process.stdout.write(`Stored ${stored} in ${REPOSITORY} and added this public key to catalog/signing-keys.json:\n${JSON.stringify(entry, null, 2)}\n`);
      }))
      .catch((error) => { process.stderr.write(`${error.message}\n${error.message.startsWith('Invalid argument') || error.message.startsWith('Missing') ? usage : ''}`); process.exitCode = 1; });
  }
}
