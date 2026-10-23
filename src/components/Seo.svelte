<svelte:head>
    <title>{page_title}</title>
    <link rel="canonical" href={page_url} />
    {#if noindex}
        <meta name="robots" content="noindex" />
    {:else}
        {#each LOCALES as language (language)}
            <link rel="alternate" hreflang={language} href={$route.url.origin + href_in($route.path, language)} />
        {/each}
        <link rel="alternate" hreflang="x-default" href={$route.url.origin + href_in($route.path, 'ar')} />
    {/if}
</svelte:head>

<script>
import {href_in, locale, LOCALES} from '~/lib/locale.js'
import {SITE} from '~/lib/site.js'

let {title = '', description = '', noindex = false} = $props()

const {route} = window.navgo
const description_tag = document.querySelector('meta[name="description"]')
const site = SITE[locale]

const page_title = $derived(title ? `${title} | ${site.name}` : site.name)
const page_description = $derived(description || site.description)
const page_url = $derived(`${$route.url.origin}${$route.url.pathname}`)

$effect(() => {
    description_tag.content = page_description
})
</script>
