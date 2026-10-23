import {PACKAGES} from './constants.svelte.js'
import {DEFAULT_STROKE_WIDTH} from './frame.js'

const package_name = id => PACKAGES.find(pkg => pkg.id === id).name

function component_props({size = 24, stroke_width = DEFAULT_STROKE_WIDTH, color = ''} = {}) {
    const props = []
    if (size !== 24) props.push(`size={${size}}`)
    if (color) props.push(`color="${color}"`)
    if (stroke_width !== DEFAULT_STROKE_WIDTH) props.push(`strokeWidth={${stroke_width}}`)
    return props.length ? ` ${props.join(' ')}` : ''
}

export const svelte_usage = (component, options) =>
    `<script>
    import {${component}} from '${package_name('svelte')}'
</script>

<${component}${component_props(options)} />`

export const react_usage = (component, options) =>
    `import {${component}} from '${package_name('react')}'

export function Example() {
    return <${component}${component_props(options)} />
}`

export const install_command = id => `pnpm add ${package_name(id)}`

export const svelte_props_example = `<script>
    import {Mosque, Kaaba, Quran} from '${package_name('svelte')}'
</script>

<Mosque />
<Kaaba size={32} color="#1f6b55" />
<Quran strokeWidth={1.4} class="text-amber-700" />`

export const react_props_example = `import {Mosque, Kaaba, Quran} from '${package_name('react')}'

export function Toolbar() {
    return (
        <nav>
            <Mosque />
            <Kaaba size={32} color="#1f6b55" />
            <Quran strokeWidth={1.4} className="text-amber-700" />
        </nav>
    )
}`

export const get_html_example = () => /* @wc-include */ `<button class="prayer-button">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="${DEFAULT_STROKE_WIDTH}"
       stroke-linecap="round" stroke-linejoin="round" overflow="visible" aria-hidden="true">
    <!-- … -->
  </svg>
  مواقيت الصلاة
</button>

<style>
  /* الأيقونة تأخذ لون النص، فقاعدة واحدة تلوّنهما معاً */
  .prayer-button { color: #1f6b55; }
</style>`

export const get_css_styling_example = () => /* @wc-include */ `<h2 class="section-title">
  <svg aria-hidden="true" …>…</svg>
  المساجد القريبة
</h2>

<style>
  .section-title { color: #a8741a; }
  /* الحجم من CSS يغلب خاصيتَي width وheight */
  .section-title svg { width: 2rem; height: 2rem; }
</style>`

export const tailwind_styling_example = `<svg class="size-8 text-emerald-700" …>…</svg>`

export const get_a11y_example = () => /* @wc-include */ `<!-- بجوار نص يقول المعنى: أخفِها عن قارئ الشاشة -->
<button>
  <svg aria-hidden="true" …>…</svg>
  مواقيت الصلاة
</button>

<!-- زر بلا نص: الاسم على الزر، والأيقونة مخفية -->
<button aria-label="اتجاه القبلة">
  <svg aria-hidden="true" …>…</svg>
</button>

<!-- أيقونة تحمل المعنى وحدها -->
<svg role="img" aria-label="حلال" …>…</svg>`

export const check_command = 'pnpm check:icons'

export const icon_meta_example = `{
  "title": "مسجد",
  "title_en": "Mosque",
  "tags": ["masjid", "جامع", "صلاة", "building"]
}`

export const icon_svg_template = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M2 22h20" />
  <!-- … -->
</svg>`
