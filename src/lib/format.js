import {digits, locale} from './locale.js'

// Written for both languages, like the head text in site.js, and keyed by Intl's plural categories.
const FORMS = {
    ar: {
        zero: 'لا أيقونات',
        one: 'أيقونة واحدة',
        two: 'أيقونتان',
        few: '# أيقونات',
        many: '# أيقونة',
        other: '# أيقونة',
    },
    en: {one: '# icon', other: '# icons'},
}

const RULES = {ar: new Intl.PluralRules('ar'), en: new Intl.PluralRules('en')}

export function count_icons(n, language = locale) {
    return FORMS[language][RULES[language].select(n)].replace('#', digits(n, language))
}
