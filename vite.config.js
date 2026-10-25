import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'

import {svelte} from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import {defineConfig} from 'vite'
import domain from 'vite-plugin-domain'
import {wuchale} from 'wuchale/vite'

import {stamp_head} from './scripts/static-head.js'
import {PAGES, SITE} from './src/lib/site.js'
import tsconfig from './tsconfig.json' with {type: 'json'}

const assets_dir = `assets-${new Date().toISOString().slice(2, 19).replace(/\D/g, '')}`

const HEAD_DOCS = [
    {language: 'ar', route: '/', file: 'index.html'},
    {language: 'ar', route: '/guide', file: 'guide.html'},
    {language: 'en', route: '/', file: 'en.html'},
    {language: 'en', route: '/guide', file: 'en/guide.html'},
]

function public_path(language, route) {
    if (language === 'ar') return route
    return route === '/' ? '/en' : `/en${route}`
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
            const alternates_for = route =>
                ['ar', 'en'].map(language => ({language, path: public_path(language, route)}))
            for (const doc of HEAD_DOCS) {
                const site = SITE[doc.language]
                const page = PAGES[doc.route]?.[doc.language]
                const html = stamp_head(template, {
                    language: doc.language,
                    name: site.name,
                    short_name: site.short_name,
                    title: page?.title ? `${page.title} | ${site.name}` : site.name,
                    description: page?.description ?? site.description,
                    path: public_path(doc.language, doc.route),
                    origin,
                    alternates: alternates_for(doc.route),
                    image: og_image(doc.language),
                })
                const dest = join('dist', doc.file)
                mkdirSync(dirname(dest), {recursive: true})
                writeFileSync(dest, html)
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
