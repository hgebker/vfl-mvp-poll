<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Item from '$lib/components/ui/item/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import * as m from '$lib/paraglide/messages';

	const links = [
		{
			href: resolve('/(app)/create'),
			icon: PlusIcon,
			title: m.home_create_poll_title(),
			description: m.home_create_poll_desc()
		},
		{
			href: resolve('/(app)/admin/players'),
			icon: UsersIcon,
			title: m.home_manage_players_title(),
			description: m.home_manage_players_desc()
		}
	];
</script>

<svelte:head>
	<title>{m.home_head_title()}</title>
</svelte:head>

<div class="page pt-8">
	<div class="flex flex-col items-center gap-2 text-center">
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">{m.home_welcome()}</h3>
		<p class="leading-7">
			{m.home_subtitle()}
		</p>
	</div>

	<div class="flex w-full max-w-md flex-col gap-6">
		<Item.Group>
			{#each links as link (link.href)}
				<Item.Root variant="muted">
					{#snippet child({ props })}
						<a href={link.href} {...props}>
							<Item.Media variant="icon">
								<link.icon />
							</Item.Media>
							<Item.Content>
								<Item.Title>{link.title}</Item.Title>
								<Item.Description>{link.description}</Item.Description>
							</Item.Content>
							<Item.Actions>
								<ChevronRightIcon class="size-4" />
							</Item.Actions>
						</a>
					{/snippet}
				</Item.Root>
			{/each}
		</Item.Group>
	</div>
</div>
