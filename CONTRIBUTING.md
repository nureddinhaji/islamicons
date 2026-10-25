# المساهمة في Islamicons — Contributing

[العربية](#العربية) | [English](#english)

<div dir="rtl">

## العربية

المساهمة مرحَّب بها: أيقونة جديدة، أو تصحيح أيقونة قائمة، أو كلمات بحث أدق، أو تحسين للموقع. قبل أن ترسم أيقونة جديدة،
افتح issue تصف فيها الأيقونة ومعناها، كي نتفق على اسمها وتصنيفها قبل العمل.

### إضافة أيقونة

1. ارسمها على شبكة ٢٤ بسُمك ٢، واحفظها في `icons/<name>.svg` بخصائص الجذر القياسية.
2. أنشئ `icons/<name>.json` بعنوانها العربي وعنوانها الإنجليزي وكلمات البحث.
3. أضف اسمها إلى قائمة تصنيفها في `icons/_categories.json`، في الموضع الذي يجب أن تظهر فيه.
4. شغّل `pnpm check:icons`. يلتقط الموقع الأيقونة في البناء التالي دون أي تعديل في الشيفرة.

التسمية، كي تُقرأ المجموعة واحدة. يفرض `pnpm check:icons` قواعد العناوين والترتيب وكلمات البحث، ويُترك المعنى والتهجئة
و«ال» للمراجعة.

- **الاسم البرمجي:** يسمّي معنى الأيقونة لا طريقة رسمها. علامات المصحف باسمها كما يكتبه Unicode ‏(`end-of-ayah`
  و`ornate-parenthesis-left`)، وما ليس مصطلحاً إسلامياً بالإنجليزية الواضحة (`mosque` و`font-size` و`dictionary`
  و`diacritics`). والنسخة تضيف بعد اسم أصلها كلمة لكل فرق (`quran-ornate-simple`)، وتأتي `filled` آخر كلمة، والشطب على
  الرسم `off` آخر كلمة كذلك (`adhan-off`)، ودبوس الخريطة `map-pin` يتبعه ما يدل عليه، والاتجاهات كما في الرسم (`left`
  و`right`). والاسم الذي يبدأ باسم أيقونة أخرى تتبعه شَرطة نسخةٌ منها.
- **التهجئة:** يُكتب المصطلح الإسلامي بالحروف اللاتينية كما يكتبه أول هذه المصادر: واجهات المطوّرين (Aladhan وadhan-js
  وQuran.com)، ثم مدخل قاموس Merriam-Webster، ثم عنوان ويكيبيديا الإنجليزية (`dhuhr` و`tawhid` و`tilawa` و`salawat`).
  وتذهب بقية التهجئات إلى كلمات البحث.
- **العنوان العربي:** قصير يتسع له مربّع الأيقونة. الأفعال والمناسك والأوقات والعلوم والفريد بـ«ال» (السجود، الفجر،
  الكعبة)، والأشياء والأشخاص بلا «ال» (مسجد، مصحف). وعنوان الأصل بلا أقواس، وعنوان النسخة هو عنوان أصلها وما يميّزها
  بين قوسين، وفرق ثانٍ بعد «،» (الإحرام (لحية عريضة، مُصمَت))، ونسخة `filled` «مُصمَت»، ونسخة `off` تسمّي حالة الإيقاف.
  والعناوين لا تتكرر.
- **العنوان الإنجليزي:** يبدأ بحرف كبير وبلا حروف عربية، وعلامة ﷺ مسموحة. ويُكتب المصطلح الإسلامي بتهجئة الاسم البرمجي مع
  حروفه الكبيرة وفاصلته العليا (`Tawaf` و`Dhuhr` و`Tilawa` و`Sa'i` و`Asbab al-Nuzul`)، وما سواه إنجليزية واضحة (`Mosque`
  و`Prayer mat`). ويبقى المعنى الإنجليزي كلمة بحث يجدها البحث أصلاً (`recitation` و`prostration`). وعنوان النسخة هو
  عنوان أصلها الإنجليزي وما يميّزها بين قوسين، وفرق ثانٍ بعد فاصلة إنجليزية (`Ihram (wide beard, filled)`)، ونسخة
  `filled` آخر ما بين قوسيها كلمة filled. وعنوان الأصل بلا أقواس، والعناوين لا تتكرر. ويطابق البحث العنوان الإنجليزي كما
  يطابق العربي، وتُحذف كلمة البحث التي تكرره.
- **كلمات البحث:** لا تكرر ما يجده البحث أصلاً: الاسم، وأحد العنوانين، وصورة «ال»، والهمزة، والتاء المربوطة والهاء،
  والألف المقصورة والياء، والتشكيل. لكل مفهوم عربي مقابله الإنجليزي وبالعكس، وكل تهجئة إنجليزية شائعة موجودة (`salat`
  و`namaz`)، وكلمات البحث صادقة في وصف الأيقونة، والإنجليزية منها بأحرف صغيرة، والاسم القديم الذي يبحث عنه الناس يبقى
  كلمة بحث.
- **الترتيب:** داخل التصنيف بالترتيب الذي يلقاه المستخدم: أوقات الصلاة على مدار اليوم، وأركان الصلاة بترتيبها، ومناسك
  الحج كما تُؤدّى، والأصل قبل نسخه.

### معايير الرسم

يفرضها `pnpm check:icons`، ويعمل قبل كل بناء، ويرفض كل أيقونة تخالفها:

- **الصياغة:** الملف هو جذر `<svg>` تتبعه أشكال مغلقة ذاتياً لا غير. الخصائص بين علامتي تنصيص مزدوجتين، وكل خاصية مرة
  واحدة. والأرقام عشرية عادية، وأنصاف الأقطار والعروض والارتفاعات أكبر من صفر. وما لا يستطيع الفحص تفسيره يفشل، ويرفض
  الموقع تحميله.
- **الجذر:** الخصائص القياسية بالضبط: `xmlns` و`width="24"` و`height="24"` و`viewBox="0 0 24 24"` و`fill="none"`
  و`stroke="currentColor"` و`stroke-width="2"` و`stroke-linecap="round"` و`stroke-linejoin="round"`.
- **العناصر:** `path` و`circle` و`ellipse` و`rect` و`line` و`polyline` و`polygon`، بخصائص الهندسة وحدها، مع
  `fill="currentColor"` على الأجزاء المصمتة عمداً (نجمة `star-and-crescent`، والنسخ `filled`).
- **الممنوع:** المعرّفات والفئات والأنماط والتحويلات والأقنعة والمجموعات والنصوص، كي تعمل الأيقونة في أي صفحة ولا تتعارض
  نسختان منها.
- **الحدود:** كل مسار بين ٢ و٢٢، أي هامش بكسل حول خط سُمكه ٢. وتُقاس المنحنيات والأقواس على امتدادها لا عند أطرافها
  فقط.
- **البيانات:** ملف `.json` فيه `title` و`title_en` و`tags` وحدها: عنوان عربي، وعنوان إنجليزي، وكلمات بحث غير فارغة
  وغير مكررة ولا مسافة في طرفيها، وبأحرف صغيرة في الإنجليزية، ولا تكرر الاسم ولا أحد العنوانين ولا بعضها. وعنوان النسخة
  في كل لغة هو عنوان أصلها وما يميّزها بين قوسين، وعنوان الأصل بلا أقواس، والعناوين لا تتكرر في كل لغة، و`filled`
  و`off` آخر كلمة في الاسم. واسم الأيقونة في قائمة تصنيفها في `_categories.json` مرة واحدة، وقوائمه لا تسمّي إلا أيقونات
  موجودة وتضمّ الأيقونة التي تمثّل كل تصنيف. وكل أيقونة يسمّيها الموقع في `src/` موجودة.

### تُرسم بسُمك ٢ وتُعرض بسُمك ١٫٦

الرسم بسُمك ٢ وغني بالتفاصيل. وكل ما تعرضه المكتبة أو تصدّره (الموقع، ورمز SVG المنسوخ، والتنزيلات، والحزمتان
المرتقبتان) يعرضه ملفَّ SVG قياسياً ٢٤×٢٤ بسُمك ١٫٦، مكبَّراً حول مركزه حتى تلامس حافة الخط حدود اللوحة تماماً:

<div dir="ltr">

```
scale = 1.2 − strokeWidth / 20        (1.12 at 1.6; art within 2–22, so 12 − 10·scale = strokeWidth / 2)
```

</div>

يفعل ذلك `src/lib/frame.js` دون DOM، بالدالة `frame_inner(inner, strokeWidth)`، فيتشارك الموقع و`scripts/check-icons.js`
والحزمتان تنفيذاً واحداً.

- الخط الأخف يرسم الأيقونة أكبر قليلاً، والأثقل أصغر قليلاً، فتملأ لوحتها دائماً.
- ولأن الحبر يلامس حدود اللوحة، يحمل كل رسم وكل تصدير `overflow="visible"`، وكذلك المكوّنات المرتقبة. وبدونها يقصّ Chrome
  وFirefox جزءاً ظاهراً من الحافة في أغلب الأيقونات كلما وقعت حدود اللوحة بين بكسلين.
- مقيساً على المجموعة كلها، يتسع أضيق فراغ بين العناصر المتمايزة من وسيط ٠٫١٥ بكسل في الرسم إلى ٠٫٨١ بكسل في العرض،
  فتُقرأ الأيقونات بوضوح من ٢٠ بكسل، وأبهى ما تكون من ٢٨ بكسل. وفي حجم ١٦ بكسل استعمل سُمك ١٫٤.
- الأقواس الممتدة على وترها بالضبط (أنصاف الدوائر) تُكتب بأنصاف أقطار أقل من نصف الوتر بشعرة، فيحسبها المتصفح نصف دائرة
  تامة، ولو قُرّبت إلى الأعلى لتسطّحت تسطحاً ظاهراً. وتحتفظ الإحداثيات بأربع خانات عشرية لأن ما يقارب نصف الدائرة يضخّم أثر
  التقريب.

### بنية المشروع

- `icons/<name>.svg`: الرسم الأصل بسُمك ٢، وهو المرجع. والملفات الجاهزة للاستعمال (سُمك ١٫٦، داخل الإطار، مع
  `overflow="visible"`) تأتي من الموقع، ولاحقاً من الحزمتين.
- `icons/<name>.json`: العنوان العربي `title`، والإنجليزي `title_en`، وكلمات البحث `tags` بالعربية والإنجليزية.
- `icons/_categories.json`: التصنيفات بترتيب العرض: المعرّف، والعنوان العربي `title`، والإنجليزي `title_en`، والأيقونة
  التي تمثّله، وقائمة `icons` بترتيب العرض، وملاحظة اختيارية `note` تظهر في لوحة الأيقونة ومعها `note_en`. وهو المكان
  الوحيد الذي يحدد تصنيف كل أيقونة.
- `src/lib/frame.js`: إطار العرض، وهو هندسة خالصة. و`src/lib/icon-file.js`: القارئ الوحيد لملفات الأيقونات.
  و`scripts/check-icons.js`: المعايير في صورة فحص.
- `src/`: الموقع (Svelte 5 وnavgo وTailwind 4 وbits-ui). ويحمّل `src/lib/icons.js` مجلد `icons/` عند البناء.

### التطوير

Node 24 وpnpm 12، مثبّتان في `mise.toml`. شغّل الأوامر عبر mise ‏(`mise exec -- pnpm …`) أو مع تفعيل mise.

<div dir="ltr">

```bash
pnpm dev            # خادم التطوير (VITE_PORT من mise.toml)
pnpm build          # فحص الأيقونات، ثم بناء الإنتاج في dist/
pnpm check:icons    # معايير الرسم على icons/
pnpm sheet mosque   # صفحة مراجعة: الشبكة والأحجام المعروضة والقياسات، في tmp/sheets/
pnpm og             # صورتا معاينة الرابط (og:image)، في tmp/og/؛ والبناء يولّدهما في dist/ تلقائياً
pnpm test           # اختبارات الفحص
pnpm lint           # oxlint
pnpm format:check   # oxfmt
```

</div>

### قبل أن تفتح طلب الدمج

شغّل هذه الأوامر، ويجب أن تنجح كلها:

<div dir="ltr">

```bash
pnpm check:icons
pnpm test
pnpm lint
pnpm format:check
```

</div>

وإن أضفت أيقونة أو غيّرت رسمها، فأرفق بالطلب صفحة مراجعتها من `pnpm sheet <name>`، أو `pnpm sheet <old> <new>` للمقارنة
بين نسختين.
وإن غيّرت أيقونة من أيقونات صورة المعاينة في الصفحة الأولى، فأعد توليدها بـ`pnpm preview:readme`.

</div>

## English

Contributions are welcome: a new icon, a fix to an existing one, better search tags, or an improvement to the site.
Before drawing a new icon, open an issue that describes the icon and what it means, so its name and category are agreed
before the work starts.

### Adding an icon

1. Draw it on the 24 grid at stroke 2 and save it as `icons/<name>.svg` with the standard root attributes.
2. Add `icons/<name>.json` with its Arabic title, its English title and its search tags.
3. Put the name in its category's list in `icons/_categories.json`, at the place it should appear.
4. Run `pnpm check:icons`. The site picks the icon up on the next build; no code changes are needed.

Naming, so the set reads as one. `pnpm check:icons` enforces the title, order and tag rules; meaning, spelling and
«ال» are left to review.

- **Name (id):** it names what the icon means, not how it is drawn. Mushaf marks take their name as Unicode spells
  it (`end-of-ayah`, `ornate-parenthesis-left`); anything that is not an Islamic term is plain English (`mosque`,
  `font-size`, `dictionary`, `diacritics`). A variant adds one word per difference after its base
  (`quran-ornate-simple`), with `-filled` last; a slash across the drawing is `-off`, last (`adhan-off`); a map pin is
  `map-pin-<what it marks>`; directions are the drawing's own (`left`/`right`). A name that starts with another
  icon's name and a hyphen is that icon's variant.
- **Spelling:** an Islamic term is transliterated as the first of these sources spells it: developer APIs (Aladhan,
  adhan-js, Quran.com), the Merriam-Webster headword, the English Wikipedia title (`dhuhr`, `tawhid`, `tilawa`,
  `salawat`). Every other spelling goes in the tags.
- **Arabic title:** short enough for a tile. Acts, rites, times, fields of knowledge and unique things take «ال»
  (`السجود`, `الفجر`, `الكعبة`); objects and people do not (`مسجد`, `مصحف`). A base title has no parentheses. A
  variant's title is its base's plus the difference in parentheses, a second difference after «،»
  (`الإحرام (لحية عريضة، مُصمَت)`); `-filled` is «مُصمَت», an `-off` variant names the off state. Titles are unique.
- **English title:** sentence case, starting with a capital, with no Arabic letters (ﷺ is allowed). An Islamic term
  keeps the id's spelling, including its capitals and apostrophe (`Tawaf`, `Dhuhr`, `Tilawa`, `Sa'i`,
  `Asbab al-Nuzul`); everything else is plain English (`Mosque`, `Prayer mat`). The English meaning stays a tag
  (`recitation`, `prostration`), which search already finds. A variant is its base's English title plus the
  difference in parentheses, a second difference after ", " (`Ihram (wide beard, filled)`); a `-filled` variant ends
  in `filled)`. A base title has no parentheses. Titles are unique. Search matches the English title the same way it
  matches the Arabic one, and a tag that repeats it is dropped.
- **Tags:** never what search already finds (the id, either title, an «ال» form, hamza, ة/ه, ى/ي, diacritics). Every
  Arabic concept has its English counterpart and the reverse, every common English spelling is present (`salat`,
  `namaz`), tags are true of the icon, English tags are lowercase, and an old name people search for stays a tag.
- **Order:** inside a category, the order a user meets things: prayer times through the day, positions through the
  prayer, Hajj rites as performed, a base icon before its variants.

### The drawing standard

`pnpm check:icons` enforces it, runs before every build, and rejects any icon that breaks it:

- **Syntax:** the file is the `<svg>` root followed by self-closing shapes and nothing else. Attributes are in double
  quotes, each once. Numbers are plain decimals, and radii, widths and heights are above zero. Anything the check cannot
  account for fails it, and the site refuses to load such a file.
- **Root:** exactly the standard attributes — `xmlns`, `width="24"`, `height="24"`, `viewBox="0 0 24 24"`,
  `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- **Elements:** `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon`, with geometry attributes only, plus
  `fill="currentColor"` on deliberately solid parts (the star of `star-and-crescent`, the `*-filled` variants).
