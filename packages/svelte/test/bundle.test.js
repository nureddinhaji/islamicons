import assert from 'node:assert/strict'
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {after, test} from 'node:test'
import {fileURLToPath} from 'node:url'

import {svelte} from '@sveltejs/vite-plugin-svelte'
import {build} from 'vite'

const paths_of = name =>
    [...readFileSync(new URL(`../../svg/icons/${name}.svg`, import.meta.url), 'utf8').matchAll(/ d="([^"]+)"/g)].map(
        ([, d]) => d,
    )
const mosque = paths_of('mosque')
const kaaba_only = paths_of('kaaba').filter(d => !mosque.includes(d))

// Vite resolves the package's own name only from a file inside it, so the entry cannot live in the OS temp dir.
const entry_dir = mkdtempSync(fileURLToPath(new URL('./.vite-entry-', import.meta.url)))
after(() => rmSync(entry_dir, {recursive: true, force: true}))

async function bundle(source) {
    const entry = path.join(entry_dir, 'main.js')
    writeFileSync(entry, source)
    const [result] = [
        await build({
            configFile: false,
            logLevel: 'silent',
            root: entry_dir,
            plugins: [svelte()],
            build: {
                write: false,
                minify: false,
                lib: {entry, formats: ['es'], fileName: 'main'},
                rollupOptions: {external: [/^svelte(\/|$)/]},
            },
        }),
    ].flat()
    return result.output.map(chunk => chunk.code ?? '').join('\n')
}

for (const [label, source] of [
    ['the barrel', "export {Mosque} from '@islamicons/svelte'\n"],
    ["the icon's own file", "export {default as Mosque} from '@islamicons/svelte/icons/mosque'\n"],
]) {
    test(`importing one icon from ${label} bundles that icon alone`, async () => {
        const code = await bundle(source)
        for (const d of mosque) assert.ok(code.includes(d), `mosque path ${d}`)
        assert.ok(kaaba_only.length > 0)
        for (const d of kaaba_only) assert.ok(!code.includes(d), `kaaba path ${d}`)
    })
}
