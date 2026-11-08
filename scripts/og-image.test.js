import assert from 'node:assert/strict'
import {test} from 'node:test'

import {read_catalog} from './icon-catalog.js'
import {icon_og_assets, icon_og_image} from './og-image.js'
import {family_icons, icon_page_html, related_icons} from './static-pages.js'

const catalog = read_catalog()
const mosque = catalog.find(icon => icon.name === 'mosque')

test('each icon card has its own path and an alt in its language', () => {
    assert.deepEqual(icon_og_image(mosque, 'en'), {
        path: '/og/mosque-en.png',
        alt: 'The Mosque icon from Islamicons',
        width: 1200,
        height: 630,
    })
    assert.equal(icon_og_image(mosque, 'ar').alt, 'أيقونة «مسجد» من مكتبة الأيقونات الإسلامية')
})

test('the cards are 1200×630 PNGs, one per icon and language', () => {
    const assets = icon_og_assets([mosque])
    assert.deepEqual(
        assets.map(asset => asset.fileName),
        ['og/mosque-ar.png', 'og/mosque-en.png'],
    )
    for (const {source} of assets) {
        assert.equal(source.subarray(1, 4).toString(), 'PNG')
        assert.deepEqual([source.readUInt32BE(16), source.readUInt32BE(20)], [1200, 630])
    }
})

test('an icon page stamps its own card as og:image', () => {
    const template = '<html><head>\n<title>old</title>\n</head>\n<body></body></html>'
    const html = icon_page_html(template, {
        icon: mosque,
        language: 'ar',
        related: related_icons(catalog, mosque),
        family: family_icons(catalog, mosque),
        origin: 'https://example.test',
        image: icon_og_image(mosque, 'ar'),
    })
    assert.match(html, /property="og:image" data-static-head content="https:\/\/example.test\/og\/mosque-ar.png"/)
    assert.match(html, /og:image:alt" data-static-head content="أيقونة «مسجد» من مكتبة الأيقونات الإسلامية"/)
})
