// The build emits the og:image cards into dist/; `pnpm og` writes them to tmp/og/ for review.
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {inflateSync} from 'node:zlib'

import {Resvg} from '@resvg/resvg-js'

import {DEFAULT_STROKE_WIDTH, frame_inner} from '../src/lib/frame.js'
import {icon_inner} from '../src/lib/icon-file.js'
import {SITE} from '../src/lib/site.js'
import {category_title, icon_title, read_catalog} from './icon-catalog.js'

const OG_SIZE = {width: 1200, height: 630}
const og_file = language => `og-${language}.png`

// Mirrors the light theme in src/css/tailwind.css.
const COLOR = {
    paper: '#f7f6f3',
    card: '#ffffff',
    grid: '#e7e5df',
    ink: '#1b1a18',
    muted: '#5f5b54',
    primary: '#1f6b55',
    // --gold (light) in src/css/tailwind.css: the keylines of the site's icon panel.
    gold: '#a8731a',
}

const COPY = {
    ar: {
        headline: ['أيقونات إسلامية', 'مرسومة بإتقان'],
        lead: ['شبكة ٢٤×٢٤ وخط واحد متّسق', 'مفتوحة المصدر ومجانية'],
        alt: 'شعار المكتبة وعبارة «أيقونات إسلامية مرسومة بإتقان» بجانب لوحة من أيقوناتها',
    },
    en: {
        headline: ['Islamic icons', 'drawn with care'],
        lead: ['One 24×24 grid, one consistent line', 'Open source and free'],
        alt: 'The Islamicons logo and the words “Islamic icons drawn with care” beside a sheet of its icons',
    },
}

export const og_image = language => ({path: `/${og_file(language)}`, alt: COPY[language].alt, ...OG_SIZE})

// Rows of the sheet from its outer column to the one beside the text; the first and last rows and the outer column
// are cut by the image edge, so the clearest drawings sit inside. SELECTED is drawn as a picked icon.
const SHEET = [
    ['adhan', 'tasbih-counter', 'ramadan', 'iftar', 'user-hijab'],
    ['dome', 'lantern', 'kaaba', 'prayer-beads', 'rehal'],
    ['minaret', 'star-and-crescent', 'quran', 'hijri-calendar', 'mihrab'],
    ['zamzam', 'qibla-compass', 'dome-of-the-rock', 'mosque', 'dua'],
    ['tawaf', 'prayer-mat', 'end-of-ayah', 'rub-el-hizb', 'hadith'],
    ['khutbah', 'wudu', 'sujud', 'tilawa', 'zakat'],
    ['sadaqah-box', 'ihram', 'takbir', 'jamarat', 'arafat'],
]
const SELECTED = 'mosque'
// 630 / 6: five whole rows, and half a row at the top and at the bottom.
const PITCH = 105
const ICON = 40
const MARGIN = 80

const root = path.resolve(import.meta.dirname, '..')
const icons_dir = path.join(root, 'icons')
const fonts_dir = path.join(root, 'node_modules/@fontsource')
// The Arabic and Latin subsets share one family name, and resvg takes the first loaded face of a weight, then falls
// back to the first loaded face that has the glyph whatever its weight; so each language loads its own subset first.
const plex = (subset, weight) => `ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-${subset}-${weight}-normal.woff`
const FONTS = {
    ar: [plex('arabic', 400), plex('arabic', 700), plex('latin', 400)],
    // English names still carry ﷺ, which only the Arabic subset draws.
    en: [plex('latin', 400), plex('latin', 700), plex('arabic', 700), plex('arabic', 400)],
}
const MONO = 'ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff'
// This file has no typographic family name, so resvg knows the weight as a family of its own.
const MONO_FAMILY = 'IBM Plex Mono Medium'