- **Forbidden:** ids, classes, styles, transforms, masks, groups and text, so an icon works on any page and two copies
  never clash.
- **Bounds:** every path stays within 2–22 — a 1 px margin around a 2 px stroke. Curves and arcs are measured along
  their length, not only at their end points.
- **Metadata:** a `.json` with exactly `title`, `title_en` and `tags` — an Arabic title, an English title, and tags
  that are trimmed, non-empty, unique, lowercase in English, and not repeating the id, either title or each other. A
  variant's title, in each language, is its base title plus the difference in parentheses, a base title has none,
  titles are unique in each language, and `filled`/`off` come last in an id.
  The icon is listed exactly once in its category in `_categories.json`, whose lists name only existing icons and
  include each category's own icon. Every icon the site names in `src/` exists.

### Drawn at 2, shown at 1.6

The art is drawn at stroke 2 and is rich in detail. Everything the library shows or exports — the site, copied SVG,
downloads, the planned packages — renders it as a standard 24×24 SVG at stroke 1.6, with the art scaled about the
centre so the outer edge of the stroke meets the box edge exactly:

```
scale = 1.2 − strokeWidth / 20        (1.12 at 1.6; art within 2–22, so 12 − 10·scale = strokeWidth / 2)
```

`src/lib/frame.js` does this without a DOM (`frame_inner(inner, strokeWidth)`), so the site, `scripts/check-icons.js`
and the packages share one implementation.

