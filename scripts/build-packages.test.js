import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {after, test} from 'node:test'
import {fileURLToPath} from 'node:url'

import {frame_inner, svg_document} from '../src/lib/frame.js'
import {icon_inner, read_icon, to_pascal_case} from '../src/lib/icon-file.js'

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
    return dir
}

// Planted before the first run: the generator must empty its folders, not only add to them.
const first = path.join(temp, 'first')
for (const [folder, file] of [
    ['svg/icons', 'stale.svg'],
    ['svelte/src/icons', 'stale.svelte'],
    ['react/dist/icons', 'stale.js'],
]) {
    mkdirSync(path.join(first, folder), {recursive: true})
    writeFileSync(path.join(first, folder, file), 'stale')
}
generate(first)
const svg_package = path.join(first, 'svg')
const files_dir = path.join(svg_package, 'icons')
const svelte_src = path.join(first, 'svelte', 'src')
const react_dist = path.join(first, 'react', 'dist')

test('every icon has exactly one file, and a stale file is gone', () => {
    assert.deepEqual(readdirSync(files_dir).sort(), names.map(name => `${name}.svg`).sort())
})

test('every icon has exactly one Svelte component, and a stale one is gone', () => {
    const files = readdirSync(path.join(svelte_src, 'icons')).sort()
    assert.deepEqual(files, names.map(name => `${name}.svelte`).sort())
})

test('each component draws its framed shapes and names itself', () => {
    for (const name of names) {
        const art = icon_inner(readFileSync(path.join(icons_dir, `${name}.svg`), 'utf8'), name)
        const source = readFileSync(path.join(svelte_src, 'icons', `${name}.svelte`), 'utf8')
        assert.ok(source.includes(`{#snippet shapes()}${frame_inner(art)}{/snippet}`), name)
        assert.ok(source.includes(`<Icon {...props} name="${name}" {shapes} />`), name)
    }
})

test('every icon has one React module and its types, and a stale file is gone', () => {
    const files = readdirSync(path.join(react_dist, 'icons')).sort()
    assert.deepEqual(files, names.flatMap(name => [`${name}.d.ts`, `${name}.js`]).sort())
})

test('each React module carries the shapes of its package file', () => {
    for (const name of names) {
        const source = readFileSync(path.join(react_dist, 'icons', `${name}.js`), 'utf8')
        const nodes = JSON.parse(/^const NODES = (.+)$/m.exec(source)[1])
        const file = read_icon(readFileSync(path.join(files_dir, `${name}.svg`), 'utf8'))
        assert.deepEqual(
            nodes,
            file.elements.map(({tag, attrs}) => [tag, {...attrs}]),
            name,
        )
        assert.match(source, new RegExp(`^export default function ${to_pascal_case(name)}\\(props\\)`, 'm'), name)
        assert.ok(source.includes(`name: '${name}', nodes: NODES`), name)
    }
})

test('React ships the hand-written component and types unchanged, and both barrels list every icon', () => {
    for (const file of ['Icon.js', 'types.d.ts'])
        assert.equal(
            readFileSync(path.join(react_dist, file), 'utf8'),
            readFileSync(path.join(root, 'packages', 'react', 'src', file), 'utf8'),
        )
    const expected = names.map(name => `export {default as ${to_pascal_case(name)}} from './icons/${name}.js'`)
    assert.equal(readFileSync(path.join(react_dist, 'index.js'), 'utf8'), `${expected.join('\n')}\n`)
    assert.equal(
        readFileSync(path.join(react_dist, 'index.d.ts'), 'utf8'),
        `${[...expected, "export type {IconProps} from './types.js'"].join('\n')}\n`,
    )
})

test('the barrel exports every icon once, under its PascalCase name', () => {
    const barrel = readFileSync(path.join(svelte_src, 'index.js'), 'utf8')
    const exports = [...barrel.matchAll(/^export \{default as (\w+)\} from '\.\/icons\/([a-z0-9-]+)\.svelte'$/gm)]
    assert.deepEqual(
        exports.map(([, , name]) => name),
        names,
    )
    const components = exports.map(([, component]) => component)
    assert.equal(new Set(components).size, names.length)
    for (const [index, name] of names.entries()) assert.equal(components[index], to_pascal_case(name))
    assert.equal(to_pascal_case('prayer-mat-rolled'), 'PrayerMatRolled')
    assert.match(barrel, /^\/\*\* @typedef \{import\('\.\/types\.js'\)\.IconProps\} IconProps \*\/$/m)
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
    assert.deepEqual(listing(second), listing(first))
    for (const entry of listing(first)) {
        const file = path.join(first, entry)
        if (statSync(file).isFile()) assert.ok(readFileSync(file).equals(readFileSync(path.join(second, entry))), entry)
    }
})
