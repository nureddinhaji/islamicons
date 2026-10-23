const LOCALE_DIR = {ar: 'rtl', en: 'ltr'}
const OG_LOCALE = {ar: 'ar_AR', en: 'en_GB'}

function escape_text(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

function escape_attr(value) {
    return escape_text(value).replace(/"/g, '&quot;')
}

function set_meta(html, key, content) {
    const attr = key.startsWith('og:') ? 'property' : 'name'
    return html.replace(
        new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`),
        `$1${escape_attr(content)}$2`,
    )
}

export function public_url(origin, path) {
    return `${origin}${path}`
}

export function stamp_head(html, {language, name, title, description, path, origin, alternates}) {
    const canonical = public_url(origin, path)
    let out = html.replace(/<html[^>]*>/, `<html dir="${LOCALE_DIR[language]}" lang="${language}">`)
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${escape_text(title)}</title>`)
    out = set_meta(out, 'description', description)
    out = set_meta(out, 'application-name', name)
    out = set_meta(out, 'og:site_name', name)
    out = set_meta(out, 'og:locale', OG_LOCALE[language])
    out = set_meta(out, 'og:title', title)
    out = set_meta(out, 'og:description', description)
    // og:url and hreflang must be absolute, so without SITE_ORIGIN they are left to Seo.svelte at runtime.
    if (!origin) return out
    const links = [
        `<link rel="canonical" data-static-head href="${escape_attr(canonical)}">`,
        `<meta property="og:url" data-static-head content="${escape_attr(canonical)}">`,
        ...alternates.map(
            item =>
                `<link rel="alternate" data-static-head hreflang="${item.language}" href="${escape_attr(public_url(origin, item.path))}">`,
        ),
        `<link rel="alternate" data-static-head hreflang="x-default" href="${escape_attr(public_url(origin, alternates.find(item => item.language === 'ar').path))}">`,
    ]
    return out.replace('</head>', `${links.join('\n')}\n</head>`)
}
