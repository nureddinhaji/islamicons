import assert from 'node:assert/strict'
import {test} from 'node:test'

import {base_of, variant_difference} from '../src/lib/icon-family.js'
import {icon_title, read_catalog} from './icon-catalog.js'

const catalog = read_catalog()
const by_name = new Map(catalog.map(icon => [icon.name, icon]))

const variant_of = {
    'ihram-wide-filled': 'ihram-wide',
    'ihram-wide': 'ihram',
    'quran-ornate-simple': 'quran-ornate',
    'quran-ornate': 'quran',
}
const parent_of = name => variant_of[name]
const has_about = name => ['ihram', 'quran', 'quran-ornate'].includes(name)

test('a copy points to the nearest icon that has its own about text', () => {
    assert.equal(base_of('ihram-wide-filled', parent_of, has_about), 'ihram')
    assert.equal(base_of('quran-ornate-simple', parent_of, has_about), 'quran-ornate')
    assert.equal(base_of('quran-ornate', parent_of, has_about), '')
})

test("an id that starts with another's is not a variant without variant_of", () => {
    assert.equal(base_of('dome-of-the-rock', parent_of, has_about), '')
})

test('a variant with its own about text is not a copy', () => {
    for (const name of ['ayah-book', 'ayah-search', 'quran-search']) assert.equal(by_name.get(name).base, '', name)
    assert.equal(by_name.get('mosque-minaret-left').base, 'mosque')
})

test('variant_difference reads what follows the base title', () => {
    assert.equal(variant_difference('Mosque (left minaret)', 'Mosque'), 'left minaret')
    assert.equal(variant_difference('Quran (ornate, simple)', 'Quran (ornate)'), 'simple')
    assert.equal(variant_difference('مصحف (مزخرف، مبسّط)', 'مصحف (مزخرف)'), 'مبسّط')
})

test('every copy is its base title plus a difference, in both languages', () => {
    const copies = catalog.filter(icon => icon.base)
    assert.ok(copies.length > 0)
    for (const icon of copies) {
        const base = by_name.get(icon.base)
        assert.equal(icon.about, '', icon.name)
        for (const [language, comma] of [['ar', '، '], ['en', ', ']]) {
            const title = icon_title(icon, language)
            const base_title = icon_title(base, language)
            const difference = variant_difference(title, base_title)
            const head = base_title.endsWith(')') ? `${base_title.slice(0, -1)}${comma}` : `${base_title} (`
            assert.ok(difference, `${icon.name}: ${language}`)
            assert.equal(`${head}${difference})`, title, `${icon.name}: ${language}`)
        }
    }
})
