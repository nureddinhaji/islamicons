import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {after, test} from 'node:test'
import {fileURLToPath} from 'node:url'

import {frame_inner, svg_document} from '../src/lib/frame.js'
import {icon_inner, read_icon} from '../src/lib/icon-file.js'

const generator = fileURLToPath(new URL('./build-packages.js', import.meta.url))
const root = fileURLToPath(new URL('..', import.meta.url))
const icons_dir = path.join(root, 'icons')
const read_json = file => JSON.parse(readFileSync(file, 'utf8'))

const names = readdirSync(icons_dir)
    .filter(file => file.endsWith('.svg'))
    .map(file => file.slice(0, -'.svg'.length))
    .sort()

const temp = mkdtempSync(path.join(os.tmpdir(), 'islamicons-packages-'))
after(() => rmSync(temp, {recursive: true, force: true}))

function generate(dir) {
    const result = spawnSync(process.execPath, [generator, dir], {encoding: 'utf8'})
    assert.equal(result.status, 0, result.stderr)
    return path.join(dir, 'svg')
}

// Planted before the first run: the generator must empty the folder, not only add to it.
const first = path.join(temp, 'first')
mkdirSync(path.join(first, 'svg', 'icons'), {recursive: true})
writeFileSync(path.join(first, 'svg', 'icons', 'stale.svg'), '<svg/>')
const svg_package = generate(first)
const files_dir = path.join(svg_package, 'icons')

test('every icon has exactly one file, and a stale file is gone', () => {
    assert.deepEqual(readdirSync(files_dir).sort(), names.map(name => `${name}.svg`).sort())
})

test('each file is the site writer output for its own source', () => {
    for (const name of names) {
        const art = icon_inner(readFileSync(path.join(icons_dir, `${name}.svg`), 'utf8'), name)
        const expected = `${svg_document(frame_inner(art))}\n`
        assert.equal(readFileSync(path.join(files_dir, `${name}.svg`), 'utf8'), expected, name)
    }
})

test('each file reads back through the house reader with shapes and no problems', () => {
    for (const name of names) {
        const {elements, problems} = read_icon(readFileSync(path.join(files_dir, `${name}.svg`), 'utf8'))
        assert.deepEqual(problems, [], name)
        assert.ok(elements.length > 0, name)
    }
})

test('icons.json carries the source titles, tags and categories', () => {
    const data = read_json(path.join(svg_package, 'icons.json'))
    const categories = read_json(path.join(icons_dir, '_categories.json'))
    assert.deepEqual(data.categories, categories)
    assert.deepEqual(Object.keys(data.icons), names)
    for (const name of names) {
        const {title, title_en, tags} = read_json(path.join(icons_dir, `${name}.json`))
        const category = categories.find(entry => entry.icons.includes(name))?.id
        assert.ok(category, `${name} has a category`)
        assert.deepEqual(data.icons[name], {title, title_en, category, tags}, name)
    }
})

test('the licence travels with the package', () => {
    assert.equal(
        readFileSync(path.join(svg_package, 'LICENSE'), 'utf8'),
        readFileSync(path.join(root, 'LICENSE'), 'utf8'),
    )
})

test('two runs write identical bytes', () => {
    const second = generate(path.join(temp, 'second'))
    const listing = dir => readdirSync(dir, {recursive: true}).sort()
    assert.deepEqual(listing(second), listing(svg_package))
    for (const entry of listing(svg_package)) {
        const file = path.join(svg_package, entry)
        if (statSync(file).isFile()) assert.ok(readFileSync(file).equals(readFileSync(path.join(second, entry))), entry)
    }
})
