<div class="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-28 text-center">
    <IslamIcon icon={icon_named('qibla-arrow')} size={64} class="text-gold" />
    <div class="flex flex-col gap-2">
        <h1 class="text-3xl">ضلّت هذه الصفحة طريقها</h1>
        <p class="text-muted-foreground">الرابط غير صحيح أو نُقلت الصفحة. ارجع إلى الأيقونات وستجد ما تبحث عنه.</p>
    </div>
    <Button href={href_in('/')}>
        <Icon id="layout-grid" />
        تصفّح الأيقونات
    </Button>
</div>

<script>
import IslamIcon from '~/components/IslamIcon.svelte'
import {icon_named} from '~/lib/icons.js'
import {href_in} from '~/lib/locale.js'
import Icon from '$icon'
import {Button} from '$ui/button/index.js'
</script>
