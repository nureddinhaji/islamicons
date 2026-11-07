import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'

import {REPO_URL} from '../src/lib/constants.svelte.js'
import {read_catalog} from './icon-catalog.js'
import {home_body, icon_page_html, related_icons, website_object} from './static-pages.js'

const ORIGIN = 'https://example.test'
const COPYRIGHT = readFileSync(new URL('../LICENSE', import.meta.url), 'utf8').split('\n')[2]
const IMAGE = {path: '/og-ar.png', alt: 'alt', width: 1200, height: 630}
const template = `<html dir="rtl" lang="ar">
<head>
<meta name="description" content="old">
<meta property="og:title" content="old">
<title>old</title>
</head>
<body></body>
</html>`

const catalog = read_catalog()
const names = new Set(catalog.map(icon => icon.name))
const mosque = catalog.find(icon => icon.name === 'mosque')

const page = (icon, language, origin = ORIGIN) =>
    icon_page_html(template, {icon, language, related: related_icons(catalog, icon), origin, image: IMAGE})

const hrefs = (html, rel) =>
    Object.fromEntries(
        [
            ...html.matchAll(
                new RegExp(`<link rel="${rel}" data-static-head (?:hreflang="([^"]+)" )?href="([^"]+)"`, 'g'),
            ),
        ].map(match => [match[1] ?? rel, match[2]]),
    )

test('every icon in the catalogue has a framed file and both titles', () => {
    assert.ok(catalog.length > 200)
    for (const icon of catalog) {
        assert.match(icon.framed_svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="24"/)
        assert.ok(icon.title && icon.title_en && icon.category.title && icon.category.title_en, icon.name)
    }
})

test('an icon page holds its title as the h1, in each language', () => {
    assert.match(page(mosque, 'ar'), /<h1>مسجد<\/h1>/)
    assert.match(page(mosque, 'ar'), /<title>أيقونة مسجد بصيغة SVG \| مكتبة الأيقونات الإسلامية<\/title>/)
    assert.match(page(mosque, 'en'), /<h1>Mosque<\/h1>/)
    assert.match(page(mosque, 'en'), /<html dir="ltr" lang="en">/)
})

test('the canonical is the page itself and the alternates are reciprocal', () => {
    const ar = hrefs(page(mosque, 'ar'), 'alternate')
    const en = hrefs(page(mosque, 'en'), 'alternate')
    assert.equal(hrefs(page(mosque, 'ar'), 'canonical').canonical, `${ORIGIN}/icons/mosque`)
    assert.equal(hrefs(page(mosque, 'en'), 'canonical').canonical, `${ORIGIN}/en/icons/mosque`)
    assert.deepEqual(ar, en)
    assert.deepEqual(ar, {
        ar: `${ORIGIN}/icons/mosque`,
        en: `${ORIGIN}/en/icons/mosque`,
        'x-default': `${ORIGIN}/icons/mosque`,
    })
})

test('the JSON-LD parses and names the icon file and its licence', () => {
    for (const language of ['ar', 'en']) {
        const [, json] = page(mosque, language).match(
            /<script type="application\/ld\+json" data-static-head>(.*?)<\/script>/,
        )
        const data = JSON.parse(json)
        assert.equal(data['@type'], 'ImageObject')
        assert.equal(data.contentUrl, `${ORIGIN}/svg/mosque.svg`)
        assert.match(data.acquireLicensePage, language === 'en' ? /\/en\/guide#license$/ : /\.test\/guide#license$/)
        assert.equal(data.copyrightNotice, COPYRIGHT)
        assert.equal(data.license, `${REPO_URL}/blob/main/LICENSE`)
    }
})

test('internal links stay in the page language and related links name real icons', () => {
    const ar = page(mosque, 'ar')
    const en = page(mosque, 'en')
    const related = [...ar.matchAll(/href="\/icons\/([^"]+)"/g)].map(match => match[1])
    assert.ok(related.length > 0)
    for (const name of related) assert.ok(names.has(name), name)
    assert.ok(!related.includes('mosque'))
    assert.match(en, /href="\/en\?category=/)
    assert.match(en, /href="\/en\/guide#license"/)
    assert.doesNotMatch(en, /href="\/(?!en|svg|icons\/mosque")/)
    assert.match(ar, /href="\/en\/icons\/mosque" hreflang="en"/)
})

test('titles are escaped in the head, the body and the JSON-LD', () => {
    const icon = {...mosque, title: '<b>&"', title_en: '</script><i>'}
    const ar = page(icon, 'ar')
    const en = page(icon, 'en')
    assert.doesNotMatch(ar, /<b>/)
    assert.match(ar, /<h1>&lt;b>&amp;"<\/h1>/)
    assert.doesNotMatch(en, /<\/script><i>/)
    assert.doesNotMatch(en, /<i>/)
})

test('without an origin the page keeps its body but carries no absolute links or JSON-LD', () => {
    const html = page(mosque, 'ar', '')
    assert.match(html, /<div data-static-body>/)
    assert.doesNotMatch(html, /canonical|hreflang="x-default"|ld\+json/)
})

test('the home body links every icon once, in its own language, under its category', () => {
    for (const [language, prefix] of [
        ['ar', '/icons/'],
        ['en', '/en/icons/'],
    ]) {
        const html = home_body(language, catalog)
        const linked = [...html.matchAll(/href="([^"]+)"/g)]
            .map(match => match[1])
            .filter(href => href.includes('/icons/'))
        assert.equal(linked.length, catalog.length)
        assert.equal(new Set(linked).size, catalog.length)
        for (const href of linked) {
            assert.ok(href.startsWith(prefix), href)
            assert.ok(names.has(href.slice(prefix.length)), href)
        }
        assert.equal(html.match(/<h2>/g).length, new Set(catalog.map(icon => icon.category.id)).size)
        assert.match(html, /^<div data-static-body>\n<header><nav>[\s\S]*<\/nav><\/header>\n<main>\n<h1>/)
    }
    assert.match(home_body('en', catalog), /<h2>Quran<\/h2>/)
    assert.match(home_body('en', catalog), /href="\/en\/guide"/)
    assert.match(home_body('en', catalog), /<a href="\/" hreflang="ar" lang="ar">/)
    assert.match(home_body('ar', catalog), /<a href="\/en" hreflang="en" lang="en">/)
})

test('the WebSite JSON-LD names the home page of its language', () => {
    assert.deepEqual(website_object('en', ORIGIN), {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Islamicons',
        url: `${ORIGIN}/en`,
        inLanguage: 'en',
    })
    assert.equal(website_object('ar', ORIGIN).url, `${ORIGIN}/`)
})
