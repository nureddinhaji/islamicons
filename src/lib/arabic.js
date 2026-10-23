const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

export const arabic_digits = value => String(value).replace(/[0-9]/g, digit => ARABIC_DIGITS[digit])

const MARKS = 'ً-ْٰۖ-ۜ'
const MARK = new RegExp(`[${MARKS}]`, 'g')
const LETTER = /[ء-ي]/
const REGEX_SPECIAL = /[|\\{}()[\]^$+*?.]/
// Letters people write for one another; each string matches every letter in it, both ways.
const INTERCHANGED = ['اأإآ', 'اى', 'يى', 'ةه', 'ةت']
// One-way: a bare hamza or one on alef finds every seat, but a hamza typed on a seat finds only that seat.
const HAMZA_SEATS = {ء: 'أإؤئ', أ: 'ءؤئ'}

function letter_pattern(letter) {
    const finds = new Set([
        letter,
        ...INTERCHANGED.filter(group => group.includes(letter)).join(''),
        ...(HAMZA_SEATS[letter] ?? ''),
    ])
    const body = finds.size > 1 ? `[${[...finds].join('')}]` : letter
    return `${body}[${MARKS}]*`
}

const char_pattern = char => (LETTER.test(char) ? letter_pattern(char) : char.replace(REGEX_SPECIAL, '\\$&'))

// A regex source, not a RegExp, so each caller picks its own flags; harakat are ignored on both sides.
export function arabic_pattern(query) {
    return [...String(query).replace(MARK, '')].map(char_pattern).join('')
}
