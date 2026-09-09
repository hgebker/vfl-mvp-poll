<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as m from '$lib/paraglide/messages';

	type Player = {
		id: string;
		firstName: string;
		lastName: string;
		jerseyNumber: number;
		votes?: number;
	};

	let { players }: { players: Player[] } = $props();

	const showVotes = $derived(players.some((p) => p.votes !== undefined));
	const sorted = $derived(
		showVotes
			? [...players].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
			: [...players].sort((a, b) => a.jerseyNumber - b.jerseyNumber)
	);
</script>

<Card>
	<CardHeader>
		<CardTitle>{m.selected_players_title({ count: players.length })}</CardTitle>
		<CardDescription>
			{m.selected_players_desc()}
		</CardDescription>
	</CardHeader>

	<CardContent>
		<ul class="flex flex-col gap-2 pt-1">
			{#each sorted as player (player.id)}
				<li
					class="bg-secondary/60 flex items-center justify-between gap-3 rounded-lg px-4 py-2 font-medium"
				>
					<span>#{player.jerseyNumber} {player.firstName} {player.lastName}</span>
					{#if player.votes !== undefined}
						<Badge variant="secondary">
							{player.votes}
							{player.votes === 1 ? m.selected_players_vote_singular() : m.selected_players_vote_plural()}
						</Badge>
					{/if}
				</li>
			{/each}
		</ul>
	</CardContent>
</Card>
