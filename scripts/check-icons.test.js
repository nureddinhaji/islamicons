import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'

import {icon_inner, read_icon, ROOT_ATTRS} from '../src/lib/icon-file.js'

const checker = fileURLToPath(new URL('./check-icons.js', import.meta.url))
const icons_dir = fileURLToPath(new URL('../icons', import.meta.url))

const root_text = (extra = '') =>
    Object.entries(ROOT_ATTRS)
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ') + extra
const svg = (inner, {extra = '', before = '', after = ''} = {}) =>
    `${before}<svg ${root_text(extra)}>\n  ${inner}\n</svg>\n${after}`
const SHAPE = '<path d="M4 4h16"/>'

const rejected = {
    'single-quoted handler': [svg(`<path d="M4 4h16" onmouseover='alert(1)'/>`), /unexpected text in <path>/],
    'single-quoted style': [svg(`<path d="M4 4h16" style='fill:red'/>`), /unexpected text in <path>/],
    unquoted: [svg('<path d=M4 />'), /unexpected text in <path>/],
    'double-quoted handler': [svg('<path d="M4 4h16" onclick="x"/>'), /disallowed attribute onclick/],
    'wrong-case handler': [svg('<path d="M4 4h16" onMouseOver="x"/>'), /disallowed attribute onMouseOver/],
    namespaced: [svg('<path d="M4 4h16" xlink:href="x"/>'), /unexpected text in <path>/],
    'duplicate attribute': [svg('<path d="M4 4h16" d="M5 5h14"/>'), /repeats the attribute d/],
    'script prefix': [svg(SHAPE, {before: '<script>alert(1)</script>'}), /file must start with <svg/],
    'bom prefix': [svg(SHAPE, {before: '\uFEFF'}), /file must start with <svg/],
    'content after </svg>': [svg(SHAPE, {after: '<script/>'}), /unexpected text/],
    comment: [svg(`<!-- x -->${SHAPE}`), /unexpected text/],
    group: [svg('<g><path d="M4 4h16"/></g>'), /<g> is not allowed/],
    'inherited tag name': [svg('<constructor/>'), /<constructor> is not allowed/],
    'entity in value': [svg('<path d="M4 4h16&#x20;"/>'), /unexpected text in <path>/],
    'no shapes': [svg(''), /has no shapes/],
    'cx is text': [svg('<circle cx="abc" cy="12" r="3"/>'), /cx must be a plain decimal/],
    'huge cx': [svg(`<circle cx="${'9'.repeat(400)}" cy="12" r="3"/>`), /cx must be a plain decimal/],
    'negative r': [svg('<circle cx="12" cy="12" r="-3"/>'), /r must be above zero/],
    'zero r': [svg('<circle cx="12" cy="12" r="0"/>'), /r must be above zero/],
    'zero width': [svg('<rect x="4" y="4" width="0" height="4"/>'), /width must be above zero/],
    'zero ellipse rx': [svg('<ellipse cx="12" cy="12" rx="0" ry="3"/>'), /rx must be above zero/],
    'negative rect rx': [svg('<rect x="4" y="4" width="4" height="4" rx="-1"/>'), /rx must be zero or more/],
    'missing r': [svg('<circle cx="12" cy="12"/>'), /<circle> is missing r/],
    'path not starting with M': [svg('<path d="L4 4h16"/>'), /d must start with M/],
    'exponent in d': [svg('<path d="M4e0 4h16"/>'), /d has characters outside/],
    'no-break space in d': [svg('<path d="M4\u00A04h16"/>'), /d has characters outside/],
    'odd points': [svg('<polyline points="4 4 8 8 12"/>'), /points must be an even count/],
    'leading comma in points': [svg('<polyline points=",4 4 20 20"/>'), /points must be an even count/],
    'doubled comma in points': [svg('<polyline points="4 4,,20 20"/>'), /points must be an even count/],
}

