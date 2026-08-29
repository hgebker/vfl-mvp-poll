<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils.js';

	const slug = $derived(page.params.slug!);
	const isManage = $derived(page.route.id === '/(app)/s/[slug]/manage');
	const isResults = $derived(page.route.id === '/s/[slug]/results');
</script>

{#if page.data.teamId}
	<div class="bg-secondary/60 mx-auto flex w-full gap-1 rounded-full p-1">
		<a
			href={resolve('/(app)/s/[slug]/manage', { slug })}
			class={cn(
				'flex-1 rounded-full px-4 py-1.5 text-center text-sm font-medium transition-colors',
				isManage ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
			)}
		>
			Manage
		</a>
		<a
			href={resolve('/s/[slug]/results', { slug })}
			class={cn(
				'flex-1 rounded-full px-4 py-1.5 text-center text-sm font-medium transition-colors',
				isResults ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
			)}
		>
			Results
		</a>
	</div>
{/if}
