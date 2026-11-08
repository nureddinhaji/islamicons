<div class="flex flex-col gap-8">
    {#if base || icon.about}
        <div class="flex max-w-prose flex-col gap-3 leading-relaxed">
            {#if base}
                <p>
                    نسخة من أيقونة <a
                        href={href_in(`/icons/${base.name}`)}
                        class={LINK_CLASS}
                        onclick={event => select(event, base.name)}>{base.title}</a
                    >: {icon.difference}.
                </p>
            {/if}
            {#if icon.about}
                <p>{icon.about}</p>
            {/if}
        </div>
    {/if}
    <div class="mx-auto w-full max-w-72 overflow-hidden rounded-2xl bg-card p-3">
        <KeylineCanvas
            {icon}
            stroke_width={customizer.current.stroke_width}
            color={customizer.current.color}
            draw
            show_keylines
            label
        />
    </div>

    <div class="flex flex-col gap-3">
        {#key icon.name}
            <IconActions {icon} {svg_code} {options} />
        {/key}
        {#if category_note}
            <p class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Icon id="info" class="size-4 shrink-0" />
                {category_note}
            </p>
        {/if}
    </div>

    <Tabs.Root value="svg" class="gap-3">
        <Tabs.List class="w-full">
            <Tabs.Trigger value="svg" class="text-muted-foreground">SVG</Tabs.Trigger>
            <Tabs.Trigger value="svelte" class="text-muted-foreground">Svelte</Tabs.Trigger>
            <Tabs.Trigger value="react" class="text-muted-foreground">React</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="svg">
            {#key icon.name}
                <CodeBlock code={svg_code} caption="{icon.name}.svg" />
            {/key}
        </Tabs.Content>
        {#each [{id: 'svelte', code: svelte_usage(icon.component, options)}, {id: 'react', code: react_usage(icon.component, options)}] as tab (tab.id)}
            <Tabs.Content value={tab.id} class="flex flex-col gap-2">
                <p class="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon id="book-open" class="size-4" />
                    <a href={href_in(`/guide#${tab.id}`)} class="underline underline-offset-4 hover:text-foreground"
                        >تثبيت الحزمة وخصائصها</a
                    >
                </p>
                {#key icon.name}
                    <CodeBlock code={tab.code} caption={PACKAGES.find(pkg => pkg.id === tab.id).name} />
                {/key}
            </Tabs.Content>
        {/each}
    </Tabs.Root>

    <section aria-labelledby="icon-tags" class="flex flex-col gap-3">
        <svelte:element this={heading} id="icon-tags" class="text-base">كلمات البحث</svelte:element>
        <ul class="flex flex-wrap gap-1.5">
            {#each icon.tags as tag (tag)}
                <li>
                    <a
                        href={href_in(`/?q=${encodeURIComponent(tag)}`)}
                        dir="auto"
                        class="inline-flex rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {tag}
                    </a>
                </li>
            {/each}
        </ul>
    </section>

    {#if family.length}
        <section aria-labelledby="icon-versions" class="flex flex-col gap-3">
            <svelte:element this={heading} id="icon-versions" class="text-base">نسخ أخرى</svelte:element>
            {@render icon_grid(family)}
        </section>
    {/if}

    {#if related.length}
        <section aria-labelledby="icon-related" class="flex flex-col gap-3">
            <svelte:element this={heading} id="icon-related" class="text-base">من التصنيف نفسه</svelte:element>
            {@render icon_grid(related)}
        </section>
    {/if}
</div>

{#snippet icon_grid(items)}
    <ul class="grid grid-cols-6 gap-1">
        {#each items as item (item.name)}
            <li>
                <a
                    href={href_in(`/icons/${item.name}`)}
                    title={item.title}
                    aria-label={item.title}
                    onclick={event => select(event, item.name)}
                    class={RELATED_CLASS}
                >
                    <IslamIcon icon={item} stroke_width={customizer.current.stroke_width} />
                </a>
            </li>
        {/each}
    </ul>
{/snippet}

<script>
import {PACKAGES} from '~/lib/constants.svelte.js'
import {customizer} from '~/lib/customizer.svelte.js'
import {category_by_id, icon_by_name, icons, to_svg} from '~/lib/icons.js'
import {href_in} from '~/lib/locale.js'
import {react_usage, svelte_usage} from '~/lib/snippets.svelte.js'
import Icon from '$icon'
import * as Tabs from '$ui/tabs/index.js'

import CodeBlock from '../CodeBlock.svelte'
import IslamIcon from '../IslamIcon.svelte'
import KeylineCanvas from '../KeylineCanvas.svelte'
import IconActions from './IconActions.svelte'

const LINK_CLASS = 'text-primary underline underline-offset-4'
const RELATED_CLASS = 'grid aspect-square w-full place-items-center rounded-lg transition-colors hover:bg-muted'

// `heading` sits one level under the host's title.
let {icon, onselect = undefined, heading = 'h3'} = $props()

const options = $derived({
    size: customizer.current.size,
    stroke_width: customizer.current.stroke_width,
    color: customizer.current.color,
})
const svg_code = $derived(to_svg(icon, {...options, color: customizer.current.color || 'currentColor'}))
const category_note = $derived(category_by_id.get(icon.category)?.note)
const root = $derived(icon.base || icon.name)
const base = $derived(icon.base ? icon_by_name.get(icon.base) : null)
const family = $derived(icons.filter(i => (i.base || i.name) === root && i.name !== icon.name))
const related = $derived(icons.filter(i => i.category === icon.category && (i.base || i.name) !== root))

function select(event, name) {
    if (!onselect || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return
    event.preventDefault()
    onselect(name)
}
</script>
