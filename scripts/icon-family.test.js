import assert from 'node:assert/strict'
import {test} from 'node:test'

import {base_of, parent_of, variant_difference} from '../src/lib/icon-family.js'
import {icon_title, read_catalog} from './icon-catalog.js'

const catalog = read_catalog()
const names = catalog.map(icon => icon.name)
const by_name = new Map(catalog.map(icon => [icon.name, icon]))

test('parent_of picks the longest prefix', () => {
    assert.equal(parent_of('ihram-wide-filled', names), 'ihram-wide')
})

test('a name exception has no parent', () => {
    assert.equal(parent_of('dome-of-the-rock', names), undefined)
})

test('a copy points to the nearest icon that has its own about text', () => {
    const has_about = name => ['ihram', 'quran', 'quran-ornate'].includes(name)
    assert.equal(base_of('ihram-wide-filled', names, has_about), 'ihram')
    assert.equal(base_of('quran-ornate-simple', names, has_about), 'quran-ornate')
    assert.equal(base_of('quran-ornate', names, has_about), '')
    assert.equal(base_of('dome-of-the-rock', names, has_about), '')
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
