// The one reader of icon files, shared by the site and scripts/check-icons.js so both read every file the same way.
import {parse_path} from './frame.js'

// Null-prototype so a parsed name such as `constructor` or `toString` can never hit Object.prototype.
export const ROOT_ATTRS = {
    __proto__: null,
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
}
export const SHAPE_ATTRS = {
    __proto__: null,
    path: ['d'],
    circle: ['cx', 'cy', 'r'],
    ellipse: ['cx', 'cy', 'rx', 'ry'],
    rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
    line: ['x1', 'y1', 'x2', 'y2'],
    polyline: ['points'],
    polygon: ['points'],
}

const OPTIONAL_ATTRS = new Set(['rx', 'ry'])
const POSITIONS = new Set(['cx', 'cy', 'x', 'y', 'x1', 'y1', 'x2', 'y2'])
const NUMBER = /^-?(?:\d+\.?\d*|\.\d+)$/
const PATH_CHARS = /^[MmLlHhVvCcSsQqTtAaZz\d. \t\n\r-]+$/

// XML whitespace only: `\s` would also accept a no-break space and let it reach the page.
const SVG_OPEN = /<svg(?=[ \t\n\r])/y
const ATTR = /[ \t\n\r]+([a-zA-Z][a-zA-Z-]*)="([^"<>&]*)"/y
const TAG_OPEN = /[ \t\n\r]*<([a-zA-Z]+)/y
const TAG_END = /[ \t\n\r]*>/y
const SHAPE_END = /[ \t\n\r]*\/>/y
const SVG_CLOSE = /[ \t\n\r]*<\/svg>[ \t\n\r]*$/y

class SyntaxProblem extends Error {}

function take(state, pattern) {
    pattern.lastIndex = state.pos
    const match = pattern.exec(state.text)
    if (match) state.pos = pattern.lastIndex
    return match
}

function fail(state, message) {
    const before = state.text.slice(0, state.pos).split('\n')
    const excerpt = JSON.stringify(state.text.slice(state.pos, state.pos + 24))
    throw new SyntaxProblem(`${message} at ${before.length}:${before[before.length - 1].length + 1} near ${excerpt}`)
}

function read_attrs(state) {
    const attrs = Object.create(null)
    let match
    while ((match = take(state, ATTR))) {
        if (match[1] in attrs) fail(state, `repeats the attribute ${match[1]}`)
        attrs[match[1]] = match[2]
    }
    return attrs
}

function read_syntax(text) {
    const state = {text, pos: 0}
    if (!take(state, SVG_OPEN)) fail(state, 'file must start with <svg')
    const root = read_attrs(state)
    if (!take(state, TAG_END)) fail(state, 'unexpected text in the <svg> tag')
    const elements = []
    let tag
    while ((tag = take(state, TAG_OPEN))) {
        if (!(tag[1] in SHAPE_ATTRS)) fail(state, `<${tag[1]}> is not allowed`)
        const attrs = read_attrs(state)
        if (!take(state, SHAPE_END)) fail(state, `unexpected text in <${tag[1]}>`)
        elements.push({tag: tag[1], attrs})
    }
    if (!take(state, SVG_CLOSE)) fail(state, 'unexpected text; expected a shape or </svg> and nothing after it')
    return {root, elements}
}

const is_number = value => NUMBER.test(value) && Number.isFinite(Number(value))

// Returns the reason a value is wrong, or '' when it is fine.
function value_problem(tag, name, value) {
    const must_be = (ok, what) => (ok ? '' : `${name} must be ${what}, is "${value}"`)
    if (name === 'd') {
        if (!PATH_CHARS.test(value)) return 'd has characters outside commands, plain decimals and spaces'
        try {
            const segments = parse_path(value)
            if (!/^[Mm]$/.test(segments[0]?.command)) return 'd must start with M'
            if (!segments.every(({args}) => args.every(Number.isFinite))) return 'd has a number that is not finite'
        } catch (error) {
            return error.message
        }
        return ''
    }
    if (name === 'points') {
        const numbers = value.replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, '').split(/[ \t\n\r]*,[ \t\n\r]*|[ \t\n\r]+/)
        return must_be(
            numbers.length >= 4 && numbers.length % 2 === 0 && numbers.every(is_number),
            'an even count of at least four plain decimals',
        )
    }
    if (!is_number(value)) return must_be(false, 'a plain decimal')
    if (POSITIONS.has(name)) return ''
    const may_be_zero = tag === 'rect' && OPTIONAL_ATTRS.has(name)
    return must_be(may_be_zero ? Number(value) >= 0 : Number(value) > 0, may_be_zero ? 'zero or more' : 'above zero')
}

function read_values({tag, attrs}) {
    const problems = []
    for (const [name, value] of Object.entries(attrs)) {
        if (name === 'fill' && value === 'currentColor') continue
        if (!SHAPE_ATTRS[tag].includes(name)) {
            problems.push(`<${tag}> has a disallowed attribute ${name}`)
            continue
        }
        const problem = value_problem(tag, name, value)
        if (problem) problems.push(`<${tag}> ${problem}`)
    }
    for (const name of SHAPE_ATTRS[tag])
        if (!(name in attrs) && !(tag === 'rect' && OPTIONAL_ATTRS.has(name)))
            problems.push(`<${tag}> is missing ${name}`)
    return problems
}

// `root` is null when the syntax failed; the caller compares it with ROOT_ATTRS.
export function read_icon(text) {
    let syntax
    try {
        syntax = read_syntax(text)
    } catch (error) {
        if (error instanceof SyntaxProblem) return {root: null, elements: [], problems: [error.message]}
        throw error
    }
    const {root, elements} = syntax
    const problems = elements.flatMap(read_values)
    if (!elements.length) problems.push('has no shapes')
    return {root, elements, problems}
}

export const to_inner = elements =>
    elements
        .map(
            ({tag, attrs}) =>
                `<${tag}${Object.entries(attrs)
                    .map(([name, value]) => ` ${name}="${value}"`)
                    .join('')}/>`,
        )
        .join('')

// Fails closed: a file that breaks the format never becomes markup.
export function icon_inner(text, label) {
    const {elements, problems} = read_icon(text)
    if (problems.length) throw new Error(`${label}: ${problems[0]}`)
    return to_inner(elements)
}
