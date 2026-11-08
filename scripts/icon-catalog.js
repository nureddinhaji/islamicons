import {readFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {frame_inner, svg_document} from '../src/lib/frame.js'
import {base_of, variant_difference} from '../src/lib/icon-family.js'
import {icon_inner, to_pascal_case} from '../src/lib/icon-file.js'

const icons_dir = fileURLToPath(new URL('../icons', import.meta.url))
const read_json = file => JSON.parse(readFileSync(path.join(icons_dir, file), 'utf8'))

export const icon_title = (icon, language) => (language === 'en' ? icon.title_en : icon.title)
export const icon_about = (icon, language) => (language === 'en' ? icon.about_en : icon.about)
export const icon_difference = (icon, base, language) => variant_difference(icon_title(icon, language), icon_title(base, language))
export const category_title = (icon, language) => (language === 'en' ? icon.category.title_en : icon.category.title)

// In catalogue order, as the site lists them. `art` is the drawing on the 24 grid; `framed_svg` is the file a visitor downloads.
export function read_catalog() {
    const categories = read_json('_categories.json')
    const names = categories.flatMap(({icons}) => icons)
    const metas = new Map(names.map(name => [name, read_json(`${name}.json`)]))
    const has_about = name => Boolean(metas.get(name).about)
    return categories.flatMap(({id, title, title_en, icons}) =>
        icons.map(name => {
            const {title: icon_title, title_en: icon_title_en, tags, about = '', about_en = ''} = metas.get(name)
            const art = icon_inner(readFileSync(path.join(icons_dir, `${name}.svg`), 'utf8'), name)
            const framed = frame_inner(art)
            return {
                name,
                base: base_of(name, names, has_about),
                component: to_pascal_case(name),
                title: icon_title,
                title_en: icon_title_en,
                tags,
                about,
                about_en,
                category: {id, title, title_en},
                art,
                framed,
                framed_svg: `${svg_document(framed)}\n`,
            }
        }),
    )
}
