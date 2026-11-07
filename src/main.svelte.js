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
import * as IconPage from '~/routes/IconPage.svelte'

import App from './App.svelte'
import {category_by_id, icon_by_name} from './lib/icons.js'
import {base, dir, locale} from './lib/locale.js'
import {icon_page_meta, PAGES} from './lib/site.js'

const ICON_ROUTE = '/icons/:name'

// Every route needs a file in dist/ too, or Cloudflare answers its direct load with a 404 (vite.config.js).
const routes = [
    ['/', Home],
    ['/guide', Guide],
    [ICON_ROUTE, IconPage],
]

function route_meta_for(to) {
    if (to?.route?.[0] !== ICON_ROUTE) return PAGES[to?.route?.[0]]?.[locale] ?? {}
    const icon = icon_by_name.get(to.params.name)
    return icon_page_meta(icon.title, category_by_id.get(icon.category).title, locale, icon.about)
}

const props = $state({
    Component: null,
    route_meta: {},
    is_404: false,
})

// Google reads structured data from the rendered first load, so it stays until the visitor leaves that path.
const landing_path = location.pathname
const json_ld = document.querySelector('script[type="application/ld+json"][data-static-head]')

function after_navigate(nav) {
    const route_module = nav.to?.route?.[1]
    if (nav.to?.url.pathname !== landing_path) json_ld?.remove()
    props.is_404 = nav.status === 404
    props.route_meta = route_meta_for(nav.to)
    props.Component = route_module?.default ?? null
}

document.documentElement.lang = locale
document.documentElement.dir = dir
// The build stamps these for crawlers. Once the app runs, Seo owns the head, including on a 404, and App the body.
for (const node of document.querySelectorAll('[data-static-head], [data-static-body]')) {
    if (node !== json_ld) node.remove()
}
await loadLocale(locale)

const router = new Navgo(routes, {after_navigate, aria_current: true, base})
await router.init()
mount(App, {target: document.body, props})
