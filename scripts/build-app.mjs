#!/usr/bin/env node
// Build an immutable utility artifact. Usage: node scripts/build-app.mjs --app usage [--version 0.1.0] [--output-dir dist]
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), '..');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function buildApp({ app = 'usage', version, outputDir = resolve(root, 'dist') } = {}) {
  if (!/^[a-z][a-z0-9-]*$/.test(app)) throw new Error('Invalid app slug.');
  const appRoot = join(root, 'apps', app);
  const manifest = JSON.parse(await readFile(join(appRoot, 'cats.app.json'), 'utf8'));
  const pkg = JSON.parse(await readFile(join(appRoot, 'package.json'), 'utf8'));
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version) || pkg.version !== manifest.version
    || (version && version !== manifest.version)) throw new Error('Requested, manifest, and package versions must match exactly.');
  const [template, css, model, renderer] = await Promise.all(['index.html', 'style.css', 'model.js', 'app.js']
    .map((file) => readFile(join(appRoot, 'src', file), 'utf8')));
  const script = `${model.replace(/^export /gm, '')}\n${renderer.replace(/^import .* from '\.\/model\.js';\s*$/m, '')}`;
  if (/<\/script/i.test(script) || /<\/style/i.test(css)) throw new Error('Inline renderer payload contains an unsafe closing tag.');
  const html = template.replace('/* APP_STYLES */', css).replace('/* APP_SCRIPT */', () => script);
  const license = await readFile(join(root, 'LICENSE'));
  const envelope = { schemaVersion: 1, kind: 'cats-app', manifest,
    files: [{ path: 'LICENSE', base64: license.toString('base64') }, { path: manifest.entrypoints.renderer, base64: Buffer.from(html).toString('base64') }] };
  const bytes = gzipSync(Buffer.from(JSON.stringify(envelope)), { level: 9 });
  const artifact = `${app}-${manifest.version}.catsapp`;
  const lock = { schemaVersion: 1, apps: [{ id: manifest.id, version: manifest.version, sha256: hash(bytes), artifact }] };
  await mkdir(outputDir, { recursive: true });
  // Repeat builds are idempotent. Never silently replace a version with different bytes.
  const artifactPath = join(outputDir, artifact);
  try {
    const existing = await readFile(artifactPath);
    if (!existing.equals(bytes)) throw new Error(`Artifact already exists with different content: ${artifact}. Choose a new version or a separate build output directory.`);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(artifactPath, bytes);
  const lockPath = join(outputDir, `${app}-${manifest.version}.lock.json`);
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  await writeFile(join(outputDir, `${app}-${manifest.version}.provenance.json`), `${JSON.stringify({
    ...lock.apps[0], repository: 'cats-inc/cats-apps',
    sourceRevision: process.env.GITHUB_REPOSITORY === 'cats-inc/cats-apps' && /^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA ?? '') ? process.env.GITHUB_SHA : null,
    sourceDigest: hash(Buffer.from(JSON.stringify({ manifest, pkg, template, css, model, renderer, license: license.toString('utf8') }))),
    sourceScope: 'app-inputs-and-license',
  }, null, 2)}\n`);
  return { artifactPath, lockPath, ...lock.apps[0] };
}

export function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    const key = { '--app': 'app', '--version': 'version', '--output-dir': 'outputDir' }[argv[index]];
    if (!key || !argv[index + 1] || argv[index + 1].startsWith('--')) throw new Error(`Invalid argument: ${argv[index]}`);
    options[key] = argv[++index];
  }
  if (options.outputDir) options.outputDir = resolve(options.outputDir);
  return options;
}

if (resolve(process.argv[1] ?? '') === scriptPath) {
  if (process.argv.includes('--help')) process.stdout.write('Usage: node scripts/build-app.mjs --app usage [--version 0.1.0] [--output-dir dist]\n');
  else buildApp(parseArgs(process.argv.slice(2))).then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
