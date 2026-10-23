import assert from 'node:assert/strict'
import {test} from 'node:test'

import {stamp_head} from './static-head.js'

const template = `<html dir="rtl" lang="ar">
<head>
<meta name="description" content="old">
<meta name="application-name" content="old">
<meta property="og:site_name" content="old">
<meta property="og:locale" content="ar_AR">
<meta property="og:title" content="old">
<meta property="og:description" content="old">
<title>old</title>
</head>
<body></body>
</html>`

test('a static head carries the page language', () => {
    const html = stamp_head(template, {
        language: 'en',
        name: 'Islamicons',
        title: 'Guide | Islamicons',
        description: 'How to use Islamicons',
        path: '/en/guide',
        origin: '',
        alternates: [
            {language: 'ar', path: '/guide'},
            {language: 'en', path: '/en/guide'},
        ],
    })
    assert.match(html, /<html dir="ltr" lang="en">/)
    assert.match(html, /<title>Guide \| Islamicons<\/title>/)
    assert.match(html, /name="description" content="How to use Islamicons"/)
    assert.match(html, /og:locale" content="en_GB"/)
    assert.doesNotMatch(html, /data-static-head/)
})

test('SITE_ORIGIN adds absolute canonical and alternate links', () => {
    const html = stamp_head(template, {
        language: 'ar',
        name: 'مكتبة',
        title: 'مكتبة',
        description: 'وصف',
        path: '/',
        origin: 'https://example.test',
        alternates: [
            {language: 'ar', path: '/'},
            {language: 'en', path: '/en'},
        ],
    })
    assert.match(html, /rel="canonical" data-static-head href="https:\/\/example.test\/"/)
    assert.match(html, /hreflang="en" href="https:\/\/example.test\/en"/)
    assert.match(html, /hreflang="x-default" href="https:\/\/example.test\/"/)
})
