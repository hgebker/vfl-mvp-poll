<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Check from '@lucide/svelte/icons/check';
	import Plus from '@lucide/svelte/icons/plus';
	import LogOut from '@lucide/svelte/icons/log-out';
	import * as m from '$lib/paraglide/messages';

	type Team = { id: string; name: string };

	let { teams, activeTeamId }: { teams: Team[]; activeTeamId: string } = $props();

	const activeTeam = $derived(teams.find((team) => team.id === activeTeamId) ?? teams[0]);
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton size="lg" {...props}>
						<img src="/favicon.svg" alt="" class="size-8 shrink-0" />
						<span class="grid flex-1 text-left leading-tight">
							<span class="truncate font-semibold">{m.app_title()}</span>
							<span class="text-muted-foreground truncate text-xs">{activeTeam?.name}</span>
						</span>
						<ChevronsUpDown class="ml-auto" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start" side="bottom" class="min-w-56">
				<DropdownMenu.Label>{m.team_switcher_teams_label()}</DropdownMenu.Label>
				{#each teams as team (team.id)}
					<DropdownMenu.Item closeOnSelect={false}>
						{#snippet child({ props })}
							<form method="POST" action="/switch-team" {...props}>
								<input type="hidden" name="teamId" value={team.id} />
								<button type="submit" class="flex w-full items-center gap-2">
									{team.name}
									{#if team.id === activeTeamId}
										<Check class="ml-auto" />
									{/if}
								</button>
							</form>
						{/snippet}
					</DropdownMenu.Item>
				{/each}
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<a href="/login?addTeam=1" {...props}>
							<Plus />
							{m.team_switcher_add_team()}
						</a>
					{/snippet}
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item closeOnSelect={false}>
					{#snippet child({ props })}
						<form method="POST" action="/logout" {...props}>
							<button type="submit" class="flex w-full items-center gap-2">
								<LogOut />
								{m.team_switcher_logout()}
							</button>
						</form>
					{/snippet}
				</DropdownMenu.Item>
				<DropdownMenu.Item variant="destructive" closeOnSelect={false}>
					{#snippet child({ props })}
						<form method="POST" action="/logout-all" {...props}>
							<button type="submit" class="flex w-full items-center gap-2">
								<LogOut />
								{m.team_switcher_logout_all()}
							</button>
						</form>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
