import assert from 'node:assert/strict'
import {test} from 'node:test'

import {robots_txt, sitemap_xml} from './sitemap.js'

const alternates_for = (ar, en) => [
    {language: 'ar', path: ar},
    {language: 'en', path: en},
]

const ENTRIES = [
    {path: '/', alternates: alternates_for('/', '/en')},
    {path: '/en', alternates: alternates_for('/', '/en')},
    {path: '/guide', alternates: alternates_for('/guide', '/en/guide')},
    {path: '/en/guide', alternates: alternates_for('/guide', '/en/guide')},
]

test('the sitemap lists each path once, with ar, en and x-default alternates', () => {
    const xml = sitemap_xml('https://example.test', ENTRIES)
    const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(match => match[1])
    assert.deepEqual(locs, [
        'https://example.test/',
        'https://example.test/en',
        'https://example.test/guide',
        'https://example.test/en/guide',
    ])
    for (const url of xml.split('<url>').slice(1)) {
        assert.match(url, /hreflang="ar" href="https:\/\/example.test\//)
        assert.match(url, /hreflang="en" href="https:\/\/example.test\/en/)
        assert.match(url, /hreflang="x-default" href="https:\/\/example.test\//)
    }
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org/)
})

test('the sitemap escapes & in URLs', () => {
    const xml = sitemap_xml('https://example.test', [{path: '/a&b', alternates: alternates_for('/a&b', '/en/a&b')}])
    assert.match(xml, /<loc>https:\/\/example.test\/a&amp;b<\/loc>/)
    assert.doesNotMatch(xml, /&(?!amp;)/)
})

test('robots.txt names the sitemap only when there is an origin', () => {
    assert.equal(robots_txt(''), 'User-agent: *\nAllow: /\n')
    assert.equal(
        robots_txt('https://example.test'),
        'User-agent: *\nAllow: /\n\nSitemap: https://example.test/sitemap.xml\n',
    )
})
