import assert from 'node:assert/strict'
import {test} from 'node:test'

import {arabic_digits, arabic_pattern} from '../src/lib/arabic.js'

const finds = (query, text) => new RegExp(`^(?:${arabic_pattern(query)})$`).test(text)

test('arabic_digits converts digits only', () => {
    assert.equal(arabic_digits(2026), '٢٠٢٦')
    assert.equal(arabic_digits('x9'), 'x٩')
})

test('harakat are ignored both ways', () => {
    assert.ok(finds('مُصمَت', 'مصمت'))
    assert.ok(finds('مصمت', 'مُصمَت'))
})

test('the dagger alef and Quranic marks in the text are ignored too', () => {
    assert.ok(finds('الرحمن', 'الرحمٰن'))
    assert.ok(finds('العلم', 'العلمۖ'))
})

test('lookalike letters match', () => {
    assert.ok(finds('ا', 'أ'))
    assert.ok(finds('ة', 'ه'))
    assert.ok(finds('ي', 'ى'))
    assert.ok(finds('إ', 'ا'))
    assert.ok(finds('أ', 'ا'))
    assert.ok(finds('آ', 'ا'))
})

test('ت and ه are not lookalikes, though both are lookalikes of ة', () => {
    assert.ok(!finds('ت', 'ه'))
    assert.ok(!finds('ه', 'ت'))
})

test('hamza seats are one-way: أ finds ؤ, ؤ does not find أ', () => {
    assert.ok(finds('أ', 'ؤ'))
    assert.ok(!finds('ؤ', 'أ'))
})

test('regex specials are literal', () => {
    assert.ok(finds('c++', 'c++'))
    assert.ok(!finds('c++', 'cc'))
    assert.ok(finds('x-y', 'x-y'))
})

test('the result is a string', () => {
    assert.equal(typeof arabic_pattern('a'), 'string')
})
