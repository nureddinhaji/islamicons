import assert from 'node:assert/strict'
import {execFileSync, spawnSync} from 'node:child_process'
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {after, test} from 'node:test'
import {fileURLToPath} from 'node:url'

const script = fileURLToPath(new URL('./release-ids.js', import.meta.url))

const temp = mkdtempSync(path.join(os.tmpdir(), 'islamicons-release-ids-'))
after(() => rmSync(temp, {recursive: true, force: true}))

// No inherited GIT_* (a pre-commit hook sets GIT_INDEX_FILE) and no user config (signing, hooks, default branch).
const env = {
    ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_'))),
    GIT_AUTHOR_NAME: 'test',
    GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'test',
    GIT_COMMITTER_EMAIL: 'test@example.com',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
}
const git = (cwd, ...args) => execFileSync('git', args, {cwd, env, stdio: 'pipe'})

// One commit per step, holding exactly its icons and categories, tagged when the step names a tag.
function repo(...steps) {
    const dir = mkdtempSync(path.join(temp, 'repo-'))
    git(dir, 'init', '-q', '-b', 'main')
    const icons_dir = path.join(dir, 'icons')
    for (const {icons, categories = ['x'], tag} of steps) {
        rmSync(icons_dir, {recursive: true, force: true})
        mkdirSync(icons_dir)
        for (const name of icons) writeFileSync(path.join(icons_dir, `${name}.svg`), '')
        writeFileSync(path.join(icons_dir, '_categories.json'), JSON.stringify(categories.map(id => ({id, icons}))))
        git(dir, 'add', '-A')
        git(dir, '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', tag ?? 'head')
        if (tag) git(dir, '-c', 'tag.gpgsign=false', 'tag', tag)
    }
    return dir
}

const run = (dir, tag) => spawnSync(process.execPath, [script, tag], {cwd: dir, env, encoding: 'utf8'})

function expect(result, status, message) {
    assert.equal(result.status, status, result.stderr)
    assert.equal(result.stdout, '')
    assert.match(result.stderr, message)
}

test('a removed icon id fails within a major', () => {
    const dir = repo({tag: 'v1.0.0', icons: ['a', 'b']}, {icons: ['a']})
    expect(run(dir, 'v1.1.0'), 1, /removes icon ids b: a removed icon id needs a major version/)
})

test('a removed icon id is listed, not refused, on a new major', () => {
    const dir = repo({tag: 'v1.0.0', icons: ['a', 'b']}, {icons: ['a']})
    expect(run(dir, 'v2.0.0'), 0, /warning: v2\.0\.0 removes icon ids b/)
})

test('the baseline is the numerically highest earlier release', () => {
    const dir = repo({tag: 'v1.9.0', icons: ['a']}, {tag: 'v1.10.0', icons: ['a', 'c']}, {icons: ['a']})
    expect(run(dir, 'v1.11.0'), 1, /against v1\.10\.0: .*removes icon ids c/s)
})

test('a prerelease is never a baseline', () => {
    const dir = repo({tag: 'v1.0.0', icons: ['a']}, {tag: 'v1.1.0-beta.1', icons: ['a', 'x']}, {icons: ['a']})
    expect(run(dir, 'v1.1.0'), 0, /against v1\.0\.0: 1 icon ids, 0 removed/)
})

test('the requested tag at HEAD is compared with the release before it', () => {
    const dir = repo({tag: 'v1.0.0', icons: ['a', 'b']}, {tag: 'v1.1.0', icons: ['a']})
    expect(run(dir, 'v1.1.0'), 1, /against v1\.0\.0: .*removes icon ids b/s)
})

test('a prerelease is checked against the release below its core', () => {
    const dir = repo({tag: 'v1.0.0', icons: ['a', 'b']}, {icons: ['a']})
    expect(run(dir, 'v1.1.0-beta.1'), 1, /against v1\.0\.0: .*removes icon ids b/s)
})

test('the first release has nothing to compare and passes', () => {
    expect(run(repo({icons: ['a']}), 'v1.0.0'), 0, /no earlier stable release to compare/)
})

test('a shallow clone fails instead of passing unchecked', () => {
    const source = repo({tag: 'v1.0.0', icons: ['a', 'b']}, {icons: ['a']})
    const dir = path.join(temp, 'shallow')
    execFileSync('git', ['clone', '-q', '--depth', '1', `file://${source}`, dir], {env, stdio: 'pipe'})
    expect(run(dir, 'v1.1.0'), 1, /shallow/)
})

test('added icon ids pass', () => {
    const dir = repo({tag: 'v1.0.0', icons: ['a']}, {icons: ['a', 'b']})
    expect(run(dir, 'v1.1.0'), 0, /1 icon ids, 0 removed/)
})

test('a removed category id fails within a major', () => {
    const dir = repo({tag: 'v1.0.0', icons: ['a'], categories: ['x', 'y']}, {icons: ['a'], categories: ['x']})
    expect(run(dir, 'v1.1.0'), 1, /removes category ids y: a removed category id needs a major version/)
})

test('added category ids pass', () => {
    const dir = repo({tag: 'v1.0.0', icons: ['a'], categories: ['x']}, {icons: ['a'], categories: ['x', 'y']})
    expect(run(dir, 'v1.1.0'), 0, /1 category ids, 0 removed/)
})
