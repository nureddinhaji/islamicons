<figure class={['flex min-w-0 flex-col overflow-hidden rounded-xl bg-muted', class_name]}>
    {#if caption || copy}
        <figcaption class="flex items-center justify-between gap-2 py-1.5 ps-4 pe-1.5 text-sm text-muted-foreground">
            <span dir="ltr" class="font-mono">{caption}</span>
            {#if copy}
                <CopyButton text={code} label="نسخ" variant="ghost" size="sm" bind:failed={copy_failed} />
            {/if}
        </figcaption>
    {/if}
    {#if copy_failed}
        <p class="px-4 pb-2 text-sm text-destructive" role="alert">تعذّر النسخ، انسخ النص يدوياً.</p>
    {/if}
    <pre
        dir="ltr"
        class={['overflow-x-auto px-4 pb-4 font-mono text-sm leading-relaxed',
        !caption
        &&
        !copy
        &&
        'pt-4']}><code>{code}</code></pre>
</figure>

<script>
import CopyButton from './CopyButton.svelte'

let {code, caption = '', copy = true, class: class_name = ''} = $props()

let copy_failed = $state(false)
</script>