for (const [name, [text, message]] of Object.entries(rejected))
    test(`read_icon rejects: ${name}`, () => {
        const {problems} = read_icon(text)
        assert.ok(problems.length, 'expected a problem')
        assert.match(problems[0], message)
    })

test('icon_inner throws on a handler, so nothing unsafe reaches the page', () => {
    assert.throws(() => icon_inner(rejected['single-quoted handler'][0], 'x.svg'), /x\.svg: .*unexpected text/)
})

test('a root toString comes back in root for the check to report', () => {
    const {root, problems} = read_icon(svg(SHAPE, {extra: ' toString="x"'}))
    assert.deepEqual(problems, [])
    assert.equal(root.toString, 'x')
})

test('a valid file round-trips to canonical inner markup', () => {
    const text = svg('<path d="M4 4h16"/>\n  <circle cx="12" cy="12" r="3.5" fill="currentColor"/>')
    assert.equal(icon_inner(text, 'x.svg'), '<path d="M4 4h16"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>')
})

function check_with({svg: svg_text, meta, categories, name, title, title_en, add, src} = {}) {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'icons-'))
    try {
        cpSync(icons_dir, dir, {recursive: true})
        const victim =
            name ??
            readdirSync(dir)
                .find(file => file.endsWith('.svg'))
                .slice(0, -4)
        if (title !== undefined || title_en !== undefined) {
            const file = path.join(dir, `${victim}.json`)
            const data = JSON.parse(readFileSync(file, 'utf8'))
            if (title !== undefined) data.title = title
            if (title_en !== undefined) data.title_en = title_en
            writeFileSync(file, JSON.stringify(data))
        }
        for (const [added, added_meta] of Object.entries(add ?? {})) {
            cpSync(path.join(dir, `${victim}.svg`), path.join(dir, `${added}.svg`))
            writeFileSync(path.join(dir, `${added}.json`), JSON.stringify(added_meta))
        }
        if (svg_text) writeFileSync(path.join(dir, `${victim}.svg`), svg_text)
        if (meta !== undefined)
            writeFileSync(path.join(dir, `${victim}.json`), typeof meta === 'string' ? meta : JSON.stringify(meta))
        if (categories) writeFileSync(path.join(dir, '_categories.json'), categories(dir))
        const args = [checker, dir]
        if (src) {
            const src_dir = path.join(dir, '_src')
            mkdirSync(src_dir)
            for (const [file, text] of Object.entries(src)) writeFileSync(path.join(src_dir, file), text)
            args.push(src_dir)
        }
        const result = spawnSync(process.execPath, args, {encoding: 'utf8'})
        return {...result, victim}
    } finally {
        rmSync(dir, {recursive: true, force: true})
    }
}

// Each case names the reason it must fail for, so a failure for some other reason does not count.
const crafted = {
    'single-quoted handler': [rejected['single-quoted handler'][0], /unexpected text in <path>/],
    'bad and negative values': [svg('<circle cx="abc" cy="12" r="-3"/>'), /cx must be a plain decimal/],
    'script prefix': [rejected['script prefix'][0], /file must start with <svg/],
    'no shapes': [rejected['no shapes'][0], /has no shapes/],
    'root toString': [svg(SHAPE, {extra: ' toString="x"'}), /unexpected root attribute toString/],
}

const reported = (result, file, reason) => new RegExp(`^${file}: .*${reason.source}`, 'm').test(result.stderr)

for (const [name, [text, reason]] of Object.entries(crafted))
    test(`check-icons fails on: ${name}`, () => {
        const result = check_with({svg: text})
        assert.equal(result.status, 1, result.stdout)
        assert.ok(reported(result, result.victim, reason), result.stderr)
    })

