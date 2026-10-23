<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={['shrink-0 overflow-visible', draw && 'draw-icon', class_name]}
    style={draw ? CALM : undefined}
    aria-hidden="true"
>
    {#if draw}
        <!-- The star is carved from the filled square through a mask, so the hole shows whatever lies behind it. -->
        <defs>
            <mask id={carve_id} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                <rect width="24" height="24" fill="white" />
                <g color="black">
                    <path d={STAR} stroke-width="0.3" pathLength="1" style="--i: 11; --draw-duration: 1s" />
                    <!-- Empties after its outline ends (2.98 s): 17 × 180 ms = 3.06 s. -->
                    <path d={STAR} fill="currentColor" stroke="none" style="--i: 17; --draw-fill-duration: 0.6s" />
                </g>
            </mask>
        </defs>
        <!-- Both shapes are solid; their edges are drawn first so they are drawn like the rest. -->
        <path d={CRESCENT} stroke-width="0.3" pathLength="1" style="--i: 0" />
        <path d={SQUARE} stroke-width="0.3" pathLength="1" style="--i: 1" />
        <path d={CRESCENT} fill="currentColor" stroke="none" style="--i: 5" />
        <path
            d={SQUARE}
            fill="currentColor"
            stroke="none"
            mask="url(#{carve_id})"
            style="--i: 7; --draw-fill-duration: 0.6s"
        />
    {:else}
        <path d={CRESCENT} fill="currentColor" stroke="none" />
        <path d={SQUARE + STAR} fill="currentColor" fill-rule="evenodd" stroke="none" />
    {/if}
</svg>

<script>
const CRESCENT = 'M12.37 3.1A9.5 9.5 0 1 0 19.34 17.05A7.8 7.8 0 0 1 12.37 3.1Z'
// The solid square covers what the old 2-unit frame's outer edge enclosed; the star, 1.25× its first size, is cut out of it.
const SQUARE =
    'M14.75 4.5H19.25A2.75 2.75 0 0 1 22 7.25V11.75A2.75 2.75 0 0 1 19.25 14.5H14.75A2.75 2.75 0 0 1 12 11.75V7.25A2.75 2.75 0 0 1 14.75 4.5Z'
const STAR =
    'M17 7L17.7375 7.7375L18.7625 7.7375L18.7625 8.7625L19.5 9.5L18.7625 10.2375L18.7625 11.2625L17.7375 11.2625L17 12L16.2625 11.2625L15.2375 11.2625L15.2375 10.2375L14.5 9.5L15.2375 8.7625L15.2375 7.7375L16.2625 7.7375Z'

// A slow, even line (ease-in-out sine) and long fades: the logo opens the page, so it takes its time.
const CALM =
    '--draw-duration: 1.6s; --draw-ease: cubic-bezier(0.37, 0, 0.63, 1); --draw-step: 180ms; --draw-fill-duration: 0.9s; --draw-fill-ease: cubic-bezier(0.37, 0, 0.63, 1)'

let {draw = false, class: class_name = ''} = $props()

const carve_id = $props.id()
</script>
