import assert from 'node:assert/strict'
import {readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'

const src_dir = fileURLToPath(new URL('../src', import.meta.url))
let case_n = 0

async function load_locale(pathname) {
    globalThis.location = {pathname}
    return import(`../src/lib/locale.js?case=${case_n++}`)
}

test('href_in keeps the language in the public URL', async () => {
    const {href_in} = await load_locale('/')
    assert.equal(href_in('/', 'en'), '/en')
    assert.equal(href_in('/?q=x', 'en'), '/en?q=x')
    assert.equal(href_in('/guide', 'en'), '/en/guide')
    assert.equal(href_in('/guide', 'ar'), '/guide')
})

test('counted icons follow the language', async () => {
    await load_locale('/')
    const {count_icons} = await import('../src/lib/format.js')
    assert.equal(count_icons(0, 'ar'), 'لا أيقونات')
    assert.equal(count_icons(1, 'ar'), 'أيقونة واحدة')
    assert.equal(count_icons(2, 'ar'), 'أيقونتان')
    assert.equal(count_icons(5, 'ar'), '٥ أيقونات')
    assert.equal(count_icons(11, 'ar'), '١١ أيقونة')
    assert.equal(count_icons(114, 'ar'), '١١٤ أيقونة')
    assert.equal(count_icons(1, 'en'), '1 icon')
    assert.equal(count_icons(0, 'en'), '0 icons')
    assert.equal(count_icons(114, 'en'), '114 icons')
})

test('the language switch keeps the same view', async () => {
    const {href_in} = await load_locale('/en/guide')
    const switch_to = (path, search, target) => href_in(path, target) + search
    assert.equal(switch_to('/guide', '?q=mosque', 'ar'), '/guide?q=mosque')
    assert.equal(switch_to('/', '?icon=kaaba', 'en'), '/en?icon=kaaba')
})

test('the URL alone says the language', async () => {
    for (const [pathname, expected] of [
        ['/en', 'en'],
        ['/en/', 'en'],
        ['/en/guide', 'en'],
        ['/enx', 'ar'],
    ]) {
        const {locale} = await load_locale(pathname)
        assert.equal(locale, expected, pathname)
    }
})

// A raw internal link drops an English reader into the Arabic page. These are the shapes that do that.
const raw_href = [/href="\//, /href=\{'\//, /href=\{`\//, /href: '\//]

test('internal links go through href_in', () => {
    const hits = []
    function walk(dir) {
        for (const entry of readdirSync(dir, {withFileTypes: true})) {
            const full = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                walk(full)
                continue
            }
            if (!/\.(svelte|js)$/.test(entry.name)) continue
            const lines = readFileSync(full, 'utf8').split('\n')
            lines.forEach((line, index) => {
                if (raw_href.some(pattern => pattern.test(line)))
                    hits.push(`${path.relative(src_dir, full)}:${index + 1}`)
            })
        }
    }
    walk(src_dir)
    assert.deepEqual(hits, [])
})
