<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';

	// The app is dark-by-default with no runtime theme toggle (see app.html), so the
	// toaster theme is pinned rather than tracked via mode-watcher.
	let restProps: SonnerProps = $props();
</script>

<Sonner
	theme="dark"
	class="toaster group"
	style="--normal-bg: var(--popover); --normal-text: var(--popover-foreground); --normal-border: var(--border);"
	{...restProps}
/>
