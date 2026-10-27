import {PersistedState} from 'runed'

import {DEFAULT_STROKE_WIDTH} from './frame.js'

export const CUSTOMIZER_DEFAULTS = {size: 32, stroke_width: DEFAULT_STROKE_WIDTH, color: ''}

export const get_color_swatches = () => [
    {value: '', label: 'لون النص'},
    {value: '#1f6b55', label: 'أخضر'},
    {value: '#a8741a', label: 'ذهبي'},
    {value: '#2f5d8a', label: 'أزرق'},
    {value: '#9b3b3b', label: 'عنّابي'},
]

// A per-viewer convenience: the grid keeps the size, stroke and colour picked last time.
// Versioned because PersistedState stores the defaults on a first visit (runed): bump it when a default changes.
export const customizer = new PersistedState('islamicons:customizer:v4', {...CUSTOMIZER_DEFAULTS})

// Picked once in the guide, every install command follows it.
export const package_manager = new PersistedState('islamicons:package-manager', 'pnpm')

export function reset_customizer() {
    customizer.current = {...CUSTOMIZER_DEFAULTS}
}