const good_meta = {title: 'مسجد', title_en: 'Place of prayer', tags: ['masjid']}
const bad_meta = {
    'empty tag': [{...good_meta, tags: ['masjid', '']}, /tag "" must be a non-empty trimmed string/],
    'whitespace tag': [{...good_meta, tags: ['masjid', '  ']}, /tag " {2}" must be a non-empty trimmed string/],
    'duplicate tag': [{...good_meta, tags: ['masjid', 'masjid']}, /tag "masjid" is listed more than once/],
    'untrimmed tag': [{...good_meta, tags: [' masjid']}, /tag " masjid" must be a non-empty trimmed string/],
    'non-string tag': [{...good_meta, tags: ['masjid', 3]}, /tag 3 must be a non-empty trimmed string/],
    'extra key': [{...good_meta, note: 'x'}, /has an unexpected key note/],
    'category key': [{...good_meta, category: 'prayer'}, /has an unexpected key category/],
    'non-Arabic title': [{...good_meta, title: 'Adhan'}, /metadata needs an Arabic title/],
    'untrimmed title': [{...good_meta, title: ' مسجد'}, /metadata needs an Arabic title/],
    'invalid json': ['{"title": ', /is not valid JSON/],
    'missing English title': [{title: 'مسجد', tags: ['masjid']}, /metadata needs an English title/],
    'Arabic in the English title': [{...good_meta, title_en: 'مسجد'}, /metadata needs an English title/],
    'lowercase English title': [{...good_meta, title_en: 'mosque'}, /metadata needs an English title/],
}

for (const [name, [meta, reason]] of Object.entries(bad_meta))
    test(`check-icons fails on metadata: ${name}`, () => {
        const result = check_with({name: 'mosque', meta})
        assert.equal(result.status, 1, result.stdout)
        assert.ok(reported(result, result.victim, reason), result.stderr)
    })

const bad_tags = {
    'tag equal to the id': [['mosque'], /tag "mosque": search already finds this/],
    'tag equal to the title': [['مسجد'], /tag "مسجد": search already finds this/],
    'tag that is an article form of another': [['جامع', 'الجامع'], /tag "الجامع": search already finds this/],
    'tag that differs by hamza': [['أذان', 'اذان'], /tag "اذان": search already finds this/],
    'capital letters': [['Mosque'], /tag "Mosque": English tags are lowercase/],
}

for (const [name, [tags, reason]] of Object.entries(bad_tags))
    test(`check-icons fails on tags: ${name}`, () => {
        const result = check_with({name: 'mosque', meta: {title: 'مسجد', title_en: 'Place of prayer', tags}})
        assert.equal(result.status, 1, result.stdout)
        assert.ok(reported(result, 'mosque', reason), result.stderr)
    })

const bad_titles = {
    'variant title without its base head': ['sujud-detailed', 'سجود مفصل', /title must read «السجود \(…\)»/],
    'base title with parentheses': ['sujud', 'السجود (أ)', /a base title has no parentheses/],
    '-filled without مُصمَت': ['ihram-filled', 'الإحرام (مفرّغ)', /-filled and «\(… مُصمَت\)» go together/],
    'مُصمَت without -filled': ['ihram', 'الإحرام (مُصمَت)', /-filled and «\(… مُصمَت\)» go together/],
    'duplicate title': ['mosque', 'الكعبة', /title is also used by kaaba/],
}

for (const [name, [victim, title, reason]] of Object.entries(bad_titles))
    test(`check-icons fails on title: ${name}`, () => {
        const result = check_with({name: victim, title})
        assert.equal(result.status, 1, result.stdout)
        assert.ok(reported(result, victim, reason), result.stderr)
    })

test('check-icons fails on tags: tag repeating the English title', () => {
    const result = check_with({
        name: 'qibla-arrow',
        meta: {title: 'اتجاه القبلة', title_en: 'Qibla direction', tags: ['qibla direction']},
    })
    assert.equal(result.status, 1, result.stdout)
    assert.ok(reported(result, 'qibla-arrow', /tag "qibla direction": search already finds this/), result.stderr)
})

