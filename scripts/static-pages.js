// What a crawler reads without running the app. main.svelte.js removes it before mounting, so visitors never see it.
import {readFileSync} from 'node:fs'

import {PACKAGES, REPO_URL} from '../src/lib/constants.svelte.js'
import {svg_document} from '../src/lib/frame.js'
import {icon_page_meta, page_title, SITE} from '../src/lib/site.js'
import {install_command, react_usage, svelte_usage} from '../src/lib/snippets.svelte.js'
import {category_title, icon_title} from './icon-catalog.js'
import {alternates_for, escape_attr, escape_text, public_path, public_url, stamp_head} from './static-head.js'

const OTHER = {ar: 'en', en: 'ar'}
const DIR = {ar: 'rtl', en: 'ltr'}
const COPYRIGHT = readFileSync(new URL('../LICENSE', import.meta.url), 'utf8')
    .split('\n')
    .find(line => line.startsWith('Copyright'))
const {author} = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

const LABELS = {
    ar: {
        guide: 'دليل الاستخدام',
        file: 'اسم الملف',
        category: 'التصنيف',
        tags: 'كلمات البحث',
        download: 'تنزيل SVG',
        license: 'مجانية ومفتوحة المصدر برخصة',
        license_terms: 'شروط الاستعمال',
        related: 'من التصنيف نفسه',
        other_page: 'English',
    },
    en: {
        guide: 'Guide',
        file: 'File name',
        category: 'Category',
        tags: 'Search words',
        download: 'Download SVG',
        license: 'Free and open source under the',
        license_terms: 'terms of use',
        related: 'From the same category',
        other_page: 'العربية',
    },
}

export const icon_route = name => `/icons/${name}`

export const related_icons = (catalog, icon) =>
    catalog.filter(item => item.category.id === icon.category.id && item.name !== icon.name)

const link = (href, text, attrs = '') => `<a href="${escape_attr(href)}"${attrs}>${escape_text(text)}</a>`
const code_block = code => `<pre dir="ltr"><code>${escape_text(code)}</code></pre>`

// `route` is this page's internal path, so the language link lands on the same page in the other language.
function site_nav(language, route) {
    const other = OTHER[language]
    return [
        '<header><nav>',
        link(public_path(language, '/'), SITE[language].name),
        link(public_path(language, '/guide'), LABELS[language].guide),
        link(public_path(other, route), LABELS[language].other_page, ` hreflang="${other}" lang="${other}"`),
        '</nav></header>',
    ].join('\n')
}

export function icon_page_body(icon, language, related) {
    const labels = LABELS[language]
    const other = OTHER[language]
    const title = icon_title(icon, language)
    const href = route => public_path(language, route)
    const drawing = svg_document(icon.framed, {size: 96}).replace(
        '<svg ',
        () => `<svg role="img" aria-label="${escape_attr(title)}" `,
    )
    const usage = PACKAGES.map(pkg =>
        [
            `<h2>${escape_text(pkg.label)}</h2>`,
            code_block(install_command('pnpm', pkg.name)),
            code_block((pkg.id === 'svelte' ? svelte_usage : react_usage)(icon.component)),
        ].join('\n'),
    )
    return [
        '<div data-static-body>',
        site_nav(language, icon_route(icon.name)),
        '<main><article>',
        `<h1>${escape_text(title)}</h1>`,
        `<p lang="${other}" dir="${DIR[other]}">${escape_text(icon_title(icon, other))}</p>`,
        drawing,
        '<dl>',
        `<dt>${labels.file}</dt><dd><code dir="ltr">${escape_text(icon.name)}</code></dd>`,
        `<dt>${labels.category}</dt><dd>${link(href(`/?category=${icon.category.id}`), category_title(icon, language))}</dd>`,
        '</dl>',
        `<p>${link(`/svg/${icon.name}.svg`, labels.download, ` download="${escape_attr(icon.name)}.svg"`)}</p>`,
        ...usage,
        `<h2>${labels.tags}</h2>`,
        `<ul>${icon.tags.map(tag => `<li dir="auto">${escape_text(tag)}</li>`).join('')}</ul>`,
        `<p>${labels.license} ${link(`${REPO_URL}/blob/main/LICENSE`, 'MIT')} (${link(`${href('/guide')}#license`, labels.license_terms)})</p>`,
        ...(related.length
            ? [
                  `<h2>${labels.related}</h2>`,
                  `<ul>${related.map(item => `<li>${link(href(icon_route(item.name)), icon_title(item, language))}</li>`).join('')}</ul>`,
              ]
            : []),
        '</article></main>',
        '</div>',
    ].join('\n')
}

// Text links only: 217 inline drawings would weigh more than the app that replaces them.
export function home_body(language, catalog) {
    const site = SITE[language]
    const href = route => public_path(language, route)
    const groups = Map.groupBy(catalog, icon => icon.category.id)
    const sections = [...groups.values()].map(icons =>
        [
            `<section><h2>${escape_text(category_title(icons[0], language))}</h2>`,
            `<ul>${icons.map(icon => `<li>${link(href(icon_route(icon.name)), icon_title(icon, language))}</li>`).join('')}</ul>`,
            '</section>',
        ].join('\n'),
    )
    return [
        '<div data-static-body>',
        site_nav(language, '/'),
        '<main>',
        `<h1>${escape_text(site.name)}</h1>`,
        `<p>${escape_text(site.description)}</p>`,
        ...sections,
        '</main>',
        '</div>',
    ].join('\n')
}

// No SearchAction: Google retired the sitelinks search box it fed.
export function website_object(language, origin) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE[language].name,
        url: public_url(origin, public_path(language, '/')),
        inLanguage: language,
    }
}

// Google Images reads these fields for its "Licensable" badge.
function image_object(icon, language, origin) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: icon_title(icon, language),
        contentUrl: public_url(origin, `/svg/${icon.name}.svg`),
        encodingFormat: 'image/svg+xml',
        license: `${REPO_URL}/blob/main/LICENSE`,
        acquireLicensePage: public_url(origin, `${public_path(language, '/guide')}#license`),
        creditText: SITE[language].name,
        creator: {'@type': 'Person', name: author},
        copyrightNotice: COPYRIGHT,
    }
}

export function icon_page_html(template, {icon, language, related, origin, image}) {
    const site = SITE[language]
    const meta = icon_page_meta(icon_title(icon, language), category_title(icon, language), language)
    const route = icon_route(icon.name)
    return stamp_head(template, {
        language,
        name: site.name,
        short_name: site.short_name,
        title: page_title(meta.title, language),
        description: meta.description,
        path: public_path(language, route),
        origin,
        alternates: alternates_for(route),
        image,
        body: icon_page_body(icon, language, related),
        json_ld: image_object(icon, language, origin),
    })
}
