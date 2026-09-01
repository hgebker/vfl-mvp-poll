<script lang="ts">
	import { BarChart } from 'layerchart';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { ChartContainer, type ChartConfig } from '$lib/components/ui/chart/index.js';
	import SelectedPlayers from '$lib/components/selected-players.svelte';
	import PollNavTabs from '$lib/components/poll-nav-tabs.svelte';
	import type { PageData } from './$types';

	const chartConfig = {
		votes: {
			label: 'Votes',
			color: 'var(--primary)'
		}
	} satisfies ChartConfig;

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<div class="page">
	<PollNavTabs />

	<div class="flex flex-col items-center gap-2 text-center">
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">{data.title}</h3>
		<p class="text-muted-foreground">Results</p>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Votes per player</CardTitle>
		</CardHeader>

		<CardContent>
			<ChartContainer
				config={chartConfig}
				class="aspect-auto"
				style="height: {56 * data.results.length + 32}px"
			>
				<BarChart
					data={data.results}
					x="votes"
					y="name"
					orientation="horizontal"
					series={[{ key: 'votes', color: 'var(--color-votes)' }]}
					padding={{ left: 72, right: 24, bottom: 24 }}
					labels
					props={{
						bars: { rounded: 'right', radius: 8 },
						yAxis: {
							format: (value: string) => value.replace(' ', '\n'),
							tickLabelProps: { lineHeight: '1.1em' }
						},
						labels: {
							class: 'text-[10px]',
							format: (value: number) => Math.round(value).toString()
						}
					}}
				></BarChart>
			</ChartContainer>
		</CardContent>
	</Card>

	<SelectedPlayers
		players={data.results.map((r) => ({
			id: r.playerId,
			firstName: r.firstName,
			lastName: r.lastName,
			jerseyNumber: r.jerseyNumber,
			votes: r.votes
		}))}
	/>
</div>
