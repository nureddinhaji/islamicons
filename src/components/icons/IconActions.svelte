<div class="flex flex-col gap-2">
    <div class="flex flex-wrap items-start gap-2">
        <CopyButton text={() => svg_code} label="نسخ SVG" variant="default" bind:failed={copy_failed} />
        <Button variant="outline" onclick={() => download_svg(svg_code, `${icon.name}.svg`)}>
            <Icon id="download" />
            تنزيل SVG
        </Button>
        <Button variant="outline" onclick={save_png}>
            <Icon id="image" />
            تنزيل PNG
        </Button>
    </div>
    {#if copy_failed}
        <p class="text-sm text-destructive" role="alert">تعذّر النسخ، انسخ الكود من تبويب SVG أدناه.</p>
    {/if}
    {#if png_failed}
        <p class="text-sm text-destructive" role="alert">تعذّر إنشاء صورة PNG، جرّب تنزيل SVG.</p>
    {/if}
</div>

<script>
import {download_png, download_svg} from '~/lib/download.js'
import {to_svg} from '~/lib/icons.js'
import Icon from '$icon'
import {Button} from '$ui/button/index.js'

import CopyButton from '../CopyButton.svelte'

const PNG_SIZE = 512
// Fallback ink for PNG, where currentColor has no text colour to inherit.
const PNG_INK = '#1c1b19'

// Mounted inside the panel's content, which unmounts on every close, so a failure never outlives its opening.
let {icon, svg_code, options} = $props()

let copy_failed = $state(false)
let png_failed = $state(false)

async function save_png() {
    png_failed = false
    try {
        const svg = to_svg(icon, {...options, size: PNG_SIZE, color: options.color || PNG_INK})
        await download_png(svg, `${icon.name}.png`, PNG_SIZE)
    } catch {
        png_failed = true
    }
}
</script>
