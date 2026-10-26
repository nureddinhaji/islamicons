# Islamicons — مكتبة الأيقونات الإسلامية

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/preview-dark.svg">
  <img src=".github/preview-light.svg" width="768" alt="Islamicons: a sheet of icons including a mosque, the Kaaba, a mushaf, a rehal, prayer beads and a Ramadan lantern">
</picture>

[العربية](#العربية) | [English](#english)

<div dir="rtl">

## العربية

أيقونات إسلامية مفتوحة المصدر ومجانية، مرسومة بإتقان على شبكة ٢٤×٢٤ بقواعد رسم واحدة، فتبدو مجموعة واحدة كأنها من يد
واحدة. كل أيقونة ملف SVG عادي يعمل في أي صفحة ويب أو تطبيق.

### الاستعمال

اختر أيقونة من موقع [islamicons.org](https://islamicons.org)، واضبط حجمها وسُمكها ولونها، ثم انسخ رمز SVG أو نزّله، أو
نزّلها صورة PNG. والموقع بالعربية والإنجليزية.

<div dir="ltr">

```html
<button>
  <svg … stroke="currentColor" overflow="visible" aria-hidden="true">…</svg>
  مواقيت الصلاة
</button>
```

</div>

- **اللون:** تأخذ الأيقونة لون النص حولها (&#x2066;`currentColor`&#x2069;)، فيكفي أن تلوّن العنصر الذي يحتويها.
- **الحافة:** أبقِ &#x2066;`overflow="visible"`&#x2069; في الرمز المنسوخ، فحافة الخط تبلغ حدود اللوحة، وبدونها يقصّ المتصفح جزءاً منها.
- **إمكانية الوصول:** أضف &#x2066;`aria-hidden="true"`&#x2069; إن كان بجوار الأيقونة نص يقول معناها، وإلا فأعطها &#x2066;`role="img"`&#x2069;
  و&#x2066;`aria-label`&#x2069;.

### الحزم

حزمتا &#x2066;`@islamicons/svelte`&#x2069; و&#x2066;`@islamicons/react`&#x2069; قيد الإعداد، وكل أيقونة فيهما مكوّن يحمل اسمها:

<div dir="ltr">

```svelte
<Mosque size={32} />
```

</div>

### المساهمة

نرحّب بالأيقونات الجديدة والتصحيحات. معايير الرسم وقواعد التسمية وطريقة إضافة أيقونة في
[دليل المساهمة](CONTRIBUTING.md).

### الرخصة

رخصة &#x2066;MIT&#x2069;، وحقوق النشر &#x2066;© 2026 Nureddin Haji&#x2069;. مجانية للاستعمال الشخصي والتجاري، والشرط الوحيد أن يبقى نص الرخصة مع نسخ المكتبة أو أجزاء
كبيرة منها. انظر &#x2066;`LICENSE`&#x2069;.

وتستعمل واجهة الموقع رموزاً وشيفرة من مشروعين آخرين برخصة MIT، وليست جزءاً من المكتبة:

- رموز الواجهة، كالبحث والنسخ والتنزيل: [Tabler Icons](https://tabler.io/icons)، &#x2066;© Paweł Kuna&#x2069;.
- مكونات الواجهة، كالأزرار والحقول واللوحة الجانبية: [shadcn-svelte](https://shadcn-svelte.com)، &#x2066;© Hunter Johnston&#x2069;
  وCokaKoala وshadcn، ونص رخصتها في [&#x2066;`THIRD_PARTY_NOTICES.md`&#x2069;](THIRD_PARTY_NOTICES.md).

</div>

## English

Open-source, free Islamic icons, drawn with care on a 24×24 grid to one set of rules, so they read as one set by one
hand. Every icon is a plain SVG that works in any web page or app.

### Usage

Pick an icon on [islamicons.org](https://islamicons.org/en), set its size, stroke and colour, then copy or download the
SVG, or download it as a PNG. The site is in Arabic and English.

```html
<button>
  <svg … stroke="currentColor" overflow="visible" aria-hidden="true">…</svg>
  Prayer times
</button>
```

- **Colour:** the icon takes the colour of the text around it (`currentColor`), so colouring its container is enough.
- **Edge:** keep `overflow="visible"` in the copied code. The stroke reaches the box edge, and without it the browser
  clips part of it.
- **Accessibility:** add `aria-hidden="true"` when text beside the icon says what it means; otherwise give it
  `role="img"` and an `aria-label`.

### Packages

`@islamicons/svelte` and `@islamicons/react` are in preparation. Each icon is a component named after it:

```svelte
<Mosque size={32} />
```

### Contributing

New icons and fixes are welcome. The drawing standard, the naming rules and how to add an icon are in
[the contributing guide](CONTRIBUTING.md).

### License

MIT, © 2026 Nureddin Haji. Free for personal and commercial use; keep the license text with copies of the library or
substantial parts of it. See `LICENSE`.

The site's interface uses glyphs and code from two other MIT-licensed projects; they are not part of the library:

- Interface glyphs (search, copy, download and the like): [Tabler Icons](https://tabler.io/icons), © Paweł Kuna.
- Interface components (buttons, inputs, the side sheet): [shadcn-svelte](https://shadcn-svelte.com), © Hunter Johnston,
  CokaKoala and shadcn. Its license text is in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
