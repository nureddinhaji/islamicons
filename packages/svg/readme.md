# @islamicons/svg

[العربية](#العربية) | [English](#english)

<div dir="rtl">

## العربية

أيقونات مكتبة الأيقونات الإسلامية ملفاتِ SVG جاهزة: لوحة ٢٤×٢٤، وخط بسُمك ١٫٦، ولون `currentColor`، وهي نفسها الملفات
التي تنزّلها من [islamicons.org](https://islamicons.org) إذا جعلت الحجم ٢٤ وتركت السُّمك واللون على حالهما.

### التثبيت

<div dir="ltr">

```sh
pnpm add @islamicons/svg
```

</div>

### الملفات

- `@islamicons/svg/icons/<name>.svg`: ملف لكل أيقونة باسمها البرمجي، مثل `icons/mosque.svg`.
- `@islamicons/svg/icons.json`: العنوان العربي والإنجليزي والتصنيف والكلمات المفتاحية لكل أيقونة، والتصنيفات بترتيب عرضها.

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
  `<img>` فتُرسم بالأسود، لأن الصورة لا ترث لون الصفحة.
- **الحافة:** أبقِ `overflow="visible"` على العنصر `svg`، فحافة الخط تبلغ حدود اللوحة، وبدونها يقصّ المتصفح جزءاً منها.
- **إمكانية الوصول:** أضف `aria-hidden="true"` إن كان بجوار الأيقونة نص يقول معناها، وإلا فأعطها `role="img"`
  و`aria-label`.

دليل الاستخدام كاملاً: [islamicons.org/guide](https://islamicons.org/guide).

### الرخصة

MIT، © 2026 Nureddin Haji. انظر `LICENSE`.

</div>

## English

The Islamicons icons as ready-to-use SVG files: a 24×24 box, stroke 1.6, `currentColor`. They are the same files you
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
- **Edge:** keep `overflow="visible"` on the `svg` element. The stroke reaches the edge of the box, and without it
  browsers clip part of that edge.
- **Accessibility:** add `aria-hidden="true"` when text beside the icon already says what it means; otherwise give it
  `role="img"` and an `aria-label`.

The full guide: [islamicons.org/en/guide](https://islamicons.org/en/guide).

### License

MIT, © 2026 Nureddin Haji. See `LICENSE`.
