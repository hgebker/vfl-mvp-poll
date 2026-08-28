<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		value,
		class: className,
		...restProps
	}: RadioGroupPrimitive.ItemProps = $props();
</script>

<RadioGroupPrimitive.Item
	bind:ref
	{value}
	class={cn(
		'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive data-[state=checked]:border-primary aspect-square size-6 shrink-0 rounded-full border-2 shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
>
	{#snippet children({ checked })}
		<div class="flex h-full w-full items-center justify-center">
			{#if checked}
				<div class="bg-primary size-3 rounded-full"></div>
			{/if}
		</div>
	{/snippet}
</RadioGroupPrimitive.Item>
