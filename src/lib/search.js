import {arabic_pattern} from './arabic.js'

// What search reads from an icon, shared so the site and the tests rank the same text.
export const search_fields = (name, {title, title_en, tags}) => ({
    titles: [title, title_en],
    haystack: [name, title, title_en, ...tags].join(' ').toLowerCase(),
})

// Arabic is usually typed with the article: «المسجد» has to find «مسجد».
const without_article = word => (/^ال[\u0621-\u064A]{2}/.test(word) ? word.slice(2) : '')

// One query word as matchers from best to loosest: the whole title (after «ال» too), a whole tag or name, the start of
// one, the start of a word inside one (after «ال» too), anywhere.
function matchers(word) {
    const source = arabic_pattern(word)
    return {
        // Titles carry the article («السجود») but tags must not, so «سجود» would otherwise rank a tag above the title.
        title: RegExp(`^(?:ال)?(?:${source})$`, 'i'),
        whole: RegExp(`^(?:${source})$`, 'i'),
        start: RegExp(`^(?:${source})`, 'i'),
        word: RegExp(`(?:^|[\\s-])(?:ال)?(?:${source})`, 'i'),
        any: RegExp(source, 'i'),
    }
}

function relevance(icon, m) {
    const fields = [...icon.titles, ...icon.tags, icon.name]
    if (icon.titles.some(title => m.title.test(title))) return 100
    if (fields.some(field => m.whole.test(field))) return 90
    if (fields.some(field => m.start.test(field))) return 70
    if (fields.some(field => m.word.test(field))) return 50
    return m.any.test(icon.haystack) ? 20 : 0
}

// Every word has to match; the best matches come first. Ties keep the list's order (the sort is stable).
export function rank_icons(list, query) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return list
    const per_word = words.map(word => [word, without_article(word)].filter(Boolean).map(matchers))
    const scored = []
    for (const icon of list) {
        let score = 0
        for (const options of per_word) {
            const best = Math.max(...options.map(m => relevance(icon, m)))
            if (!best) {
                score = 0
                break
            }
            score += best
        }
        if (score) scored.push({icon, score})
    }
    return scored.sort((a, b) => b.score - a.score).map(item => item.icon)
}
