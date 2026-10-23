<svelte:window onkeydown={focus_search_on_slash} />

<Hero onselect={name => update_params({icon: name})} />

<div class="mx-auto grid max-w-6xl gap-8 px-4 pb-24 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
    <aside class="flex min-w-0 flex-col gap-8 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
        <CategoryNav active={$search_params.category} onselect={select_category} />
        <div class="max-lg:hidden">
            <Customizer />
        </div>
    </aside>

    <div class="flex min-w-0 flex-col gap-4">
        <div class="sticky top-(--header-height) z-20 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-lg">
            <div class="relative">
                <Icon
                    id="search"
                    class="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
                />
                <input
                    bind:this={search_input}
                    type="search"
                    value={$search_params.q}
                    oninput={e => update_params({q: e.currentTarget.value})}
                    placeholder="ابحث بالعربية أو بالإنجليزية: مسجد، quran، رمضان…"
                    aria-label="ابحث في الأيقونات"
                    class="h-12 w-full rounded-xl bg-card ps-11 pe-12 text-base shadow-[0_1px_2px_rgb(0_0_0/0.04)] placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
                />
                {#if $search_params.q}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        class="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label="مسح البحث"
                        onclick={clear_search}
                    >
                        <Icon id="x" />
                    </Button>
                {:else}
                    <kbd
                        class="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-md bg-muted px-2 font-mono text-sm text-muted-foreground max-sm:hidden"
                    >
                        /
                    </kbd>
                {/if}
            </div>
        </div>

        <details class="group rounded-xl bg-card lg:hidden">
            <summary class="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium">
                <Icon id="sliders-horizontal" class="size-4" />
                تخصيص الحجم والسُمك واللون
                <Icon id="chevron-down" class="ms-auto size-4 transition-transform group-open:rotate-180" />
            </summary>
            <div class="px-4 pt-1 pb-5">
                <Customizer />
            </div>
        </details>

        <!-- Visible only while searching: otherwise the group headings already say what is listed. -->
        <p class={['text-sm text-muted-foreground', !$search_params.q && 'sr-only']} aria-live="polite">
            {result_summary}
        </p>

        {#if groups.length}
            <div class="flex flex-col gap-14">
                {#each groups as group (group.id)}
                    <section aria-labelledby="group-{group.id}" class="flex flex-col gap-4">
                        <div class="flex items-baseline gap-3">
                            <h2 id="group-{group.id}" class="text-xl">{group.title}</h2>
                            <span class="text-sm text-muted-foreground">{count_icons(group.icons.length)}</span>
                        </div>
                        <!-- Each cell's outline fills the 1px gap, so the sheet is ruled and a short last row stays open. -->
                        <ul class="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-px p-px">
                            {#each group.icons as icon (icon.name)}
                                <li class="grid outline outline-grid-line">
                                    <IconTile
                                        {icon}
                                        selected={icon.name === $search_params.icon}
                                        onselect={name => update_params({icon: name})}
                                    />
                                </li>
                            {/each}
                        </ul>
                    </section>
                {/each}
            </div>
        {:else}
            <div class="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-16 text-center">
                <IslamIcon icon={icon_named('qibla-compass')} size={48} class="text-gold" />
                <div class="flex flex-col gap-1">
                    <p class="text-lg font-semibold">لم نجد أيقونة بهذا الوصف</p>
                    <p class="text-muted-foreground">جرّب كلمة أقرب، أو ابحث بالإنجليزية، أو تصفّح كل التصنيفات.</p>
                </div>
                <Button variant="outline" onclick={reset_filters}>
                    <Icon id="rotate-ccw" />
                    عرض كل الأيقونات
                </Button>
            </div>
        {/if}
    </div>
</div>

<IconPanel
    icon={icon_by_name.get($search_params.icon) ?? null}
    onselect={name => update_params({icon: name})}
    onclose={() => update_params({icon: ''})}
/>

<script module>
import {v} from 'navgo'

const optional_string = v.optional(v.fallback(v.string(), ''), '')

export const search_schema = v.object({q: optional_string, category: optional_string, icon: optional_string})
export const search_options = {show_defaults: false, debounce: 250}
</script>

<script>
import Hero from '~/components/home/Hero.svelte'
import CategoryNav from '~/components/icons/CategoryNav.svelte'
import Customizer from '~/components/icons/Customizer.svelte'
import IconPanel from '~/components/icons/IconPanel.svelte'
import IconTile from '~/components/icons/IconTile.svelte'
import IslamIcon from '~/components/IslamIcon.svelte'
import {count_icons} from '~/lib/format.js'
import {categories, category_by_id, icon_by_name, icon_named, search_icons} from '~/lib/icons.js'
import Icon from '$icon'
import {Button} from '$ui/button/index.js'

// Icon data is bundled, so these are shallow URL writes: there is no loader to re-run.
const {search_params} = window.navgo

let search_input = $state()

const results = $derived(search_icons($search_params.q, $search_params.category))
// Results arrive ranked, so while searching the category holding the best match comes first.
const groups = $derived.by(() => {
    const by_category = new Map()
    for (const icon of results) by_category.set(icon.category, [...(by_category.get(icon.category) ?? []), icon])
    const order = $search_params.q ? [...by_category.keys()] : categories.map(category => category.id)
    return order.filter(id => by_category.has(id)).map(id => ({...category_by_id.get(id), icons: by_category.get(id)}))
})

const result_summary = $derived.by(() => {
    const scope = category_by_id.get($search_params.category)?.title
    const count = count_icons(results.length)
    const query = $search_params.q
    if (query && scope) return `${count} تطابق «${query}» في ${scope}`
    if (query) return `${count} تطابق «${query}»`
    if (scope) return `${count} في ${scope}`
    return `كل الأيقونات: ${count}`
})

function update_params(changes) {
    $search_params = {...$search_params, ...changes}
}

function select_category(category) {
    update_params({category})
}

function clear_search() {
    update_params({q: ''})
    search_input?.focus()
}

function reset_filters() {
    update_params({q: '', category: ''})
}

function focus_search_on_slash(event) {
    // The Arabic layout types «ظ» on the «/» key.
    if (event.key !== '/' && event.key !== /* @wc-ignore */ 'ظ') return
    if (event.ctrlKey || event.metaKey || event.altKey || $search_params.icon) return
    if (event.target.closest?.('input, textarea, [contenteditable]')) return
    event.preventDefault()
    search_input?.focus()
}
</script>
