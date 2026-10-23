<footer class="mt-auto bg-muted/60">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <a href={href_in('/')} class="flex items-center gap-3 self-start rounded-md md:self-auto">
            <Logo class="size-8 text-primary" />
            <span class="flex flex-col leading-tight">
                <span class="font-bold">{SITE[locale].name}</span>
                <span class="text-sm text-muted-foreground">مفتوحة المصدر برخصة MIT</span>
            </span>
        </a>

        <nav aria-label="روابط الموقع">
            <ul class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {#each get_nav_links() as link (link.path)}
                    <li>
                        <a href={href_in(link.path)} class="text-muted-foreground hover:text-foreground">{link.label}</a
                        >
                    </li>
                {/each}
            </ul>
        </nav>
    </div>
</footer>

<script>
import {get_nav_links} from '~/lib/constants.svelte.js'
import {href_in, locale} from '~/lib/locale.js'
import {SITE} from '~/lib/site.js'

import Logo from './Logo.svelte'
</script>
