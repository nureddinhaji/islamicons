// Review sheet for drawing icons. Usage: pnpm sheet <name|file.svg>... [--with a,b,c] [--out file.png]
// One column per icon (several = a comparison): the art on the grid with keylines, centrelines and anchors, the shown
// sizes on light and dark, measurements against the set, and each icon at shown size among its siblings.
import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs'
import path from 'node:path'

import {Resvg} from '@resvg/resvg-js'

import {DEFAULT_STROKE_WIDTH, frame_inner, parse_path, walk_path} from '../src/lib/frame.js'
import {read_icon, to_inner} from '../src/lib/icon-file.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const ICONS_DIR = path.join(ROOT, 'icons')
const SIZES = [16, 20, 24, 32, 48]
// CONTRIBUTING: the set reads from 20 px; at 16 px it is shown at stroke 1.4.
const stroke_at = size => (size <= 16 ? 1.4 : DEFAULT_STROKE_WIDTH)
const DEFAULT_SIBLINGS = ['mosque', 'kaaba', 'quran', 'lantern', 'prayer-times', 'crescent']
const MEASURE = 10
const MASK = 24 * MEASURE
const PAD = 24
const INK = '#18181b'
const PAPER = '#fafafa'
const ACCENT = '#e11d48'
// resvg maps the generic sans-serif to Arial, which most Linux systems lack; these cover Linux, macOS and Windows.
const FONT = 'Noto Sans, DejaVu Sans, Helvetica, Arial, sans-serif'

function parse_args(argv) {
    const options = {inputs: [], siblings: DEFAULT_SIBLINGS, out: null}
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i]
        if (arg !== '--with' && arg !== '--out') {
            options.inputs.push(arg)
            continue
        }
        const value = argv[++i]
        if (!value || value.startsWith('--')) return null
        if (arg === '--with') options.siblings = value.split(',').filter(Boolean)
        else options.out = value
    }
    return options
}

function load(input) {
    const is_file = input.endsWith('.svg') || input.includes('/')
    const file = is_file ? path.resolve(input) : path.join(ICONS_DIR, `${input}.svg`)
    const label = path.basename(file, '.svg')
    const {elements, problems} = read_icon(readFileSync(file, 'utf8'))
    if (problems.length) throw new Error(`${label}: ${problems.join('; ')}`)
    return {label, elements, inner: to_inner(elements)}
}

const art_svg = (inner, size) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#000" color="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

function alpha(inner) {
    const pixels = new Resvg(art_svg(inner, MASK), {font: {loadSystemFonts: false}}).render().pixels
    const out = new Float32Array(MASK * MASK)
    for (let i = 0; i < out.length; i++) out[i] = pixels[i * 4 + 3] / 255
    return out
}

// Two-pass chamfer distance (in pixels) from every pixel to the nearest inked one.
function distance_field(mask) {
    const field = new Float32Array(mask.length).map((_, i) => (mask[i] > 0.5 ? 0 : Infinity))
    const step = (i, j, cost) => {
        if (field[j] + cost < field[i]) field[i] = field[j] + cost
    }
    for (let y = 0; y < MASK; y++)
        for (let x = 0; x < MASK; x++) {
            const i = y * MASK + x
            if (x > 0) step(i, i - 1, 1)
            if (y > 0) step(i, i - MASK, 1)
            if (x > 0 && y > 0) step(i, i - MASK - 1, Math.SQRT2)
            if (x < MASK - 1 && y > 0) step(i, i - MASK + 1, Math.SQRT2)
        }
    for (let y = MASK - 1; y >= 0; y--)
        for (let x = MASK - 1; x >= 0; x--) {
            const i = y * MASK + x
            if (x < MASK - 1) step(i, i + 1, 1)
            if (y < MASK - 1) step(i, i + MASK, 1)
            if (x < MASK - 1 && y < MASK - 1) step(i, i + MASK + 1, Math.SQRT2)
            if (x > 0 && y < MASK - 1) step(i, i + MASK - 1, Math.SQRT2)
        }
    return field
}

// Edge-to-edge distance between the strokes of two elements, in grid units; 0 means they touch.
function gap_between(field, mask) {
    let best = Infinity
    for (let i = 0; i < mask.length; i++) if (mask[i] > 0.5 && field[i] < best) best = field[i]
    return Math.max(0, best - 1) / MEASURE
}

function measure({elements, inner}) {
    const mask = alpha(inner)
    let ink = 0
    let [sx, sy] = [0, 0]
    let [x0, y0, x1, y1] = [MASK, MASK, -1, -1]
    for (let y = 0; y < MASK; y++)
        for (let x = 0; x < MASK; x++) {
            const a = mask[y * MASK + x]
            ink += a
            sx += a * x
            sy += a * y
            if (a > 0.5) [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)]
        }
    const parts = elements.map(element => alpha(to_inner([element])))
    const fields = parts.map(distance_field)
    let tightest = Infinity
    let touching = 0
    for (let i = 0; i < parts.length; i++)
        for (let j = i + 1; j < parts.length; j++) {
            const gap = gap_between(fields[i], parts[j])
            if (gap === 0) touching++
            else tightest = Math.min(tightest, gap)
        }
    const unit = value => value / MEASURE
    return {
        ink: ink / mask.length,
        // pixel i covers i..i+1, so its centre is i + 0.5
        centre: [unit(sx / ink + 0.5) - 12, unit(sy / ink + 0.5) - 12],
        // the ink box less half the drawn stroke: where the paths themselves reach
        bounds: [unit(x0) + 1, unit(y0) + 1, unit(x1 + 1) - 1, unit(y1 + 1) - 1],
        tightest,
        touching,
    }
}

