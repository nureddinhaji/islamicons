import {frame_scale, parse_path, walk_path} from '../src/lib/frame.js'

export const TOLERANCE = 0.001
const TOUCH = 2 * TOLERANCE
const mix = (a, b, t = 0.5) => a.map((v, i) => v + (b[i] - v) * t)
const dot = (a, b) => a[0] * b[0] + a[1] * b[1]
const subtract = (a, b) => a.map((v, i) => v - b[i])
const clamp = t => Math.max(0, Math.min(1, t))
const project = (p, a, b) => {
    const v = subtract(b, a)
    return mix(a, b, clamp(dot(subtract(p, a), v) / (dot(v, v) || 1)))
}

export function segment_distance(a0, a1, b0, b1) {
    const u = subtract(a1, a0)
    const v = subtract(b1, b0)
    const cross = (a, b) => a[0] * b[1] - a[1] * b[0]
    const den = cross(u, v)
    const w = subtract(b0, a0)
    // float noise leaves collinear segments a tiny cross product, which would read as a crossing
    if (Math.abs(den) > 1e-9 * Math.hypot(...u) * Math.hypot(...v)) {
        const s = cross(w, v) / den
        const t = cross(w, u) / den
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            const p = mix(a0, a1, s)
            return {distance: 0, p, q: p}
        }
    }
    return [
        [a0, project(a0, b0, b1)],
        [a1, project(a1, b0, b1)],
        [project(b0, a0, a1), b0],
        [project(b1, a0, a1), b1],
    ]
        .map(([p, q]) => ({distance: Math.hypot(...subtract(p, q)), p, q}))
        .sort((a, b) => a.distance - b.distance)[0]
}

function bezier(points) {
    const [a, b, c, d] = points
    if (Math.max(...[b, c].map(p => Math.hypot(...subtract(p, project(p, a, d))))) <= TOLERANCE) return [d]
    const ab = mix(a, b),
        bc = mix(b, c),
        cd = mix(c, d)
    const abc = mix(ab, bc),
        bcd = mix(bc, cd)
    const mid = mix(abc, bcd)
    return [...bezier([a, ab, abc, mid]), ...bezier([mid, bcd, cd, d])]
}

function ellipse_points(cx, cy, rx, ry, phi, start, delta) {
    const n = Math.ceil(Math.abs(delta) / (2 * Math.acos(Math.max(-1, 1 - TOLERANCE / Math.max(rx, ry)))))
    return Array.from({length: n}, (_, i) => {
        const theta = start + (delta * (i + 1)) / n
        return [
            cx + rx * Math.cos(theta) * Math.cos(phi) - ry * Math.sin(theta) * Math.sin(phi),
            cy + rx * Math.cos(theta) * Math.sin(phi) + ry * Math.sin(theta) * Math.cos(phi),
        ]
    })
}

// SVG F.6.5, matching check-icons.js; endpoint-equal arcs draw nothing.
function arc_points(from, [rx, ry, rotation, large_arc, sweep, x2, y2]) {
    if (!rx || !ry) return [[x2, y2]]
    if (from[0] === x2 && from[1] === y2) return []
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
    const points = ellipse_points(cx, cy, arx, ary, phi, start, delta)
    points[points.length - 1] = [x2, y2]
    return points
}

function path_parts(d) {
    const parts = []
    let part, control, previous
    for (const {lower, abs, from, to} of walk_path(parse_path(d))) {
        if (lower === 'm') {
            part = {points: [to]}
            parts.push(part)
        } else if ('csqt'.includes(lower)) {
            const cubic = lower === 'c' || lower === 's'
            const compatible = cubic ? previous === 'c' || previous === 's' : previous === 'q' || previous === 't'
            const reflected = compatible ? from.map((v, i) => 2 * v - control[i]) : from
            let c1, c2
            if (lower === 'c') [c1, c2] = [abs.slice(0, 2), abs.slice(2, 4)]
            else if (lower === 's') [c1, c2] = [reflected, abs.slice(0, 2)]
            else {
                control = lower === 'q' ? abs.slice(0, 2) : reflected
                c1 = mix(from, control, 2 / 3)
                c2 = mix(to, control, 2 / 3)
            }
            part.points.push(...bezier([from, c1, c2, to]))
            if (cubic) control = c2
        } else {
            part.points.push(...(lower === 'a' ? arc_points(from, abs) : [to]))
        }
        previous = lower
    }
    return parts
}

