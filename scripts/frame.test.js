import assert from 'node:assert/strict'
import {test} from 'node:test'

import {DEFAULT_STROKE_WIDTH, frame_inner, svg_document} from '../src/lib/frame.js'

const FRAMED = '<path d="M4 4h16"/><circle cx="12" cy="12" r="2" fill="currentColor"/>'

test('the framed ink stops one unit inside the box at any stroke', () => {
    for (const stroke_width of [1, DEFAULT_STROKE_WIDTH, 2, 3]) {
        const [low, high] = /M([\d.]+) [\d.]+H([\d.]+)/.exec(frame_inner('<path d="M2 2H22"/>', stroke_width)).slice(1)
        assert.ok(Math.abs(Number(low) - stroke_width / 2 - 1) < 1e-4, `${stroke_width}: ${low}`)
        assert.ok(Math.abs(Number(high) + stroke_width / 2 - 23) < 1e-4, `${stroke_width}: ${high}`)
    }
})

test('svg_document writes the standard file at the defaults', () => {
    assert.equal(
        svg_document(FRAMED),
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" overflow="visible">
  <path d="M4 4h16"/>
  <circle cx="12" cy="12" r="2" fill="currentColor"/>
</svg>`,
    )
})

test('svg_document gives solid parts the chosen colour', () => {
    assert.equal(
        svg_document(FRAMED, {size: 32, stroke_width: 2, color: '#123456'}),
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#123456" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" overflow="visible">
  <path d="M4 4h16"/>
  <circle cx="12" cy="12" r="2" fill="#123456"/>
</svg>`,
    )
})
