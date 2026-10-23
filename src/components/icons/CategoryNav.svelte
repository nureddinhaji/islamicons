<nav aria-label="التصنيفات">
    <ul
        class="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0"
    >
        {#each items as item (item.id)}
            <li class="shrink-0">
                <button
                    type="button"
                    aria-pressed={item.id === active}
                    onclick={() => onselect(item.id)}
                    class={[
                        'flex w-full items-center gap-2.5 rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors lg:rounded-lg lg:px-3',
                        item.id === active
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'bg-muted text-muted-foreground hover:text-foreground lg:bg-transparent lg:hover:bg-muted',
                    ]}
                >
                    {#if item.icon}
                        <IslamIcon icon={icon_by_name.get(item.icon)} size={18} class="max-lg:hidden" />
                    {:else}
                        <Icon id="layout-grid" class="size-4.5 max-lg:hidden" />
                    {/if}
                    <span class="lg:me-auto">{item.title}</span>
                    <span class="text-muted-foreground tabular-nums max-lg:hidden">{digits(item.count)}</span>
                </button>
            </li>
        {/each}
    </ul>
</nav>

<script>
import {categories, icon_by_name, icons} from '~/lib/icons.js'
import {digits} from '~/lib/locale.js'
import Icon from '$icon'

import IslamIcon from '../IslamIcon.svelte'

let {active = '', onselect} = $props()

const items = [{id: '', title: 'الكل', icon: '', count: icons.length}, ...categories]
</script>
