<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={drawn_width}
    stroke-linecap="round"
    stroke-linejoin="round"
    overflow="visible"
    class={['islamicon', `islamicon-${name}`, class_name]}
    {style}
    role={labelled_by_text ? 'img' : undefined}
    aria-hidden={decorative ? 'true' : undefined}
    {...given}
>
    {#if ratio === 1}
        {@render shapes()}
    {:else}
        <g transform="matrix({ratio} 0 0 {ratio} {offset} {offset})" stroke-width={drawn_width / ratio}>
            {@render shapes()}
        </g>
    {/if}
    {@render children?.()}
</svg>

<script module>
// Here, not in the instance script: there, with no other import, svelte-package 3.0.1 drops it from the .d.ts.
/** @import {IconFrameProps} from './types.js' */
</script>

<script>
// Mirrors src/lib/frame.js: shapes arrive framed for 1.5, and another stroke rescales them about the centre.
const DEFAULT_STROKE_WIDTH = 1.5
const frame_scale = stroke_width => 1.1 - stroke_width / 20
// (1.6 * 24) / 24 is 1.6000000000000003 in floating point; 4 decimals, as frame.js writes coordinates.
const round = value => Math.round(value * 10000) / 10000
const names_itself = key => key === 'role' || key === 'title' || key.startsWith('aria-')

/** @type {IconFrameProps} */
let {
    name,
    shapes,
    size = 24,
    color = 'currentColor',
    strokeWidth: stroke_width = DEFAULT_STROKE_WIDTH,
    absoluteStrokeWidth: absolute_stroke_width = false,
    class: class_name,
    style: user_style,
    children,
    ...rest
} = $props()

const drawn_width = $derived(
    round(
        absolute_stroke_width && Number(size) > 0 ? (Number(stroke_width) * 24) / Number(size) : Number(stroke_width),
    ),
)
const ratio = $derived(frame_scale(drawn_width) / frame_scale(DEFAULT_STROKE_WIDTH))
const offset = $derived(12 - 12 * ratio)
// Not a style:color directive: one left undefined also strips `color` from the user's own style.
const style = $derived(
    color === 'currentColor' ? user_style : [user_style, `color: ${color}`].filter(Boolean).join('; '),
)
// A prop passed as undefined or null renders nothing, so it neither names the icon nor overrides what is worked out
// here. Reflect.ownKeys, not Object.entries: attachments ({@attach}) travel under symbol keys.
const given = $derived(
    Object.fromEntries(
        Reflect.ownKeys(rest)
            .filter(key => rest[key] != null)
            .map(key => [key, rest[key]]),
    ),
)
const decorative = $derived(!children && !Object.keys(given).some(names_itself))
const labelled_by_text = $derived(
    !('role' in given) && Boolean(given['aria-label'] || given['aria-labelledby'] || given.title),
)
</script>
