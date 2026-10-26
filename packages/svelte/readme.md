# @islamicons/svelte

[العربية](#العربية) | [English](#english)

<div dir="rtl">

## العربية

أيقونات مكتبة الأيقونات الإسلامية مكوّناتٍ لـ Svelte 5: لكل أيقونة مكوّن يحمل اسمها بصيغة PascalCase، فـ`prayer-beads`
تصير `PrayerBeads`، ولا يدخل في مشروعك إلا ما تستورده.

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

| الخاصية               | الافتراضي      | الوصف                                                                                                       |
| --------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `size`                | `24`           | العرض والارتفاع، رقماً بالبكسل أو أي قيمة CSS.                                                              |
| `color`               | `currentColor` | لون الخط والأجزاء المصمتة.                                                                                  |
| `strokeWidth`         | `1.6`          | سُمك الخط بالبكسل حين يكون حجم الأيقونة ٢٤. يُكبَّر الرسم أو يُصغَّر قليلاً على قدر الخط، فيبقى ملء اللوحة. |
| `absoluteStrokeWidth` | `false`        | يُبقي سُمك الخط بالبكسل ثابتاً مهما كبرت الأيقونة أو صغرت. يحتاج قيمة رقمية لـ`size`.                       |
| `class`               |                | فئات CSS تُضاف إلى عنصر `svg`.                                                                              |
| `...`                 |                | بقية الخصائص تمرّ إلى عنصر `svg` كما هي، مثل `aria-label` و`role` و`data-*`.                                |

- **إمكانية الوصول:** الأيقونة مخفية عن قارئ الشاشة افتراضياً (`aria-hidden="true"`)، لأن النص بجوارها يقول معناها في
  الغالب. فإن أعطيتها `aria-label` أو `title` صارت `role="img"` يقرؤها قارئ الشاشة.
- **فئة مشتركة:** على كل أيقونة الفئتان `islamicon` و`islamicon-<name>`، فتنسّق الأيقونات كلها من CSS بقاعدة واحدة.
- **الحافة:** يحمل العنصر `overflow="visible"`، لأن حافة الخط تبلغ حدود اللوحة. لا تُزله.

دليل الاستخدام كاملاً: [islamicons.org/guide](https://islamicons.org/guide).

### الرخصة

MIT، © 2026 Nureddin Haji. انظر `LICENSE`.

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
