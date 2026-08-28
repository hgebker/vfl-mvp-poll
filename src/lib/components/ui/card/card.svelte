<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | null;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		'bg-card text-card-foreground border-border rounded-xl border shadow-sm',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
