import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import test from 'node:test';

// CI skips App tests and the package build when a change touches only docs/,
// so no test, script or App source may read repository documentation.
// scripts/check-docs.mjs is the exception by design: it checks Markdown links
// and still runs for docs-only changes.
const repoRoot = process.cwd();
const sourceFile = /\.(?:[cm]?js|[cm]?ts|tsx)$/;
// A quoted path that starts at docs/, or a 'docs' segment passed to join/resolve.
const docsPath = /['"`](?:\.{1,2}\/)*docs\/|['"`]docs['"`]\s*[,)]/;
// A single line that names docs/ without reading it carries a trailing
// `docs-boundary-ignore: <reason>` comment.
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

test('tests, scripts and App sources stay independent of repository docs', () => {
  const violations = ['tests', 'scripts', 'apps', 'packages']
    .flatMap((root) => listSources(join(repoRoot, root)))
    .map((path) => relative(repoRoot, path).split(sep).join('/'))
    .filter((path) => path !== 'tests/docs-boundary.test.mjs' && path !== 'scripts/check-docs.mjs')
    .flatMap((path) => readFileSync(join(repoRoot, path), 'utf8').split(/\r?\n/)
      .map((line, index) => ({ line, at: `${path}:${index + 1}` }))
      .filter(({ line }) => docsPath.test(line) && !ignoreMarker.test(line))
      .map(({ at, line }) => `${at}: ${line.trim()}`));
  assert.deepEqual(violations, [], 'Keep executable inputs outside docs/.');
});
