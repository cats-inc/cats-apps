import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import test from 'node:test';

// CI skips App tests and the package build when a change touches only docs/ or
// the root agent instructions (AGENTS.md, CLAUDE.md, CODEX.md, GEMINI.md), so no
// test, script or App source may read repository documentation or those files.
// scripts/check-docs.mjs is the exception by design: it walks and link-checks
// the Markdown and still runs for docs-only changes.
const repoRoot = process.cwd();
const sourceFile = /\.(?:[cm]?js|[cm]?ts|tsx)$/;
// A quoted path that starts at docs/, or a 'docs' segment passed to join/resolve.
const docsPath = /['"`](?:\.{1,2}\/)*docs\/|['"`]docs['"`]\s*[,)]/;
// A quoted root agent instruction file. Nested copies such as apps/x/AGENTS.md
// are ordinary files that CI tests.
const agentFile = /['"`](?:\.{1,2}\/)*(?:AGENTS|CLAUDE|CODEX|GEMINI)\.md['"`]/;
// Checking that a root agent file exists does not read it.
const existenceCheck = /\b(?:exists|l?stat|access)(?:Sync)?\(/;
const readsFile = /read/i;
// A single line that names docs/ or a root agent file without reading it
// carries a trailing `docs-boundary-ignore: <reason>` comment.
const ignoreMarker = /docs-boundary-ignore: \S/;
const skippedDirectories = new Set(['node_modules', 'build', 'dist', 'coverage']);

function listSources(directory) {
  let entries;
  try { entries = readdirSync(directory, { withFileTypes: true }); } catch { return []; }
  return entries.flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return skippedDirectories.has(entry.name) ? [] : listSources(path);
    return sourceFile.test(entry.name) ? [path] : [];
  });
}

function readsDocumentation(line) {
  if (ignoreMarker.test(line)) return false;
  if (docsPath.test(line)) return true;
  return agentFile.test(line) && !(existenceCheck.test(line) && !readsFile.test(line));
}

test('the guard covers root agent instructions but allows existence checks', () => {
  assert.ok(readsDocumentation("readFileSync('AGENTS.md', 'utf8');"));
  assert.ok(readsDocumentation("await readFile(path.join(root, 'CLAUDE.md'));"));
  assert.ok(readsDocumentation("readFileSync(`../GEMINI.md`);"));
  assert.ok(readsDocumentation("if (existsSync('CODEX.md')) readFileSync('CODEX.md');"));
  assert.ok(readsDocumentation("readFileSync(join(repoRoot, 'docs', 'testing.md'));"));
  assert.ok(!readsDocumentation("if (!existsSync(join(repoRoot, 'AGENTS.md'))) throw error;"));
  assert.ok(!readsDocumentation("const present = statSync('CLAUDE.md').isFile();"));
  assert.ok(!readsDocumentation("readFileSync(join(root, 'apps/x/AGENTS.md'));"));
  assert.ok(!readsDocumentation("seed(root, 'AGENTS.md'); // docs-boundary-ignore: scratch repository"));
});

test('tests, scripts and App sources stay independent of repository docs and agent files', () => {
  const violations = ['tests', 'scripts', 'apps', 'packages']
    .flatMap((root) => listSources(join(repoRoot, root)))
    .map((path) => relative(repoRoot, path).split(sep).join('/'))
    .filter((path) => path !== 'tests/docs-boundary.test.mjs')
    .flatMap((path) => readFileSync(join(repoRoot, path), 'utf8').split(/\r?\n/)
      .map((line, index) => ({ line, at: `${path}:${index + 1}` }))
      .filter(({ line }) => readsDocumentation(line))
      .map(({ at, line }) => `${at}: ${line.trim()}`));
  assert.deepEqual(violations, [],
    'Keep executable inputs outside docs/ and the root agent instructions.');
});
