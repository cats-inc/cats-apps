#!/usr/bin/env node
/**
 * Check Cats Apps workspace metadata and local Markdown link targets.
 *
 * Usage: node scripts/check-docs.mjs
 * No network access, dependency installation, or application execution is performed.
 * Sibling-repository links are checked only when that checkout is available.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const ignoredDirectories = new Set(['node_modules', 'build', 'dist', 'coverage']);
const ignoredFiles = new Set(['CLAUDE.md', 'GEMINI.md', '000-template.md']);
const failures = [];
const manifest = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
if (manifest.name !== '@cats-inc/cats-apps' || manifest.private !== true) {
  failures.push('The root must remain the private @cats-inc/cats-apps workspace.');
}
for (const workspace of ['apps/*', 'packages/*']) {
  if (!manifest.workspaces?.includes(workspace)) {
    failures.push('Missing workspace declaration: ' + workspace);
  }
}

function collectMarkdown(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.isSymbolicLink()) return [];
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : collectMarkdown(target);
    }
    return entry.name.endsWith('.md') && !ignoredFiles.has(entry.name) ? [target] : [];
  });
}

let checkedLinks = 0;
let skippedSiblingLinks = 0;
const markdownFiles = collectMarkdown(projectRoot);
for (const file of markdownFiles) {
  const markdown = readFileSync(file, 'utf8')
    .replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '');
  const links = markdown.matchAll(/\[[^\]\n]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g);
  for (const match of links) {
    const rawTarget = match[1].replace(/^<|>$/g, '');
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(rawTarget)) continue;
    const fileTarget = rawTarget.split(/[?#]/, 1)[0];
    if (!fileTarget) continue;
    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(fileTarget);
    } catch {
      failures.push(path.relative(projectRoot, file) + ': malformed link ' + rawTarget);
      continue;
    }
    const resolved = path.resolve(path.dirname(file), decodedTarget);
    const relative = path.relative(projectRoot, resolved);
    if (relative === '..' || relative.startsWith('..' + path.sep)) {
      const siblingRelative = path.relative(path.dirname(projectRoot), resolved);
      const siblingName = siblingRelative.split(path.sep)[0];
      if (siblingName.startsWith('cats-')
          && !existsSync(path.join(path.dirname(projectRoot), siblingName))) {
        skippedSiblingLinks += 1;
        continue;
      }
    }
    checkedLinks += 1;
    if (!existsSync(resolved)) {
      failures.push(path.relative(projectRoot, file) + ': missing target ' + rawTarget);
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(failure + '\n');
  process.exitCode = 1;
} else {
  process.stdout.write('Documentation check passed: ' + markdownFiles.length
    + ' Markdown files, ' + checkedLinks + ' local targets, '
    + skippedSiblingLinks + ' unavailable sibling links skipped.\n');
  process.stdout.write('Application builds, tests, and installed rendering are not covered.\n');
}
