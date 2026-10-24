// Checks every icon against the library's drawing standard; run before each build. Usage: node scripts/check-icons.js [dir]
import {existsSync, readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'

import {arabic_pattern} from '../src/lib/arabic.js'
import {frame_inner, parse_path, walk_path} from '../src/lib/frame.js'
import {read_icon, ROOT_ATTRS, to_inner} from '../src/lib/icon-file.js'

const dir = process.argv[2] || 'icons'
// the art's 1 px safe zone at stroke 2; the presentation frame (src/lib/frame.js) relies on it
const MIN = 2
const MAX = 22
const TOLERANCE = 0.01

const problems = []
const report = (name, text) => problems.push(`${name}: ${text}`)

function cubic(p0, p1, p2, p3, t) {
    const u = 1 - t
    return [0, 1].map(i => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i])
}

// SVG arc notes F.6.5: endpoint parameters to centre parameters, then points along the arc
function arc_points(from, [rx, ry, rotation, large_arc, sweep, x2, y2]) {
    if (!rx || !ry) return [[x2, y2]]
    const phi = (rotation * Math.PI) / 180
    const [cos, sin] = [Math.cos(phi), Math.sin(phi)]
    const [dx, dy] = [(from[0] - x2) / 2, (from[1] - y2) / 2]
    const x1p = cos * dx + sin * dy
    const y1p = -sin * dx + cos * dy
    let [arx, ary] = [Math.abs(rx), Math.abs(ry)]
    const lambda = (x1p * x1p) / (arx * arx) + (y1p * y1p) / (ary * ary)
    if (lambda > 1) [arx, ary] = [arx * Math.sqrt(lambda), ary * Math.sqrt(lambda)]
    const num = arx * arx * ary * ary - arx * arx * y1p * y1p - ary * ary * x1p * x1p
    const den = arx * arx * y1p * y1p + ary * ary * x1p * x1p
    const coef = (large_arc !== sweep ? 1 : -1) * Math.sqrt(Math.max(0, num / den))
    const cxp = (coef * arx * y1p) / ary
    const cyp = (-coef * ary * x1p) / arx
    const cx = cos * cxp - sin * cyp + (from[0] + x2) / 2
    const cy = sin * cxp + cos * cyp + (from[1] + y2) / 2
    const angle = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
    const start = angle(1, 0, (x1p - cxp) / arx, (y1p - cyp) / ary)
    let delta = angle((x1p - cxp) / arx, (y1p - cyp) / ary, (-x1p - cxp) / arx, (-y1p - cyp) / ary)
    if (!sweep && delta > 0) delta -= 2 * Math.PI
    if (sweep && delta < 0) delta += 2 * Math.PI
    return Array.from({length: 65}, (_, i) => {
        const theta = start + (delta * i) / 64
        return [
            cx + arx * Math.cos(theta) * cos - ary * Math.sin(theta) * sin,
            cy + arx * Math.cos(theta) * sin + ary * Math.sin(theta) * cos,
        ]
    })
}

// Points on the path's outline, dense enough for a 0.01 bound: endpoints, sampled curves and arcs.
function path_points(d) {
    const points = []
    let last_control = null
    for (const segment of walk_path(parse_path(d))) {
        const {lower, abs, from, to} = segment
        if (lower === 'c' || lower === 's' || lower === 'q' || lower === 't') {
            const reflected = last_control ? [2 * from[0] - last_control[0], 2 * from[1] - last_control[1]] : from
            let [c1, c2] = [null, null]
            if (lower === 'c') [c1, c2] = [abs.slice(0, 2), abs.slice(2, 4)]
            else if (lower === 's') [c1, c2] = [reflected, abs.slice(0, 2)]
            else {
                const q = lower === 'q' ? abs.slice(0, 2) : reflected
                c1 = [from[0] + (2 / 3) * (q[0] - from[0]), from[1] + (2 / 3) * (q[1] - from[1])]
                c2 = [to[0] + (2 / 3) * (q[0] - to[0]), to[1] + (2 / 3) * (q[1] - to[1])]
                last_control = q
            }
            for (let i = 0; i <= 64; i++) points.push(cubic(from, c1, c2, to, i / 64))
            if (lower === 'c' || lower === 's') last_control = c2
            continue
        }
        last_control = null
        if (lower === 'a') points.push(...arc_points(from, abs))
        else if (lower === 'm') points.push(to)
        else points.push(from, to)
    }
    return points
}

