import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import test from 'node:test';

// A push to main skips App tests only when its merged pull request already passed
// on the same tree, and a tagged release skips them only when main's checks passed
// on its commit. These tests run the workflows' own shell steps against a local
// origin and a stubbed gh. The repository has no YAML parser, so steps are read
// by indentation.
const ci = readFileSync('.github/workflows/ci.yaml', 'utf8');
const release = readFileSync('.github/workflows/release-app.yaml', 'utf8');
const bash = process.platform === 'win32'
  ? resolve(execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim(), '../../../bin/bash.exe')
  : 'bash';

function step(text, id) {
  const lines = text.split(/\r?\n/);
  const at = lines.findIndex((line) => line.trim() === `id: ${id}`);
  assert.notEqual(at, -1, `step ${id}`);
  const end = lines.findIndex((line, index) => index > at && /^\s*- /.test(line));
  const own = lines.slice(at, end === -1 ? lines.length : end);
  const condition = own.find((line) => line.trim().startsWith('if: '))?.trim().slice(4);
  const run = own.findIndex((line) => /^\s+run: \|$/.test(line));
  const indent = own[run].search(/\S/);
  const body = [];
  for (const line of own.slice(run + 1)) {
    if (line.trim() && line.search(/\S/) <= indent) break;
    body.push(line);
  }
  const margin = Math.min(...body.filter((line) => line.trim()).map((line) => line.search(/\S/)));
  return { condition, run: body.map((line) => line.slice(margin)).join('\n') };
}

function runStep(script, cwd, env) {
  const output = join(mkdtempSync(join(tmpdir(), 'cats-ci-output-')), 'output');
  writeFileSync(output, '');
  try {
    const result = spawnSync(bash, ['-e', '-o', 'pipefail', '-c', script], {
      cwd, encoding: 'utf8', env: { ...process.env, ...env, GITHUB_OUTPUT: output.replaceAll('\\', '/') },
    });
    assert.equal(result.status, 0, result.stderr || String(result.error));
    return readFileSync(output, 'utf8').trim();
  } finally {
    rmSync(dirname(output), { recursive: true, force: true });
  }
}

function stubGh(bin) {
  mkdirSync(bin, { recursive: true });
  writeFileSync(join(bin, 'gh'), [
    '#!/usr/bin/env bash',
    'printf \'%s\\n\' "$2" >> "$STUB_LOG"',
    'case "$2" in',
    '  */pulls) [ -n "${STUB_PULLS:-}" ] || exit 1; printf \'%s\\n\' "$STUB_PULLS" ;;',
    '  */actions/workflows/*) [ -n "${STUB_PASSED:-}" ] || exit 1; printf \'%s\\n\' "$STUB_PASSED" ;;',
    '  *) exit 1 ;;',
    'esac',
  ].join('\n') + '\n', { mode: 0o755 });
}

test('the plan skips docs-only changes first, then code that already passed', () => {
  const plan = step(ci, 'plan').run;
  const decide = (code, green, merged) => runStep(plan, process.cwd(), { CODE: code, GREEN: green, MERGED: merged });
  assert.equal(decide('false', '', ''), 'skip=docs');
  assert.equal(decide('false', 'true', 'true'), 'skip=docs');
  assert.equal(decide('true', 'true', ''), 'skip=tested');
  assert.equal(decide('true', '', 'true'), 'skip=tested');
  assert.equal(decide('true', 'false', 'false'), 'skip=');
  assert.equal(decide('true', '', ''), 'skip=', 'skipped lookups run every check');
});

