import category_list from '../../icons/_categories.json' with {type: 'json'}
import {DEFAULT_STROKE_WIDTH, frame_inner, svg_document} from './frame.js'
import {base_of, variant_difference} from './icon-family.js'
import {icon_inner, to_pascal_case} from './icon-file.js'
import {locale} from './locale.js'
import {rank_icons, search_fields} from './search.js'

const svg_files = import.meta.glob('/icons/*.svg', {query: '?raw', import: 'default', eager: true})
const meta_files = import.meta.glob(['/icons/*.json', '!/icons/_categories.json'], {import: 'default', eager: true})

const file_name = file_path =>
    file_path
        .split('/')
        .pop()
        .replace(/\.\w+$/, '')

const metas = Object.fromEntries(Object.entries(meta_files).map(([file_path, meta]) => [file_name(file_path), meta]))

// _categories.json is the one place that says which category an icon is in and where it sits there.
const placement = new Map(
    category_list.flatMap((category, c) =>
        category.icons.map((name, i) => [name, {category: category.id, order: c * 1000 + i}]),
    ),
)

const has_about = name => Boolean(metas[name].about)
const title_of = name => (locale === 'en' ? metas[name].title_en : metas[name].title)

export const icons = Object.entries(svg_files)
    .map(([file_path, raw]) => {
        const name = file_name(file_path)
        const meta = metas[name]
        const {category = '', order = Infinity} = placement.get(name) ?? {}
        const title = title_of(name)
        const base = base_of(name, other => metas[other].variant_of, has_about)
        return {
            name,
            title,
            base,
            difference: base ? variant_difference(title, title_of(base)) : '',
            about: (locale === 'en' ? meta.about_en : meta.about) ?? '',
            category,
            order,
            tags: meta.tags,
            inner: icon_inner(raw, file_path),
            component: to_pascal_case(name),
            ...search_fields(name, meta),
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

// For ids written in the source; scripts/check-icons.js checks each one exists.
export function category_named(id) {
    const category = category_by_id.get(id)
    if (!category) throw new Error(`No category named ${id}`)
    return category
}

export function search_icons(query, category = '') {
    return rank_icons(category ? icons.filter(icon => icon.category === category) : icons, query)
}

const framed_cache = new Map()

// The art scaled into the frame for this stroke (src/lib/frame.js); the slider's few steps keep the cache small.
export function framed_inner(icon, stroke_width = DEFAULT_STROKE_WIDTH) {
    const key = `${icon.name}|${stroke_width}`
    if (!framed_cache.has(key)) framed_cache.set(key, frame_inner(icon.inner, stroke_width))
    return framed_cache.get(key)
}

export function to_svg(icon, {size = 24, stroke_width = DEFAULT_STROKE_WIDTH, color = 'currentColor'} = {}) {
    return svg_document(framed_inner(icon, stroke_width), icon.name, {size, stroke_width, color})
}

// Animation hook: pathLength lets one dash cover every stroke; --i staggers the elements.
export function to_drawable(inner) {
    let index = 0
    return inner.replace(/<(path|circle|rect|ellipse|line|polyline|polygon)\b/g, tag => {
        const attrs = ` pathLength="1" style="--i:${index++}"`
        return `${tag}${attrs}`
    })
}