function shape_points(tag, attrs) {
    const n = name => Number(attrs[name] || 0)
    if (tag === 'path') return path_points(attrs.d)
    if (tag === 'circle') return [[n('cx') - n('r'), n('cy') - n('r')], [n('cx') + n('r'), n('cy') + n('r')]]
    if (tag === 'ellipse') return [[n('cx') - n('rx'), n('cy') - n('ry')], [n('cx') + n('rx'), n('cy') + n('ry')]]
    if (tag === 'rect') return [[n('x'), n('y')], [n('x') + n('width'), n('y') + n('height')]]
    if (tag === 'line') return [[n('x1'), n('y1')], [n('x2'), n('y2')]]
    const numbers = attrs.points.trim().split(/[\s,]+/).map(Number)
    return numbers.flatMap((value, i) => (i % 2 ? [] : [[value, numbers[i + 1]]]))
}

const names = readdirSync(dir)
    .filter(file => file.endsWith('.svg'))
    .map(file => file.slice(0, -4))

function read_json(file, label) {
    try {
        return JSON.parse(readFileSync(file, 'utf8'))
    } catch (error) {
        report(label, `is not valid JSON: ${error.message}`)
    }
}

function finish() {
    if (problems.length) {
        console.error(problems.join('\n'))
        console.error(`\n${problems.length} problem(s) in ${names.length} icons`)
        process.exit(1)
    }
    console.log(`${names.length} icons meet the standard`)
}

const is_object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const is_clean_string = value => typeof value === 'string' && value !== '' && value === value.trim()
const is_english_title = value =>
    is_clean_string(value) && /^[A-Z]/.test(value) && !/[\u0600-\u06FF]/.test(value)

function key_problems(value, keys, optional = []) {
    if (!is_object(value)) return ['must be an object']
    return [
        ...keys.filter(key => !(key in value)).map(key => `is missing the key ${key}`),
        ...Object.keys(value)
            .filter(key => !keys.includes(key) && !optional.includes(key))
            .map(key => `has an unexpected key ${key}`),
    ]
}

function category_problems(list) {
    if (!Array.isArray(list)) return ['_categories.json must be an array']
    const found = []
    list.forEach((category, i) => {
        const label = `category ${is_object(category) && category.id ? category.id : `#${i + 1}`}`
        found.push(
            ...key_problems(category, ['id', 'title', 'title_en', 'icon', 'icons'], ['note', 'note_en']).map(
                text => `${label} ${text}`,
            ),
        )
        if (!is_object(category)) return
        if (typeof category.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(category.id))
            found.push(`${label}: id must be kebab-case`)
        else if (list.some((other, j) => j < i && other?.id === category.id)) found.push(`${label}: id is used twice`)
        if (!is_clean_string(category.title)) found.push(`${label}: title must be a non-empty trimmed string`)
        if ('title_en' in category && !is_english_title(category.title_en))
            found.push(`${label}: title_en must be an English title, starting with a capital and without Arabic letters`)
        const has_note = 'note' in category
        const has_note_en = 'note_en' in category
        if (has_note !== has_note_en) found.push(`${label}: note_en goes with note`)
        if (has_note && !is_clean_string(category.note))
            found.push(`${label}: note must be a non-empty trimmed string`)
        if (has_note_en && !is_clean_string(category.note_en))
            found.push(`${label}: note_en must be a non-empty trimmed string`)
        if (typeof category.icon !== 'string') found.push(`${label}: icon must be a string`)
        if (!Array.isArray(category.icons) || !category.icons.every(name => typeof name === 'string'))
            found.push(`${label}: icons must be a list of icon names`)
    })
    return found
}

const whole_match = (pattern_of, text) => new RegExp(`^(?:${arabic_pattern(pattern_of)})$`, 'i').test(text)
// some lookalikes are one-way (typing أ finds ؤ, not the reverse), so both directions are needed
const same_search = (a, b) => whole_match(a, b) || whole_match(b, a)