const median = values => {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)]
}

function set_medians() {
    const all = readdirSync(ICONS_DIR)
        .filter(file => file.endsWith('.svg'))
        .map(file => measure(load(path.join(ICONS_DIR, file))))
    return {ink: median(all.map(m => m.ink)), tightest: median(all.map(m => m.tightest))}
}

function anchors(elements) {
    return elements
        .filter(({tag}) => tag === 'path')
        .flatMap(({attrs}) => [...walk_path(parse_path(attrs.d))].filter(s => s.lower !== 'z').map(s => s.to))
}

const text = (x, y, value, {size = 13, fill = '#52525b', weight = 400} = {}) =>
    `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}">${value}</text>`

function grid_view({elements, inner}, x, y, zoom) {
    const hair = 1 / zoom
    const lines = Array.from({length: 25}, (_, i) => {
        const tone = i === 12 ? '#cbd5e1' : i % 4 ? '#eceff3' : '#dde2e8'
        return `<path d="M${i} 0V24M0 ${i}H24" stroke="${tone}" stroke-width="${hair}"/>`
    }).join('')
    const keylines = [
        `<circle cx="12" cy="12" r="10" stroke="#7dd3fc"/>`,
        `<rect x="3" y="3" width="18" height="18" rx="2" stroke="#c4b5fd"/>`,
        `<rect x="4" y="2" width="16" height="20" rx="2" stroke="#ddd6fe"/>`,
        `<rect x="2" y="4" width="20" height="16" rx="2" stroke="#ddd6fe"/>`,
        `<rect x="2" y="2" width="20" height="20" stroke="#f59e0b" stroke-dasharray="${4 * hair} ${3 * hair}"/>`,
    ].join('')
    const centreline = inner.replace(/fill="currentColor"/g, 'fill="none"')
    const dots = anchors(elements)
        .map(([ax, ay]) => `<circle cx="${ax}" cy="${ay}" r="${2.2 * hair}"/>`)
        .join('')
    return `<g transform="translate(${x} ${y}) scale(${zoom})">
        <rect width="24" height="24" fill="#fff"/>${lines}
        <g fill="none" stroke-width="${1.25 * hair}">${keylines}</g>
        <g fill="none" stroke="${INK}" stroke-opacity="0.8" color="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>
        <g fill="none" stroke="${ACCENT}" stroke-width="${hair}">${centreline}</g>
        <g fill="${ACCENT}">${dots}</g>
    </g>`
}

const shown = (inner, x, y, size, ink) =>
    `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${ink}" color="${ink}" stroke-width="${stroke_at(size)}" stroke-linecap="round" stroke-linejoin="round">${frame_inner(inner, stroke_at(size))}</g>`

function sizes_row(inner, x, y, ink, background) {
    let cursor = x
    let out = background
        ? `<rect x="${x - 10}" y="${y - 10}" width="${size_row_width + 20}" height="68" rx="6" fill="${background}"/>`
        : ''
    for (const size of SIZES) {
        out += shown(inner, cursor, y + 48 - size, size, ink)
        cursor += size + 16
    }
    return out
}
const size_row_width = SIZES.reduce((sum, size) => sum + size + 16, -16)

const PIXEL_SIZES = [24, 32]

// Each pixel's coverage as a browser paints it, enlarged: a tip that renders lighter than a straight stroke beside it
// shows here as it does on screen, which the smooth grid view hides.
function pixel_view(inner, size, x, y, cell) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#000" color="#000" stroke-width="${stroke_at(size)}" stroke-linecap="round" stroke-linejoin="round">${frame_inner(inner, stroke_at(size))}</svg>`
    const pixels = new Resvg(svg, {font: {loadSystemFonts: false}}).render().pixels
    const span = size * cell
    const lines = Array.from(
        {length: size - 1},
        (_, k) => `M${x + (k + 1) * cell} ${y}v${span}M${x} ${y + (k + 1) * cell}h${span}`,
    )
    let out = `<rect x="${x}" y="${y}" width="${span}" height="${span}" fill="#fff" stroke="#d4d4d8"/>`
    out += `<path d="${lines.join('')}" stroke="#f0f0f2" stroke-width="0.5"/>`
    for (let i = 0; i < size * size; i++) {
        const coverage = pixels[i * 4 + 3]
        if (coverage)
            out += `<rect x="${x + (i % size) * cell}" y="${y + Math.floor(i / size) * cell}" width="${cell}" height="${cell}" fill="${INK}" fill-opacity="${(coverage / 255).toFixed(3)}"/>`
    }
    return out
}

