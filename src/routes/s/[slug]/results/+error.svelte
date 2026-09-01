<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import SurveyNavTabs from '$lib/components/survey-nav-tabs.svelte';
	import LockIcon from '@lucide/svelte/icons/lock';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';

	const slug = $derived(page.params.slug!);
	const isHidden = $derived(page.status === 403);
</script>

<div class="page">
	<SurveyNavTabs />

	<Card>
		<CardContent class="flex flex-col items-center gap-2 py-10 text-center">
			<div class="bg-muted text-muted-foreground rounded-full p-4">
				{#if isHidden}
					<LockIcon class="size-8" strokeWidth={2} />
				{:else}
					<CircleAlertIcon class="size-8" strokeWidth={2} />
				{/if}
			</div>
			<p class="text-lg font-semibold">
				{isHidden ? "Results aren't available yet" : 'Something went wrong'}
			</p>
			<p class="text-muted-foreground">{page.error?.message}</p>
			<Button href={resolve('/s/[slug]', { slug })} variant="secondary">Back to vote</Button>
		</CardContent>
	</Card>
</div>
