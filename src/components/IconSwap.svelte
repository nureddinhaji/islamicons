<span class="grid shrink-0 place-items-center">
    {#key id}
        <span
            class="col-start-1 row-start-1"
            transition:scale={{duration: prefersReducedMotion.current ? 0 : 200, start: 0.5}}
        >
            <Icon {id} class={[class_name, loading && 'animate-spin']} aria-hidden="true" />
        </span>
    {/key}
</span>

<script>
import {prefersReducedMotion} from 'svelte/motion'
import {scale} from 'svelte/transition'

import Icon from '$icon'

let {icon, loading = false, class: class_name = ''} = $props()

const id = $derived(loading ? 'loader-circle' : icon)
</script>
