<Seo
    title={is_404 ? 'الصفحة غير موجودة' : route_meta.title}
    description={is_404 ? undefined : route_meta.description}
    noindex={is_404}
/>
<a
    href="#main"
    class="fixed start-4 top-2 z-50 -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground focus-visible:translate-y-0"
>
    تخطَّ إلى المحتوى
</a>
<div class="flex min-h-dvh flex-col">
    <Header />
    {#key $route.url.pathname}
        <main
            id="main"
            class="w-full flex-1 pt-(--header-height)"
            in:fade={{duration: prefersReducedMotion.current ? 0 : 180}}
        >
            {#if Component && !is_404}
                <Component />
            {:else}
                <NotFound />
            {/if}
        </main>
    {/key}
    <Footer />
</div>
<ModeWatcher />

<script>
import {ModeWatcher} from 'mode-watcher'
import {prefersReducedMotion} from 'svelte/motion'
import {fade} from 'svelte/transition'

import Footer from './components/Footer.svelte'
import Header from './components/Header.svelte'
import Seo from './components/Seo.svelte'
import NotFound from './routes/NotFound.svelte'

const {Component, route_meta, is_404} = $props()
const {route} = window.navgo
</script>
