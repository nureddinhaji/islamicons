// Writes the packages' generated files from icons/; run through `pnpm build:packages`. Usage: node scripts/build-packages.js [dir]
import {copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {frame_inner, svg_document} from '../src/lib/frame.js'
import {icon_inner, read_icon, to_pascal_case} from '../src/lib/icon-file.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const icons_dir = path.join(root, 'icons')
const out = path.resolve(process.argv[2] || path.join(root, 'packages'))

const read_json = file => JSON.parse(readFileSync(path.join(icons_dir, file), 'utf8'))
const categories = read_json('_categories.json')
const category_of = new Map(categories.flatMap(category => category.icons.map(name => [name, category.id])))

function read_package_icon(name) {
    const art = icon_inner(readFileSync(path.join(icons_dir, `${name}.svg`), 'utf8'), name)
    const framed = frame_inner(art)
    const file = `${svg_document(framed)}\n`
    const {elements, problems} = read_icon(file)
    if (problems.length || !elements.length) throw new Error(`${name}: ${problems[0] ?? 'framed file has no shapes'}`)
    const category = category_of.get(name)
    if (!category) throw new Error(`${name}: not listed in _categories.json`)
    const {title, title_en, tags} = read_json(`${name}.json`)
    return {name, component: to_pascal_case(name), framed, file, meta: {title, title_en, category, tags}}
}

// Emptied first, so a removed or renamed icon never lingers in a package.
function fresh_dir(dir) {
    rmSync(dir, {recursive: true, force: true})
    mkdirSync(dir, {recursive: true})
    return dir
}

function write_svg_package(icons, dir) {
    const files_dir = fresh_dir(path.join(dir, 'icons'))
    for (const icon of icons) writeFileSync(path.join(files_dir, `${icon.name}.svg`), icon.file)
    const data = {icons: Object.fromEntries(icons.map(icon => [icon.name, icon.meta])), categories}
    writeFileSync(path.join(dir, 'icons.json'), `${JSON.stringify(data, null, 2)}\n`)
    copyFileSync(path.join(root, 'LICENSE'), path.join(dir, 'LICENSE'))
}

// The editor hover shows this file on white, so the black currentColor ink stays visible in dark themes.
const preview = icon =>
    Buffer.from(icon.file.replace('<svg ', '<svg style="background:#fff;border-radius:2px" ')).toString('base64')

const svelte_component = icon => `<svelte:options namespace="svg" />

<!--
@component
${icon.meta.title} (${icon.meta.title_en}): https://islamicons.org/?icon=${icon.name}

![${icon.meta.title_en}](data:image/svg+xml;base64,${preview(icon)})
-->
{#snippet shapes()}${icon.framed}{/snippet}

<Icon {...props} name="${icon.name}" {shapes} />

<script>
/** @import {IconProps} from '../types.js' */
import Icon from '../Icon.svelte'

/** @type {IconProps} */
let props = $props()
</script>
`

// Only the icons and the barrel are generated; Icon.svelte and types.d.ts beside them are written by hand.
function write_svelte_sources(icons, dir) {
    const icons_out = fresh_dir(path.join(dir, 'src', 'icons'))
    for (const icon of icons) writeFileSync(path.join(icons_out, `${icon.name}.svelte`), svelte_component(icon))
    const exports = icons.map(icon => `export {default as ${icon.component}} from './icons/${icon.name}.svelte'`)
    const barrel = ["/** @typedef {import('./types.js').IconProps} IconProps */", ...exports].join('\n')
    writeFileSync(path.join(dir, 'src', 'index.js'), `${barrel}\n`)
    copyFileSync(path.join(root, 'LICENSE'), path.join(dir, 'LICENSE'))
}

const names = readdirSync(icons_dir)
    .filter(file => file.endsWith('.svg'))
    .map(file => file.slice(0, -'.svg'.length))
    .sort()
const icons = names.map(read_package_icon)
write_svg_package(icons, path.join(out, 'svg'))
write_svelte_sources(icons, path.join(out, 'svelte'))
console.log(`${icons.length} icons written to ${path.relative(process.cwd(), out) || '.'}`)
