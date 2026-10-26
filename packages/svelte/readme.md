# @islamicons/svelte

[العربية](#العربية) | [English](#english)

<div dir="rtl">

## العربية

أيقونات مكتبة الأيقونات الإسلامية مكوّناتٍ لـ Svelte 5: لكل أيقونة مكوّن يحمل اسمها بصيغة PascalCase، فـ&#x2066;`prayer-beads`&#x2069;
تصير &#x2066;`PrayerBeads`&#x2069;، ولا يدخل في مشروعك إلا ما تستورده.

### التثبيت

<div dir="ltr">

```sh
pnpm add @islamicons/svelte
```

</div>

### الاستعمال

<div dir="ltr">

```svelte
<script>
    import {Mosque, Kaaba, Quran} from '@islamicons/svelte'
</script>

<Mosque />
<Kaaba size={32} color="#1f6b55" />
<Quran strokeWidth={1.4} class="text-amber-700" />
```

</div>

ويمكنك أن تستورد كل أيقونة من ملفها، فيسرع خادم التطوير حين تكثر الأيقونات في مشروعك:

<div dir="ltr">

```js
import Mosque from '@islamicons/svelte/icons/mosque'
```

</div>

### الخصائص

| الخاصية                               | الافتراضي                      | الوصف                                                                                                                                        |
| ------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| &#x2066;`size`&#x2069;                | &#x2066;`24`&#x2069;           | العرض والارتفاع، رقماً بالبكسل أو أي قيمة CSS.                                                                                               |
| &#x2066;`color`&#x2069;               | &#x2066;`currentColor`&#x2069; | لون الخط والأجزاء المصمتة.                                                                                                                   |
| &#x2066;`strokeWidth`&#x2069;         | &#x2066;`1.6`&#x2069;          | سُمك الخط بالبكسل حين يكون حجم الأيقونة ٢٤. يُكبَّر الرسم أو يُصغَّر قليلاً على قدر الخط، فيبقى ملء اللوحة.                                  |
| &#x2066;`absoluteStrokeWidth`&#x2069; | &#x2066;`false`&#x2069;        | يُبقي سُمك الخط بالبكسل ثابتاً مهما كبرت الأيقونة أو صغرت. يحتاج قيمة رقمية لـ&#x2066;`size`&#x2069;.                                        |
| &#x2066;`class`&#x2069;               |                                | فئات CSS تُضاف إلى عنصر &#x2066;`svg`&#x2069;.                                                                                               |
| &#x2066;`...`&#x2069;                 |                                | بقية الخصائص تمرّ إلى عنصر &#x2066;`svg`&#x2069; كما هي، مثل &#x2066;`aria-label`&#x2069; و&#x2066;`role`&#x2069; و&#x2066;`data-*`&#x2069;. |

- **إمكانية الوصول:** الأيقونة مخفية عن قارئ الشاشة افتراضياً (&#x2066;`aria-hidden="true"`&#x2069;)، لأن النص بجوارها يقول معناها في
  الغالب. فإن أعطيتها &#x2066;`aria-label`&#x2069; أو &#x2066;`title`&#x2069; صارت &#x2066;`role="img"`&#x2069; يقرؤها قارئ الشاشة.
- **فئة مشتركة:** على كل أيقونة الفئتان &#x2066;`islamicon`&#x2069; و&#x2066;`islamicon-<name>`&#x2069;، فتنسّق الأيقونات كلها من CSS بقاعدة واحدة.
- **الحافة:** يحمل العنصر &#x2066;`overflow="visible"`&#x2069;، لأن حافة الخط تبلغ حدود اللوحة. لا تُزله.

دليل الاستخدام كاملاً: [islamicons.org/guide](https://islamicons.org/guide).

### الرخصة

رخصة &#x2066;MIT&#x2069;، وحقوق النشر &#x2066;© 2026 Nureddin Haji&#x2069;. انظر الملف &#x2066;`LICENSE`&#x2069;.

</div>

## English

The Islamicons icons as Svelte 5 components: one component per icon, named after it in PascalCase (`prayer-beads`
becomes `PrayerBeads`). Only what you import reaches your app.

### Install

```sh
pnpm add @islamicons/svelte
```

### Usage

```svelte
<script>
    import {Mosque, Kaaba, Quran} from '@islamicons/svelte'
</script>

<Mosque />
<Kaaba size={32} color="#1f6b55" />
<Quran strokeWidth={1.4} class="text-amber-700" />
```

Each icon can also be imported from its own file, which keeps the dev server fast when a project uses many icons:

```js
import Mosque from '@islamicons/svelte/icons/mosque'
```

### Props

| Prop                  | Default        | Description                                                                                            |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `size`                | `24`           | Width and height: a number of pixels or any CSS length.                                                |
| `color`               | `currentColor` | Colour of the strokes and the solid parts.                                                             |
| `strokeWidth`         | `1.6`          | Stroke width in pixels at size 24. The drawing grows or shrinks slightly with it, so it fills its box. |
| `absoluteStrokeWidth` | `false`        | Keeps the stroke the same number of pixels at any size. Needs a numeric `size`.                        |
| `class`               |                | CSS classes added to the `svg` element.                                                                |
| `...`                 |                | Every other prop reaches the `svg` element as is, such as `aria-label`, `role` and `data-*`.           |

- **Accessibility:** icons are hidden from screen readers by default (`aria-hidden="true"`), because the text beside
  them usually says what they mean. Give one an `aria-label` or a `title` and it becomes `role="img"`, which screen
  readers announce.
- **A shared class:** every icon carries `islamicon` and `islamicon-<name>`, so one CSS rule can style them all.
- **Edge:** the element carries `overflow="visible"` because the stroke reaches the edge of the box. Keep it.

The full guide: [islamicons.org/en/guide](https://islamicons.org/en/guide).

### License

MIT, © 2026 Nureddin Haji. See `LICENSE`.
