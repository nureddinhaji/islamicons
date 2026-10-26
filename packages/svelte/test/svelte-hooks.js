// Lets `node --test` import .svelte files, compiled for the server. Must load through `--import`: a test file's own
// static imports are linked before its body runs, so registering the hook there is too late.
import {readFileSync} from 'node:fs'
import {registerHooks} from 'node:module'
import {fileURLToPath} from 'node:url'

import {compile} from 'svelte/compiler'

registerHooks({
    load(url, context, next_load) {
        if (!url.endsWith('.svelte')) return next_load(url, context)
        const filename = fileURLToPath(url)
        const {js} = compile(readFileSync(filename, 'utf8'), {filename, generate: 'server'})
        return {format: 'module', source: js.code, shortCircuit: true}
    },
})