- A lighter line draws the art slightly larger and a heavier one slightly smaller, so the icon always fills its box.
- Because the ink meets the box edge, every rendered and exported icon carries `overflow="visible"` (the planned
  components will too). Without it, Chrome and Firefox shave a visible part of the edge on most icons whenever the box
  edge falls between pixels.
- Measured over the set, the tightest gap between distinct elements grows from a median 0.15 px as drawn to 0.81 px as
  shown, so the icons read clearly from 20 px and look their best from 28 px. At 16 px use stroke 1.4.
- Arcs that span their chord exactly (semicircles) are written with radii a hair under the chord, so renderers resolve
  them to the exact semicircle; rounding them up would visibly flatten them. Coordinates keep 4 decimals because
  near-semicircles amplify rounding.

### Layout

- `icons/<name>.svg` — the master drawing at stroke 2, the source of truth. Ready-to-use files (stroke 1.6, framed, `overflow="visible"`) come from the site, and later from the packages.
- `icons/<name>.json` — Arabic `title`, English `title_en`, and search `tags` (Arabic and English).
- `icons/_categories.json` — the categories in display order: id, Arabic `title`, English `title_en`, the icon that
  represents it, and its `icons` in display order, and an optional `note` shown in the icon panel, with
  `note_en` beside it. It is the only place that says where an icon goes.
