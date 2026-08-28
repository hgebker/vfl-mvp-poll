<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-background min-h-dvh">
	{@render children()}
</div>

<Toaster richColors position="top-center" />
