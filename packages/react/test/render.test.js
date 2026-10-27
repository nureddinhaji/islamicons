import assert from 'node:assert/strict'
import {readdirSync, readFileSync} from 'node:fs'
import {test} from 'node:test'

import {createElement, createRef} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'

import {DEFAULT_STROKE_WIDTH, frame_scale} from '../../../src/lib/frame.js'
import {read_icon} from '../../../src/lib/icon-file.js'
import Icon from '../dist/Icon.js'
import * as components from '../dist/index.js'

const svg_dir = new URL('../../svg/icons/', import.meta.url)
const {Mosque} = components

const markup = (component, props = {}) => renderToStaticMarkup(createElement(component, props))
// `<path …></path>` back to the file's `<path …/>`, so the house reader can parse it.
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

test('rendering logs nothing, at the default stroke or another', t => {
    const logged = []
    t.mock.method(console, 'error', (...args) => logged.push(args.join(' ')))
    t.mock.method(console, 'warn', (...args) => logged.push(args.join(' ')))
    for (const component of Object.values(components)) {
        markup(component)
        markup(component, {strokeWidth: 2, children: createElement('title', null, 'x')})
    }
    assert.deepEqual(logged, [])
})

test('size, colour, className and other props reach the root', () => {
    const root = root_of(markup(Mosque, {size: 32, color: '#1f6b55', className: 'text-x', id: 'm', 'data-x': '1'}))
    assert.equal(root.width, '32')
    assert.equal(root.height, '32')
    assert.equal(root.style, 'color:#1f6b55')
    assert.equal(root.stroke, 'currentColor')
    assert.equal(root.class, 'islamicon islamicon-mosque text-x')
    assert.equal(root.id, 'm')
    assert.equal(root['data-x'], '1')
})

test("the user's own props win over the component's", () => {
    const root = root_of(markup(Mosque, {width: 10, 'aria-hidden': 'false', style: {opacity: 0.5}}))
    assert.equal(root.width, '10')
    assert.equal(root['aria-hidden'], 'false')
    assert.equal(root.style, 'opacity:0.5')
})

test('a style of their own keeps its colour, and the color prop wins over it', () => {
    assert.equal(root_of(markup(Mosque, {style: {color: 'blue'}})).style, 'color:blue')
    assert.equal(
        root_of(markup(Mosque, {color: 'red', style: {color: 'blue', opacity: 0.5}})).style,
        'color:red;opacity:0.5',
    )
})

test('an icon is decorative unless something names it', () => {
    const labelled = root_of(markup(Mosque, {'aria-label': 'مسجد'}))
    assert.equal(labelled.role, 'img')
    assert.equal(labelled['aria-hidden'], undefined)

    const titled = root_of(markup(Mosque, {title: 'مسجد'}))
    assert.equal(titled.role, 'img')
    assert.equal(titled['aria-hidden'], undefined)

    const presentation = root_of(markup(Mosque, {role: 'presentation'}))
    assert.equal(presentation.role, 'presentation')
    assert.equal(presentation['aria-hidden'], undefined)

    const with_children = markup(Mosque, {children: createElement('title', null, 'مسجد')})
    assert.equal(root_of(with_children)['aria-hidden'], undefined)
    assert.match(with_children, /<title>مسجد<\/title><\/svg>$/)
})

test('a prop passed as undefined counts as not passed', () => {
    const unnamed = root_of(markup(Mosque, {'aria-label': undefined, role: undefined, 'aria-hidden': undefined}))
    assert.equal(unnamed['aria-hidden'], 'true')
    assert.equal(unnamed.role, undefined)
    assert.equal(root_of(markup(Mosque, {'aria-label': 'مسجد', role: undefined})).role, 'img')
})

test('null props and empty children, which React renders as nothing, name nothing either', () => {
    const unnamed = root_of(markup(Mosque, {'aria-label': null, role: null, 'aria-hidden': null}))
    assert.equal(unnamed['aria-hidden'], 'true')
    assert.equal(unnamed.role, undefined)
    assert.equal(root_of(markup(Mosque, {'aria-label': 'مسجد', role: null})).role, 'img')
    for (const children of [false, ''])
        assert.equal(root_of(markup(Mosque, {children}))['aria-hidden'], 'true', JSON.stringify(children))
})

test('a ref reaches the svg element', () => {
    const ref = createRef()
    assert.equal(Icon({name: 'x', nodes: [], ref}).props.ref, ref)
})

test('the default stroke draws the file as it is', () => {
    for (const props of [{strokeWidth: DEFAULT_STROKE_WIDTH}, {absoluteStrokeWidth: true, size: 24}]) {
        const html = markup(Mosque, props)
        assert.doesNotMatch(html, /<g/)
        assert.equal(root_of(html)['stroke-width'], '1.5')
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
    assert.equal(root_of(markup(Mosque, {absoluteStrokeWidth: true, size: 48}))['stroke-width'], '0.75')
    assert.equal(root_of(markup(Mosque, {absoluteStrokeWidth: true, size: '2rem'}))['stroke-width'], '1.5')
})

test('no hooks and no client directive, so Server Components can render the icons', () => {
    const sources = [
        readFileSync(new URL('../dist/Icon.js', import.meta.url), 'utf8'),
        readFileSync(new URL('../dist/icons/mosque.js', import.meta.url), 'utf8'),
    ]
    for (const source of sources) {
        assert.doesNotMatch(source, /['"]use client['"]/)
        assert.doesNotMatch(source, /\buse[A-Z]\w*\s*\(|createContext|forwardRef/)
    }
})
