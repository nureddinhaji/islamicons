<div class="flex flex-col gap-2">
    <div class="flex items-baseline justify-between gap-2 text-sm">
        <span id={label_id} class="font-medium">{label}</span>
        <output dir="ltr" class="font-mono text-muted-foreground">{value}{unit}</output>
    </div>
    <Slider.Root
        type="single"
        {dir}
        bind:value
        {min}
        {max}
        {step}
        class="relative flex h-5 w-full touch-none items-center select-none"
    >
        {#snippet children({thumbItems})}
            <span class="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
                <Slider.Range class="absolute h-full bg-primary" />
            </span>
            {#each thumbItems as thumb (thumb.index)}
                <Slider.Thumb
                    index={thumb.index}
                    aria-labelledby={label_id}
                    class="block size-4 rounded-full bg-primary shadow-[0_0_0_3px_var(--color-background)] transition-transform hover:scale-110 active:scale-110"
                />
            {/each}
        {/snippet}
    </Slider.Root>
</div>

<script>
import {Slider} from 'bits-ui'

import {dir} from '~/lib/locale.js'

let {label, value = $bindable(), min, max, step = 1, unit = ''} = $props()

const label_id = $props.id()
</script>
