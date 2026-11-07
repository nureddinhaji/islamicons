{#if icon}
    <div class="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12">
        <header class="flex flex-col gap-1">
            <a
                href={href_in(`/?category=${icon.category}`)}
                class="self-start text-sm font-medium text-primary hover:underline"
            >
                {category_by_id.get(icon.category).title}
            </a>
            <h1 class="text-3xl">{icon.title}</h1>
            <p dir="ltr" class="self-start font-mono text-sm text-muted-foreground">{icon.name}</p>
        </header>
        <IconDetails {icon} heading="h2" />
    </div>
{/if}

<script module>
import {category_by_id, icon_by_name} from '~/lib/icons.js'

// A false result skips the route, so an unknown name falls through to NotFound with status 404.
export function validate(params) {
    return icon_by_name.has(params.name)
}
</script>

<script>
import IconDetails from '~/components/icons/IconDetails.svelte'
import {href_in} from '~/lib/locale.js'

const {route} = window.navgo

const icon = $derived(icon_by_name.get($route.params.name))
</script>
