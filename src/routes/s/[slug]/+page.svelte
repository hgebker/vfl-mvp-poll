<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import LockIcon from '@lucide/svelte/icons/lock';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selected = $state<string[]>([]);

	function toggle(playerId: string, checked: boolean) {
		if (checked) {
			if (selected.length < 2) selected = [...selected, playerId];
		} else {
			selected = selected.filter((id) => id !== playerId);
		}
	}
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<div class="page">
	<div class="flex flex-col items-center gap-2 text-center">
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Matchday vote</h3>
		<p class="text-muted-foreground">{data.title}</p>
	</div>

	{#if form?.success}
		<Card>
			<CardContent class="flex flex-col items-center gap-2 py-10 text-center">
				<div class="bg-primary/15 text-primary rounded-full p-4">
					<CheckIcon class="size-8" strokeWidth={3} />
				</div>
				<p class="text-lg font-semibold">Thanks for voting!</p>
				<p class="text-muted-foreground">Results will be shown once the survey is closed.</p>
			</CardContent>
		</Card>
	{:else if data.status === 'upcoming'}
		<Card>
			<CardContent class="flex flex-col items-center gap-2 py-10 text-center">
				<div class="bg-muted text-muted-foreground rounded-full p-4">
					<ClockIcon class="size-8" strokeWidth={2} />
				</div>
				<p class="text-lg font-semibold">Voting hasn't opened yet</p>
				<p class="text-muted-foreground">Check back soon.</p>
			</CardContent>
		</Card>
	{:else if data.status === 'closed'}
		<Card>
			<CardContent class="flex flex-col items-center gap-2 py-10 text-center">
				<div class="bg-muted text-muted-foreground rounded-full p-4">
					<LockIcon class="size-8" strokeWidth={2} />
				</div>
				<p class="text-lg font-semibold">Voting has closed</p>
				<p class="text-muted-foreground">Check out the results instead.</p>
				<Button href={resolve('/s/[slug]/results', { slug: data.slug })} variant="secondary">
					See results
				</Button>
			</CardContent>
		</Card>
	{:else if data.alreadyVoted}
		<Card>
			<CardContent class="flex flex-col items-center gap-2 py-10 text-center">
				<div class="bg-muted text-muted-foreground rounded-full p-4">
					<CheckIcon class="size-8" strokeWidth={2} />
				</div>
				<p class="text-lg font-semibold">You've already voted</p>
				<p class="text-muted-foreground">Thanks for voting!</p>
			</CardContent>
		</Card>
	{:else}
		<div class="flex items-center justify-between px-1">
			<p class="text-muted-foreground text-sm font-bold tracking-wide uppercase">Tap 2 players</p>
			<div class="flex gap-1.5">
				{#each [0, 1] as i (i)}
					<div
						class={[
							'flex size-7 items-center justify-center rounded-full text-sm font-bold',
							i < selected.length
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-muted-foreground'
						]}
					>
						{i + 1}
					</div>
				{/each}
			</div>
		</div>

		<form method="POST" class="flex flex-col gap-4">
			<div class="flex flex-col gap-3">
				{#each data.roster as player (player.id)}
					{@const isSelected = selected.includes(player.id)}
					{@const isDisabled = !isSelected && selected.length >= 2}
					<label
						class={[
							'flex items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-colors',
							isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card',
							isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
						]}
					>
						<Checkbox
							name="playerIds"
							value={player.id}
							checked={isSelected}
							disabled={isDisabled}
							onCheckedChange={(checked) => toggle(player.id, checked === true)}
						/>
						<span class="text-lg font-semibold"
							>#{player.jerseyNumber} {player.firstName} {player.lastName}</span
						>
					</label>
				{/each}
			</div>

			{#if form?.error}
				<p class="text-destructive text-center font-medium">{form.error}</p>
			{/if}

			<Button type="submit" size="lg" disabled={selected.length !== 2}>Vote now</Button>
		</form>
	{/if}
</div>
