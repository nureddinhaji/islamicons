import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/500.css'
import '@fontsource/ibm-plex-sans-arabic/600.css'
import '@fontsource/ibm-plex-sans-arabic/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './css/tailwind.css'
import './lib/preinit.js'

import Navgo from 'navgo'
import {mount} from 'svelte'
import {loadLocale} from 'wuchale/load-utils'

import * as Guide from '~/routes/Guide.svelte'
import * as Home from '~/routes/Home.svelte'

import App from './App.svelte'
import {base, dir, locale} from './lib/locale.js'
import {PAGES} from './lib/site.js'

const routes = [
    ['/', Home],
    ['/guide', Guide],
]

const props = $state({
    Component: null,
    route_meta: {},
    is_404: false,
})

function after_navigate(nav) {
    const route_module = nav.to?.route?.[1]
    props.is_404 = nav.status === 404
    props.route_meta = PAGES[nav.to?.route?.[0]]?.[locale] ?? {}
    props.Component = route_module?.default ?? null
}

document.documentElement.lang = locale
document.documentElement.dir = dir
// The build stamps these for crawlers. Once the app runs, Seo owns them, including on a 404.
for (const node of document.head.querySelectorAll('[data-static-head]')) node.remove()
await loadLocale(locale)

const router = new Navgo(routes, {after_navigate, aria_current: true, base})
await router.init()
mount(App, {target: document.body, props})
