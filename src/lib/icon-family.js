// Names that start with another icon's name without being its variant.
const NOT_VARIANTS = new Set(['dome-of-the-rock', 'tazkiyah-of-the-heart', 'zakat-al-fitr'])

export const parent_of = (name, names) =>
    NOT_VARIANTS.has(name)
        ? undefined
        : names.filter(other => name.startsWith(`${other}-`)).sort((a, b) => b.length - a.length)[0]

// A variant with its own about text is a separate subject (ayah-search), so only one without it is a copy of an icon.
export function base_of(name, names, has_about) {
    if (has_about(name)) return ''
    let base = parent_of(name, names)
    for (let up; base && !has_about(base) && (up = parent_of(base, names));) base = up
    return base ?? ''
}

// check-icons makes a variant title its base title plus «(…)», or «، …)» when the base already has parentheses.
export const variant_difference = (title, base_title) =>
    title.slice(base_title.length + (base_title.endsWith(')') ? 1 : 2), -1)
