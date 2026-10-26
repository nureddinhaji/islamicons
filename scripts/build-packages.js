// Writes the packages' generated files from icons/; run through `pnpm build:packages`. Usage: node scripts/build-packages.js [dir]
import {copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {frame_inner, svg_document} from '../src/lib/frame.js'
import {icon_inner, read_icon} from '../src/lib/icon-file.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const icons_dir = path.join(root, 'icons')
const out = path.resolve(process.argv[2] || path.join(root, 'packages'))

const read_json = file => JSON.parse(readFileSync(path.join(icons_dir, file), 'utf8'))
const categories = read_json('_categories.json')
const category_of = new Map(categories.flatMap(category => category.icons.map(name => [name, category.id])))

function read_package_icon(name) {
    const art = icon_inner(readFileSync(path.join(icons_dir, `${name}.svg`), 'utf8'), name)
    const file = `${svg_document(frame_inner(art))}\n`
    const {elements, problems} = read_icon(file)
    if (problems.length || !elements.length) throw new Error(`${name}: ${problems[0] ?? 'framed file has no shapes'}`)
    const category = category_of.get(name)
    if (!category) throw new Error(`${name}: not listed in _categories.json`)
    const {title, title_en, tags} = read_json(`${name}.json`)
    return {name, file, meta: {title, title_en, category, tags}}
}

// Emptied first, so a removed or renamed icon never lingers in a package.
function write_svg_package(icons, dir) {
    const files_dir = path.join(dir, 'icons')
    rmSync(files_dir, {recursive: true, force: true})
    mkdirSync(files_dir, {recursive: true})
    for (const icon of icons) writeFileSync(path.join(files_dir, `${icon.name}.svg`), icon.file)
    const data = {icons: Object.fromEntries(icons.map(icon => [icon.name, icon.meta])), categories}
    writeFileSync(path.join(dir, 'icons.json'), `${JSON.stringify(data, null, 2)}\n`)
    copyFileSync(path.join(root, 'LICENSE'), path.join(dir, 'LICENSE'))
}

const names = readdirSync(icons_dir)
    .filter(file => file.endsWith('.svg'))
    .map(file => file.slice(0, -'.svg'.length))
    .sort()
const icons = names.map(read_package_icon)
write_svg_package(icons, path.join(out, 'svg'))
console.log(`${icons.length} icons written to ${path.relative(process.cwd(), out) || '.'}`)