const bad_english_titles = {
    'variant English title without its base head': [
        'sujud-detailed',
        'Detailed sujud',
        /English title must read "Sujud \(…\)", as a variant of sujud/,
    ],
    'base English title with parentheses': ['sujud', 'Sujud (a)', /English title: a base title has no parentheses/],
    '-filled without filled)': [
        'ihram-filled',
        'Ihram (solid)',
        /English title: -filled and "\(… filled\)" go together/,
    ],
    'filled) without -filled': ['ihram', 'Ihram (filled)', /English title: -filled and "\(… filled\)" go together/],
    'duplicate English title': ['mosque', 'Kaaba', /English title is also used by kaaba/],
}

for (const [name, [victim, title_en, reason]] of Object.entries(bad_english_titles))
    test(`check-icons fails on English title: ${name}`, () => {
        const result = check_with({name: victim, title_en})
        assert.equal(result.status, 1, result.stdout)
        assert.ok(reported(result, victim, reason), result.stderr)
    })

test('check-icons fails when filled is not the last word of a name', () => {
    const result = check_with({
        name: 'mosque',
        add: {'ihram-filled-wide': {title: 'الإحرام (مُصمَت، لحية عريضة)', tags: ['x']}},
    })
    assert.equal(result.status, 1, result.stdout)
    assert.ok(reported(result, 'ihram-filled-wide', /filled and off must be the last words/), result.stderr)
})

const bad_categories = {
    'category without icons': [
        list =>
            list.map((category, i) => {
                const {icons: _icons, ...rest} = category
                return i ? category : rest
            }),
        /is missing the key icons/,
    ],
    'category with an extra key': [
        list => list.map((category, i) => (i ? category : {...category, extra: 'x'})),
        /has an unexpected key extra/,
    ],
    'category with an empty note': [
        list => list.map((category, i) => (i ? category : {...category, note: ''})),
        /note must be a non-empty trimmed string/,
    ],
    'category with a numeric id': [
        list => list.map((category, i) => (i ? category : {...category, id: 7})),
        /id must be kebab-case/,
    ],
    'invalid json': [() => '[', /is not valid JSON/],
    'category without an English title': [
        list =>
            list.map((category, i) => {
                if (i) return category
                const {title_en: _title_en, ...rest} = category
                return rest
            }),
        /is missing the key title_en/,
    ],
    'note without note_en': [
        list => list.map((category, i) => (i ? category : {...category, note: 'ملاحظة', note_en: undefined})),
        /note_en goes with note/,
    ],
    'note_en without note': [
        list => list.map((category, i) => (i ? category : {...category, note: undefined, note_en: 'A note'})),
        /note_en goes with note/,
    ],
}

for (const [name, [change, reason]] of Object.entries(bad_categories))
    test(`check-icons fails on _categories.json: ${name}`, () => {
        const result = check_with({
            categories: dir => {
                const list = JSON.parse(readFileSync(path.join(dir, '_categories.json'), 'utf8'))
                const changed = change(list)
                return typeof changed === 'string' ? changed : JSON.stringify(changed)
            },
        })
        assert.equal(result.status, 1, result.stdout)
        assert.ok(reported(result, '_categories\\.json', reason), result.stderr)
    })

const bad_sources = {
    'a literal name': [
        {'a.svelte': "icon_named('no-such-icon')"},
        /names icon no-such-icon, which does not exist/,
        'a\\.svelte',
    ],
    'a mapped list': [
        {'b.js': "['mosque', 'no-such-icon'].map(icon_named)"},
        /names icon no-such-icon, which does not exist/,
        'b\\.js',
    ],
    'a written icon_by_name lookup': [
        {'c.svelte': "icon_by_name.get('mosque')"},
        /look up a written name with icon_named/,
        'c\\.svelte',
    ],
}

for (const [name, [src, reason, file]] of Object.entries(bad_sources))
    test(`check-icons fails on source: ${name}`, () => {
        const result = check_with({src})
        assert.equal(result.status, 1, result.stdout)
        assert.ok(reported(result, `src/${file}`, reason), result.stderr)
        assert.doesNotMatch(result.stderr, /names icon mosque/)
    })

test('check-icons passes on the real icons', () => {
    const result = check_with()
    assert.equal(result.status, 0, result.stderr)
})
