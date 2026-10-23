import {onDestroy} from 'svelte'

// Call during component init: it registers an onDestroy that clears the pending timer.
export function create_flash(ms = 2000) {
    let on = $state(false)
    let timer

    onDestroy(() => clearTimeout(timer))

    return {
        get on() {
            return on
        },
        fire() {
            on = true
            clearTimeout(timer)
            timer = setTimeout(() => (on = false), ms)
        },
    }
}
