<script lang="ts">
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<header class="flex h-14 shrink-0 items-center gap-2 px-4">
	<div class="flex items-center gap-2">
		<img src="/favicon.svg" alt="" class="size-7 shrink-0" />
		<span class="font-display text-base font-semibold">{m.app_title()}</span>
	</div>
	<div class="ml-auto flex items-center gap-2">
		<LanguageSwitcher />
	</div>
</header>
