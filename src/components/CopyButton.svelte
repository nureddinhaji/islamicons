<Button {variant} {size} class={class_name} onclick={copy} disabled={copied.on}>
    <IconSwap icon={copied.on ? 'check' : icon} />
    {label}
</Button>

<script>
import {create_flash} from '~/lib/flash.svelte.js'
import {Button} from '$ui/button/index.js'

import IconSwap from './IconSwap.svelte'

// The caller shows `failed` outside its row: a line beside the button would push the button out of place.
let {
    text,
    label,
    icon = 'copy',
    variant = 'outline',
    size = 'default',
    class: class_name = '',
    failed = $bindable(false),
} = $props()

const copied = create_flash()

async function copy() {
    failed = false
    try {
        await navigator.clipboard.writeText(typeof text === 'function' ? text() : text)
        copied.fire()
    } catch {
        failed = true
    }
}
</script>
