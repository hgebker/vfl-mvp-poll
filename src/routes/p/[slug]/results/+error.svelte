<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import PollNavTabs from '$lib/components/poll-nav-tabs.svelte';
	import LockIcon from '@lucide/svelte/icons/lock';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import * as m from '$lib/paraglide/messages';

	const slug = $derived(page.params.slug!);
	const isHidden = $derived(page.status === 403);
	const isNotFound = $derived(page.status === 404);
	const isAdmin = $derived(Boolean(page.data.teamId));
	const title = $derived(page.error?.title);
</script>

<svelte:head>
	<title
		>{title ??
			(isHidden
				? m.results_head_error_not_available_title()
				: m.results_head_error_generic_title())} · {m.app_title()}</title
	>
</svelte:head>

<div class="page">
	{#if !isNotFound}
		<PollNavTabs />
	{/if}

	{#if title}
		<div class="flex flex-col items-center gap-2 text-center">
			<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">{title}</h3>
			<p class="text-muted-foreground">{m.results_title()}</p>
		</div>
	{/if}

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
				{isHidden ? m.results_head_error_not_available_title() : m.results_head_error_generic_title()}
			</p>
			<p class="text-muted-foreground">{page.error?.message}</p>
			{#if !isNotFound}
				{#if isAdmin}
					<Button
						href={resolve('/p/[slug]', { slug })}
						target="_blank"
						rel="noopener noreferrer"
						variant="secondary"
						size="lg"
					>
						{m.results_open_voter_view()}
						<ExternalLinkIcon class="size-4" />
					</Button>
				{:else}
					<Button href={resolve('/p/[slug]', { slug })} variant="secondary" size="lg"
						>{m.results_back_to_vote()}</Button
					>
				{/if}
			{/if}
		</CardContent>
	</Card>
</div>