- `src/lib/frame.js` — the presentation frame (pure geometry). `src/lib/icon-file.js` — the one reader of icon files.
  `scripts/check-icons.js` — the standard, as a check.
- `src/` — the site (Svelte 5, navgo, Tailwind 4, bits-ui). `src/lib/icons.js` loads `icons/` at build time.

### Development

Node 24 and pnpm 12, pinned in `mise.toml`; run the commands through mise (`mise exec -- pnpm …`) or with mise
activated.

```bash
pnpm dev            # dev server (VITE_PORT from mise.toml)
pnpm build          # icon check, then production build into dist/
pnpm check:icons    # the drawing standard, over icons/
pnpm sheet mosque   # review sheet: grid, shown sizes, measurements, into tmp/sheets/
pnpm og             # the link-preview images (og:image), into tmp/og/; the build writes them into dist/ itself
pnpm test           # regression tests of the check
pnpm lint           # oxlint
pnpm format:check   # oxfmt
```

### Before you open a pull request

Run these; all of them must pass:

```bash
pnpm check:icons
pnpm test
pnpm lint
pnpm format:check
```

If you added an icon or changed a drawing, attach its review sheet from `pnpm sheet <name>` (or `pnpm sheet <old> <new>`
to compare two versions).
If you changed an icon shown in the readme's preview sheet, regenerate it with `pnpm preview:readme`.
