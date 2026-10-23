<Portal {...portal_props}>
    <Overlay />
    <Dialog.Content bind:ref data-slot="sheet-content" class={cn(sheet_variants({side}), class_name)} {...rest}>
        {@render children?.()}
        <Dialog.Close
            class="absolute inset-e-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none"
        >
            <Icon id="x" class="size-4" />
            <span class="sr-only">إغلاق</span>
        </Dialog.Close>
    </Dialog.Content>
</Portal>

<script>
import {Dialog} from 'bits-ui'

import Icon from '$icon'
import {cn} from '$lib/utils.js'
import {Overlay, Portal} from '$ui/sheet/index.js'
import {sheet_variants} from '$ui/sheet/sheet-content.svelte'

let {ref = $bindable(null), class: class_name, side = 'right', portalProps: portal_props, children, ...rest} = $props()
</script>