const fixed = (value, digits = 2) => {
    // `|| 0` turns a rounded -0 into 0, so a centred icon prints +0.00
    const rounded = Number(value.toFixed(digits)) || 0
    return (rounded >= 0 ? '+' : '') + rounded.toFixed(digits)
}

function metrics_lines(m, set) {
    const [bx0, by0, bx1, by1] = m.bounds.map(v => v.toFixed(1))
    const outside = m.bounds[0] < 1.9 || m.bounds[1] < 1.9 || m.bounds[2] > 22.1 || m.bounds[3] > 22.1
    return [
        [`ink ${(m.ink * 100).toFixed(1)}%  (set median ${(set.ink * 100).toFixed(1)}%)`],
        [`centre of ink ${fixed(m.centre[0])}, ${fixed(m.centre[1])}`],
        [`paths reach x ${bx0}–${bx1}, y ${by0}–${by1}`, outside ? ACCENT : undefined],
        [
            `tightest gap ${Number.isFinite(m.tightest) ? m.tightest.toFixed(2) : 'none'}  (set median ${set.tightest.toFixed(2)})`,
        ],
        [`touching pairs ${m.touching}`],
    ]
}

function build_sheet(icons, siblings, set) {
    const zoom = icons.length === 1 ? 16 : icons.length === 2 ? 12 : 8
    const column = Math.max(24 * zoom, size_row_width + 20)
    const gutter = 40
    const cells = PIXEL_SIZES.map(size => Math.floor((column - 12) / 2 / size))
    const pixel_block = 22 + Math.max(...PIXEL_SIZES.map((size, i) => size * cells[i])) + 24
    let body = ''
    const top = PAD + 20
    for (const [index, icon] of icons.entries()) {
        const x = PAD + index * (column + gutter)
        let y = top
        body += text(x, y - 6, icon.label, {size: 14, fill: INK, weight: 600})
        body += grid_view(icon, x, y, zoom)
        y += 24 * zoom + 34
        body += sizes_row(icon.inner, x + 10, y, INK, null)
        y += 78
        body += sizes_row(icon.inner, x + 10, y, PAPER, INK)
        y += 92
        for (const [line_index, [line, fill]] of metrics_lines(icon.metrics, set).entries())
            body += text(x, y + line_index * 19, line, fill ? {fill} : undefined)
        y += 5 * 19 + 10
        body += text(x, y, `pixels at ${PIXEL_SIZES.join(' and ')} px`, {size: 12})
        let px_x = x
        for (const [i, size] of PIXEL_SIZES.entries()) {
            body += pixel_view(icon.inner, size, px_x, y + 10, cells[i])
            px_x += size * cells[i] + 12
        }
    }
    let y = top + 24 * zoom + 34 + 78 + 92 + 5 * 19 + 10 + pixel_block
    body += text(PAD, y, 'among the set, as shown', {size: 13, fill: INK, weight: 600})
    y += 18
    for (const icon of icons) {
        if (icons.length > 1) {
            y += 14
            body += text(PAD, y - 4, icon.label, {size: 12})
        }
        for (const size of [32, 20]) {
            const row = [...siblings.slice(0, 3), icon, ...siblings.slice(3)]
            row.forEach((item, i) => (body += shown(item.inner, PAD + i * (size + 22), y, size, INK)))
            y += size + 14
        }
        y += 10
    }
    const width = PAD * 2 + icons.length * column + (icons.length - 1) * gutter
    const height = y + PAD
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`
}

const options = parse_args(process.argv.slice(2))
if (!options?.inputs.length) {
    console.error('usage: pnpm sheet <name|file.svg>... [--with a,b,c] [--out file.png]')
    process.exit(1)
}
let icons, siblings
try {
    icons = options.inputs.map(load)
    siblings = options.siblings.map(load)
} catch (error) {
    console.error(error.code === 'ENOENT' ? `not found: ${error.path}` : error.message)
    process.exit(1)
}
const set = set_medians()
for (const icon of icons) icon.metrics = measure(icon)

const out = path.resolve(options.out ?? path.join(ROOT, 'tmp/sheets', `${icons.map(i => i.label).join('+')}.png`))
mkdirSync(path.dirname(out), {recursive: true})
const sheet = build_sheet(icons, siblings, set)
writeFileSync(out, new Resvg(sheet, {font: {loadSystemFonts: true}}).render().asPng())

for (const icon of icons) {
    const m = icon.metrics
    console.log(
        `${icon.label}: ink ${(m.ink * 100).toFixed(1)}%, centre ${fixed(m.centre[0])},${fixed(m.centre[1])}, ` +
            `reach ${m.bounds.map(v => v.toFixed(1)).join(' ')}, tightest gap ${Number.isFinite(m.tightest) ? m.tightest.toFixed(2) : 'none'}, touching ${m.touching}`,
    )
}
console.log(`set median: ink ${(set.ink * 100).toFixed(1)}%, tightest gap ${set.tightest.toFixed(2)}`)
console.log(path.relative(process.cwd(), out))
