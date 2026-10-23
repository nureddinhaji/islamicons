import category_list from '../../icons/_categories.json' with {type: 'json'}
import {arabic_pattern} from './arabic.js'
import {DEFAULT_STROKE_WIDTH, frame_inner} from './frame.js'
import {icon_inner} from './icon-file.js'
import {locale} from './locale.js'

const svg_files = import.meta.glob('/icons/*.svg', {query: '?raw', import: 'default', eager: true})
const meta_files = import.meta.glob(['/icons/*.json', '!/icons/_categories.json'], {import: 'default', eager: true})

const file_name = file_path =>
    file_path
        .split('/')
        .pop()
        .replace(/\.\w+$/, '')

export const to_pascal_case = name => name.replace(/(^|-)(\w)/g, (_, _sep, char) => char.toUpperCase())

const metas = Object.fromEntries(Object.entries(meta_files).map(([file_path, meta]) => [file_name(file_path), meta]))

// _categories.json is the one place that says which category an icon is in and where it sits there.
const placement = new Map(
    category_list.flatMap((category, c) =>
        category.icons.map((name, i) => [name, {category: category.id, order: c * 1000 + i}]),
    ),
)

export const icons = Object.entries(svg_files)
    .map(([file_path, raw]) => {
        const name = file_name(file_path)
        const meta = metas[name]
        const {category = '', order = Infinity} = placement.get(name) ?? {}
        return {
            name,
            title: locale === 'en' ? meta.title_en : meta.title,
            titles: [meta.title, meta.title_en],
            category,
            order,
            tags: meta.tags,
            inner: icon_inner(raw, file_path),
            component: to_pascal_case(name),
            haystack: [name, meta.title, meta.title_en, ...meta.tags].join(' ').toLowerCase(),
        }
    })
    .sort((a, b) => a.order - b.order)

export const icon_by_name = new Map(icons.map(icon => [icon.name, icon]))

// For names written in the source; scripts/check-icons.js checks each one exists.
export function icon_named(name) {
    const icon = icon_by_name.get(name)
    if (!icon) throw new Error(`No icon named ${name}`)
    return icon
}

export const categories = category_list.map(({icons: _names, ...category}) => ({
    ...category,
    title: locale === 'en' ? category.title_en : category.title,
    note: locale === 'en' ? category.note_en : category.note,
    count: icons.filter(icon => icon.category === category.id).length,
}))

export const category_by_id = new Map(categories.map(category => [category.id, category]))

// Arabic is usually typed with the article: «المسجد» has to find «مسجد».
const without_article = word => (/^ال[\u0621-\u064A]{2}/.test(word) ? word.slice(2) : '')

// One query word as matchers from best to loosest: the whole title, a whole tag or name, the start of one, the start
// of a word inside one (after «ال» too), anywhere.
function matchers(word) {
    const source = arabic_pattern(word)
    return {
        whole: RegExp(`^(?:${source})$`, 'i'),
        start: RegExp(`^(?:${source})`, 'i'),
        word: RegExp(`(?:^|[\\s-])(?:ال)?(?:${source})`, 'i'),
        any: RegExp(source, 'i'),
    }
}

function relevance(icon, m) {
    const fields = [...icon.titles, ...icon.tags, icon.name]
    if (icon.titles.some(title => m.whole.test(title))) return 100
    if (fields.some(field => m.whole.test(field))) return 90
    if (fields.some(field => m.start.test(field))) return 70
    if (fields.some(field => m.word.test(field))) return 50
    return m.any.test(icon.haystack) ? 20 : 0
}

// Every word has to match, as before; the best matches come first, ties keep the catalogue order.
export function search_icons(query, category = '') {
    const in_scope = category ? icons.filter(icon => icon.category === category) : icons
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return in_scope
    const per_word = words.map(word => [word, without_article(word)].filter(Boolean).map(matchers))
    const scored = []
    for (const icon of in_scope) {
        let score = 0
        for (const options of per_word) {
            const best = Math.max(...options.map(m => relevance(icon, m)))
            if (!best) {
                score = 0
                break
            }
            score += best
        }
        if (score) scored.push({icon, score})
    }
    return scored.sort((a, b) => b.score - a.score || a.icon.order - b.icon.order).map(item => item.icon)
}

const framed_cache = new Map()

// The art scaled into the frame for this stroke (src/lib/frame.js); the slider's few steps keep the cache small.
export function framed_inner(icon, stroke_width = DEFAULT_STROKE_WIDTH) {
    const key = `${icon.name}|${stroke_width}`
    if (!framed_cache.has(key)) framed_cache.set(key, frame_inner(icon.inner, stroke_width))
    return framed_cache.get(key)
}

export function to_svg(icon, {size = 24, stroke_width = DEFAULT_STROKE_WIDTH, color = 'currentColor'} = {}) {
    // A standalone file has no text colour for fill="currentColor" to inherit, so solid parts take the chosen colour.
    const framed = framed_inner(icon, stroke_width)
    const filled = color === 'currentColor' ? framed : framed.replaceAll('fill="currentColor"', `fill="${color}"`)
    const body = filled.replace(/></g, '>\n  <')
    // The stroke meets the box edge, and browsers clip an inline <svg> there, shaving it at fractional sizes.
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke_width}" stroke-linecap="round" stroke-linejoin="round" overflow="visible">\n  ${body}\n</svg>`
}

// Animation hook: pathLength lets one dash cover every stroke; --i staggers the elements.
export function to_drawable(inner) {
    let index = 0
    return inner.replace(/<(path|circle|rect|ellipse|line|polyline|polygon)\b/g, tag => {
        const attrs = ` pathLength="1" style="--i:${index++}"`
        return `${tag}${attrs}`
    })
}
