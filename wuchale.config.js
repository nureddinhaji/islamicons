import {adapter as svelte, svelteDefaultHeuristic} from '@wuchale/svelte'
import {defineConfig} from 'wuchale'

// The source is Arabic: Latin labels (SVG, React, file names) are not interface text.
const is_arabic = msg => /\p{sc=Arabic}/u.test(Array.isArray(msg.body) ? msg.body[0] : msg.body)

export default defineConfig({
    locales: ['ar', 'en'],
    logLevel: 'warn',
    // An ambient Gemini key would send every string out and rewrite the catalog.
    ai: null,
    adapters: {
        main: svelte({
            sourceLocale: 'ar',
            heuristic: (msg, file) => is_arabic(msg) && svelteDefaultHeuristic(msg, file),
            loader: 'svelte',
        }),
    },
})
