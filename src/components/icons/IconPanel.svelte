<Sheet.Root bind:open={() => !!icon, value => !value && onclose()}>
    <SheetContent side="right" class="w-full gap-0 overflow-y-auto sm:max-w-md">
        {#if shown}
            <Sheet.Header class="gap-1 px-6 pt-6 pe-14">
                <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <a
                        href={href_in(`/?category=${shown.category}`)}
                        class="text-sm font-medium text-primary hover:underline"
                    >
                        {category_by_id.get(shown.category)?.title}
                    </a>
                    <a
                        href={href_in(`/icons/${shown.name}`)}
                        class="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                        صفحة الأيقونة
                    </a>
                </div>
                <Sheet.Title class="text-2xl font-bold">{shown.title}</Sheet.Title>
                <Sheet.Description dir="ltr" class="self-start font-mono text-sm text-muted-foreground">
                    {shown.name}
                </Sheet.Description>
            </Sheet.Header>

            <div class="px-6 pt-4 pb-8">
                <IconDetails icon={shown} {onselect} />
            </div>
        {/if}
    </SheetContent>
</Sheet.Root>

<script>
import {category_by_id} from '~/lib/icons.js'
import {href_in} from '~/lib/locale.js'
import * as Sheet from '$ui/sheet/index.js'

import SheetContent from '../SheetContent.svelte'
import IconDetails from './IconDetails.svelte'

let {icon = null, onselect, onclose} = $props()

// Keeps the last icon rendered while the sheet animates closed after `icon` turns null.
let last_icon = null
const shown = $derived.by(() => (last_icon = icon ?? last_icon))
</script>