// resvg-js loads fonts from file paths only, and reads TrueType, not WOFF; a WOFF 1 table is zlib-deflated or stored.
function woff_to_sfnt(woff) {
    const count = woff.readUInt16BE(12)
    const tables = Array.from({length: count}, (_, i) => {
        const at = 44 + i * 20
        const [tag, offset, length, orig_length, checksum] = [0, 4, 8, 12, 16].map(o => woff.readUInt32BE(at + o))
        const raw = woff.subarray(offset, offset + length)
        return {tag, checksum, data: length < orig_length ? inflateSync(raw) : raw}
    })
    const header_size = 12 + count * 16
    const padded = data => (data.length + 3) & ~3
    const sfnt = Buffer.alloc(header_size + tables.reduce((sum, table) => sum + padded(table.data), 0))
    const search_range = 2 ** Math.floor(Math.log2(count))
    sfnt.writeUInt32BE(woff.readUInt32BE(4), 0)
    sfnt.writeUInt16BE(count, 4)
    sfnt.writeUInt16BE(search_range * 16, 6)
    sfnt.writeUInt16BE(Math.log2(search_range), 8)
    sfnt.writeUInt16BE((count - search_range) * 16, 10)
    let offset = header_size
    tables.forEach((table, i) => {
        const at = 12 + i * 16
        sfnt.writeUInt32BE(table.tag, at)
        sfnt.writeUInt32BE(table.checksum, at + 4)
        sfnt.writeUInt32BE(offset, at + 8)
        sfnt.writeUInt32BE(table.data.length, at + 12)
        table.data.copy(sfnt, offset)
        offset += padded(table.data)
    })
    return sfnt
}

function font_files(dir, language) {
    return [...FONTS[language], MONO].map(file => {
        const dest = path.join(dir, path.basename(file, '.woff') + '.ttf')
        writeFileSync(dest, woff_to_sfnt(readFileSync(path.join(fonts_dir, file))))
        return dest
    })
}

const escape_text = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const icon_markup = name => {
    const file = path.join(icons_dir, `${name}.svg`)
    return frame_inner(icon_inner(readFileSync(file, 'utf8'), file))
}
const logo_markup = () =>
    readFileSync(path.join(root, 'public/logo.svg'), 'utf8')
        .replace(/^<svg[^>]*>|<\/svg>\s*$/g, '')
        .trim()

function sheet(rtl) {
    const {width} = OG_SIZE
    const cell = PITCH - 1
    // Half a cell lies past the outer edge and past the top and bottom.
    const from_edge = column => -PITCH / 2 + column * PITCH
    const inner_edge = from_edge(SHEET[0].length - 1) + cell
    const x_of = column => (rtl ? from_edge(column) : width - from_edge(column) - cell)
    // One pixel wider than the cells, so the grid line also runs along the outer edge.
    const backing = {x: rtl ? -PITCH / 2 - 1 : width - inner_edge, width: inner_edge + PITCH / 2 + 1}
    const offset = (cell - ICON) / 2
    const cells = SHEET.flatMap((row, r) =>
        row.map((name, column) => {
            const x = x_of(column)
            const y = -PITCH / 2 + r * PITCH
            const selected = name === SELECTED
            const ink = selected ? COLOR.card : COLOR.ink
            return [
                `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${selected ? COLOR.primary : COLOR.card}"/>`,
                `<g transform="translate(${x + offset} ${y + offset}) scale(${ICON / 24})" stroke="${ink}" color="${ink}">${icon_markup(name)}</g>`,
            ].join('')
        }),
    )
    return [
        '<filter id="lift" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#14281e" flood-opacity="0.12"/></filter>',
        `<rect x="${backing.x}" y="-${PITCH}" width="${backing.width}" height="${OG_SIZE.height + 2 * PITCH}" fill="${COLOR.grid}" filter="url(#lift)"/>`,
        `<g fill="none" stroke-width="${DEFAULT_STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round">`,
        ...cells,
        '</g>',
    ].join('\n')
}

