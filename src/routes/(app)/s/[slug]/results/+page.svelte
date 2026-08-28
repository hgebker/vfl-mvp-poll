<script lang="ts">
	import { BarChart, LineChart } from 'layerchart';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="page">
	<h1 class="font-display text-center text-3xl">{data.title}</h1>
	<p class="text-muted-foreground text-center">Results</p>

	<Card>
		<CardContent>
			<h2 class="font-display text-xl">Votes per player</h2>
			<div class="h-[300px]">
				<BarChart
					data={data.results}
					x="name"
					y="votes"
					orientation="horizontal"
					props={{ bars: { rounded: 'right', radius: 8, fill: 'var(--primary)' } }}
				/>
			</div>
		</CardContent>
	</Card>

	{#if data.timeline.length > 0}
		<Card>
			<CardContent>
				<h2 class="font-display text-xl">Vote arrival timeline</h2>
				<div class="h-[300px]">
					<LineChart
						data={data.timeline}
						x="bucket"
						y="votes"
						props={{ spline: { stroke: 'var(--primary)', 'stroke-width': 3 } }}
					/>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
