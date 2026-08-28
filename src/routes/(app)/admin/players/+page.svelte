<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let firstName = $state('');
	let lastName = $state('');
</script>

<div class="page">
	<h1 class="font-display text-center text-3xl">Players</h1>

	<Card>
		<CardContent>
			<form method="POST" action="?/create" use:enhance class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<Label for="firstName">First name</Label>
					<Input id="firstName" name="firstName" bind:value={firstName} required />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="lastName">Last name</Label>
					<Input id="lastName" name="lastName" bind:value={lastName} required />
				</div>
				{#if form?.error}
					<p class="text-destructive text-center font-medium">{form.error}</p>
				{/if}
				<Button type="submit" size="lg">Add player</Button>
			</form>
		</CardContent>
	</Card>

	<ul class="flex flex-col gap-2">
		{#each data.players as player (player.id)}
			<li class="bg-secondary/60 flex items-center justify-between rounded-2xl px-4 py-3">
				<span class={['font-medium', !player.active && 'text-muted-foreground line-through']}>
					{player.firstName}
					{player.lastName}
				</span>
				<form method="POST" action="?/toggleActive" use:enhance>
					<input type="hidden" name="playerId" value={player.id} />
					<input type="hidden" name="active" value={(!player.active).toString()} />
					<Switch
						checked={player.active}
						onclick={(e: MouseEvent) =>
							(e.currentTarget as HTMLElement)?.closest('form')?.requestSubmit()}
					/>
				</form>
			</li>
		{/each}
	</ul>
</div>
