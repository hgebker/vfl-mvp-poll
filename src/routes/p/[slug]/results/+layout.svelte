<script lang="ts">
	import AppShell from '$lib/components/app-shell.svelte';
	import PublicHeader from '$lib/components/public-header.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

{#if data.teamId}
	<AppShell polls={data.polls}>
		{@render children()}
	</AppShell>
{:else}
	<PublicHeader />
	{@render children()}
{/if}