const text_x_of = rtl => (rtl ? OG_SIZE.width - MARGIN : MARGIN)
const text_tag = (x, y, size, fill, content, {family = 'IBM Plex Sans Arabic', weight = 400} = {}) =>
    `<text x="${x}" y="${y}" font-family="${family}" font-weight="${weight}" font-size="${size}" fill="${fill}">${escape_text(content)}</text>`

// The text column of both cards: everything between the logo row and the address line is the card's own.
function text_column(language, lines) {
    const rtl = language === 'ar'
    const text_x = text_x_of(rtl)
    const logo_size = 44
    const logo_x = rtl ? text_x - logo_size : text_x
    const brand_x = rtl ? logo_x - 14 : logo_x + logo_size + 14
    return [
        `<g direction="${rtl ? 'rtl' : 'ltr'}" text-anchor="${rtl ? 'end' : 'start'}">`,
        `<svg x="${logo_x}" y="78" width="${logo_size}" height="${logo_size}" viewBox="0 0 24 24" fill="${COLOR.primary}">${logo_markup()}</svg>`,
        text_tag(brand_x, 111, 28, COLOR.ink, SITE[language].name, {weight: 700}),
        ...lines.map(([y, size, fill, content, options]) => text_tag(text_x, y, size, fill, content, options)),
        text_tag(text_x, 560, 24, COLOR.ink, 'islamicons.org', {family: MONO_FAMILY}),
        '</g>',
    ]
}

function og_svg(language) {
    const rtl = language === 'ar'
    const {width, height} = OG_SIZE
    const copy = COPY[language]
    return [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
        `<rect width="${width}" height="${height}" fill="${COLOR.paper}"/>`,
        sheet(rtl),
        ...text_column(language, [
            [276, 72, COLOR.primary, copy.headline[0], {weight: 700}],
            [366, 72, COLOR.ink, copy.headline[1], {weight: 700}],
            ...copy.lead.map((line, i) => [438 + i * 44, 28, COLOR.muted, line]),
        ]),
        '</svg>',
    ].join('\n')
}

// One icon's card: the icon on its 24-unit drawing grid, as the site's icon panel shows it, beside its title.
const CARD = 470
const CARD_ICON = 330
const UNIT = CARD_ICON / 24
const TEXT_WIDTH = OG_SIZE.width - 2 * MARGIN - CARD - 70

const ICON_COPY = {
    ar: {lead: 'مجانية ومفتوحة المصدر', alt: title => `أيقونة «${title}» من مكتبة الأيقونات الإسلامية`},
    en: {lead: 'Free and open source', alt: title => `The ${title} icon from Islamicons`},
}
const icon_file = (name, language) => `og/${name}-${language}.png`

export const icon_og_image = (icon, language) => ({
    path: `/${icon_file(icon.name, language)}`,
    alt: ICON_COPY[language].alt(icon_title(icon, language)),
    ...OG_SIZE,
})

