<div class={['relative aspect-square w-full', class_name]} style:color={color || undefined}>
    <svg viewBox="0 0 24 24" class="absolute inset-0 size-full text-grid-line" aria-hidden="true">
        {#each GRID_LINES as line (line)}
            <line x1={line} y1="0" x2={line} y2="24" />
            <line x1="0" y1={line} x2="24" y2={line} />
        {/each}
        {#if show_keylines}
            <g class="text-gold/60">
                <circle cx="12" cy="12" r="10" />
                <rect x="4" y="4" width="16" height="16" rx="2" />
            </g>
        {/if}
    </svg>
    {#key icon.name}
        <IslamIcon
            {icon}
            {stroke_width}
            {draw}
            framed={false}
            size="100%"
            class="absolute inset-0 size-full"
            label={label ? icon.title : ''}
        />
        {#if show_centerline}
            <IslamIcon {icon} framed={false} size="100%" class="centerline absolute inset-0 size-full" />
        {/if}
    {/key}
</div>

<script>
import IslamIcon from './IslamIcon.svelte'

const GRID_LINES = Array.from({length: 25}, (_, i) => i)

let {
    icon,
    stroke_width = 2,
    color = '',
    draw = false,
    show_keylines = false,
    show_centerline = false,
    label = false,
    class: class_name = '',
} = $props()
</script>

<style>
/* The grid is scaled from a 24-unit viewBox; non-scaling strokes keep every line a crisp hairline. */
svg :global(line),
svg :global(rect),
svg :global(circle) {
    vector-effect: non-scaling-stroke;
    stroke: currentColor;
    stroke-width: 1px;
    fill: none;
}

:global(.centerline) :global(*) {
    vector-effect: non-scaling-stroke;
    stroke: var(--color-background);
    stroke-width: 1px;
    fill: none;
    opacity: 0.85;
}
</style>
