// Pure geometry for the presentation frame: no DOM, so the site, scripts/check-icons.js and future packages share it.

// Pixels at 24 px: 80 % of the drawn 2, because the art is dense and a lighter line opens the gaps between its details
export const DEFAULT_STROKE_WIDTH = 1.6

const CENTRE = 12
const PARAM_COUNTS = {m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0}
const NUMBER = /^[\s,]*(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/
const ARC_FLAG = /^[\s,]*([01])/
const COMMAND = /^[\s,]*([MmLlHhVvCcSsQqTtAaZz])/

// The art keeps every path within 2–22; scaled by s about the centre with a t-wide stroke, its outer edge
// sits at s·10 + t/2, which is the box edge (12) when s = 1.2 − t/20.
export const frame_scale = (stroke_width = DEFAULT_STROKE_WIDTH) => 1.2 - stroke_width / 20

export function parse_path(d) {
    const segments = []
    let rest = d
    let command = null
    while (rest.trim()) {
        const letter = COMMAND.exec(rest)
        if (letter) {
            command = letter[1]
            rest = rest.slice(letter[0].length)
        } else if (!command) {
            throw new Error(`path data must start with a command: ${d}`)
        }
        const count = PARAM_COUNTS[command.toLowerCase()]
        const args = []
        for (let i = 0; i < count; i++) {
            const match = (command.toLowerCase() === 'a' && (i === 3 || i === 4) ? ARC_FLAG : NUMBER).exec(rest)
            if (!match) throw new Error(`bad ${command} arguments in: ${d}`)
            args.push(Number(match[1]))
            rest = rest.slice(match[0].length)
        }
        segments.push({command, args})
        // numbers that follow a moveto without a letter are linetos
        if (command === 'M') command = 'L'
        else if (command === 'm') command = 'l'
        else if (count === 0) command = null
    }
    return segments
}

// Each segment with its absolute start point, absolute arguments and absolute end point.
export function* walk_path(segments) {
    let x = 0
    let y = 0
    let start_x = 0
    let start_y = 0
    for (const [index, {command, args}] of segments.entries()) {
        const lower = command.toLowerCase()
        // SVG: a relative moveto that opens the path takes absolute coordinates
        const relative = command === lower && !(index === 0 && lower === 'm')
        const abs_x = value => (relative ? x + value : value)
        const abs_y = value => (relative ? y + value : value)
        let abs
        if (lower === 'h') abs = [abs_x(args[0])]
        else if (lower === 'v') abs = [abs_y(args[0])]
        else if (lower === 'a') abs = [...args.slice(0, 5), abs_x(args[5]), abs_y(args[6])]
        else abs = args.map((value, i) => (i % 2 ? abs_y(value) : abs_x(value)))
        const from = [x, y]
        if (lower === 'z') [x, y] = [start_x, start_y]
        else if (lower === 'h') x = abs[0]
        else if (lower === 'v') y = abs[0]
        else [x, y] = abs.slice(-2)
        if (lower === 'm') [start_x, start_y] = [x, y]
        yield {command, lower, args, abs, relative, from, to: [x, y]}
    }
}

// Λ from the SVG arc notes (F.6.6): at 1 the radii span the chord exactly, as in a semicircle.
export function arc_radii_ratio({from, to, args}) {
    const [rx, ry, rotation] = args
    if (!rx || !ry) return 0
    const angle = (rotation * Math.PI) / 180
    const half_dx = (from[0] - to[0]) / 2
    const half_dy = (from[1] - to[1]) / 2
    const x1 = Math.cos(angle) * half_dx + Math.sin(angle) * half_dy
    const y1 = -Math.sin(angle) * half_dx + Math.cos(angle) * half_dy
    return (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry)
}

// 4 decimals: near-semicircle arcs amplify rounding ~40× (tawaf's Λ is 0.9993), and 3 decimals moved one by 0.009
const format = value => {
    const text = (Math.round(value * 10000) / 10000).toString()
    return text === '-0' ? '0' : text
}

export function scale_path(d, scale) {
    let out = ''
    for (const segment of walk_path(parse_path(d))) {
        const point = value => (segment.relative ? value * scale : CENTRE + (value - CENTRE) * scale)
        if (segment.lower === 'a') {
            const [rx, ry, rotation, large_arc, sweep, x, y] = segment.args
            // A semicircle is ill-conditioned: a radius rounded a hair past half the chord flattens it visibly. Written a
            // hair under, renderers must scale it back up to span the chord, so the arc stays an exact semicircle.
            const spans_chord = Math.abs(arc_radii_ratio(segment) - 1) <= 1e-6
            const radius = r => (spans_chord ? Math.floor((r * scale - 0.0002) * 10000) / 10000 : r * scale)
            const values = [radius(rx), radius(ry), rotation].map(format)
            out += `${segment.command}${[...values, large_arc, sweep, format(point(x)), format(point(y))].join(' ')}`
        } else {
            out += segment.command + segment.args.map(value => format(point(value))).join(' ')
        }
    }
    return out
}

const POSITION_ATTRS = new Set(['cx', 'cy', 'x', 'y', 'x1', 'y1', 'x2', 'y2'])
const LENGTH_ATTRS = new Set(['r', 'rx', 'ry', 'width', 'height'])

// Scales every shape of an icon's inner markup about the centre; attributes other than geometry stay as they are.
export function scale_inner(inner, scale) {
    return inner.replace(
        /<(path|circle|ellipse|rect|line|polyline|polygon)\b([^>]*?)(\/?)>/g,
        (_, tag, attrs, close) => {
            const scaled = attrs.replace(/([\w-]+)="([^"]*)"/g, (whole, name, value) => {
                if (name === 'd') return `d="${scale_path(value, scale)}"`
                if (name === 'points') {
                    const numbers = value
                        .trim()
                        .split(/[\s,]+/)
                        .map(Number)
                    return `points="${numbers.map(n => format(CENTRE + (n - CENTRE) * scale)).join(' ')}"`
                }
                if (POSITION_ATTRS.has(name)) return `${name}="${format(CENTRE + (Number(value) - CENTRE) * scale)}"`
                if (LENGTH_ATTRS.has(name)) return `${name}="${format(Number(value) * scale)}"`
                return whole
            })
            return `<${tag}${scaled}${close}>`
        },
    )
}

export const frame_inner = (inner, stroke_width = DEFAULT_STROKE_WIDTH) => scale_inner(inner, frame_scale(stroke_width))

// `framed` must already be framed at `stroke_width`: this writes that width on the root but never rescales the art.
export function svg_document(framed, {size = 24, stroke_width = DEFAULT_STROKE_WIDTH, color = 'currentColor'} = {}) {
    // A standalone file has no text colour for fill="currentColor" to inherit, so solid parts take the chosen colour.
    const filled = color === 'currentColor' ? framed : framed.replaceAll('fill="currentColor"', `fill="${color}"`)
    const body = filled.replace(/></g, '>\n  <')
    // The stroke meets the box edge, and browsers clip an inline <svg> there, shaving it at fractional sizes.
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke_width}" stroke-linecap="round" stroke-linejoin="round" overflow="visible">\n  ${body}\n</svg>`
}