test('a main push reuses its merged pull request\'s green run only for that exact tree on the previous main', (t) => {
  const merged = step(ci, 'merged');
  assert.equal(merged.condition, "github.event_name == 'push' && steps.paths.outputs.code == 'true'");
  assert.match(ci, /\n {4}permissions:\n {6}contents: read\n {6}pull-requests: read\n {6}actions: read\n/);
  const root = mkdtempSync(join(tmpdir(), 'cats-ci-merged-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const origin = join(root, 'origin.git');
  const work = join(root, 'work');
  const bin = join(root, 'bin');
  const git = (cwd, ...args) => execFileSync('git', [
    '-c', 'user.name=CI Test', '-c', 'user.email=ci@example.invalid',
    '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false', ...args,
  ], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const write = (path, content) => {
    mkdirSync(dirname(join(work, path)), { recursive: true });
    writeFileSync(join(work, path), content);
  };
  const commit = (message) => {
    git(work, 'add', '.');
    git(work, 'commit', '-m', message);
    return git(work, 'rev-parse', 'HEAD');
  };
  git(root, 'init', '--bare', '--initial-branch=main', origin);
  mkdirSync(work);
  git(work, 'init', '--initial-branch=main');
  git(work, 'remote', 'add', 'origin', origin);
  write('src/code.ts', 'base\n');
  const base = commit('base');
  // Pull request #7 is up to date with main, so its squash lands the same tree.
  git(work, 'switch', '-c', 'pr-7');
  write('src/code.ts', 'pull request seven\n');
  const head7 = commit('pr 7');
  git(work, 'push', '--quiet', 'origin', `${head7}:refs/pull/7/head`);
  git(work, 'switch', 'main');
  git(work, 'merge', '--squash', 'pr-7');
  const squash7 = commit('squash #7');
  // Pull request #8 branched from the old main, and main moved before its squash.
  git(work, 'switch', '-c', 'pr-8', base);
  write('src/other.ts', 'pull request eight\n');
  const head8 = commit('pr 8');
  git(work, 'push', '--quiet', 'origin', `${head8}:refs/pull/8/head`);
  git(work, 'switch', 'main');
  git(work, 'merge', '--squash', 'pr-8');
  const squash8 = commit('squash #8');
  stubGh(bin);
  const reuse = (head, before, pulls, passed) => {
    git(work, 'checkout', '--quiet', head);
    return runStep(merged.run, work, {
      PATH: `${bin}${delimiter}${process.env.PATH}`, REPO: 'cats-inc/cats-apps', BEFORE: before,
      STUB_PULLS: pulls, STUB_PASSED: passed, STUB_LOG: join(root, 'gh.log'),
    });
  };
  assert.equal(reuse(squash7, base, `7 ${head7}`, '1'), 'tested=true');
  assert.match(readFileSync(join(root, 'gh.log'), 'utf8'),
    new RegExp(`actions/workflows/ci\\.yaml/runs\\?head_sha=${head7}&event=pull_request&status=success`));
  assert.equal(reuse(squash7, base, `7 ${head7}`, '0'), 'tested=false', 'the pull request must have passed CI');
  assert.equal(reuse(squash7, base, '', '1'), 'tested=false', 'a failed lookup runs every check');
  assert.equal(reuse(squash7, base, `7 ${head8}`, '1'), 'tested=false', 'the reported head must be the pull request ref');
  assert.equal(reuse(squash7, base, `9 ${head7}`, '1'), 'tested=false', 'an unknown pull request ref runs every check');
  assert.equal(reuse(squash7, '', `7 ${head7}`, '1'), 'tested=false');
  assert.equal(reuse(squash8, base, `8 ${head8}`, '1'), 'tested=false', 'a push of several commits runs every check');
  assert.equal(reuse(squash8, squash7, `8 ${head8}`, '1'), 'tested=false',
    'a head without the previous main was tested on other code');
});

test('a tagged release skips check:docs and the App tests only after main\'s Repository checks passed on its commit', (t) => {
  assert.match(release, /\n {6}contents: write\n {6}actions: read\n/);
  for (const command of ['- run: npm run check:docs', '- run: npm test']) {
    const lines = release.split(/\r?\n/);
    const at = lines.findIndex((line) => line.trim() === command);
    assert.notEqual(at, -1, command);
    assert.equal(lines[at + 1].trim(), "if: steps.ci.outputs.tested != 'true'", command);
  }
  const check = step(release, 'ci');
  assert.equal(check.condition, undefined, 'the lookup itself always runs');
  const root = mkdtempSync(join(tmpdir(), 'cats-release-check-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, 'bin');
  stubGh(bin);
  const sha = 'a'.repeat(40);
  const lookup = (passed) => runStep(check.run, root, {
    PATH: `${bin}${delimiter}${process.env.PATH}`, GITHUB_REPOSITORY: 'cats-inc/cats-apps', GITHUB_SHA: sha,
    STUB_PASSED: passed, STUB_LOG: join(root, 'gh.log'),
  });
  assert.equal(lookup('1'), 'tested=true');
  assert.match(readFileSync(join(root, 'gh.log'), 'utf8'),
    new RegExp(`actions/workflows/ci\\.yaml/runs\\?head_sha=${sha}&event=push&branch=main&status=success`));
  assert.equal(lookup('0'), 'tested=false', 'without a passing main run the release tests as before');
  assert.equal(lookup(''), 'tested=false', 'a failed lookup tests as before');
});
