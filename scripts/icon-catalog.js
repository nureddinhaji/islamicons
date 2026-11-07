import {readFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {frame_inner, svg_document} from '../src/lib/frame.js'
import {icon_inner, to_pascal_case} from '../src/lib/icon-file.js'

const icons_dir = fileURLToPath(new URL('../icons', import.meta.url))
const read_json = file => JSON.parse(readFileSync(path.join(icons_dir, file), 'utf8'))

export const icon_title = (icon, language) => (language === 'en' ? icon.title_en : icon.title)
export const category_title = (icon, language) => (language === 'en' ? icon.category.title_en : icon.category.title)

// In catalogue order, as the site lists them. `art` is the drawing on the 24 grid; `framed_svg` is the file a visitor downloads.
export function read_catalog() {
    return read_json('_categories.json').flatMap(({id, title, title_en, icons}) =>
        icons.map(name => {
            const {title: icon_title, title_en: icon_title_en, tags} = read_json(`${name}.json`)
            const art = icon_inner(readFileSync(path.join(icons_dir, `${name}.svg`), 'utf8'), name)
            const framed = frame_inner(art)
            return {
                name,
                component: to_pascal_case(name),
                title: icon_title,
                title_en: icon_title_en,
                tags,
                category: {id, title, title_en},
                art,
                framed,
                framed_svg: `${svg_document(framed)}\n`,
            }
        }),
    )
}
