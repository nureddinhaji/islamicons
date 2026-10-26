import assert from 'node:assert/strict'
import {readdirSync, readFileSync} from 'node:fs'
import {test} from 'node:test'

import {createRawSnippet} from 'svelte'
import {render} from 'svelte/server'

import {DEFAULT_STROKE_WIDTH, frame_scale} from '../../../src/lib/frame.js'
import {read_icon} from '../../../src/lib/icon-file.js'
import * as components from '../dist/index.js'

const svg_dir = new URL('../../svg/icons/', import.meta.url)
const {Mosque} = components

// Hydration markers out, and `<path …></path>` back to the file's `<path …/>`, so the house reader can parse it.
const markup = (component, props = {}) => render(component, {props}).body.replace(/<!--[^]*?-->/g, '')
const as_file = html => html.replace(/<(\w+)([^<>]*)><\/\1>/g, '<$1$2/>')
const plain = attrs => ({...attrs})
const shapes_of = elements => elements.map(({tag, attrs}) => [tag, plain(attrs)])

function root_of(html) {
    const tag = /^<svg([^>]*)>/.exec(html)[1]
    return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]))
}

test('every icon renders its package file, plus the class and aria-hidden', () => {
    const files = readdirSync(svg_dir).filter(file => file.endsWith('.svg'))
    const rendered = Object.values(components).map(component => read_icon(as_file(markup(component))))
    const names = rendered.map(({root}) => /^islamicon islamicon-([a-z0-9-]+)$/.exec(root.class)[1])
    assert.deepEqual(names.toSorted(), files.map(file => file.slice(0, -'.svg'.length)).toSorted())
    for (const [index, {root, elements, problems}] of rendered.entries()) {
        const name = names[index]
        const file = read_icon(readFileSync(new URL(`${name}.svg`, svg_dir), 'utf8'))
        assert.deepEqual(problems, [], name)
        assert.deepEqual(
            plain(root),
            {...plain(file.root), class: `islamicon islamicon-${name}`, 'aria-hidden': 'true'},
            name,
        )
        assert.deepEqual(shapes_of(elements), shapes_of(file.elements), name)
    }
})

test('size, colour, class and other props reach the root', () => {
    const root = root_of(markup(Mosque, {size: 32, color: '#1f6b55', class: 'text-x', id: 'm', 'data-x': '1'}))
    assert.equal(root.width, '32')
    assert.equal(root.height, '32')
    assert.equal(root.style, 'color: #1f6b55')
    assert.equal(root.stroke, 'currentColor')
    assert.equal(root.class, 'islamicon islamicon-mosque text-x')
    assert.equal(root.id, 'm')
    assert.equal(root['data-x'], '1')
})

test("the user's own props win over the component's", () => {
    const root = root_of(markup(Mosque, {width: '10', 'aria-hidden': 'false', style: 'opacity: 0.5'}))
    assert.equal(root.width, '10')
    assert.equal(root['aria-hidden'], 'false')
    assert.equal(root.style, 'opacity: 0.5')
})

test('a style of their own keeps its rules, and the color prop wins over its colour', () => {
    const root = root_of(markup(Mosque, {color: 'red', style: 'color: blue; opacity: 0.5'}))
    assert.equal(root.style, 'color: blue; opacity: 0.5; color: red')
    assert.equal(root_of(markup(Mosque, {style: 'color: blue'})).style, 'color: blue')
})

test('an icon is decorative unless something names it', () => {
    const labelled = root_of(markup(Mosque, {'aria-label': 'مسجد'}))
    assert.equal(labelled.role, 'img')
    assert.equal(labelled['aria-hidden'], undefined)

    const titled = root_of(markup(Mosque, {title: 'مسجد'}))
    assert.equal(titled.role, 'img')
    assert.equal(titled['aria-hidden'], undefined)

    const unset = root_of(markup(Mosque, {'aria-label': undefined, role: undefined}))
    assert.equal(unset.role, undefined)
    assert.equal(unset['aria-hidden'], 'true')

    const presentation = root_of(markup(Mosque, {role: 'presentation'}))
    assert.equal(presentation.role, 'presentation')
    assert.equal(presentation['aria-hidden'], undefined)

    const children = createRawSnippet(() => ({render: () => '<title>مسجد</title>'}))
    const with_children = markup(Mosque, {children})
    assert.equal(root_of(with_children)['aria-hidden'], undefined)
    assert.match(with_children, /<title>مسجد<\/title><\/svg>$/)
})

test('a prop passed as undefined or null counts as not passed', () => {
    for (const unset of [undefined, null]) {
        const hidden = root_of(markup(Mosque, {'aria-hidden': unset, 'aria-label': unset, role: unset}))
        assert.equal(hidden['aria-hidden'], 'true', String(unset))
        assert.equal(hidden.role, undefined, String(unset))
        assert.equal(root_of(markup(Mosque, {'aria-label': 'مسجد', role: unset})).role, 'img', String(unset))
        assert.equal(root_of(markup(Mosque, {width: unset})).width, '24', String(unset))
    }
})

test('the default stroke draws the file as it is', () => {
    for (const props of [{strokeWidth: DEFAULT_STROKE_WIDTH}, {absoluteStrokeWidth: true, size: 24}]) {
        const html = markup(Mosque, props)
        assert.doesNotMatch(html, /<g/)
        assert.equal(root_of(html)['stroke-width'], '1.6')
    }
})

test('another stroke rescales the shapes about the centre, as the site does', () => {
    const html = markup(Mosque, {strokeWidth: 2})
    const [, ratio, offset, inner] = /<g transform="matrix\(([\d.]+) 0 0 \1 ([\d.-]+) \2\)" stroke-width="([\d.]+)">/
        .exec(html)
        .map(Number)
    assert.equal(ratio, frame_scale(2) / frame_scale(DEFAULT_STROKE_WIDTH))
    assert.ok(Math.abs(offset - (12 - 12 * ratio)) < 1e-9)
    assert.ok(Math.abs(inner * ratio - 2) < 1e-9)
    assert.equal(root_of(html)['stroke-width'], '2')
})

test('an absolute stroke keeps its pixels at any size', () => {
    assert.equal(root_of(markup(Mosque, {absoluteStrokeWidth: true, size: 48}))['stroke-width'], '0.8')
    assert.equal(root_of(markup(Mosque, {absoluteStrokeWidth: true, size: '2rem'}))['stroke-width'], '1.6')
})
