import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import test from 'node:test';

// CI skips App tests and the package build when a change touches only docs/ and
// the root agent instruction files (AGENTS.md, CLAUDE.md, CODEX.md, GEMINI.md),
// so no test, script or App source may read repository documentation or those
// files' content. Checking that an agent file exists is allowed: deleting one
// still runs every check. scripts/check-docs.mjs is the exception by design: it
// checks Markdown links and still runs for docs-only changes.
const repoRoot = process.cwd();
const sourceFile = /\.(?:[cm]?js|[cm]?ts|tsx)$/;
// A quoted path that starts at docs/, or a 'docs' segment passed to join/resolve.
const docsPath = /['"`](?:\.{1,2}\/)*docs\/|['"`]docs['"`]\s*[,)]/;
// A quoted root agent file name, such as 'AGENTS.md' or '../CLAUDE.md'.
const agentFile = /['"`](?:\.{1,2}\/)*(?:AGENTS|CLAUDE|CODEX|GEMINI)\.md['"`]/;
// A line that only asks whether a file exists, without opening or reading one.
const existenceCheck = /\b(?:existsSync|access(?:Sync)?|l?stat(?:Sync)?)\s*\(/;
const fileRead = /\b(?:read\w*|createReadStream|open(?:Sync)?|import)\s*\(/;
// A single line that names docs/ or an agent file without reading it carries a
// trailing `docs-boundary-ignore: <reason>` comment.
const ignoreMarker = /docs-boundary-ignore: \S/;
const skippedDirectories = new Set(['node_modules', 'build', 'dist', 'coverage']);

function violates(line) {
  if (ignoreMarker.test(line)) return false;
  if (docsPath.test(line)) return true;
  return agentFile.test(line) && !(existenceCheck.test(line) && !fileRead.test(line));
}

function listSources(directory) {
  let entries;
  try { entries = readdirSync(directory, { withFileTypes: true }); } catch { return []; }
  return entries.flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return skippedDirectories.has(entry.name) ? [] : listSources(path);
    return sourceFile.test(entry.name) ? [path] : [];
  });
}

test('the boundary flags reads of root agent files but not existence checks or nested files', () => {
  for (const line of [
    "const text = readFileSync(join(repoRoot, 'AGENTS.md'), 'utf8');",
    'const rules = await readFile("../CLAUDE.md", "utf8");',
    "const guide = readFileSync('docs/testing.md', 'utf8');",
    "if (existsSync('CODEX.md')) source = readFileSync('CODEX.md');",
    "files.push('GEMINI.md');",
  ]) assert.equal(violates(line), true, line);
  for (const line of [
    "assert.ok(existsSync(join(repoRoot, 'AGENTS.md')));",
    "const present = statSync('CLAUDE.md').isFile();",
    "const nested = join(appDirectory, 'apps/usage/AGENTS.md');",
    "write('AGENTS.md', 'edited'); // docs-boundary-ignore: a scratch repository path",
  ]) assert.equal(violates(line), false, line);
});

test('tests, scripts and App sources stay independent of repository docs and agent files', () => {
  const violations = ['tests', 'scripts', 'apps', 'packages']
    .flatMap((root) => listSources(join(repoRoot, root)))
    .map((path) => relative(repoRoot, path).split(sep).join('/'))
    .filter((path) => path !== 'tests/docs-boundary.test.mjs' && path !== 'scripts/check-docs.mjs')
    .flatMap((path) => readFileSync(join(repoRoot, path), 'utf8').split(/\r?\n/)
      .map((line, index) => ({ line, at: `${path}:${index + 1}` }))
      .filter(({ line }) => violates(line))
      .map(({ at, line }) => `${at}: ${line.trim()}`));
  assert.deepEqual(violations, [], 'Keep executable inputs outside docs/ and the root agent files.');
});
