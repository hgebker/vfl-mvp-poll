<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import HouseIcon from '@lucide/svelte/icons/house';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	type Props = {
		opponent: string;
		homeAway: 'home' | 'away';
		matchDate: string | Date;
		status: 'upcoming' | 'open' | 'closed';
		/** Optional section label above the title, e.g. "Results" in the public view. */
		eyebrow?: string;
	};

	let { opponent, homeAway, matchDate, status, eyebrow }: Props = $props();

	const statusDot = {
		upcoming: 'bg-muted-foreground',
		open: 'bg-emerald-500',
		closed: 'bg-destructive'
	} as const;

	const statusLabel = {
		upcoming: m.poll_status_upcoming,
		open: m.poll_status_open,
		closed: m.poll_status_closed
	} as const;

	const date = $derived(
		new Date(matchDate).toLocaleDateString(getLocale(), {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		})
	);
</script>

<div class="mb-2 flex flex-col items-center gap-2 text-center">
	{#if eyebrow}
		<p class="text-muted-foreground text-sm font-bold tracking-wide uppercase">{eyebrow}</p>
	{/if}
	<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">{opponent}</h3>
	<div
		class="text-muted-foreground flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm"
	>
		<span class="inline-flex items-center gap-1.5">
			{#if homeAway === 'home'}
				<HouseIcon class="size-4" />
				{m.create_home()}
			{:else}
				<PlaneIcon class="size-4" />
				{m.create_away()}
			{/if}
		</span>
		<span class="inline-flex items-center gap-1.5">
			<CalendarIcon class="size-4" />
			{date}
		</span>
		<Badge variant="secondary" class="gap-1.5">
			<span class={['size-2 rounded-full', statusDot[status]]}></span>
			{statusLabel[status]()}
		</Badge>
	</div>
</div>
