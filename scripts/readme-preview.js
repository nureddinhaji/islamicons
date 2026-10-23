// Writes the readme's preview sheet from the icons themselves: `pnpm preview:readme` after icons change.
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import path from 'node:path'

import {DEFAULT_STROKE_WIDTH, frame_inner} from '../src/lib/frame.js'
import {icon_inner} from '../src/lib/icon-file.js'

const ICONS = [
    'mosque',
    'kaaba',
    'quran',
    'rehal',
    'prayer-beads',
    'lantern',
    'star-and-crescent',
    'dome',
    'minaret',
    'mihrab',
    'dome-of-the-rock',
    'prayer-mat',
    'adhan',
    'wudu',
    'takbir',
    'sujud',
    'dua',
    'tasbih-counter',
    'khutbah',
    'prayer-times',
    'fajr',
    'maghrib',
    'qibla-compass',
    'map-pin-mosque',
    'rub-el-hizb',
    'end-of-ayah',
    'ayah',
    'tilawa',
    'tajweed',
    'tafsir',
    'hifz',
    'hadith',
    'islamic-library',
    'dictionary',
    'hijri-calendar',
    'ramadan',
    'iftar',
    'zakat',
    'sadaqah-box',
    'udhiyah',
    'ihram',
    'tawaf',
    'sai',
    'zamzam',
    'mina-tents',
    'arafat',
    'jamarat',
    'user-hijab',
]
const COLUMNS = 12
const CELL = 64
const SIZE = 32
// The brand green in each theme: --primary in src/css/tailwind.css (light, as index.html's theme-color, and dark).
const INK = {light: '#1f6b55', dark: '#4ebc97'}

const icons_dir = path.resolve(import.meta.dirname, '../icons')
const out_dir = path.resolve(import.meta.dirname, '../.github')

const rows = Math.ceil(ICONS.length / COLUMNS)
const width = COLUMNS * CELL
const height = rows * CELL
const offset = (CELL - SIZE) / 2
const scale = SIZE / 24

const cells = ICONS.map((name, i) => {
    const file = path.join(icons_dir, `${name}.svg`)
    const inner = frame_inner(icon_inner(readFileSync(file, 'utf8'), file))
    const x = (i % COLUMNS) * CELL + offset
    const y = Math.floor(i / COLUMNS) * CELL + offset
    return `  <g transform="translate(${x} ${y}) scale(${scale})">${inner}</g>`
})

mkdirSync(out_dir, {recursive: true})
for (const [theme, ink] of Object.entries(INK)) {
    const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" stroke="${ink}" stroke-width="${DEFAULT_STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round" color="${ink}" overflow="visible">`,
        ...cells,
        '</svg>',
        '',
    ].join('\n')
    writeFileSync(path.join(out_dir, `preview-${theme}.svg`), svg)
}
console.log(`${ICONS.length} icons, ${COLUMNS} × ${rows}, written to .github/preview-{light,dark}.svg`)
