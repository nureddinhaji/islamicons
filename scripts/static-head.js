const LOCALE_DIR = {ar: 'rtl', en: 'ltr'}
const OG_LOCALE = {ar: 'ar_AR', en: 'en_GB'}

export function escape_text(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

export function escape_attr(value) {
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

// The head and the sitemap must name the same fallback page.
export function x_default_path(alternates) {
    return alternates.find(item => item.language === 'ar').path
}

export function stamp_head(
    html,
    {language, name, short_name, title, description, path, origin, alternates, image, noindex = false},
) {
    const canonical = public_url(origin, path)
    let out = html.replace(/<html[^>]*>/, `<html dir="${LOCALE_DIR[language]}" lang="${language}">`)
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${escape_text(title)}</title>`)
    out = set_meta(out, 'description', description)
    out = set_meta(out, 'application-name', name)
    out = set_meta(out, 'apple-mobile-web-app-title', short_name)
    out = set_meta(out, 'og:site_name', name)
    out = set_meta(out, 'og:locale', OG_LOCALE[language])
    out = set_meta(out, 'og:title', title)
    out = set_meta(out, 'og:description', description)
    // A 404 has no canonical address, so it gets no canonical, og:url or hreflang either.
    if (noindex) return out.replace('</head>', '<meta name="robots" data-static-head content="noindex">\n</head>')
    // og:url, og:image and hreflang must be absolute, so without SITE_ORIGIN they are left out (hreflang to Seo.svelte).
    if (!origin) return out
    const links = [
        `<link rel="canonical" data-static-head href="${escape_attr(canonical)}">`,
        `<meta property="og:url" data-static-head content="${escape_attr(canonical)}">`,
        `<meta property="og:image" data-static-head content="${escape_attr(public_url(origin, image.path))}">`,
        `<meta property="og:image:width" data-static-head content="${image.width}">`,
        `<meta property="og:image:height" data-static-head content="${image.height}">`,
        `<meta property="og:image:alt" data-static-head content="${escape_attr(image.alt)}">`,
        ...alternates.map(
            item =>
                `<link rel="alternate" data-static-head hreflang="${item.language}" href="${escape_attr(public_url(origin, item.path))}">`,
        ),
        `<link rel="alternate" data-static-head hreflang="x-default" href="${escape_attr(public_url(origin, x_default_path(alternates)))}">`,
    ]
    return out.replace('</head>', `${links.join('\n')}\n</head>`)
}