// resvg draws a line as one run, so a long title is shrunk to the column rather than wrapped.
function fitted_size(font, content, size, weight) {
    const probe = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="${2 * size}">${text_tag(0, size, size, COLOR.ink, content, {weight})}</svg>`
    const measured = new Resvg(probe, {font}).getBBox()?.width ?? 0
    return measured > TEXT_WIDTH ? Math.floor((size * TEXT_WIDTH) / measured) : size
}

const card_x_of = rtl => (rtl ? MARGIN : OG_SIZE.width - MARGIN - CARD)

const art_origin = language => [card_x_of(language === 'ar') + (CARD - CARD_ICON) / 2, MARGIN + (CARD - CARD_ICON) / 2]

// The shadow's blur is most of a render and the card is the same on every icon, so it is drawn once per language.
function card_backdrop(language) {
    const {width, height} = OG_SIZE
    const [x, y] = art_origin(language)
    const steps = Array.from({length: 25}, (_, i) => i)
    const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
        `<rect width="${width}" height="${height}" fill="${COLOR.paper}"/>`,
        '<filter id="lift" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="#14281e" flood-opacity="0.08"/></filter>',
        '<radialGradient id="fade" r="0.7"><stop offset="0.6" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>',
        '<mask id="grid-fade"><rect width="24" height="24" fill="url(#fade)"/></mask>',
        `<rect x="${card_x_of(language === 'ar')}" y="${MARGIN}" width="${CARD}" height="${CARD}" rx="40" fill="${COLOR.card}" filter="url(#lift)"/>`,
        `<g transform="translate(${x} ${y}) scale(${UNIT})" fill="none" stroke-width="${1 / UNIT}">`,
        `<g mask="url(#grid-fade)" stroke="${COLOR.grid}">`,
        ...steps.map(i => `<line x1="${i}" y1="0" x2="${i}" y2="24"/><line x1="0" y1="${i}" x2="24" y2="${i}"/>`),
        '</g>',
        `<g stroke="${COLOR.gold}" stroke-opacity="0.45"><circle cx="12" cy="12" r="10"/><rect x="4" y="4" width="16" height="16" rx="2"/></g>`,
        '</g>',
        '</svg>',
    ].join('\n')
    return `data:image/png;base64,${new Resvg(svg).render().asPng().toString('base64')}`
}

function icon_og_svg(icon, language, font, backdrop) {
    const {width, height} = OG_SIZE
    // The variant goes on its own line without its brackets, which resvg would mirror at the wrong end in RTL.
    const [, name, variant] = icon_title(icon, language).match(/^(.*?)(?:\s*\((.*)\))?$/)
    const [x, y] = art_origin(language)
    return [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
        `<image width="${width}" height="${height}" href="${backdrop}"/>`,
        // Unframed, so the art sits on the grid lines exactly as it was drawn.
        `<g transform="translate(${x} ${y}) scale(${UNIT})" fill="none" stroke="${COLOR.primary}" color="${COLOR.primary}" stroke-width="${DEFAULT_STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round">${icon.art}</g>`,
        ...text_column(language, [
            [236, 28, COLOR.primary, category_title(icon, language)],
            [316, fitted_size(font, name, 72, 700), COLOR.ink, name, {weight: 700}],
            ...(variant ? [[372, fitted_size(font, variant, 36, 400), COLOR.muted, variant]] : []),
            [470, 28, COLOR.muted, ICON_COPY[language].lead],
        ]),
        '</svg>',
    ].join('\n')
}

function with_fonts(language, use) {
    const fonts_tmp = mkdtempSync(path.join(tmpdir(), 'islamicons-og-'))
    try {
        return use({fontFiles: font_files(fonts_tmp, language), loadSystemFonts: false})
    } finally {
        rmSync(fonts_tmp, {recursive: true, force: true})
    }
}

const render_og_image = language => with_fonts(language, font => new Resvg(og_svg(language), {font}).render().asPng())

export const og_assets = () =>
    Object.keys(COPY).map(language => ({fileName: og_file(language), source: render_og_image(language)}))

// `icons` are read_catalog() records (scripts/icon-catalog.js).
export const icon_og_assets = icons =>
    Object.keys(ICON_COPY).flatMap(language =>
        with_fonts(language, font => {
            const backdrop = card_backdrop(language)
            return icons.map(icon => ({
                fileName: icon_file(icon.name, language),
                source: new Resvg(icon_og_svg(icon, language, font, backdrop), {font}).render().asPng(),
            }))
        }),
    )

// `pnpm og [name…]` also draws the named icons' cards.
if (process.argv[1] === import.meta.filename) {
    const names = process.argv.slice(2)
    const out_dir = path.join(root, 'tmp/og')
    mkdirSync(path.join(out_dir, 'og'), {recursive: true})
    const icons = read_catalog().filter(icon => names.includes(icon.name))
    for (const asset of [...og_assets(), ...icon_og_assets(icons)])
        writeFileSync(path.join(out_dir, asset.fileName), asset.source)
    console.log(`written to ${path.relative(root, out_dir)}/`)
}
