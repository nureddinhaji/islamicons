<svg
    class={['icon', class_name]}
    width="24"
    height="24"
    style:width={size_css}
    style:height={size_css}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={stroke_width}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    {...rest}
>
    {@html GLYPHS[id]}
</svg>

<script module>
// Interface glyphs from Tabler Icons (MIT, © Paweł Kuna); only these files are bundled.
import adjustments from '@tabler/icons/outline/adjustments-horizontal.svg?raw'
import book from '@tabler/icons/outline/book.svg?raw'
import github from '@tabler/icons/outline/brand-github.svg?raw'
import react from '@tabler/icons/outline/brand-react.svg?raw'
import svelte from '@tabler/icons/outline/brand-svelte.svg?raw'
import check from '@tabler/icons/outline/check.svg?raw'
import chevron_down from '@tabler/icons/outline/chevron-down.svg?raw'
import copy from '@tabler/icons/outline/copy.svg?raw'
import download from '@tabler/icons/outline/download.svg?raw'
import file_svg from '@tabler/icons/outline/file-type-svg.svg?raw'
import info_circle from '@tabler/icons/outline/info-circle.svg?raw'
import layout_grid from '@tabler/icons/outline/layout-grid.svg?raw'
import loader from '@tabler/icons/outline/loader-2.svg?raw'
import moon from '@tabler/icons/outline/moon.svg?raw'
import photo from '@tabler/icons/outline/photo.svg?raw'
import rotate from '@tabler/icons/outline/rotate.svg?raw'
import search from '@tabler/icons/outline/search.svg?raw'
import sun from '@tabler/icons/outline/sun.svg?raw'
import world from '@tabler/icons/outline/world.svg?raw'
import x from '@tabler/icons/outline/x.svg?raw'

// The files are whole SVGs; keep their shapes, minus the transparent box path every Tabler icon opens with.
const shapes = raw =>
    raw
        .replace(/^[\s\S]*?<svg[^>]*>/, '')
        .replace(/<\/svg>\s*$/, '')
        .replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, '')
        .replace(/>\s+</g, '><')
        .trim()

const GLYPHS = Object.fromEntries(
    Object.entries({
        'book-open': book,
        check,
        'chevron-down': chevron_down,
        copy,
        download,
        github,
        image: photo,
        info: info_circle,
        'layout-grid': layout_grid,
        'loader-circle': loader,
        moon,
        react,
        'rotate-ccw': rotate,
        search,
        'sliders-horizontal': adjustments,
        sun,
        svelte,
        svg: file_svg,
        world,
        x,
    }).map(([id, raw]) => [id, shapes(raw)]),
)
</script>

<script>
let {id, class: class_name = '', size = undefined, stroke_width = 2, ...rest} = $props()

const size_css = $derived(size == null ? undefined : typeof size === 'number' ? `${size}px` : size)
</script>
