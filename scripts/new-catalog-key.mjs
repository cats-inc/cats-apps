#!/usr/bin/env node
// Create the App catalog signing key. Usage: node scripts/new-catalog-key.mjs --key-id cats-apps-catalog-2026-10
// The private key goes straight to `gh secret set CATALOG_SIGNING_KEY` on its stdin and is
// never printed or written to disk. Only after gh succeeds is the public key appended to
// catalog/signing-keys.json, for the publish workflow and Platform's trust root.
import { spawn } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), '..');
export const KEY_ID_PATTERN = /^[a-z0-9][a-z0-9.-]{2,63}$/;
export const SECRET_NAME = 'CATALOG_SIGNING_KEY';
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

function setRepositorySecret(value) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('gh', ['secret', 'set', SECRET_NAME, '-R', REPOSITORY], { stdio: ['pipe', 'ignore', 'inherit'] });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolvePromise() : reject(new Error(`gh secret set exited with ${code}.`))));
    child.stdin.end(value);
  });
}

export async function createAndStoreCatalogKey(keyId, { keysPath = resolve(root, 'catalog/signing-keys.json'), storeSecret = setRepositorySecret } = {}) {
  const keys = JSON.parse(await readFile(keysPath, 'utf8'));
  if (keys.keys.some((key) => key.keyId === keyId)) throw new Error(`Key ID already exists: ${keyId}`);
  const { entry, privateKeyPem } = createCatalogKey(keyId);
  await storeSecret(privateKeyPem);
  await appendPublicKey(keysPath, entry);
  return entry;
}

if (resolve(process.argv[1] ?? '') === scriptPath) {
  const args = process.argv.slice(2);
  const keyId = args[0] === '--key-id' && args.length === 2 ? args[1] : undefined;
  if (args.includes('--help') || !keyId) {
    process.stdout.write('Usage: node scripts/new-catalog-key.mjs --key-id <id>\n');
    process.exitCode = args.includes('--help') ? 0 : 1;
  } else {
    createAndStoreCatalogKey(keyId).then((entry) => {
      process.stdout.write(`Stored ${SECRET_NAME} in ${REPOSITORY} and added this public key to catalog/signing-keys.json:\n${JSON.stringify(entry, null, 2)}\n`);
    }).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
  }
}
