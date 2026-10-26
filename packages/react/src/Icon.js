import {createElement} from 'react'

// Mirrors src/lib/frame.js: shapes arrive framed for 1.6, and another stroke rescales them about the centre.
const DEFAULT_STROKE_WIDTH = 1.6
const frame_scale = stroke_width => 1.2 - stroke_width / 20
// (1.6 * 24) / 24 is 1.6000000000000003 in floating point; 4 decimals, as frame.js writes coordinates.
const round = value => Math.round(value * 10000) / 10000
const names_itself = key => key === 'role' || key === 'title' || key.startsWith('aria-')

export default function Icon({
    name,
    nodes,
    size = 24,
    color = 'currentColor',
    strokeWidth: stroke_width = DEFAULT_STROKE_WIDTH,
    absoluteStrokeWidth: absolute_stroke_width = false,
    className: class_name,
    style,
    children,
    ...rest
}) {
    // React renders a null or undefined prop as nothing, so here it neither names the icon nor overrides role/aria-hidden.
    const given = Object.fromEntries(Object.entries(rest).filter(([, value]) => value != null))
    const drawn_width = round(
        absolute_stroke_width && Number(size) > 0 ? (Number(stroke_width) * 24) / Number(size) : Number(stroke_width),
    )
    const ratio = frame_scale(drawn_width) / frame_scale(DEFAULT_STROKE_WIDTH)
    const offset = 12 - 12 * ratio
    const decorative = !children && !Object.keys(given).some(names_itself)
    const labelled_by_text =
        !('role' in given) && Boolean(given['aria-label'] || given['aria-labelledby'] || given.title)
    const shapes = nodes.map(([tag, attrs]) => createElement(tag, attrs))
    // Spread as separate children in both branches: an array passed as one child makes React ask for keys.
    const body =
        ratio === 1
            ? shapes
            : [
                  createElement(
                      'g',
                      {
                          transform: `matrix(${ratio} 0 0 ${ratio} ${offset} ${offset})`,
                          strokeWidth: drawn_width / ratio,
                      },
                      ...shapes,
                  ),
              ]
    return createElement(
        'svg',
        {
            xmlns: 'http://www.w3.org/2000/svg',
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: drawn_width,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            overflow: 'visible',
            className: ['islamicon', `islamicon-${name}`, class_name].filter(Boolean).join(' '),
            // Colour goes through CSS `color`, so the solid parts (fill="currentColor") follow it with the strokes.
            style: color === 'currentColor' ? style : {...style, color},
            role: labelled_by_text ? 'img' : undefined,
            'aria-hidden': decorative ? 'true' : undefined,
            ...given,
        },
        ...body,
        children,
    )
}
