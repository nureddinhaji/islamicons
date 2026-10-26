import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {cpSync, mkdtempSync, readdirSync, readFileSync, rmSync} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {after, test} from 'node:test'
import {fileURLToPath} from 'node:url'

const script = fileURLToPath(new URL('./release-version.js', import.meta.url))
const packages_dir = fileURLToPath(new URL('../packages', import.meta.url))
const names = readdirSync(packages_dir).filter(name => !name.startsWith('.'))

const temp = mkdtempSync(path.join(os.tmpdir(), 'islamicons-release-'))
after(() => rmSync(temp, {recursive: true, force: true}))

// A copy of each real package.json, so the stamp is checked against the files it will meet in CI.
function packages() {
    const dir = mkdtempSync(path.join(temp, 'packages-'))
    for (const name of names)
        cpSync(path.join(packages_dir, name, 'package.json'), path.join(dir, name, 'package.json'))
    return dir
}

const run = (tag, dir) => spawnSync(process.execPath, [script, tag, dir], {encoding: 'utf8'})
const manifest = (dir, name) => readFileSync(path.join(dir, name, 'package.json'), 'utf8')

for (const [tag, version, dist_tag] of [
    ['v1.0.0', '1.0.0', 'latest'],
    ['v1.0.0-beta.1', '1.0.0-beta.1', 'next'],
    ['v2.10.3-rc.0', '2.10.3-rc.0', 'next'],
    ['v1.2.3-alpha-1.x', '1.2.3-alpha-1.x', 'next'],
]) {
    test(`${tag} stamps ${version} into every package and picks ${dist_tag}`, () => {
        const dir = packages()
        const result = run(tag, dir)
        assert.equal(result.status, 0, result.stderr)
        assert.equal(result.stdout, `dist_tag=${dist_tag}\n`)
        for (const name of names) {
            const before = readFileSync(path.join(packages_dir, name, 'package.json'), 'utf8')
            const version_line = /^ {2}"version": "[^"]*",$/m
            // Not `expected !== before`: in CI the files already carry the tag's version when this test runs.
            assert.match(before, version_line, `${name} has a version line`)
            const expected = before.replace(version_line, `  "version": "${version}",`)
            assert.equal(manifest(dir, name), expected, `only the version changes in ${name}`)
        }
    })
}

for (const tag of [
    '',
    'v1',
    'v1.0',
    '1.0.0',
    'v01.0.0',
    'v1.0.0-',
    'v1.0.0-beta..1',
    'v1.0.0-01',
    'v1.0.0+build',
    'v1.0.0+x;rm',
    'v1.0.0 ',
]) {
    test(`${JSON.stringify(tag)} is refused and writes nothing`, () => {
        const dir = packages()
        const result = run(tag, dir)
        assert.equal(result.status, 1)
        assert.equal(result.stdout, '')
        assert.match(result.stderr, /is not a release tag/)
        for (const name of names)
            assert.equal(manifest(dir, name), readFileSync(path.join(packages_dir, name, 'package.json'), 'utf8'))
    })
}

test('a directory with no packages is an error, not a silent success', () => {
    const result = run('v1.0.0', mkdtempSync(path.join(temp, 'empty-')))
    assert.equal(result.status, 1)
    assert.equal(result.stdout, '')
    assert.match(result.stderr, /no packages/)
})
