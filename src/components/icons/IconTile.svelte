<a
    href={href_in(`/icons/${icon.name}`)}
    onclick={event => select(event, icon.name)}
    aria-current={selected || undefined}
    title={icon.title}
    class={[
        'group flex aspect-square min-w-0 flex-col items-center justify-center gap-2 p-3 transition-colors focus-visible:z-10',
        selected ? 'bg-primary/10 text-primary' : 'bg-card hover:bg-muted',
    ]}
>
    <span
        class="grid min-h-16 place-items-center transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
    >
        <IslamIcon
            {icon}
            size={customizer.current.size}
            stroke_width={customizer.current.stroke_width}
            color={customizer.current.color}
        />
    </span>
    <span class={['w-full truncate text-center text-sm', selected ? 'font-semibold' : 'text-muted-foreground']}
        >{icon.title}</span
    >
</a>

<script>
import {customizer} from '~/lib/customizer.svelte.js'
import {href_in} from '~/lib/locale.js'

import IslamIcon from '../IslamIcon.svelte'

let {icon, selected = false, onselect} = $props()

function select(event, name) {
    if (!onselect || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return
    event.preventDefault()
    onselect(name)
}
</script>
