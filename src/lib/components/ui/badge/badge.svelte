<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground border-transparent',
				secondary: 'bg-secondary text-secondary-foreground border-transparent',
				outline: 'text-foreground border-border',
				success: 'bg-emerald-500/15 text-emerald-500 border-transparent'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		variant = 'default',
		children,
		...restProps
	}: HTMLAttributes<HTMLSpanElement> & { ref?: HTMLSpanElement | null; variant?: BadgeVariant } =
		$props();
</script>

<span bind:this={ref} class={cn(badgeVariants({ variant }), className)} {...restProps}>
	{@render children?.()}
</span>
