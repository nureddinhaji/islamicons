<div class="flex flex-col gap-8">
    {#if icon.about}
        <p class="max-w-prose leading-relaxed">{icon.about}</p>
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

    {#if related.length}
        <section aria-labelledby="icon-related" class="flex flex-col gap-3">
            <svelte:element this={heading} id="icon-related" class="text-base">من التصنيف نفسه</svelte:element>
            <ul class="grid grid-cols-6 gap-1">
                {#each related as item (item.name)}
                    <li>
                        {#if onselect}
                            <button
                                type="button"
                                title={item.title}
                                aria-label={item.title}
                                onclick={() => onselect(item.name)}
                                class={RELATED_CLASS}
                            >
                                <IslamIcon icon={item} stroke_width={customizer.current.stroke_width} />
                            </button>
                        {:else}
                            <a
                                href={href_in(`/icons/${item.name}`)}
                                title={item.title}
                                aria-label={item.title}
                                class={RELATED_CLASS}
                            >
                                <IslamIcon icon={item} stroke_width={customizer.current.stroke_width} />
                            </a>
                        {/if}
                    </li>
                {/each}
            </ul>
        </section>
    {/if}
</div>

<script>
import {PACKAGES} from '~/lib/constants.svelte.js'
import {customizer} from '~/lib/customizer.svelte.js'
import {category_by_id, icons, to_svg} from '~/lib/icons.js'
import {href_in} from '~/lib/locale.js'
import {react_usage, svelte_usage} from '~/lib/snippets.svelte.js'
import Icon from '$icon'
import * as Tabs from '$ui/tabs/index.js'

import CodeBlock from '../CodeBlock.svelte'
import IslamIcon from '../IslamIcon.svelte'
import KeylineCanvas from '../KeylineCanvas.svelte'
import IconActions from './IconActions.svelte'

const RELATED_CLASS = 'grid aspect-square w-full place-items-center rounded-lg transition-colors hover:bg-muted'

// Without `onselect` (the icon's page) related icons are links; `heading` sits one level under the host's title.
let {icon, onselect = undefined, heading = 'h3'} = $props()

const options = $derived({
    size: customizer.current.size,
    stroke_width: customizer.current.stroke_width,
    color: customizer.current.color,
})
const svg_code = $derived(to_svg(icon, {...options, color: customizer.current.color || 'currentColor'}))
const category_note = $derived(category_by_id.get(icon.category)?.note)
const related = $derived(icons.filter(i => i.category === icon.category && i.name !== icon.name))
</script>
