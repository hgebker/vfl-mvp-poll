<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
	import { cn } from '$lib/utils.js';
	import { DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const df = new DateFormatter('en-GB', { dateStyle: 'long' });

	let opponent = $state('');
	let matchDate = $state<DateValue | undefined>(undefined);
	let homeAway = $state('home');
</script>

<svelte:head>
	<title>New poll</title>
</svelte:head>

<div class="page">
	<div class="flex flex-col items-center gap-2 text-center">
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">New poll</h3>
	</div>

	<form method="POST" class="flex flex-col gap-4">
		<Card>
			<CardHeader>
				<CardTitle>Match Details</CardTitle>
				<CardDescription>Enter basic details about the match.</CardDescription>
			</CardHeader>

			<CardContent class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<Label for="opponent">Opponent</Label>
					<Input id="opponent" name="opponent" bind:value={opponent} required />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="matchDate">Match date</Label>
					<input type="hidden" name="matchDate" value={matchDate ? matchDate.toString() : ''} />
					<Popover.Root>
						<Popover.Trigger id="matchDate">
							{#snippet child({ props })}
								<Button
									{...props}
									variant="outline"
									class={cn(
										'justify-start text-left font-normal',
										!matchDate && 'text-muted-foreground'
									)}
								>
									<CalendarIcon />
									{matchDate ? df.format(matchDate.toDate(getLocalTimeZone())) : 'Pick a date'}
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<Calendar type="single" bind:value={matchDate} />
						</Popover.Content>
					</Popover.Root>
				</div>

				<fieldset class="flex flex-col gap-2">
					<legend class="mb-1 text-sm font-semibold">Home or away?</legend>
					<RadioGroup bind:value={homeAway} name="homeAway" class="grid-cols-2 gap-3!">
						<Label
							class="border-border has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/10 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium"
						>
							<RadioGroupItem value="home" />
							Home
						</Label>
						<Label
							class="border-border has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/10 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium"
						>
							<RadioGroupItem value="away" />
							Away
						</Label>
					</RadioGroup>
				</fieldset>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Match Roster</CardTitle>
				<CardDescription>
					Pick who's votable — visitors will choose two of these players as MVP.
				</CardDescription>
			</CardHeader>

			<CardContent>
				{#if data.players.length === 0}
					<p class="text-muted-foreground text-sm">
						No active players yet. Add some in
						<a href={resolve('/(app)/admin/players')} class="text-primary underline">player admin</a
						>
						first.
					</p>
				{/if}

				<div class="flex flex-col gap-2">
					{#each data.players as player (player.id)}
						<Label
							class="border-border has-[[data-state=checked]]:border-primary flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium"
						>
							<Checkbox name="rosterPlayerIds" value={player.id} />
							#{player.jerseyNumber}
							{player.firstName}
							{player.lastName}
						</Label>
					{/each}
				</div>
			</CardContent>
		</Card>

		{#if form?.error}
			<p class="text-destructive text-center font-medium">{form.error}</p>
		{/if}

		<Button type="submit" size="lg">Create poll</Button>
	</form>
</div>
