<script lang="ts">
	import { getLocale, locales, setLocale } from '$lib/paraglide/runtime';

	type Locale = (typeof locales)[number];

	const localeLabels: Record<Locale, { code: string; name: string }> = {
		en: { code: 'EN', name: 'English' },
		de: { code: 'DE', name: 'Deutsch' }
	};

	function onchange(event: Event & { currentTarget: HTMLSelectElement }) {
		setLocale(event.currentTarget.value as Locale);
	}
</script>

<select
	aria-label="Language"
	value={getLocale()}
	{onchange}
	class="lang-select h-9 rounded-md px-2 text-sm font-medium outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
>
	<button type="button" class="lang-trigger flex items-center gap-1">
		<selectedcontent></selectedcontent>
	</button>

	{#each locales as locale (locale)}
		<option value={locale} class="lang-option">
			<span class="lang-option-code">{localeLabels[locale].code}</span>
			<span class="lang-option-name">{localeLabels[locale].name}</span>
		</option>
	{/each}
</select>

<style>
	.lang-select {
		appearance: base-select;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* browsers without customizable-select support ignore <button>/<selectedcontent>
	   and fall back to a plain native select showing the selected option's text */
	.lang-trigger {
		appearance: base-select;
		display: flex;
		align-items: center;
		border: none;
		background: none;
		color: inherit;
	}

	.lang-select::picker-icon {
		align-self: center;
		color: var(--muted-foreground);
	}

	.lang-trigger selectedcontent .lang-option-name {
		display: none;
	}

	.lang-select::picker(select) {
		appearance: base-select;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--popover);
		color: var(--popover-foreground);
		padding: 0.25rem;
		margin-top: 0.25rem;
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
	}

	.lang-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: calc(var(--radius) - 4px);
		padding: 0.375rem 0.5rem;
		font-size: 0.875rem;
		color: var(--popover-foreground);
	}

	.lang-option-code {
		font-weight: 600;
		width: 1.5rem;
	}

	.lang-option-name {
		color: var(--muted-foreground);
	}

	.lang-option:hover,
	.lang-option:focus {
		background: var(--accent);
		color: var(--accent-foreground);
	}

	.lang-option:checked {
		background: var(--accent);
		color: var(--accent-foreground);
	}
</style>
