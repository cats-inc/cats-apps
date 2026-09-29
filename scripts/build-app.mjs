#!/usr/bin/env node
// Build an immutable utility artifact. Usage: node scripts/build-app.mjs --app usage [--version 0.1.0] [--output-dir dist]
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_SDK_VERSION, encodeAppPackage, supportsVersion, validateRendererAppPackage } from '@cats-inc/cats-platform/app-sdk';

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), '..');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
// The pinned Platform devDependency supplies the official encoder and the installer's own validation.
const { version: SDK_PLATFORM_VERSION } = createRequire(import.meta.url)('@cats-inc/cats-platform/package.json');

// Lowest version a declared range accepts, in the host grammar: X.Y.Z, ^X.Y.Z, X.Y.x and X.x.
export function minimumVersion(range) {
  const match = /^\^?(\d+)\.(\d+)\.(\d+)$/.exec(range) ?? /^(\d+)\.(?:(\d+)\.)?x$/.exec(range);
  const floor = match && [match[1], match[2] ?? '0', match[3] ?? '0'].join('.');
  if (!floor || !supportsVersion(floor, range)) throw new Error(`Unsupported compatibility range: ${range}`);
  return floor;
}

// Validate against the declared floor, and against the SDK's own host version when the
// declared ranges accept it; an App may still target an older host line. A floor older
// than the first SDK release is checked with the pinned release's rules.
export function validateHosts(bytes, compatibility) {
  const hosts = [{ platformVersion: minimumVersion(compatibility.catsPlatform), appSdkVersion: minimumVersion(compatibility.appSdk) }];
  if (supportsVersion(SDK_PLATFORM_VERSION, compatibility.catsPlatform) && supportsVersion(APP_SDK_VERSION, compatibility.appSdk)
    && (hosts[0].platformVersion !== SDK_PLATFORM_VERSION || hosts[0].appSdkVersion !== APP_SDK_VERSION)) {
    hosts.push({ platformVersion: SDK_PLATFORM_VERSION, appSdkVersion: APP_SDK_VERSION });
  }
  for (const host of hosts) validateRendererAppPackage(bytes, host);
  return hosts;
}

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
  let html = template.replace('/* APP_STYLES */', css).replace('/* APP_SCRIPT */', () => script);
  const assets = {};
  for (const match of html.matchAll(/\{\{APP_ASSET:([^}]+)\}\}/g)) {
    const name = match[1];
    if (!/^[a-z0-9-]+\.(jpg|png|webp)$/.test(name)) throw new Error('Invalid inline image asset.');
    if (assets[name]) continue;
    const bytes = await readFile(join(appRoot, 'assets', name));
    if (bytes.length > 2 * 1024 * 1024) throw new Error('Inline image asset exceeds 2 MiB.');
    assets[name] = hash(bytes);
    const type = name.endsWith('.jpg') ? 'jpeg' : name.split('.').at(-1);
    html = html.replaceAll(match[0], `data:image/${type};base64,${bytes.toString('base64')}`);
  }
  const license = await readFile(join(root, 'LICENSE'));
  const bytes = encodeAppPackage({ manifest,
    files: [{ path: 'LICENSE', data: license }, { path: manifest.entrypoints.renderer, data: Buffer.from(html) }] });
  const hosts = validateHosts(bytes, manifest.compatibility);
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
    sourceDigest: hash(Buffer.from(JSON.stringify({ manifest, pkg, template, css, model, renderer, license: license.toString('utf8'), ...(Object.keys(assets).length ? { assets } : {}) }))),
    sourceScope: 'app-inputs-and-license',
    builtWith: { package: '@cats-inc/cats-platform', version: SDK_PLATFORM_VERSION, appSdk: APP_SDK_VERSION },
    validatedHosts: hosts,
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
