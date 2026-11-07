import {escape_attr, public_url, x_default_path} from './static-head.js'

// No lastmod: Workers Builds clones shallowly, so every page would carry the same git date.
export function sitemap_xml(origin, entries) {
    const link = (hreflang, path) =>
        `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escape_attr(public_url(origin, path))}"/>`
    const urls = entries.map(entry =>
        [
            '<url>',
            `<loc>${escape_attr(public_url(origin, entry.path))}</loc>`,
            ...entry.alternates.map(item => link(item.language, item.path)),
            link('x-default', x_default_path(entry.alternates)),
            ...(entry.images ?? []).map(
                image => `<image:image><image:loc>${escape_attr(public_url(origin, image))}</image:loc></image:image>`,
            ),
            '</url>',
        ].join('\n'),
    )
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        ...urls,
        '</urlset>',
        '',
    ].join('\n')
}

export function robots_txt(origin) {
    const lines = ['User-agent: *', 'Allow: /']
    if (origin) lines.push('', `Sitemap: ${public_url(origin, '/sitemap.xml')}`)
    return `${lines.join('\n')}\n`
}
