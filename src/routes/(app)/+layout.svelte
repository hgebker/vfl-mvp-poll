<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

{#if data.teamId}
	<Sidebar.Provider>
		<AppSidebar surveys={data.surveys} />
		<Sidebar.Inset>
			<header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
				<Sidebar.Trigger />
			</header>
			<main class="flex-1">
				{@render children()}
			</main>
		</Sidebar.Inset>
	</Sidebar.Provider>
{:else}
	{@render children()}
{/if}
