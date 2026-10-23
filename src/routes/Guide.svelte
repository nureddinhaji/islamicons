<div class="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-10 pb-24">
    <header class="flex max-w-3xl flex-col gap-3">
        <h1 class="text-4xl">دليل الاستخدام</h1>
        <p class="text-lg text-muted-foreground">
            كل ما تحتاجه لتضع الأيقونات في مشروعك: نسخها وتنزيلها اليوم، والحزمتان المرتقبتان، والتنسيق وإمكانية الوصول،
            ثم القواعد التي تُرسم بها كل أيقونة وطريقة إضافة أيقونة جديدة.
        </p>
    </header>

    <details class="group rounded-xl bg-card lg:hidden">
        <summary class="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium">
            محتويات الدليل
            <Icon id="chevron-down" class="ms-auto size-4 transition-transform group-open:rotate-180" />
        </summary>
        <nav aria-label="محتويات الدليل" class="px-1 pb-4">
            {@render contents()}
        </nav>
    </details>

    <div class="grid gap-12 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
        <nav
            aria-label="محتويات الدليل"
            class="max-lg:hidden lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:max-h-[calc(100dvh-var(--header-height)-3rem)] lg:overflow-y-auto"
        >
            {@render contents()}
        </nav>

        <article class="flex max-w-3xl min-w-0 flex-col gap-16">
            <section id="overview" class="flex flex-col gap-5">
                <h2 class="text-2xl">نظرة عامة</h2>
                <p>
                    مكتبة الأيقونات الإسلامية مجموعة مفتوحة المصدر من {count_icons(icons.length)} للمسجد والصلاة والقرآن والحج
                    ورمضان وغيرها، رُسمت كلها بقواعد واحدة فتبدو كأنها من يد واحدة، وتعمل في أي صفحة ويب أو تطبيق يعرض SVG.
                </p>
                <ul class="flex flex-col gap-3">
                    {#each FEATURES as feature (feature)}
                        <li class="flex gap-3">
                            <Icon id="check" class="mt-1 size-4.5 shrink-0 text-primary" />
                            <span>{feature}</span>
                        </li>
                    {/each}
                </ul>
                <div class="flex gap-3 rounded-xl bg-gold/10 p-4">
                    <Icon id="clock" class="mt-1 size-4.5 shrink-0 text-gold" />
                    <p>
                        <span class="font-semibold">المتاح اليوم:</span> نسخ أي أيقونة أو تنزيلها من
                        <a href={href_in('/')} class="font-medium text-primary underline underline-offset-4"
                            >صفحة الأيقونات</a
                        >.
                        <span class="font-semibold">المرتقب:</span> حزمتا Svelte وReact، ولم تُنشرا بعد، والأمثلة الخاصة بهما
                        في هذا الدليل تصف واجهتهما المرتقبة.
                    </p>
                </div>
            </section>

            <section id="svg" class="flex flex-col gap-5">
                <h2 class="text-2xl">النسخ والتنزيل</h2>
                <ol class="flex list-inside list-decimal flex-col gap-2 marker:text-muted-foreground">
                    <li>
                        افتح <a href={href_in('/')} class="text-primary underline underline-offset-4">صفحة الأيقونات</a>،
                        وابحث عن الأيقونة أو تصفّح تصنيفاتها، ثم اضغط عليها لتفتح لوحتها.
                    </li>
                    <li>
                        اضبط من لوحة التخصيص ما تحتاجه: الحجم من ١٦ إلى ٦٤ بكسل، وسُمك الخط من ١ إلى ٣، واللون (لون النص
                        أو لون تختاره).
                    </li>
                    <li>
                        اضغط «نسخ SVG» لتلصق الرمز في صفحتك، أو نزّل ملف SVG، أو صورة PNG بمقاس ٥١٢×٥١٢ وخلفية شفافة.
                    </li>
                </ol>
                <p>
                    إن تركت اللون على «لون النص» فالرمز يُرسم بـ<code dir="ltr" class="font-mono">currentColor</code>، أي
                    بلون النص الذي حوله، فيكفي أن تلوّن العنصر الحاوي:
                </p>
                <CodeBlock code={get_html_example()} caption="index.html" />
                <div class="flex gap-3 rounded-xl bg-muted p-4">
                    <Icon id="sliders-horizontal" class="mt-1 size-4.5 shrink-0 text-muted-foreground" />
                    <div class="flex flex-col gap-2">
                        <p>
                            السُمك محسوب في الرمز نفسه: يُكبَّر الرسم أو يُصغَّر قليلاً على قدر خطه حتى تبلغ حافته حدود اللوحة.
                            فإن أردت سُمكاً آخر فاختره من لوحة التخصيص وانسخ الأيقونة من جديد، ولا تغيّر
                            <code dir="ltr" class="font-mono">stroke-width</code> في الرمز المنسوخ، لأن الخط الأثقل يتجاوز حينها
                            حدود اللوحة.
                        </p>
                        <p>
                            ولأن الحافة على حدود اللوحة يحمل الرمز
                            <code dir="ltr" class="font-mono">overflow="visible"</code>، فأبقِها: المتصفح يقصّ ما يبلغ
                            حدود عنصر svg، فإن وقعت الأيقونة بين بكسلين، كما في الأحجام الكسرية أو عند تكبير الصفحة، ذهب
                            جزء من حافتها.
                        </p>
                    </div>
                </div>
            </section>

            {#each PACKAGES as pkg (pkg.id)}
                <section id={pkg.id} class="flex flex-col gap-5">
                    <h2 class="text-2xl" dir="auto">{pkg.label}</h2>
                    <p>
                        كل أيقونة مكوّن مستقل يحمل اسمها بصيغة PascalCase، فـ<code dir="ltr" class="font-mono"
                            >prayer-beads</code
                        >
                        تصير <code dir="ltr" class="font-mono">PrayerBeads</code>. وستُبنى الحزمة بحيث لا يدخل في مشروعك
                        إلا ما تستورده منها.
                    </p>
                    <p class="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Icon id="clock" class="size-4 text-gold" />
                        الحزمة قيد الإعداد، وهذا شكل استخدامها المرتقب.
                    </p>
                    <CodeBlock code={install_command(pkg.id)} caption="terminal" copy={false} />
                    <CodeBlock
                        code={pkg.id === 'svelte' ? svelte_props_example : react_props_example}
                        caption={pkg.id === 'svelte' ? 'App.svelte' : 'Toolbar.jsx'}
                    />
                </section>
            {/each}

            <section id="props" class="flex flex-col gap-5">
                <h2 class="text-2xl">الخصائص</h2>
                <p>الخصائص نفسها في الحزمتين، وبالأسماء المألوفة في مكتبات الأيقونات، فلا تحتاج إلى تعلّم شيء جديد.</p>
                <div class="overflow-x-auto rounded-xl bg-card">
                    <table class="w-full text-start text-sm">
                        <thead class="text-muted-foreground">
                            <tr class="border-b">
                                <th scope="col" class="px-4 py-3 text-start font-medium">الخاصية</th>
                                <th scope="col" class="px-4 py-3 text-start font-medium">الافتراضي</th>
                                <th scope="col" class="px-4 py-3 text-start font-medium">الوصف</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            {#each PROPS as prop (prop.name)}
                                <tr>
                                    <th
                                        scope="row"
                                        class="px-4 py-3 text-start font-mono font-medium whitespace-nowrap"
                                    >
                                        <span dir="ltr">{prop.name}</span>
                                    </th>
                                    <td class="px-4 py-3 text-start font-mono whitespace-nowrap text-muted-foreground">
                                        <span dir="ltr">{prop.default}</span>
                                    </td>
                                    <td class="min-w-56 px-4 py-3">{prop.text}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>

            <section id="styling" class="flex flex-col gap-5">
                <h2 class="text-2xl">التنسيق</h2>
                <p>الأيقونة عنصر <code dir="ltr" class="font-mono">svg</code> عادي، فتنسّقها كما تنسّق أي عنصر:</p>
                <ul class="flex flex-col gap-2">
                    <li>
                        <span class="font-semibold">الحجم:</span> غيّر <code dir="ltr" class="font-mono">width</code>
                        و<code dir="ltr" class="font-mono">height</code>، أو اضبطهما من CSS فيغلبان الخاصيتين.
                    </li>
                    <li>
                        <span class="font-semibold">اللون:</span> اضبط <code dir="ltr" class="font-mono">color</code> على
                        الأيقونة نفسها أو على أي عنصر يحتويها.
                    </li>
                </ul>
                <CodeBlock code={get_css_styling_example()} caption="CSS" />
                <p>وفي Tailwind تكفي فئة للحجم وأخرى للون:</p>
                <CodeBlock code={tailwind_styling_example} caption="Tailwind" />
                <h3 class="text-lg">ما يجب تجنّبه</h3>
                <ul class="flex flex-col gap-2">
                    <li>
                        لا تضبط <code dir="ltr" class="font-mono">fill</code> على الأيقونة من CSS: الأيقونات خطوط، وملء العنصر
                        يملأ أشكالها فتصير كتلاً.
                    </li>
                    <li>
                        لا تغيّر سُمك الخط بـ<code dir="ltr" class="font-mono">stroke-width</code> من CSS، للسبب المذكور في
                        <a href="#svg" class="text-primary underline underline-offset-4">النسخ والتنزيل</a>. استعمل لوحة
                        التخصيص، أو خاصية <code dir="ltr" class="font-mono">strokeWidth</code> في الحزمتين.
                    </li>
                </ul>
            </section>

            <section id="sizes" class="flex flex-col gap-5">
                <h2 class="text-2xl">أفضل الأحجام</h2>
                <p>
                    الأيقونات مرسومة على شبكة ٢٤ بخط ٢، وتُعرض بخط ١٫٦ مكبّرةً قليلاً حتى تملأ لوحتها، فتتسع الفراغات بين
                    تفاصيلها الغنية وتتزن مع أيقونات واجهتك بالحجم نفسه. تظهر واضحة من ٢٠ بكسل فما فوق، وأبهى ما تكون من
                    ٢٨ بكسل في البطاقات والعناوين.
                </p>
                <ul class="flex flex-wrap items-end gap-x-8 gap-y-6" aria-label="أيقونة المسجد بأحجام مختلفة">
                    {#each SIZE_DEMO as demo (demo.size)}
                        <li class="flex flex-col items-center gap-2">
                            <IslamIcon icon={SIZE_DEMO_ICON} size={demo.size} />
                            <span dir="ltr" class="font-mono text-sm text-muted-foreground">{demo.size}px</span>
                        </li>
                    {/each}
                </ul>
                <p>
                    وإن احتجتها بحجم ١٦ بكسل، في زر صغير أو بجوار نص، فخفّف الخط إلى
                    <code dir="ltr" class="font-mono">1.4</code> كي لا تتلاصق التفاصيل:
                </p>
                <ul class="flex flex-wrap items-end gap-x-8 gap-y-6" aria-label="مقارنة سُمك الخط في الأحجام الصغيرة">
                    {#each SMALL_DEMO as demo (`${demo.size}-${demo.stroke_width}`)}
                        <li class="flex flex-col items-center gap-2">
                            <IslamIcon icon={SIZE_DEMO_ICON} size={demo.size} stroke_width={demo.stroke_width} />
                            <span dir="ltr" class="font-mono text-sm text-muted-foreground"
                                >{demo.size}px ({demo.stroke_width})</span
                            >
                        </li>
                    {/each}
                </ul>
            </section>

            <section id="accessibility" class="flex flex-col gap-5">
                <h2 class="text-2xl">إمكانية الوصول</h2>
                <p>قارئ الشاشة يحتاج أن يعرف: هل الأيقونة زينة بجوار كلام يقول معناها، أم هي المعنى نفسه؟</p>
                <ul class="flex flex-col gap-2">
                    <li>
                        <span class="font-semibold">زينة بجوار نص:</span> أضف
                        <code dir="ltr" class="font-mono">aria-hidden="true"</code>، لأن النص يقول المعنى.
                    </li>
                    <li>
                        <span class="font-semibold">زر أو رابط بلا نص:</span> ضع الاسم على الزر نفسه بـ<code
                            dir="ltr"
                            class="font-mono">aria-label</code
                        >، وأخفِ الأيقونة.
                    </li>
                    <li>
                        <span class="font-semibold">أيقونة تحمل المعنى وحدها:</span> أضف
                        <code dir="ltr" class="font-mono">role="img"</code> و<code dir="ltr" class="font-mono"
                            >aria-label</code
                        > بوصف قصير.
                    </li>
                </ul>
                <CodeBlock code={get_a11y_example()} caption="index.html" />
                <p>ولا تجعل اللون وحده يحمل المعنى: إن دلّ لون الأيقونة على حالة، فاذكر الحالة بنص أيضاً.</p>
            </section>

            <section id="color" class="flex flex-col gap-5">
                <h2 class="text-2xl">الألوان والأجزاء المصمتة</h2>
                <p>
                    بعض الأيقونات فيها أجزاء مصمتة، مثل النجمة في <span class="font-medium">هلال ونجمة</span> أو النسخ
                    <span class="font-medium">المُصمَتة</span> من أيقونات المستخدم. هذه الأجزاء تُملأ بـ<code
                        dir="ltr"
                        class="font-mono">currentColor</code
                    > أيضاً، فتتبع اللون نفسه الذي تختاره للخط، وإن اخترت لوناً قبل النسخ أو التنزيل أخذته معه.
                </p>
                <ul class="flex flex-wrap gap-6 text-primary" aria-label="أمثلة على أيقونات فيها أجزاء مصمتة">
                    {#each FILLED_EXAMPLES as icon (icon.name)}
                        <li class="flex flex-col items-center gap-2">
                            <IslamIcon {icon} size={40} />
                            <span class="text-sm text-muted-foreground">{icon.title}</span>
                        </li>
                    {/each}
                </ul>
            </section>

            <section id="direction" class="flex flex-col gap-5">
                <h2 class="text-2xl">الاتجاه في الواجهات العربية</h2>
                <p>
                    الأيقونات لا تنعكس تلقائياً في الصفحات ذات الاتجاه من اليمين إلى اليسار، لأن أغلبها رموز لا اتجاه لها:
                    المسجد مسجد في كل لغة. أما ما له اتجاه فتجد له نسختين صريحتين، فاختر منهما ما يناسب سياقك.
                </p>
                <ul class="flex flex-wrap gap-6" aria-label="أمثلة على أيقونات لها نسختان">
                    {#each DIRECTIONAL_EXAMPLES as icon (icon.name)}
                        <li class="flex flex-col items-center gap-2">
                            <IslamIcon {icon} size={40} />
                            <span dir="ltr" class="font-mono text-sm text-muted-foreground">{icon.name}</span>
                        </li>
                    {/each}
                </ul>
            </section>

            <section id="search" class="flex flex-col gap-5">
                <h2 class="text-2xl">البحث والأسماء</h2>
                <p>
                    ابحث بالعربية أو بالإنجليزية من <a
                        href={href_in('/')}
                        class="text-primary underline underline-offset-4">صفحة الأيقونات</a
                    >، أو اضغط <kbd class="rounded-md bg-muted px-1.5 font-mono text-sm">/</kbd> لتنتقل إلى مربع البحث من
                    أي مكان فيها.
                </p>
                <ul class="flex flex-col gap-2">
                    <li>يتجاهل البحث التشكيل، ويساوي بين صور الهمزة، والتاء المربوطة والهاء، والألف المقصورة والياء.</li>
                    <li>يجد الكلمة مع «ال» وبدونها، فـ«المسجد» و«مسجد» سواء.</li>
                    <li>إن كتبت أكثر من كلمة فيجب أن تطابق الأيقونةُ كلَّ كلمة، وتظهر الأقرب أولاً.</li>
                </ul>
                <p>لكل أيقونة أربعة أسماء:</p>
                <ul class="flex flex-col gap-2">
                    <li>
                        <span class="font-semibold">اسم برمجي</span> بالإنجليزية وبحروف صغيرة تفصلها شَرطة، وهو اسم ملفها:
                        <code dir="ltr" class="font-mono">prayer-mat-rolled</code>.
                    </li>
                    <li>
                        <span class="font-semibold">اسم المكوّن</span> في الحزمتين بصيغة PascalCase:
                        <code dir="ltr" class="font-mono">PrayerMatRolled</code>.
                    </li>
                    <li><span class="font-semibold">عنوان عربي</span> يظهر في الموقع: سجادة صلاة (ملفوفة).</li>
                    <li>
                        <span class="font-semibold">عنوان إنجليزي</span> يظهر في الموقع الإنجليزي ويجده البحث أيضاً:
                        <span dir="ltr">Prayer mat (rolled)</span>.
                    </li>
                </ul>
            </section>

            <section id="standard" class="flex flex-col gap-5">
                <h2 class="text-2xl">معايير المكتبة</h2>
                <p>
                    هذه القواعد التي تُرسم بها كل أيقونة في المكتبة، وبها تتناسق فيما بينها وتعمل في أي مشروع. كل أيقونة
                    ملفان في مجلد <code dir="ltr" class="font-mono">icons/</code> يحملان اسمها.
                </p>
                <ul class="flex flex-col gap-3">
                    {#each RULES as rule (rule.title)}
                        <li class="flex gap-3">
                            <Icon id="check" class="mt-1 size-4.5 shrink-0 text-primary" />
                            <span><span class="font-semibold">{rule.title}:</span> {rule.text}</span>
                        </li>
                    {/each}
                </ul>
                <CodeBlock code={icon_svg_template} caption="icons/mosque.svg" />
                <CodeBlock code={icon_meta_example} caption="icons/mosque.json" />
                <p>
                    يتحقق الأمر <code dir="ltr" class="font-mono">{check_command}</code> من هذه القواعد كلها ويرفض كل أيقونة
                    تخالفها، ويعمل تلقائياً قبل كل بناء للموقع.
                </p>
            </section>

            <section id="contribute" class="flex flex-col gap-5">
                <h2 class="text-2xl">إضافة أيقونة</h2>
                <ol class="flex list-inside list-decimal flex-col gap-2 marker:text-muted-foreground">
                    <li>
                        ارسم الأيقونة على شبكة ٢٤ بخط ٢، واحفظها في
                        <code dir="ltr" class="font-mono">icons/&lt;name&gt;.svg</code> بخصائص الجذر القياسية.
                    </li>
                    <li>
                        أنشئ <code dir="ltr" class="font-mono">icons/&lt;name&gt;.json</code> بعنوانها العربي وعنوانها الإنجليزي
                        وكلمات البحث.
                    </li>
                    <li>
                        أضف اسمها إلى قائمة تصنيفها في <code dir="ltr" class="font-mono">icons/_categories.json</code>،
                        في الموضع الذي يجب أن تظهر فيه.
                    </li>
                    <li>شغّل الفحص، فإن مرّ ظهرت الأيقونة في الموقع عند البناء التالي دون أي تعديل في الشيفرة.</li>
                </ol>
                <CodeBlock code={check_command} caption="terminal" />
                <h3 class="text-lg">قواعد التسمية</h3>
                <ul class="flex flex-col gap-3">
                    {#each NAMING as rule (rule.title)}
                        <li class="flex gap-3">
                            <Icon id="check" class="mt-1 size-4.5 shrink-0 text-primary" />
                            <span><span class="font-semibold">{rule.title}:</span> {rule.text}</span>
                        </li>
                    {/each}
                </ul>
            </section>

            <section id="license" class="flex flex-col gap-5">
                <h2 class="text-2xl">الرخصة</h2>
                <p>
                    المكتبة مفتوحة المصدر برخصة MIT. يمكنك استعمال الأيقونات وتعديلها في مشاريعك الشخصية والتجارية مجاناً.
                    والشرط الوحيد أن يبقى نص الرخصة مع نسخ المكتبة أو أجزاء كبيرة منها، في ملف التراخيص مثلاً، ولا يُشترط
                    ذكرها في واجهة مشروعك.
                </p>
                <p class="text-sm text-muted-foreground">
                    رموز واجهة هذا الموقع، كالبحث والنسخ والتنزيل، من مكتبة
                    <a href="https://tabler.io/icons" class="underline underline-offset-4">Tabler Icons</a> برخصة MIT، وليست
                    جزءاً من المكتبة.
                </p>
            </section>
        </article>
    </div>
</div>

{#snippet contents()}
    <div class="flex flex-col gap-5">
        {#each CONTENTS as group (group.title)}
            <div class="flex flex-col gap-1">
                <p class="px-3 text-sm font-semibold">{group.title}</p>
                <ul class="flex flex-col gap-0.5 text-sm">
                    {#each group.items as item (item.id)}
                        <li>
                            <a
                                href="#{item.id}"
                                class="block rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                {item.title}
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/each}
    </div>
{/snippet}

<script>
import CodeBlock from '~/components/CodeBlock.svelte'
import IslamIcon from '~/components/IslamIcon.svelte'
import {PACKAGES} from '~/lib/constants.svelte.js'
import {count_icons} from '~/lib/format.js'
import {icon_named, icons} from '~/lib/icons.js'
import {href_in} from '~/lib/locale.js'
import {
    check_command,
    get_a11y_example,
    get_css_styling_example,
    get_html_example,
    icon_meta_example,
    icon_svg_template,
    install_command,
    react_props_example,
    svelte_props_example,
    tailwind_styling_example,
} from '~/lib/snippets.svelte.js'
import Icon from '$icon'

const CONTENTS = [
    {
        title: 'البدء',
        items: [
            {id: 'overview', title: 'نظرة عامة'},
            {id: 'svg', title: 'النسخ والتنزيل'},
        ],
    },
    {
        title: 'الحزم',
        items: [...PACKAGES.map(pkg => ({id: pkg.id, title: pkg.label})), {id: 'props', title: 'الخصائص'}],
    },
    {
        title: 'الاستعمال',
        items: [
            {id: 'styling', title: 'التنسيق'},
            {id: 'sizes', title: 'أفضل الأحجام'},
            {id: 'accessibility', title: 'إمكانية الوصول'},
            {id: 'color', title: 'الألوان والأجزاء المصمتة'},
            {id: 'direction', title: 'الاتجاه'},
        ],
    },
    {
        title: 'المكتبة',
        items: [
            {id: 'search', title: 'البحث والأسماء'},
            {id: 'standard', title: 'معايير المكتبة'},
            {id: 'contribute', title: 'إضافة أيقونة'},
            {id: 'license', title: 'الرخصة'},
        ],
    },
]

const FEATURES = [
    'شبكة ٢٤×٢٤ وخط بأطراف ووصلات مستديرة، في ملف SVG قياسي.',
    'لون واحد هو لون النص من حولها، يشمل الخطوط والأجزاء المصمتة.',
    'عنوان عربي وعنوان إنجليزي وكلمات بحث بالعربية والإنجليزية لكل أيقونة.',
    'رخصة MIT: مجانية للاستعمال الشخصي والتجاري.',
]

const PROPS = [
    {name: 'size', default: '24', text: 'العرض والارتفاع، رقماً بالبكسل أو أي قيمة CSS.'},
    {name: 'color', default: 'currentColor', text: 'لون الخط والأجزاء المصمتة.'},
    {
        name: 'strokeWidth',
        default: '1.6',
        text: 'سُمك الخط بالبكسل حين يكون حجم الأيقونة ٢٤. يُكبَّر الرسم أو يُصغَّر قليلاً على قدر الخط، فيبقى ملء اللوحة ولا يُقصّ طرف منه.',
    },
    {
        name: 'absoluteStrokeWidth',
        default: 'false',
        text: 'يُبقي سُمك الخط بالبكسل ثابتاً مهما كبرت الأيقونة أو صغرت، بدل أن يتناسب مع حجمها.',
    },
    {name: 'class / className', default: '—', text: 'فئات CSS تُضاف إلى عنصر svg.'},
    {
        name: '...',
        default: '—',
        text: 'بقية الخصائص تمرّ إلى عنصر svg كما هي، مثل aria-label وrole وdata-*.',
    },
]

const RULES = [
    {title: 'الجذر', text: 'خصائص عنصر svg هي الخصائص القياسية بالضبط، كما في القالب أدناه.'},
    {
        title: 'الشبكة والحدود',
        text: 'لوحة ٢٤×٢٤، وكل مسار بين ٢ و٢٢ من الجهات الأربع، فيبقى هامش بكسل حول الخط. تُقاس المنحنيات والأقواس على امتدادها لا عند أطرافها فقط.',
    },
    {title: 'الخط', text: 'سُمك ٢ في الرسم، بأطراف ووصلات مستديرة.'},
    {
        title: 'العرض',
        text: 'تُعرض الأيقونة بخط ١٫٦، وتُكبَّر حول مركزها حتى تبلغ حافة الخط حدود اللوحة تماماً (١٫١٢ مرة عند هذا السُمك)، في ملف SVG قياسي لوحته 0 0 24 24، بجذر يحمل overflow="visible" كي لا يقصّ المتصفح تلك الحافة.',
    },
    {
        title: 'العناصر',
        text: /* @wc-include */ 'path وcircle وellipse وrect وline وpolyline وpolygon فقط، بخصائص الهندسة وحدها.',
    },
    {
        title: 'الأجزاء المصمتة',
        text: 'تُملأ بـfill="currentColor" وحده، ولا تُستعمل إلا حين تكون جزءاً من المعنى، مثل نجمة الهلال.',
    },
    {
        title: 'الممنوع',
        text: 'لا معرّفات ولا فئات ولا أنماط ولا تحويلات ولا أقنعة ولا مجموعات ولا نصوص، كي تعمل الأيقونة في أي صفحة ولا تتعارض نسختان منها. والملف هو جذر svg تتبعه أشكال مغلقة ذاتياً لا غير، بعلامات تنصيص مزدوجة وأرقام عشرية عادية، وما لا يستطيع الفحص قراءته يفشل، ويرفض الموقع تحميله.',
    },
    {
        title: 'البيانات',
        text: 'ملف json فيه title وtitle_en وtags، بعنوان عربي وعنوان إنجليزي وكلمات بحث غير فارغة وغير مكررة ولا مسافة في طرفيها، وكلمات البحث لا تكرر الاسم ولا العنوان العربي ولا العنوان الإنجليزي ولا بعضها، وعنوان النسخة هو عنوان أصلها مع ما يميزها بين قوسين وعنوان الأصل بلا أقواس في اللغتين، والعناوين لا تتكرر، وfilled وoff آخر كلمة في الاسم، واسم الأيقونة في قائمة تصنيفها في _categories.json مرة واحدة، وكل أيقونة يسميها الموقع في src موجودة.',
    },
]

const NAMING = [
    {
        title: 'الاسم البرمجي',
        text: 'يسمّي معنى الأيقونة لا طريقة رسمها. علامات المصحف باسمها كما يكتبه Unicode (end-of-ayah وornate-parenthesis-left)، وما ليس مصطلحاً إسلامياً بالإنجليزية الواضحة (mosque وfont-size وdictionary). والنسخة تضيف بعد اسم أصلها كلمة لكل فرق (quran-ornate-simple)، وتأتي filled آخر كلمة، وoff للشطب على الرسم آخر كلمة كذلك (adhan-off)، ودبوس الخريطة map-pin يتبعه ما يدل عليه (map-pin-kaaba)، والاتجاهات كما في الرسم (left وright). والاسم الذي يبدأ باسم أيقونة أخرى تتبعه شَرطة نسخةٌ منها.',
    },
    {
        title: 'التهجئة',
        text: 'يُكتب المصطلح الإسلامي بالحروف اللاتينية كما يكتبه أول مصدر يذكره: واجهات المطوّرين (Aladhan وadhan-js وQuran.com)، ثم قاموس Merriam-Webster، ثم عنوان ويكيبيديا الإنجليزية (dhuhr وtawhid وtilawa وsalawat). وتذهب بقية التهجئات إلى كلمات البحث.',
    },
    {
        title: 'العنوان العربي',
        text: 'قصير يتسع له مربّع الأيقونة. الأفعال والمناسك والأوقات والعلوم والفريد بـ«ال» (السجود، الفجر، الكعبة)، والأشياء والأشخاص بلا «ال» (مسجد، مصحف). وعنوان الأصل بلا أقواس، وعنوان النسخة هو عنوان أصلها وما يميّزها بين قوسين، وفرق ثانٍ بعد «،» (الإحرام (لحية عريضة، مُصمَت)). والعناوين لا تتكرر.',
    },
    {
        title: 'العنوان الإنجليزي',
        text: "يبدأ بحرف كبير وبلا حروف عربية، وعلامة ﷺ مسموحة. ويُكتب المصطلح الإسلامي بتهجئة الاسم البرمجي مع حروفه الكبيرة وفاصلته العليا (Tawaf وDhuhr وTilawa وSa'i وAsbab al-Nuzul)، وما سواه إنجليزية واضحة (Mosque وPrayer mat). ويبقى المعنى الإنجليزي كلمة بحث (recitation وprostration). وعنوان الأصل بلا أقواس، وعنوان النسخة هو عنوان أصلها وما يميّزها بين قوسين، وفرق ثانٍ بعد فاصلة إنجليزية (Ihram (wide beard, filled))، ونسخة filled آخر ما بين قوسيها كلمة filled. والعناوين لا تتكرر.",
    },
    {
        title: 'كلمات البحث',
        text: 'لا تكرر ما يجده البحث أصلاً: الاسم والعنوان العربي والعنوان الإنجليزي وصورة «ال» والهمزة والتاء المربوطة والياء والتشكيل. لكل مفهوم عربي مقابله الإنجليزي وبالعكس، وكل تهجئة إنجليزية شائعة موجودة (salat وnamaz)، والكلمات الإنجليزية بأحرف صغيرة، والاسم القديم الذي يبحث عنه الناس يبقى كلمة بحث.',
    },
    {
        title: 'الترتيب',
        text: 'داخل التصنيف بالترتيب الذي يلقاه المستخدم: أوقات الصلاة على مدار اليوم، وأركان الصلاة بترتيبها، ومناسك الحج كما تُؤدّى، والأصل قبل نسخه.',
    },
]

const SIZE_DEMO_ICON = icon_named('mosque')
const SIZE_DEMO = [16, 20, 24, 32, 48].map(size => ({size}))
const SMALL_DEMO = [
    {size: 16, stroke_width: 1.6},
    {size: 16, stroke_width: 1.4},
    {size: 20, stroke_width: 1.6},
    {size: 20, stroke_width: 1.4},
]

const FILLED_EXAMPLES = ['star-and-crescent', 'quran-crescent', 'user-beard-filled'].map(icon_named)
const DIRECTIONAL_EXAMPLES = [
    'ornate-parenthesis-right',
    'ornate-parenthesis-left',
    'mosque-minaret-right',
    'mosque-minaret-left',
].map(icon_named)
</script>
