<svelte:window bind:scrollY={scroll_y} />

<header
    class={[
        'fixed inset-x-0 top-0 z-40 h-(--header-height) backdrop-blur-lg transition-[background-color,box-shadow] duration-300',
        scrolled ? 'bg-background/85 shadow-[0_1px_0_var(--color-border)]' : 'bg-background/40',
    ]}
>
    <nav class="mx-auto flex h-full max-w-6xl items-center gap-2 px-4" aria-label="التنقل الرئيسي">
        <a href={href_in('/')} class="me-auto flex items-center gap-2.5 rounded-md text-primary">
            <Logo class="size-9" />
            <span class="flex flex-col leading-tight text-foreground max-sm:sr-only">
                <span class="text-sm font-medium text-muted-foreground">مكتبة</span>
                <span class="font-bold">الأيقونات الإسلامية</span>
            </span>
        </a>

        <ul class="flex items-center gap-1">
            {#each get_nav_links() as link (link.path)}
                <li>
                    <a
                        href={href_in(link.path)}
                        class={[
                            'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors',
                            is_active(link.path)
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        ]}
                    >
                        <Icon id={link.icon} class="size-4 max-sm:hidden" />
                        {link.label}
                    </a>
                </li>
            {/each}
        </ul>
        <div class="flex items-center">
            <Button
                href={REPO_URL}
                target="_blank"
                rel="noopener"
                variant="ghost"
                size="icon"
                aria-label="المستودع على GitHub"
                title="المستودع على GitHub"
                class="rounded-full text-muted-foreground"
            >
                <Icon id="github" class="size-4.5" />
            </Button>
            <!-- target="_top" so navgo leaves the other language to the browser: it is a new document. -->
            <Button
                href={switch_href}
                hreflang={other}
                lang={other}
                target="_top"
                variant="ghost"
                size="icon"
                aria-label={LOCALE_NAMES[other]}
                title={LOCALE_NAMES[other]}
                class="relative rounded-full text-muted-foreground"
            >
                <Icon id="world" class="size-4.5" />
                <!-- Below the text-sm floor at the author's request: a two-letter badge, not reading text. -->
                <span
                    aria-hidden="true"
                    class="absolute end-0 top-0 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-primary px-0.5 text-[0.625rem] leading-none font-semibold text-primary-foreground shadow-[0_0_0_2px_var(--color-background)]"
                >
                    <span style:translate="0 -{BADGE_LIFT[other]}em">{LOCALE_BADGES[other]}</span>
                </span>
            </Button>
            <LightSwitch class="rounded-full text-muted-foreground" />
        </div>
    </nav>
</header>

<script>
import {get_nav_links, REPO_URL} from '~/lib/constants.svelte.js'
import {href_in, locale, LOCALE_BADGES, LOCALE_NAMES, LOCALES} from '~/lib/locale.js'
import Icon from '$icon'
import {Button} from '$ui/button/index.js'

import LightSwitch from './LightSwitch.svelte'
import Logo from './Logo.svelte'

const {route} = window.navgo

let scroll_y = $state(0)
const scrolled = $derived(scroll_y > 8)

const is_active = path => $route.path === path || $route.path.startsWith(`${path}/`)
const other = LOCALES.find(language => language !== locale)
const switch_href = $derived(href_in($route.path, other) + $route.url.search)
// Measured in IBM Plex Sans Arabic: the line box sits the ink low, and the isolated ع hangs a tail below the baseline.
const BADGE_LIFT = {ar: 0.21, en: 0.085}
</script>
