<script lang="ts">
	import * as Item from '$lib/components/ui/item/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	const links = [
		{
			href: '/create',
			icon: PlusIcon,
			title: 'Create a survey',
			description: 'Set up a new MVP vote for your players.'
		},
		{
			href: '/admin/players',
			icon: UsersIcon,
			title: 'Manage players',
			description: 'Add, edit, or remove the players who can be voted for.'
		}
	];
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="page pt-8">
	<div class="flex flex-col items-center gap-2 text-center">
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Welcome!</h3>
		<p class="leading-7">
			Create MVP votes for your matches and let your players decide who stood out.
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
