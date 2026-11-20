import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'

import {read_icon} from '../src/lib/icon-file.js'
import {correlation, icon_parts, measure_gaps, segment_distance, shown_gap, TOLERANCE} from './icon-measure.js'

const shape = (tag, attrs) => ({tag, attrs})
const line = (x1, y1, x2, y2) => shape('line', {x1, y1, x2, y2})
const path = d => shape('path', {d})
const measure = (elements, strokes) => measure_gaps(icon_parts(elements), strokes)
const near = (actual, expected, error = 0.002) =>
    assert.ok(Math.abs(actual - expected) <= error, `${actual} != ${expected} ± ${error}`)

for (const [distance, gap] of [
    [2.02, 0.02],
    [1.9, -0.1],
]) {
    test('horizontal lines ' + distance + ' apart', () => {
        const [master, shown] = measure([line(0, 0, 10, 0), line(0, distance, 10, distance)], [2, 1.5])
        near(master.pairs[0].drawn, gap)
        assert.equal(master.pairs[0].open, gap > 0)
        assert.equal(master.touching, gap < 0 ? 1 : 0)
        if (gap < 0) {
            near(shown.pairs[0].shown, 0.4475, 0.003)
            assert.equal(shown.opening.length, 1)
            assert.equal(shown.tightest, null)
        }
    })
}

test('diagonal lines are not quantised', () => {
    const d = 2.05 / Math.SQRT2
    near(measure([line(0, 0, 10, 10), line(-d, d, 10 - d, 10 + d)])[0].tightest.drawn, 0.05)
})

test('crossing third stroke covers a collinear gap', () => {
    const [m] = measure([line(0, 0, 3, 0), line(5.5, 0, 8, 0), line(4.25, -3, 4.25, 3)])
    assert.equal(m.pairs.find(p => p.a === 'e1' && p.b === 'e2').open, false)
})

test('a partial bridge leaves the far end open', () => {
    const [m] = measure([line(0, 0, 10, 0), line(0, 2.3, 10, 2.3), line(0, 0, 0, 2.3)])
    const pair = m.pairs.find(p => p.a === 'e1' && p.b === 'e2')
    assert.equal(pair.open, true)
    assert.ok(pair.at[0] > 1)
})

test('rails bridged at both ends are open between the bridges', () => {
    const [m] = measure([line(0, 0, 10, 0), line(0, 2.3, 10, 2.3), line(0, 0, 0, 2.3), line(10, 0, 10, 2.3)])
    const pair = m.pairs.find(p => p.a === 'e1' && p.b === 'e2')
    assert.equal(pair.open, true)
    near(pair.drawn, 0.3)
    assert.ok(pair.at[0] > 1 && pair.at[0] < 9)
})

test('a converging pair bridged at its closest spot reports its first open spot', () => {
    const [m] = measure([path('M2 4H22'), path('M2 6.02L22 6.42'), path('M2 4V6.02')])
    const pair = m.pairs.find(p => p.a === 'e1' && p.b === 'e2')
    assert.equal(pair.open, true)
    assert.ok(pair.drawn >= 0.038 && pair.drawn <= 0.046, String(pair.drawn))
})

test('a narrow clear band between two bridging strokes is open', () => {
    const [m] = measure([path('M2 4H22'), path('M2 7H22'), path('M2 4.3H22'), path('M2 6.4H22')])
    assert.equal(m.pairs.find(p => p.a === 'e1' && p.b === 'e2').open, true)
})

test('a lone moveto is no part', () => {
    const parts = icon_parts([path('M4 4h5M10 10'), line(4, 7, 9, 7)])
    assert.deepEqual(
        parts.map(p => p.label),
        ['e1/1', 'e2'],
    )
    near(measure_gaps(parts)[0].tightest.drawn, 1)
})

test('collinear strokes are apart, not crossing', () => {
    const [m] = measure([path('M2.2 2.9L5.2 4.9'), path('M8.2 6.9L11.2 8.9')])
    assert.equal(m.pairs[0].open, true)
    near(m.pairs[0].drawn, Math.sqrt(13) - 2)
})

test('a hole in a filled compound path is not ink', () => {
    const donut = shape('path', {
        d: 'M0 -6A6 6 0 1 1 0 6A6 6 0 1 1 0 -6ZM0 -3A3 3 0 1 0 0 3A3 3 0 1 0 0 -3Z',
        fill: 'currentColor',
    })
    const [m] = measure([donut, path('M-0.5 0H0.5')])
    near(m.pairs.find(p => p.a === 'e1/2' && p.b === 'e2').drawn, 0.5)
    assert.equal(m.pairs.find(p => p.a === 'e1/2' && p.b === 'e2').open, true)
})

test('fill covers an interior stroke', () => {
    const [m] = measure([shape('circle', {cx: 0, cy: 0, r: 5, fill: 'currentColor'}), line(-1, 0, 1, 0)])
    assert.equal(m.tightest, null)
})

test('circle and tangent line', () => {
    near(measure([shape('circle', {cx: 0, cy: 0, r: 3}), line(-5, 5.05, 5, 5.05)])[0].tightest.drawn, 0.05)
})

for (const [smooth, explicit] of [
    ['M0 0C1 2 3 2 4 0S7 -2 8 0', 'M0 0C1 2 3 2 4 0C5 -2 7 -2 8 0'],
    ['M0 0Q2 3 4 0T8 0', 'M0 0Q2 3 4 0Q6 -3 8 0'],
    ['M0 0Q1 2 2 0S3 2 4 0', 'M0 0Q1 2 2 0C2 0 3 2 4 0'],
    ['M0 0C1 2 2 2 3 0T6 0', 'M0 0C1 2 2 2 3 0Q3 0 6 0'],
])
    test('smooth control reflection: ' + smooth, () => {
        assert.deepEqual(icon_parts([path(smooth)]), icon_parts([path(explicit)]))
    })