export function icon_parts(elements) {
    return elements.flatMap(({tag, attrs}, index) => {
        const a = Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, Number(v)]))
        let parts
        if (tag === 'path') parts = path_parts(attrs.d)
        else if (tag === 'circle' || tag === 'ellipse') {
            const rx = a.r ?? a.rx,
                ry = a.r ?? a.ry
            const points = [[a.cx + rx, a.cy], ...ellipse_points(a.cx, a.cy, rx, ry, 0, 0, 2 * Math.PI)]
            points[points.length - 1] = points[0]
            parts = [{points}]
        } else if (tag === 'rect') {
            const {x, y, width: w, height: h} = a
            const rx = Math.min(a.rx ?? a.ry ?? 0, w / 2),
                ry = Math.min(a.ry ?? a.rx ?? 0, h / 2)
            parts = path_parts(
                rx && ry
                    ? `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`
                    : `M${x} ${y}h${w}v${h}h${-w}Z`,
            )
        } else {
            const numbers =
                tag === 'line'
                    ? [a.x1, a.y1, a.x2, a.y2]
                    : attrs.points
                          .trim()
                          .split(/[\s,]+/)
                          .map(Number)
            const points = []
            for (let i = 0; i < numbers.length; i += 2) points.push(numbers.slice(i, i + 2))
            if (tag === 'polygon') points.push(points[0])
            parts = [{points}]
        }
        return (
            parts
                .map((part, subpath) => ({
                    ...part,
                    filled: attrs.fill === 'currentColor',
                    element: index,
                    label: 'e' + (index + 1) + (parts.length > 1 ? '/' + (subpath + 1) : ''),
                }))
                // a lone moveto draws nothing
                .filter(part => part.points.length > 1)
        )
    })
}

const bounds = points => [
    Math.min(...points.map(p => p[0])),
    Math.min(...points.map(p => p[1])),
    Math.max(...points.map(p => p[0])),
    Math.max(...points.map(p => p[1])),
]
const box_distance = (a, b) => Math.hypot(Math.max(0, a[0] - b[2], b[0] - a[2]), Math.max(0, a[1] - b[3], b[1] - a[3]))
const segments = part =>
    part.points.slice(1).map((p, i) => ({a: part.points[i], b: p, box: bounds([part.points[i], p])}))

const samples = (a, b) => {
    const n = Math.max(4, Math.ceil(Math.hypot(...subtract(b, a)) / 0.1))
    return Array.from({length: n + 1}, (_, i) => mix(a, b, i / n))
}

function pair_distance(a, b) {
    const sa = a.segments,
        sb = b.segments
    let distance = Infinity
    for (const u of sa)
        for (const v of sb)
            if (box_distance(u.box, v.box) < distance)
                distance = Math.min(distance, segment_distance(u.a, u.b, v.a, v.b).distance)
    const window = distance + 0.05
    const found = new Map()
    const add = (p, q, d = Math.hypot(...subtract(p, q))) => {
        const key = [...p, ...q].map(v => Math.round(v * 20)).join()
        if (d <= window && !(found.get(key)?.distance <= d)) found.set(key, {distance: d, p, q})
    }
    // A straight part is one segment, so its closest spot alone misses a clear middle between two bridged ends.
    for (const u of sa)
        for (const v of sb) {
            if (box_distance(u.box, v.box) > window) continue
            const closest = segment_distance(u.a, u.b, v.a, v.b)
            if (closest.distance > window) continue
            add(closest.p, closest.q, closest.distance)
            for (const p of samples(u.a, u.b)) add(p, project(p, v.a, v.b))
            for (const q of samples(v.a, v.b)) add(project(q, u.a, u.b), q)
        }
    return {distance, candidates: [...found.values()].sort((a, b) => a.distance - b.distance)}
}

