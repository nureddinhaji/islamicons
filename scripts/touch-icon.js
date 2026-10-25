// The home-screen icon (apple-touch-icon): iOS ignores an SVG icon there and shows a page thumbnail instead, so the
// build draws this PNG from public/logo.svg.
import {readFileSync} from 'node:fs'
import path from 'node:path'

import {Resvg} from '@resvg/resvg-js'

// iOS fills transparency with black and rounds the corners itself, so the tile is opaque and square, and the mark
// keeps clear of the rounding.
const SIZE = 180
const MARK_WIDTH = 0.62
// Mirrors --primary (light) in src/css/tailwind.css, as index.html's theme-color.
const TILE = '#1f6b55'
const MARK = '#ffffff'

export function touch_icon_asset() {
    const logo = readFileSync(path.resolve(import.meta.dirname, '../public/logo.svg'), 'utf8')
    // Centred by its drawn bounds: the mark does not fill its 24 box evenly.
    const box = new Resvg(logo).getBBox()
    const scale = (SIZE * MARK_WIDTH) / box.width
    const x = (SIZE - box.width * scale) / 2 - box.x * scale
    const y = (SIZE - box.height * scale) / 2 - box.y * scale
    const inner = logo.replace(/^<svg[^>]*>|<\/svg>\s*$/g, '').trim()
    const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">`,
        `<rect width="${SIZE}" height="${SIZE}" fill="${TILE}"/>`,
        `<g transform="translate(${x} ${y}) scale(${scale})" fill="${MARK}">${inner}</g>`,
        '</svg>',
    ].join('')
    return {fileName: 'apple-touch-icon.png', source: new Resvg(svg).render().asPng()}
}
