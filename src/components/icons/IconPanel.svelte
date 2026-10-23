<Sheet.Root bind:open={() => !!icon, value => !value && onclose()}>
    <SheetContent side="right" class="w-full gap-0 overflow-y-auto sm:max-w-md">
        {#if shown}
            <Sheet.Header class="gap-1 px-6 pt-6 pe-14">
                <a
                    href={href_in(`/?category=${shown.category}`)}
                    class="self-start text-sm font-medium text-primary hover:underline"
                >
                    {category_by_id.get(shown.category)?.title}
                </a>
                <Sheet.Title class="text-2xl font-bold">{shown.title}</Sheet.Title>
                <Sheet.Description dir="ltr" class="self-start font-mono text-sm text-muted-foreground">
                    {shown.name}
                </Sheet.Description>
            </Sheet.Header>

            <div class="flex flex-col gap-8 px-6 pt-4 pb-8">
                <div class="mx-auto w-full max-w-72 overflow-hidden rounded-2xl bg-card p-3">
                    <KeylineCanvas
                        icon={shown}
                        stroke_width={customizer.current.stroke_width}
                        color={customizer.current.color}
                        draw
                        show_keylines
                        label
                    />
                </div>

                <div class="flex flex-col gap-3">
                    {#key shown.name}
                        <IconActions icon={shown} {svg_code} {options} />
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
                        {#key shown.name}
                            <CodeBlock code={svg_code} caption="{shown.name}.svg" />
                        {/key}
                    </Tabs.Content>
                    {#each [{id: 'svelte', code: svelte_usage(shown.component, options)}, {id: 'react', code: react_usage(shown.component, options)}] as tab (tab.id)}
                        <Tabs.Content value={tab.id} class="flex flex-col gap-2">
                            <p class="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Icon id="clock" class="size-4 text-gold" />
                                الحزمة قيد الإعداد، وهذا شكل استخدامها المرتقب.
                            </p>
                            {#key shown.name}
                                <CodeBlock code={tab.code} caption={PACKAGES.find(pkg => pkg.id === tab.id).name} />
                            {/key}
                        </Tabs.Content>
                    {/each}
                </Tabs.Root>

                <section aria-labelledby="icon-tags" class="flex flex-col gap-3">
                    <h3 id="icon-tags" class="text-base">كلمات البحث</h3>
                    <ul class="flex flex-wrap gap-1.5">
                        {#each shown.tags as tag (tag)}
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
                        <h3 id="icon-related" class="text-base">من التصنيف نفسه</h3>
                        <ul class="grid grid-cols-6 gap-1">
                            {#each related as item (item.name)}
                                <li>
                                    <button
                                        type="button"
                                        title={item.title}
                                        aria-label={item.title}
                                        onclick={() => onselect(item.name)}
                                        class="grid aspect-square w-full place-items-center rounded-lg transition-colors hover:bg-muted"
                                    >
                                        <IslamIcon icon={item} stroke_width={customizer.current.stroke_width} />
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    </section>
                {/if}
            </div>
        {/if}
    </SheetContent>
</Sheet.Root>

<script>
import {PACKAGES} from '~/lib/constants.svelte.js'
import {customizer} from '~/lib/customizer.svelte.js'
import {category_by_id, icons, to_svg} from '~/lib/icons.js'
import {href_in} from '~/lib/locale.js'
import {react_usage, svelte_usage} from '~/lib/snippets.svelte.js'
import Icon from '$icon'
import * as Sheet from '$ui/sheet/index.js'
import * as Tabs from '$ui/tabs/index.js'

import CodeBlock from '../CodeBlock.svelte'
import IslamIcon from '../IslamIcon.svelte'
import KeylineCanvas from '../KeylineCanvas.svelte'
import SheetContent from '../SheetContent.svelte'
import IconActions from './IconActions.svelte'

let {icon = null, onselect, onclose} = $props()

// Keeps the last icon rendered while the sheet animates closed after `icon` turns null.
let last_icon = null
const shown = $derived.by(() => (last_icon = icon ?? last_icon))

const options = $derived({
    size: customizer.current.size,
    stroke_width: customizer.current.stroke_width,
    color: customizer.current.color,
})
const svg_code = $derived(shown ? to_svg(shown, {...options, color: customizer.current.color || 'currentColor'}) : '')
const category_note = $derived(shown ? category_by_id.get(shown.category)?.note : undefined)
const related = $derived(shown ? icons.filter(i => i.category === shown.category && i.name !== shown.name) : [])
</script>
