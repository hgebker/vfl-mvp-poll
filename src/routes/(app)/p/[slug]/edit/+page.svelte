<script lang="ts">
	import { enhance } from '$app/forms';
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
	import {
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		type DateValue
	} from '@internationalized/date';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const df = new DateFormatter(getLocale(), { dateStyle: 'long' });

	function toLocalIsoDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	let opponent = $state(data.opponent);
	let matchDate = $state<DateValue | undefined>(
		parseDate(toLocalIsoDate(new Date(data.matchDate)))
	);
	let homeAway = $state(data.homeAway);
	let selectedPlayerIds = $state<string[]>([...data.rosterPlayerIds]);

	function togglePlayer(playerId: string, checked: boolean) {
		selectedPlayerIds = checked
			? [...selectedPlayerIds, playerId]
			: selectedPlayerIds.filter((id) => id !== playerId);
	}
	function selectAll() {
		selectedPlayerIds = data.players.map((p) => p.id);
	}
	function deselectAll() {
		selectedPlayerIds = [];
	}
</script>

<svelte:head>
	<title>{m.edit_head_title()} · {m.app_title()}</title>
</svelte:head>

<div class="page">
	<div class="flex flex-col items-center gap-2 text-center">
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">{m.edit_title()}</h3>
	</div>

	<form method="POST" use:enhance class="flex flex-col gap-4">
		<Card>
			<CardHeader>
				<CardTitle>{m.create_match_details_title()}</CardTitle>
				<CardDescription>{m.create_match_details_desc()}</CardDescription>
			</CardHeader>

			<CardContent class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<Label for="opponent">{m.create_opponent_label()}</Label>
					<Input id="opponent" name="opponent" bind:value={opponent} required />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="matchDate">{m.create_match_date_label()}</Label>
					<input type="hidden" name="matchDate" value={matchDate ? matchDate.toString() : ''} />
					<Popover.Root>
						<Popover.Trigger id="matchDate">
							{#snippet child({ props })}
								<Button
									{...props}
									variant="outline"
									size="lg"
									class={cn(
										'justify-start text-left font-normal',
										!matchDate && 'text-muted-foreground'
									)}
								>
									<CalendarIcon />
									{matchDate
										? df.format(matchDate.toDate(getLocalTimeZone()))
										: m.create_pick_date()}
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<Calendar type="single" bind:value={matchDate} />
						</Popover.Content>
					</Popover.Root>
				</div>

				<fieldset class="flex flex-col gap-2">
					<legend class="mb-1 text-sm font-semibold">{m.create_home_or_away_label()}</legend>
					<RadioGroup bind:value={homeAway} name="homeAway" class="grid-cols-2 gap-3!">
						<Label
							class="border-border has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/10 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium"
						>
							<RadioGroupItem value="home" />
							{m.create_home()}
						</Label>
						<Label
							class="border-border has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/10 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium"
						>
							<RadioGroupItem value="away" />
							{m.create_away()}
						</Label>
					</RadioGroup>
				</fieldset>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>{m.create_roster_title()}</CardTitle>
				<CardDescription>
					{m.create_roster_desc()}
				</CardDescription>
			</CardHeader>

			<CardContent>
				{#if data.players.length === 0}
					<p class="text-muted-foreground text-sm">
						{m.create_no_players_before_link()}
						<a href={resolve('/(app)/admin/players')} class="text-primary underline"
							>{m.create_no_players_link()}</a
						>
						{m.create_no_players_after_link()}
					</p>
				{/if}

				{#if data.players.length > 0}
					<div class="mb-2 flex gap-2">
						<Button type="button" variant="outline" size="lg" class="flex-1" onclick={selectAll}>
							{m.create_select_all()}
						</Button>
						<Button type="button" variant="outline" size="lg" class="flex-1" onclick={deselectAll}>
							{m.create_deselect_all()}
						</Button>
					</div>
				{/if}

				<div class="flex flex-col gap-2">
					{#each data.players as player (player.id)}
						{@const isSelected = selectedPlayerIds.includes(player.id)}
						<Label
							class="border-border has-[[data-state=checked]]:border-primary flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium"
						>
							<Checkbox
								name="rosterPlayerIds"
								value={player.id}
								checked={isSelected}
								onCheckedChange={(checked) => togglePlayer(player.id, checked === true)}
							/>
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

		<Button type="submit" size="lg">{m.edit_submit()}</Button>
	</form>
</div>