function meta_problems(name, meta) {
    const found = key_problems(meta, ['title', 'title_en', 'tags'])
    if (!is_object(meta)) return found
    if (!is_clean_string(meta.title) || !/[\u0600-\u06FF]/.test(meta.title))
        found.push('metadata needs an Arabic title, without leading or trailing spaces')
    if (!is_english_title(meta.title_en))
        found.push('metadata needs an English title, starting with a capital and without Arabic letters')
    if (!Array.isArray(meta.tags) || !meta.tags.length) return [...found, 'metadata needs search tags']
    for (const tag of meta.tags)
        if (!is_clean_string(tag)) found.push(`tag ${JSON.stringify(tag)} must be a non-empty trimmed string`)
    for (const tag of new Set(meta.tags.filter((tag, i) => meta.tags.indexOf(tag) !== i)))
        found.push(`tag ${JSON.stringify(tag)} is listed more than once`)
    meta.tags.forEach((tag, i) => {
        if (!is_clean_string(tag)) return
        const repeats =
            tag.toLowerCase() === name ||
            tag.toLowerCase() === name.replaceAll('-', ' ') ||
            (is_clean_string(meta.title) && same_search(tag, meta.title)) ||
            (is_english_title(meta.title_en) && same_search(tag, meta.title_en)) ||
            (tag.startsWith('ال') &&
                meta.tags.some(other => other !== tag && is_clean_string(other) && same_search(other, tag.slice(2)))) ||
            meta.tags.slice(0, i).some(other => is_clean_string(other) && other !== tag && same_search(other, tag))
        if (repeats) found.push(`tag ${JSON.stringify(tag)}: search already finds this; drop the tag`)
        if (/[A-Z]/.test(tag)) found.push(`tag ${JSON.stringify(tag)}: English tags are lowercase`)
    })
    return found
}

const categories = read_json(path.join(dir, '_categories.json'), '_categories.json')
if (categories === undefined) {
    finish()
}
const shape = category_problems(categories)
for (const text of shape) report('_categories.json', text)
const shape_ok = !shape.length

// _categories.json alone says where each icon goes and in what order
const listed = shape_ok ? categories.flatMap(category => category.icons) : []
if (shape_ok) {
    for (const name of new Set(listed.filter((name, i) => listed.indexOf(name) !== i)))
        report('_categories.json', `${name} is listed more than once`)
    for (const name of listed) if (!names.includes(name)) report('_categories.json', `lists missing icon ${name}`)
    for (const name of names) if (!listed.includes(name)) report(name, 'not listed in any category of _categories.json')
}

const metas = new Map()
for (const name of names) {
    const svg = readFileSync(path.join(dir, `${name}.svg`), 'utf8')
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) report(name, 'name must be kebab-case English')
    const {root, elements, problems: file_problems} = read_icon(svg)
    for (const text of file_problems) report(name, text)
    if (root) {
        for (const [key, value] of Object.entries(ROOT_ATTRS))
            if (root[key] !== value) report(name, `root ${key} must be "${value}", is "${root[key] ?? '—'}"`)
        for (const key of Object.keys(root)) if (!(key in ROOT_ATTRS)) report(name, `unexpected root attribute ${key}`)
    }

    // Bounds and frame only make sense for a file that was read cleanly.
    if (!file_problems.length) {
        let [min_x, min_y, max_x, max_y] = [Infinity, Infinity, -Infinity, -Infinity]
        for (const {tag, attrs} of elements)
            for (const [x, y] of shape_points(tag, attrs)) {
                min_x = Math.min(min_x, x)
                min_y = Math.min(min_y, y)
                max_x = Math.max(max_x, x)
                max_y = Math.max(max_y, y)
            }
        const box = [min_x, min_y, max_x, max_y].map(v => Math.round(v * 100) / 100)
        if (min_x < MIN - TOLERANCE || min_y < MIN - TOLERANCE || max_x > MAX + TOLERANCE || max_y > MAX + TOLERANCE)
            report(name, `art reaches [${box.join(', ')}]; every path must stay within ${MIN}–${MAX}`)
        try {
            frame_inner(to_inner(elements))
        } catch (error) {
            report(name, `frame transform failed: ${error.message}`)
        }
    }

    const meta_path = path.join(dir, `${name}.json`)
    if (!existsSync(meta_path)) {
        report(name, 'missing .json metadata')
        continue
    }
    const meta = read_json(meta_path, name)
    if (meta === undefined) continue
    for (const text of meta_problems(name, meta)) report(name, text)
    if (is_object(meta) && is_clean_string(meta.title) && /[\u0600-\u06FF]/.test(meta.title)) metas.set(name, meta)
}

