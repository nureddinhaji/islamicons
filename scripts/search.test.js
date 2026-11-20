import assert from 'node:assert/strict'
import {test} from 'node:test'

import {rank_icons, search_fields} from '../src/lib/search.js'
import {read_catalog} from './icon-catalog.js'

const catalog = read_catalog().map(icon => ({...icon, ...search_fields(icon.name, icon)}))
const names = query => rank_icons(catalog, query).map(icon => icon.name)
const first = query => names(query)[0]

test('an empty or blank query lists everything in catalogue order', () => {
    const all = catalog.map(icon => icon.name)
    assert.deepEqual(names(''), all)
    assert.deepEqual(names('   '), all)
})

test('a query that matches nothing returns nothing', () => {
    assert.deepEqual(names('zzzz'), [])
})

test('hamza spellings find the same icon', () => {
    assert.equal(first('قارئ'), 'qari')
    assert.equal(first('قاري'), 'qari')
    assert.equal(first('بئر'), 'zamzam')
})

test('a title with «ال» beats a whole tag', () => {
    assert.equal(first('سجود'), 'sujud')
})

test('icons tied on a whole tag keep the catalogue order', () => {
    assert.deepEqual(names('صلاة').slice(0, 4), ['prayer-mat', 'prayer-mat-rolled', 'takbir', 'qiyam'])
})

test('duha ranks above sunrise for «ضحى»', () => {
    assert.deepEqual(names('ضحى').slice(0, 2), ['duha', 'sunrise'])
})

test('a seat typed without its hamza finds the icon', () => {
    assert.equal(first('ميذنة'), 'minaret')
    assert.equal(first('عايلة'), 'family')
    assert.equal(first('موذن'), 'adhan')
    assert.equal(first('بير'), 'zamzam')
    assert.equal(first('سوال'), 'fatwa')
})

test('the added tags find their icons', () => {
    assert.equal(first('masajid'), 'mosque')
    assert.ok(names('مساجد').includes('mosque'))
    for (const query of ['أهلة', 'الأهلة', 'اهلة']) assert.equal(first(query), 'crescent')
    for (const query of ['khimar', 'خمار']) assert.equal(first(query), 'hijab')
    assert.deepEqual(names('modest'), ['hijab', 'niqab'])
    for (const query of ['مصحف', 'quran']) {
        const rank = names(query).indexOf('surah-book')
        assert.ok(rank >= 0 && rank < 12, `${query}: ${rank}`)
    }
})
