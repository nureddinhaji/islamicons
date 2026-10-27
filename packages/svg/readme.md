# @islamicons/svg

[العربية](#العربية) | [English](#english)

<div dir="rtl">

## العربية

أيقونات مكتبة الأيقونات الإسلامية ملفاتِ SVG جاهزة: لوحة ٢٤×٢٤، وخط بسُمك ١٫٥، ولون &#x2066;`currentColor`&#x2069;، وهي نفسها الملفات
التي تنزّلها من [islamicons.org](https://islamicons.org) إذا جعلت الحجم ٢٤ وتركت السُّمك واللون على حالهما.

### التثبيت

<div dir="ltr">

```sh
pnpm add @islamicons/svg
```

</div>

### الملفات

- &#x2066;`@islamicons/svg/icons/<name>.svg`&#x2069;: ملف لكل أيقونة باسمها البرمجي، مثل &#x2066;`icons/mosque.svg`&#x2069;.
- &#x2066;`@islamicons/svg/icons.json`&#x2069;: العنوان العربي والإنجليزي والتصنيف والكلمات المفتاحية لكل أيقونة، والتصنيفات بترتيب عرضها.

<div dir="ltr">

```json
{
    "icons": {"mosque": {"title": "مسجد", "title_en": "Mosque", "category": "architecture", "tags": ["…"]}},
    "categories": [
        {
            "id": "architecture",
            "title": "العمارة",
            "title_en": "Architecture",
            "icon": "mosque",
            "icons": ["mosque", "…"]
        }
    ]
}
```

</div>

- **اللون:** إذا وضعت رمز الأيقونة في الصفحة نفسها أخذت لون النص حولها، فيكفي أن تلوّن العنصر الذي يحتويها. أما في
  &#x2066;`<img>`&#x2069; فتُرسم بالأسود، لأن الصورة لا ترث لون الصفحة.
- **الحافة:** يترك الرسم هامش وحدة داخل لوحته، فلا يقصّ المتصفح حافته في الأحجام المعتادة، حتى الكسرية منها وعند تكبير الصفحة. فإن ثقّلت الخط من CSS
  فأبقِ &#x2066;`overflow="visible"`&#x2069; على العنصر &#x2066;`svg`&#x2069;، لأن الخط الأثقل يأكل من هذا الهامش.
- **إمكانية الوصول:** أضف &#x2066;`aria-hidden="true"`&#x2069; إن كان بجوار الأيقونة نص يقول معناها، وإلا فأعطها &#x2066;`role="img"`&#x2069;
  و&#x2066;`aria-label`&#x2069;.

دليل الاستخدام كاملاً: [islamicons.org/guide](https://islamicons.org/guide).

### الرخصة

رخصة &#x2066;MIT&#x2069;، وحقوق النشر &#x2066;© 2026 Nureddin Haji&#x2069;. انظر الملف &#x2066;`LICENSE`&#x2069;.

</div>

## English

The Islamicons icons as ready-to-use SVG files: a 24×24 box, stroke 1.5, `currentColor`. They are the same files you
download from [islamicons.org](https://islamicons.org/en) with the size set to 24 and the stroke and colour at their
defaults.

### Install

```sh
pnpm add @islamicons/svg
```

### Files

- `@islamicons/svg/icons/<name>.svg`: one file per icon, named by its id, such as `icons/mosque.svg`.
- `@islamicons/svg/icons.json`: each icon's Arabic and English title, category and search tags, and the categories in
  display order (shape above).

- **Colour:** an icon whose markup is placed in the page takes the colour of the text around it, so colouring its
  container is enough. In an `<img>` it draws in black, because an image does not inherit the page's colour.
- **Edge:** the drawing keeps a one-unit margin inside its box, so browsers do not shave its edge at the usual sizes,
  fractional ones and page zoom included. If you make the stroke heavier in CSS, keep `overflow="visible"` on the `svg` element: a heavier line
  eats into that margin.
- **Accessibility:** add `aria-hidden="true"` when text beside the icon already says what it means; otherwise give it
  `role="img"` and an `aria-label`.

The full guide: [islamicons.org/en/guide](https://islamicons.org/en/guide).

### License

MIT, © 2026 Nureddin Haji. See `LICENSE`.
