<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		class: className,
		...restProps
	}: CheckboxPrimitive.RootProps = $props();
</script>

<CheckboxPrimitive.Root
	bind:ref
	bind:checked
	class={cn(
		'peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary size-6 shrink-0 rounded-lg border-2 shadow-xs transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		<div class="flex h-full w-full items-center justify-center text-current">
			{#if indeterminate}
				<div class="size-2 rounded-sm bg-current"></div>
			{:else if checked}
				<CheckIcon class="size-4" strokeWidth={3} />
			{/if}
		</div>
	{/snippet}
</CheckboxPrimitive.Root>