// Names that start with another icon's name without being its variant.
const NOT_VARIANTS = new Set(['dome-of-the-rock', 'tazkiyah-of-the-heart'])

const parent_of = name =>
    NOT_VARIANTS.has(name)
        ? undefined
        : names.filter(other => name.startsWith(`${other}-`)).sort((a, b) => b.length - a.length)[0]

function variant_problems(name, title, base_title, {comma, filled_end, quote, label = ''}) {
    const [open, close] = quote
    const prefix = label ? `${label}: ` : ''
    const found = []
    if (name.endsWith('-filled') !== title.endsWith(filled_end))
        found.push(`${prefix}-filled and ${open}(… ${filled_end}${close} go together`)
    const parent = parent_of(name)
    if (!parent) return title.includes('(') ? [...found, `${prefix}a base title has no parentheses`] : found
    if (base_title === undefined) return found
    const head = base_title.endsWith(')') ? `${base_title.slice(0, -1)}${comma}` : `${base_title} (`
    if (!title.startsWith(head) || !title.endsWith(')'))
        found.push(
            label
                ? `${label} must read ${open}${head}…)${close}, as a variant of ${parent}`
                : `title must read ${open}${head}…)${close}, as a variant of ${parent}`,
        )
    return found
}

const ARABIC_TITLE = {comma: '، ', filled_end: 'مُصمَت)', quote: ['«', '»']}
const ENGLISH_TITLE = {comma: ', ', filled_end: 'filled)', quote: ['"', '"'], label: 'English title'}

function title_problems(name) {
    const meta = metas.get(name)
    const found = []
    if (/-(filled|off)-/.test(name)) found.push('filled and off must be the last words of the name')
    const parent = parent_of(name)
    const base = parent && metas.get(parent)
    found.push(...variant_problems(name, meta.title, base?.title, ARABIC_TITLE))
    if (is_english_title(meta.title_en) && (!parent || is_english_title(base?.title_en)))
        found.push(...variant_problems(name, meta.title_en, base?.title_en, ENGLISH_TITLE))
    return found
}

for (const name of metas.keys()) {
    for (const text of title_problems(name)) report(name, text)
    const {title, title_en} = metas.get(name)
    const twins = [...metas.keys()].filter(other => other !== name && metas.get(other).title === title)
    if (twins.length) report(name, `title is also used by ${twins.join(', ')}`)
    if (!is_english_title(title_en)) continue
    const en_twins = [...metas.keys()].filter(
        other => other !== name && is_english_title(metas.get(other).title_en) && metas.get(other).title_en === title_en,
    )
    if (en_twins.length) report(name, `English title is also used by ${en_twins.join(', ')}`)
}

for (const file of readdirSync(dir).filter(file => file.endsWith('.json') && file !== '_categories.json'))
    if (!names.includes(file.slice(0, -5))) report(file, 'metadata without an icon')
if (shape_ok)
    for (const category of categories)
        if (!category.icons.includes(category.icon))
            report('_categories.json', `category ${category.id} is shown by ${category.icon}, which is not in its list`)

const src_dir = process.argv[3] || 'src'
// The site's own literal icon names: icon_named('x') and ['x', 'y'].map(icon_named).
for (const file of readdirSync(src_dir, {recursive: true}).filter(file => /\.(svelte|js)$/.test(file))) {
    const text = readFileSync(path.join(src_dir, file), 'utf8')
    const named = [
        ...[...text.matchAll(/icon_named\(\s*'([^']*)'\s*\)/g)].map(m => m[1]),
        ...[...text.matchAll(/\[([^\]]*)\]\s*\.map\(icon_named\)/g)].flatMap(m =>
            [...m[1].matchAll(/'([^']*)'/g)].map(s => s[1]),
        ),
    ]
    for (const name of named)
        if (!names.includes(name)) report(`src/${file}`, `names icon ${name}, which does not exist`)
    if (/icon_by_name\.get\(\s*'/.test(text)) report(`src/${file}`, "look up a written name with icon_named('…')")
}

finish()
