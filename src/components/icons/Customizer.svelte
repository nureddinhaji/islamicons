<section aria-labelledby="{uid}-title" class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-2">
        <h2 id="{uid}-title" class="text-base">التخصيص</h2>
        <Button
            variant="ghost"
            size="sm"
            onclick={reset_customizer}
            disabled={is_default}
            class="text-muted-foreground"
        >
            <Icon id="rotate-ccw" />
            استعادة
        </Button>
    </div>
    <RangeField label="الحجم" bind:value={customizer.current.size} min={16} max={64} step={4} unit="px" />
    <RangeField label="سُمك الخط" bind:value={customizer.current.stroke_width} min={1} max={3} step={0.1} />
    <div role="group" aria-labelledby="{uid}-color" class="flex flex-col gap-2">
        <span id="{uid}-color" class="text-sm font-medium">اللون</span>
        <div class="flex flex-wrap items-center gap-2">
            {#each get_color_swatches() as swatch (swatch.value)}
                <button
                    type="button"
                    aria-label={swatch.label}
                    aria-pressed={customizer.current.color === swatch.value}
                    title={swatch.label}
                    onclick={() => (customizer.current.color = swatch.value)}
                    class={[
                        'grid size-8 place-items-center rounded-full transition-shadow focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-(--ring-focus)',
                        customizer.current.color === swatch.value &&
                            'shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-foreground)]',
                    ]}
                >
                    <span
                        class="size-6 rounded-full bg-(--swatch) shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]"
                        style:--swatch={swatch.value || 'var(--color-foreground)'}
                    ></span>
                </button>
            {/each}
            <label
                class={[
                    'relative grid size-8 cursor-pointer place-items-center rounded-full transition-shadow has-focus-visible:outline-2 has-focus-visible:outline-offset-6 has-focus-visible:outline-(--ring-focus)',
                    is_custom_color && 'shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-foreground)]',
                ]}
                title="لون مخصّص"
            >
                <span
                    class="size-6 rounded-full bg-[conic-gradient(from_0deg,#d14,#e90,#3a3,#18c,#93c,#d14)]"
                    style:background={is_custom_color ? customizer.current.color : undefined}
                ></span>
                <input
                    type="color"
                    class="absolute inset-0 size-full cursor-pointer opacity-0"
                    aria-label="لون مخصّص"
                    value={is_custom_color ? customizer.current.color : '#1f6b55'}
                    oninput={e => (customizer.current.color = e.currentTarget.value)}
                />
            </label>
        </div>
    </div>
</section>

<script>
import {customizer, CUSTOMIZER_DEFAULTS, get_color_swatches, reset_customizer} from '~/lib/customizer.svelte.js'
import Icon from '$icon'
import {Button} from '$ui/button/index.js'

import RangeField from '../RangeField.svelte'

const uid = $props.id()

const is_custom_color = $derived(!get_color_swatches().some(swatch => swatch.value === customizer.current.color))
const is_default = $derived(
    Object.entries(CUSTOMIZER_DEFAULTS).every(([key, value]) => customizer.current[key] === value),
)
</script>
