<Button onclick={toggle_theme} variant="ghost" size="icon" aria-label="تبديل الوضع الليلي" class={class_name}>
    <IconSwap icon={mode.current === 'dark' ? 'sun' : 'moon'} class="size-4.5" />
</Button>

<script>
import {mode, toggleMode} from 'mode-watcher'
import {tick} from 'svelte'
import {prefersReducedMotion} from 'svelte/motion'

import {Button} from '$ui/button/index.js'

import IconSwap from './IconSwap.svelte'

let {class: class_name = ''} = $props()

function toggle_theme() {
    if (prefersReducedMotion.current) toggleMode()
    else
        document.startViewTransition(() => {
            toggleMode()
            return tick()
        })
}
</script>
