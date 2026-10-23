import {arabic_digits} from './arabic.js'

export const LOCALES = ['ar', 'en']
export const LOCALE_NAMES = {ar: 'العربية', en: 'English'}
export const LOCALE_BADGES = {ar: 'ع', en: 'en'}

export const locale = /^\/en(\/|$)/.test(location.pathname) ? 'en' : 'ar'
export const dir = locale === 'ar' ? 'rtl' : 'ltr'
export const base = locale === 'ar' ? '/' : `/${locale}`

// An internal path ('/', '/guide', '/?q=…') as a public URL in `target`; the home page is '/en', not '/en/'.
export function href_in(path, target = locale) {
    if (target === 'ar') return path
    return `/${target}${path.replace(/^\/(?=[?#]|$)/, '')}`
}

export const digits = (n, language = locale) => (language === 'ar' ? arabic_digits(n) : String(n))
