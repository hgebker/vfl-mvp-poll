<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import {
		Sheet,
		SheetContent,
		SheetFooter,
		SheetHeader,
		SheetTitle
	} from '$lib/components/ui/sheet/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import * as m from '$lib/paraglide/messages';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type Player = (typeof data.players)[number];

	let firstName = $state('');
	let lastName = $state('');
	let jerseyNumber = $state('');

	let editingPlayer: Player | null = $state(null);
	let editSheetOpen = $state(false);
	let editFirstName = $state('');
	let editLastName = $state('');
	let editJerseyNumber = $state('');

	function openEditSheet(player: Player) {
		editingPlayer = player;
		editFirstName = player.firstName;
		editLastName = player.lastName;
		editJerseyNumber = String(player.jerseyNumber);
		editSheetOpen = true;
	}
</script>

<svelte:head>
	<title>{m.players_head_title()}</title>
</svelte:head>

<div class="page">
	<div class="flex flex-col items-center gap-2 text-center">
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">{m.players_title()}</h3>
	</div>

	<Card>
		<CardContent>
			<form method="POST" action="?/create" use:enhance class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<Label for="firstName">{m.players_first_name_label()}</Label>
					<Input id="firstName" name="firstName" bind:value={firstName} required />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="lastName">{m.players_last_name_label()}</Label>
					<Input id="lastName" name="lastName" bind:value={lastName} required />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="jerseyNumber">{m.players_jersey_number_label()}</Label>
					<Input
						id="jerseyNumber"
						name="jerseyNumber"
						type="number"
						min="0"
						max="99"
						bind:value={jerseyNumber}
						required
					/>
				</div>
				{#if form?.error}
					<p class="text-destructive text-center font-medium">{form.error}</p>
				{/if}
				<Button type="submit" size="lg">{m.players_add_submit()}</Button>
			</form>
		</CardContent>
	</Card>

	<ul class="flex flex-col gap-2">
		{#each data.players as player (player.id)}
			<li class="bg-secondary/60 flex items-center justify-between rounded-2xl px-4 py-3">
				<span class={['font-medium', !player.active && 'text-muted-foreground line-through']}>
					#{player.jerseyNumber}
					{player.firstName}
					{player.lastName}
				</span>
				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						aria-label={m.players_edit_aria_label()}
						onclick={() => openEditSheet(player)}
					>
						<PencilIcon class="size-4" />
					</Button>

					<AlertDialog>
						<AlertDialogTrigger>
							{#snippet child({ props })}
								<Button {...props} variant="ghost" size="icon" aria-label={m.players_delete_aria_label()}>
									<Trash2Icon class="size-4" />
								</Button>
							{/snippet}
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>{m.players_delete_confirm_title()}</AlertDialogTitle>
								<AlertDialogDescription>
									{m.players_delete_confirm_desc({
										name: `${player.firstName} ${player.lastName}`
									})}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>{m.players_cancel()}</AlertDialogCancel>
								<form method="POST" action="?/delete" use:enhance class="w-full sm:w-auto">
									<input type="hidden" name="playerId" value={player.id} />
									<AlertDialogAction type="submit" variant="destructive" class="w-full">
										{m.players_delete_submit()}
									</AlertDialogAction>
								</form>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					<form
						method="POST"
						action="?/toggleActive"
						use:enhance
						class="flex h-9 items-center justify-center"
					>
						<input type="hidden" name="playerId" value={player.id} />
						<input type="hidden" name="active" value={(!player.active).toString()} />
						<Switch
							checked={player.active}
							onclick={(e: MouseEvent) =>
								(e.currentTarget as HTMLElement)?.closest('form')?.requestSubmit()}
						/>
					</form>
				</div>
			</li>
		{/each}
	</ul>

	<Sheet bind:open={editSheetOpen}>
		<SheetContent>
			<SheetHeader>
				<SheetTitle>{m.players_edit_sheet_title()}</SheetTitle>
			</SheetHeader>
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					return async ({ update, result }) => {
						await update();
						if (result.type !== 'failure') {
							editSheetOpen = false;
						}
					};
				}}
				class="flex flex-col gap-4 px-4"
			>
				<input type="hidden" name="playerId" value={editingPlayer?.id} />
				<div class="flex flex-col gap-2">
					<Label for="editFirstName">{m.players_first_name_label()}</Label>
					<Input id="editFirstName" name="firstName" bind:value={editFirstName} required />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="editLastName">{m.players_last_name_label()}</Label>
					<Input id="editLastName" name="lastName" bind:value={editLastName} required />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="editJerseyNumber">{m.players_jersey_number_label()}</Label>
					<Input
						id="editJerseyNumber"
						name="jerseyNumber"
						type="number"
						min="0"
						max="99"
						bind:value={editJerseyNumber}
						required
					/>
				</div>
				{#if form?.error}
					<p class="text-destructive text-center font-medium">{form.error}</p>
				{/if}
				<SheetFooter>
					<Button type="submit" size="lg">{m.players_save_changes()}</Button>
				</SheetFooter>
			</form>
		</SheetContent>
	</Sheet>
</div>