function inside(p, part) {
    let odd = false
    const points = part.points
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const a = points[i],
            b = points[j]
        if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) odd = !odd
    }
    return odd
}

// fills: the subpaths of each filled element together, so a hole in a compound fill is not ink
function ink_at(p, parts, fills, radius) {
    const reach = radius + 1e-10,
        point = [p[0], p[1], p[0], p[1]]
    return (
        fills.some(fill => fill.filter(part => inside(p, part)).length % 2) ||
        parts.some(
            part =>
                box_distance(point, part.box) <= reach &&
                part.segments.some(
                    s =>
                        box_distance(point, s.box) <= reach &&
                        Math.hypot(...subtract(p, project(p, s.a, s.b))) <= reach,
                ),
        )
    )
}

export const shown_gap = (drawn, stroke) => (stroke === 2 ? drawn : frame_scale(stroke) * (drawn + 2) - stroke)

// The two stroke edges are ink by construction, so only points strictly between them are tested.
function clear_between({p, q, distance}, parts, fills, radius) {
    const start = mix(p, q, radius / distance),
        end = mix(q, p, radius / distance)
    const n = Math.max(4, Math.ceil((distance - 2 * radius) / 0.05))
    for (let i = 1; i < n; i++) if (!ink_at(mix(start, end, i / n), parts, fills, radius)) return true
    return false
}

export function measure_gaps(parts, strokes = [2]) {
    parts = parts.map(part => ({...part, box: bounds(part.points), segments: segments(part)}))
    const fills = [
        ...Map.groupBy(
            parts.filter(part => part.filled),
            part => part.element,
        ).values(),
    ]
    const results = strokes.map(stroke => ({stroke, pairs: [], tightest: null, touching: 0, opening: []}))
    for (let i = 0; i < parts.length; i++)
        for (let j = i + 1; j < parts.length; j++) {
            const lower = box_distance(parts[i].box, parts[j].box) - 2
            if (lower > TOUCH && results.every(r => r.tightest && lower > r.tightest.drawn)) continue
            const {distance, candidates} = pair_distance(parts[i], parts[j])
            const touching = distance - 2 <= TOUCH
            for (const result of results) {
                const radius = result.stroke / (2 * frame_scale(result.stroke))
                const open =
                    shown_gap(distance - 2, result.stroke) > TOUCH
                        ? candidates.find(c => clear_between(c, parts, fills, radius))
                        : undefined
                const spot = open ?? candidates[0]
                const pair = {
                    a: parts[i].label,
                    b: parts[j].label,
                    // a join is reported by its contact at stroke 2, and shown where it opens
                    drawn: touching ? distance - 2 : spot.distance - 2,
                    shown: shown_gap(spot.distance - 2, result.stroke),
                    open: !!open,
                    at: mix(spot.p, spot.q),
                }
                result.pairs.push(pair)
                if (touching) {
                    result.touching++
                    if (pair.open) result.opening.push(pair)
                } else if (pair.open && (!result.tightest || pair.drawn < result.tightest.drawn)) result.tightest = pair
            }
        }
    return results
}

export function correlation(a, b) {
    const ma = a.reduce((sum, v) => sum + v, 0) / a.length
    const mb = b.reduce((sum, v) => sum + v, 0) / b.length
    let ab = 0,
        aa = 0,
        bb = 0
    for (let i = 0; i < a.length; i++) {
        const x = a[i] - ma,
            y = b[i] - mb
        ab += x * y
        aa += x * x
        bb += y * y
    }
    return aa && bb ? ab / Math.sqrt(aa * bb) : 0
}
