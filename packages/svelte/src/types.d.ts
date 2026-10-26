import type {Snippet} from 'svelte'
import type {SVGAttributes} from 'svelte/elements'

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'color'> {
    /** Width and height: a number of pixels or any CSS length. Default 24. */
    size?: number | string
    /** Colour of the strokes and the solid parts. Default `currentColor`, the colour of the surrounding text. */
    color?: string
    /** Stroke width in pixels at size 24; the drawing rescales slightly with it so it always fills its box. Default 1.6. */
    strokeWidth?: number
    /** Keep the stroke the same number of pixels at any size, instead of scaling with the icon. Needs a numeric `size`. */
    absoluteStrokeWidth?: boolean
    /** Extra SVG content drawn after the icon's shapes. Name the icon with `aria-label`, not a `<title>` here: rendered in the browser, Svelte creates that as an HTML element, which names nothing. */
    children?: Snippet
}

/** Internal: what each generated icon passes to the shared component. */
export interface IconFrameProps extends IconProps {
    name: string
    shapes: Snippet
}
