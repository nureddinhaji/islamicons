import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'

import {svelte} from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import {defineConfig} from 'vite'
import domain from 'vite-plugin-domain'
import {wuchale} from 'wuchale/vite'

import {read_catalog} from './scripts/icon-catalog.js'
import {robots_txt, sitemap_xml} from './scripts/sitemap.js'
import {alternates_for, public_path, stamp_head} from './scripts/static-head.js'
import {home_body, icon_page_html, icon_route, related_icons, website_object} from './scripts/static-pages.js'
import {NOT_FOUND, page_title, PAGES, SITE} from './src/lib/site.js'
import tsconfig from './tsconfig.json' with {type: 'json'}

const assets_dir = `assets-${new Date().toISOString().slice(2, 19).replace(/\D/g, '')}`

const HEAD_DOCS = [
    {language: 'ar', route: '/', file: 'index.html'},
    {language: 'ar', route: '/guide', file: 'guide.html'},
    {language: 'en', route: '/', file: 'en.html'},
    {language: 'en', route: '/guide', file: 'en/guide.html'},
]

// Cloudflare answers an unmatched path with the nearest 404.html, so /en/... gets the English one.
const NOT_FOUND_DOCS = [
    {language: 'ar', file: '404.html'},
    {language: 'en', file: 'en/404.html'},
]

function write_dist(file, content) {
    const dest = join('dist', file)
    mkdirSync(dirname(dest), {recursive: true})
    writeFileSync(dest, content)
}

// Cloudflare serves /en from en.html. Canonical and alternate links are stamped only once SITE_ORIGIN is set.
function static_heads() {
    return {
        name: 'static-heads',
        apply: 'build',
        async closeBundle() {
            // Imported here so the dev server does not load resvg.
            const {og_image} = await import('./scripts/og-image.js')
            const template = readFileSync('dist/index.html', 'utf8')
            const origin = (process.env.SITE_ORIGIN ?? '').replace(/\/$/, '')
            const catalog = read_catalog()
            for (const doc of HEAD_DOCS) {
                const site = SITE[doc.language]
                const page = PAGES[doc.route]?.[doc.language]
                const html = stamp_head(template, {
                    language: doc.language,
                    name: site.name,
                    short_name: site.short_name,
                    title: page_title(page?.title, doc.language),
                    description: page?.description ?? site.description,
                    path: public_path(doc.language, doc.route),
                    origin,
                    alternates: alternates_for(doc.route),
                    image: og_image(doc.language),
                    ...(doc.route === '/' && {
                        body: home_body(doc.language, catalog),
                        json_ld: website_object(doc.language, origin),
                    }),
                })
                write_dist(doc.file, html)
            }
            for (const doc of NOT_FOUND_DOCS) {
                const site = SITE[doc.language]
                const html = stamp_head(template, {
                    language: doc.language,
                    name: site.name,
                    short_name: site.short_name,
                    title: page_title(NOT_FOUND[doc.language].title, doc.language),
                    description: site.description,
                    noindex: true,
                })
                write_dist(doc.file, html)
            }
            // Cloudflare serves /icons/mosque from icons/mosque.html; /svg/ keeps a page and its image apart.
            for (const icon of catalog) {
                const related = related_icons(catalog, icon)
                for (const language of ['ar', 'en']) {
                    const html = icon_page_html(template, {icon, language, related, origin, image: og_image(language)})
                    write_dist(`${public_path(language, icon_route(icon.name)).slice(1)}.html`, html)
                }
                write_dist(`svg/${icon.name}.svg`, icon.framed_svg)
            }
            write_dist('robots.txt', robots_txt(origin))
            // Sitemap URLs must be absolute.
            if (origin) {
                const pages = HEAD_DOCS.map(doc => ({
                    path: public_path(doc.language, doc.route),
                    alternates: alternates_for(doc.route),
                }))
                const icon_pages = catalog.flatMap(icon =>
                    ['ar', 'en'].map(language => ({
                        path: public_path(language, icon_route(icon.name)),
                        alternates: alternates_for(icon_route(icon.name)),
                        images: [`/svg/${icon.name}.svg`],
                    })),
                )
                write_dist('sitemap.xml', sitemap_xml(origin, [...pages, ...icon_pages]))
            }
        },
    }
}

// The PNGs drawn at build: the link previews and the home-screen icon.
function build_images() {
    return {
        name: 'build-images',
        apply: 'build',
        async generateBundle() {
            const [{og_assets}, {touch_icon_asset}] = await Promise.all([
                import('./scripts/og-image.js'),
                import('./scripts/touch-icon.js'),
            ])
            for (const asset of [...og_assets(), touch_icon_asset()]) this.emitFile({type: 'asset', ...asset})
        },
    }
}

export default defineConfig({
    publicDir: 'public',
    css: {
        transformer: 'lightningcss',
    },
    build: {
        reportCompressedSize: false,
        rolldownOptions: {
            output: {
                entryFileNames: `${assets_dir}/bundle.es.js`,
                chunkFileNames: `${assets_dir}/[name].js`,
                assetFileNames: `${assets_dir}/[name][extname]`,
            },
        },
    },
    server: {
        host: !!process.env.VITE_HOST,
        port: +(process.env.VITE_PORT || 5080),
        watch: {
            ignored: ['**/src/locales/.wuchale/**'],
        },
    },
    resolve: {
        alias: Object.entries(tsconfig.compilerOptions.paths).map(([k, v]) => ({
            find: k.replace('/*', ''),
            replacement: resolve(v[0].replace('/*', '')),
        })),
    },
    plugins: [
        domain(),
        tailwindcss(),
        wuchale(),
        static_heads(),
        build_images(),
        svelte({
            onwarn(warning, handler) {
                const IGNORED_WARNINGS = ['a11y_click_events_have_key_events', 'a11y_no_static_element_interactions']
                if (!IGNORED_WARNINGS.includes(warning.code)) handler(warning)
            },
        }),
    ],
})
