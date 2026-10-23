<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={stroke_width}
    stroke-linecap="round"
    stroke-linejoin="round"
    class={['shrink-0 overflow-visible', draw && 'draw-icon', class_name]}
    style:color={color || undefined}
    role={label ? 'img' : undefined}
    aria-label={label || undefined}
    aria-hidden={label ? undefined : 'true'}
    {...rest}
>
    {@html draw ? to_drawable(inner) : inner}
</svg>

<script>
import {DEFAULT_STROKE_WIDTH} from '~/lib/frame.js'
import {framed_inner, to_drawable} from '~/lib/icons.js'

// Colour goes through CSS `color` so filled parts (fill="currentColor") follow it along with the strokes.
// `framed={false}` shows the art as drawn on the 24 grid (the keyline view).
// The frame puts the stroke's outer edge on the box edge, which a clipping <svg> shaves whenever it lands between pixels.
let {
    icon,
    size = 24,
    stroke_width = DEFAULT_STROKE_WIDTH,
    framed = true,
    color = '',
    draw = false,
    label = '',
    class: class_name = '',
    ...rest
} = $props()

const inner = $derived(framed ? framed_inner(icon, stroke_width) : icon.inner)
</script>
