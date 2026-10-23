// Safari private mode and blocked site data throw on access; fall back to a no-op store.
try {
    localStorage.setItem('_TEST_KEY_', '1')
    localStorage.removeItem('_TEST_KEY_')
} catch {
    delete window['localStorage']
    // @ts-expect-error
    window.localStorage = {setItem: () => {}, getItem: () => null, removeItem: () => {}}
}

// @ts-expect-error
if (!document.startViewTransition) document.startViewTransition = cb => cb()