test('rotated elliptical arc lies on its analytic ellipse and bulges to its sweep side', () => {
    const phi = Math.PI / 6
    // a quarter of the ellipse x = 4 cos t, y = 2 sin t rotated 30°, from t = 0 to t = 90°
    const [part] = icon_parts([path('M3.4641016151377544 2A4 2 30 0 1 -1 1.7320508075688772')])
    const off_ellipse = ([x, y]) => {
        const u = x * Math.cos(phi) + y * Math.sin(phi)
        const v = -x * Math.sin(phi) + y * Math.cos(phi)
        return Math.abs((u * u) / 16 + (v * v) / 4 - 1) / Math.hypot(u / 8, v / 2)
    }
    const midpoints = part.points.slice(1).map((p, i) => p.map((v, k) => (v + part.points[i][k]) / 2))
    for (const p of [...part.points, ...midpoints]) assert.ok(off_ellipse(p) <= TOLERANCE, String(p))
    const [a, b] = [part.points[0], part.points.at(-1)]
    const side = ([x, y]) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])
    for (const p of part.points.slice(1, -1)) assert.ok(side(p) * side([0, 0]) < 0, String(p))
})

test('arc radii scale up and zero radii become lines', () => {
    assert.deepEqual(icon_parts([path('M0 0A0 2 0 0 1 4 0')]), icon_parts([path('M0 0L4 0')]))
    assert.deepEqual(icon_parts([path('M0 0A1 1 0 0 1 4 0')]), icon_parts([path('M0 0A2 2 0 0 1 4 0')]))
})

for (const rx of [1, 8])
    test('rounded rect rx ' + rx, () => {
        const r = Math.min(rx, 2)
        const actual = icon_parts([shape('rect', {x: 0, y: 0, width: 4, height: 6, rx})])
        const ry = Math.min(rx, 3)
        const expected = icon_parts([
            path(
                `M${r} 0H${4 - r}A${r} ${ry} 0 0 1 4 ${ry}V${6 - ry}A${r} ${ry} 0 0 1 ${4 - r} 6H${r}A${r} ${ry} 0 0 1 0 ${6 - ry}V${ry}A${r} ${ry} 0 0 1 ${r} 0Z`,
            ),
        ])
        assert.deepEqual(actual, expected)
    })

test('straight rect, ellipse, polygon and polyline', () => {
    assert.deepEqual(icon_parts([shape('rect', {x: 0, y: 0, width: 4, height: 6})]), icon_parts([path('M0 0h4v6h-4Z')]))
    const [ellipse] = icon_parts([shape('ellipse', {cx: 2, cy: 3, rx: 4, ry: 2})])
    assert.deepEqual(ellipse.points[0], ellipse.points.at(-1))
    for (const [x, y] of ellipse.points) near((x - 2) ** 2 / 16 + (y - 3) ** 2 / 4, 1, TOLERANCE)
    const parts = icon_parts([shape('polygon', {points: '0,0 2,0 2,2'}), shape('polyline', {points: '0 0 2 0 2 2'})])
    assert.deepEqual(parts[0].points[0], parts[0].points.at(-1))
    assert.notDeepEqual(parts[1].points[0], parts[1].points.at(-1))
})

test('subpaths are distinct labelled parts', () => {
    const parts = icon_parts([path('m1 2h3m2 3v4')])
    assert.deepEqual(
        parts.map(p => p.label),
        ['e1/1', 'e1/2'],
    )
    assert.deepEqual(parts[1].points, [
        [6, 5],
        [6, 9],
    ])
})

test('shown gap and correlation', () => {
    near(shown_gap(0, 1.5), 0.55, 1e-12)
    assert.equal(shown_gap(0.123, 2), 0.123)
    const a = [0, 0.2, 0.8, 1],
        b = [0.1, 0.5, 0.6, 0.7]
    near(correlation(a, a), 1, 1e-12)
    assert.equal(correlation(a, b), correlation(b, a))
})

test('segment distance handles crossing, parallel and degenerate segments', () => {
    near(segment_distance([0, 0], [2, 2], [0, 2], [2, 0]).distance, 0)
    near(segment_distance([0, 0], [2, 0], [0, 3], [2, 3]).distance, 3)
    near(segment_distance([0, 0], [0, 0], [2, 0], [2, 0]).distance, 2)
})

const real_icon = name => {
    const {elements, problems} = read_icon(readFileSync(new URL('../icons/' + name + '.svg', import.meta.url), 'utf8'))
    assert.equal(problems.length, 0)
    return measure(elements, [2, 1.5])
}

for (const [name, gap] of [
    ['hifz', 0.088],
    ['khutbah', 0.021],
    ['ihram', 0.021],
    ['kaaba', 0.741],
    ['pillars-of-islam', 2.5],
])
    test('real icon: ' + name, () => near(real_icon(name)[0].tightest.drawn, gap, 0.005))

test('real icon: qari joins open when shown but are not its tightest gap', () => {
    const [, shown] = real_icon('qari')
    assert.ok(shown.opening.length > 0)
    assert.ok(!shown.opening.includes(shown.tightest))
})

test('real icon: sadaqah-box-note reports a join at its contact, shown where it opens', () => {
    const [, shown] = real_icon('sadaqah-box-note')
    const join = shown.opening.find(p => p.a === 'e1' && p.b === 'e3')
    near(join.drawn, -0.1, 0.005)
    near(join.shown, shown_gap(-0.058, 1.5), 0.005)
})
