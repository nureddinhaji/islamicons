<section>
    <div class="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-12 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div class="flex max-w-2xl flex-col gap-5">
            <h1 class="text-5xl leading-[1.25]"><span class="text-primary">أيقونات إسلامية</span> مرسومة بإتقان</h1>
            <p class="text-lg text-muted-foreground">
                {count_icons(icons.length)} إسلامية بقواعد رسم واحدة، مفتوحة المصدر ومجانية. اختر أيقونة لتنسخ رمزها أو تنزّلها،
                بالحجم والسُمك واللون الذي تريد.
            </p>
            <p class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>متوفرة على:</span>
                {#each TARGETS as target (target.id)}
                    <a
                        href={href_in(`/guide#${target.id}`)}
                        class="flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-primary"
                    >
                        <Icon id={target.id} class="size-5" />
                        {target.label}
                    </a>
                {/each}
            </p>
        </div>

        <div
            class="relative [--cell:7rem] [--logo:calc(var(--sheet)*0.78)] [--sheet:calc(var(--cell)*3+2px)] max-lg:hidden"
        >
            <ul
                class={['grid grid-cols-3 gap-px bg-grid-line', SHEET_SHADOW, building && 'opacity-0']}
                aria-label="أيقونات مختارة"
                onpointerenter={() => (held = true)}
                onpointerleave={() => (held = false)}
                onfocusin={() => (focused = true)}
                onfocusout={() => (focused = false)}
            >
                {#each cells as cell, i (i)}
                    <li class="grid">
                        <button
                            type="button"
                            aria-label={cell.icon.title}
                            title={cell.icon.title}
                            onclick={() => onselect(cell.icon.name)}
                            class="grid size-(--cell) place-items-center bg-card transition-colors hover:text-primary focus-visible:z-10"
                        >
                            {#key cell.icon.name}
                                <span class={['col-start-1 row-start-1 grid', cell.swapped && 'fresh-ink']} out:undraw>
                                    <IslamIcon icon={cell.icon} size={44} draw style="--draw-delay: {cell.delay}ms" />
                                </span>
                            {/key}
                        </button>
                    </li>
                {/each}
            </ul>

            <!-- The opening: the logo draws alone, a frame and a card form around it, the sheet's lines cut it into nine,
                 and the pieces give way to icons. -->
            {#if building}
                <div class="pointer-events-none absolute inset-0 grid place-items-center text-primary">
                    <div
                        class={[
                            'absolute inset-0 bg-card transition-opacity delay-450 duration-500',
                            SHEET_SHADOW,
                            phase === 'logo' && 'opacity-0',
                        ]}
                    ></div>
                    {#if phase === 'frame'}
                        <!-- Two halves leave the top centre and meet at the bottom, the same in either direction. -->
                        <svg
                            viewBox="0 0 100 100"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="0.375"
                            class="draw-icon absolute inset-0 size-full overflow-visible text-primary/40"
                            aria-hidden="true"
                        >
                            <path d="M50 0H0V100H50" pathLength="1" />
                            <path d="M50 0H100V100H50" pathLength="1" />
                        </svg>
                    {/if}
                    <Logo draw class="relative size-(--logo)" />
                </div>
            {:else if phase === 'cut'}
                <div class="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px">
                    {#each PIECES as piece (piece.index)}
                        <div class="relative overflow-hidden bg-card text-primary" out:burst|global={piece}>
                            <!-- Logical offsets: each piece shows its own part of the logo in either direction. -->
                            <div
                                class="absolute size-(--logo)"
                                style:inset-inline-start="calc((var(--sheet) - var(--logo)) / 2 - {piece.column} * (var(--cell) + 1px))"
                                style:top="calc((var(--sheet) - var(--logo)) / 2 - {piece.row} * (var(--cell) + 1px))"
                            >
                                <Logo class="size-full" />
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</section>

<script module>
// The opening plays once per page load, not on every return to the home page.
let opening_played = false
</script>

<script>
import {onDestroy} from 'svelte'
import {cubicOut} from 'svelte/easing'
import {prefersReducedMotion} from 'svelte/motion'

import {PACKAGES} from '~/lib/constants.svelte.js'
import {count_icons} from '~/lib/format.js'
import {icon_named, icons} from '~/lib/icons.js'
import {href_in} from '~/lib/locale.js'
import Icon from '$icon'

import IslamIcon from '../IslamIcon.svelte'
import Logo from '../Logo.svelte'

const SHEET_SHADOW = 'shadow-[0_40px_80px_-40px_rgb(20_40_30/0.35)]'
const FRAME_AT = 3500
const CUT_AT = 4800
const BURST_AT = 5100
const RING_STEP = 110
const BURST = 520
const SWAP_EVERY = 1800
const UNDRAW = 380

const featured = [
    'mosque',
    'kaaba',
    'quran',
    'star-and-crescent',
    'lantern',
    'prayer-beads',
    'rub-el-hizb',
    'dua',
    'qibla-compass',
].map(icon_named)

const TARGETS = [{id: 'svg', label: 'SVG'}, ...PACKAGES]

// Base icons only (variant titles carry parentheses), and never the sacred names in a game of swaps.
const REEL = icons.filter(icon => icon.category !== 'sacred-names' && !icon.titles[0].includes('('))

// Steps from the centre cell: 0 for the centre, 1 for the edges, 2 for the corners.
const ring = index => Math.abs((index % 3) - 1) + Math.abs(Math.floor(index / 3) - 1)

const PIECES = Array.from({length: 9}, (_, index) => ({
    index,
    column: index % 3,
    row: Math.floor(index / 3),
    delay: ring(index) * RING_STEP,
}))

let {onselect} = $props()

const opening = !opening_played && !prefersReducedMotion.current
opening_played = true

let phase = $state(opening ? 'logo' : 'board')
const building = $derived(phase === 'logo' || phase === 'frame')
let cells = $state(
    featured.map((icon, i) => ({
        icon,
        delay: opening ? BURST_AT + ring(i) * RING_STEP + 140 : i * 90,
        swapped: false,
    })),
)
const swaps_from = performance.now() + (opening ? BURST_AT + 2 * RING_STEP + BURST + 900 : 0)
// A cell never changes under the pointer or the keyboard: what the reader is about to click stays put.
let held = false
let focused = false
let queue = []
let last_cell = -1

const opening_timers = opening
    ? [
          setTimeout(() => (phase = 'frame'), FRAME_AT),
          setTimeout(() => (phase = 'cut'), CUT_AT),
          setTimeout(() => (phase = 'board'), BURST_AT),
      ]
    : []
onDestroy(() => opening_timers.forEach(clearTimeout))

function shuffled(list) {
    const out = [...list]
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

function next_icon() {
    const on_sheet = new Set(cells.map(cell => cell.icon.name))
    for (;;) {
        if (!queue.length) queue = shuffled(REEL)
        const icon = queue.pop()
        if (!on_sheet.has(icon.name)) return icon
    }
}

function swap() {
    if (held || focused || document.hidden || performance.now() < swaps_from) return
    let index
    do index = Math.floor(Math.random() * cells.length)
    while (index === last_cell)
    last_cell = index
    cells[index] = {icon: next_icon(), delay: UNDRAW - 80, swapped: true}
}

// The old line retracts the way it was drawn; Web Animations outrank the .draw-icon fill that holds it drawn.
function undraw(node) {
    const timing = {duration: UNDRAW, easing: 'cubic-bezier(0.55, 0, 1, 0.45)', fill: 'forwards'}
    for (const path of node.querySelectorAll('[pathLength]')) path.animate({strokeDashoffset: [0, 1]}, timing)
    for (const part of node.querySelectorAll('[fill="currentColor"]')) part.animate({opacity: [1, 0]}, timing)
    return {duration: UNDRAW}
}

function burst(_node, {delay}) {
    return {
        delay,
        duration: BURST,
        easing: cubicOut,
        css: t => `opacity: ${t}; transform: scale(${0.86 + 0.14 * t}); filter: blur(${(1 - t) * 6}px)`,
    }
}

$effect(() => {
    if (prefersReducedMotion.current) return
    const timer = setInterval(swap, SWAP_EVERY)
    return () => clearInterval(timer)
})
</script>
