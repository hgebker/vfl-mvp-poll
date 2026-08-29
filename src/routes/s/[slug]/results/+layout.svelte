<script lang="ts">
	import AppShell from '$lib/components/app-shell.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

{#if data.teamId}
	<AppShell surveys={data.surveys}>
		{@render children()}
	</AppShell>
{:else}
	{@render children()}
{/if}
