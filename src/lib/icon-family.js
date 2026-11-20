// A variant with its own about text is a separate subject (ayah-search), so only one without it is a copy of an icon.
export function base_of(name, parent_of, has_about) {
    if (has_about(name)) return ''
    let base = parent_of(name)
    for (let up; base && !has_about(base) && (up = parent_of(base));) base = up
    return base ?? ''
}

// check-icons makes a variant title its base title plus «(…)», or «، …)» when the base already has parentheses.
export const variant_difference = (title, base_title) =>
    title.slice(base_title.length + (base_title.endsWith(')') ? 1 : 2), -1)
