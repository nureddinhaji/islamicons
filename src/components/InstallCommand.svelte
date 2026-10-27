<Tabs.Root bind:value={() => manager, set_manager}>
    <Tabs.List variant="line" aria-label="مدير الحزم">
        {#each PACKAGE_MANAGERS as option (option)}
            <Tabs.Trigger value={option} class="font-mono text-muted-foreground">{option}</Tabs.Trigger>
        {/each}
    </Tabs.List>
    {#each PACKAGE_MANAGERS as option (option)}
        <!-- The copy button is the panel's first control, so Tab goes straight to it. -->
        <Tabs.Content value={option} tabindex={-1}>
            <CodeBlock code={install_command(option, name)} caption="terminal" />
        </Tabs.Content>
    {/each}
</Tabs.Root>

<script>
import CodeBlock from '~/components/CodeBlock.svelte'
import {package_manager} from '~/lib/customizer.svelte.js'
import {install_command, PACKAGE_MANAGERS} from '~/lib/snippets.svelte.js'
import * as Tabs from '$ui/tabs/index.js'

let {name} = $props()

// A value stored by an older version of the site, or edited by hand, must not leave the block empty.
const manager = $derived(PACKAGE_MANAGERS.includes(package_manager.current) ? package_manager.current : 'pnpm')

function set_manager(value) {
    package_manager.current = value
}
</script>
