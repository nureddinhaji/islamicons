// Type-checked by `tsc -p test` under `moduleResolution: bundler`, as Svelte projects resolve; never run.
import {type IconProps, Mosque} from '@islamicons/svelte'
import MosqueFile from '@islamicons/svelte/icons/mosque'
import type {ComponentProps} from 'svelte'

type Props = ComponentProps<typeof Mosque>

export const _guide: Props = {
    size: 32,
    color: '#1f6b55',
    strokeWidth: 1.4,
    absoluteStrokeWidth: true,
    class: 'text-amber-700',
    'aria-label': 'مسجد',
    'data-icon': 'mosque',
}
export const _css_size: ComponentProps<typeof MosqueFile> = {size: '2rem'}
export const _shared: IconProps = _guide

// @ts-expect-error strokeWidth is a number
export const _wrong_type: Props = {strokeWidth: 'thick'}

// @ts-expect-error no such prop
export const _unknown: Props = {thickness: 2}
