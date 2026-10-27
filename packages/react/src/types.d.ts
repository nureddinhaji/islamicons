import type {SVGProps} from 'react'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'color' | 'strokeWidth'> {
    /** Width and height: a number of pixels or any CSS length. Default 24. */
    size?: number | string
    /** Colour of the strokes and the solid parts. Default `currentColor`, the colour of the surrounding text. */
    color?: string
    /** Stroke width in pixels at size 24; the drawing rescales slightly with it to keep a unit of margin. Default 1.5. */
    strokeWidth?: number
    /** Keep the stroke the same number of pixels at any size, instead of scaling with the icon. Needs a numeric `size`. */
    absoluteStrokeWidth?: boolean
}
