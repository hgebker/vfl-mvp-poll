<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import Users from '@lucide/svelte/icons/users';
	import House from '@lucide/svelte/icons/house';

	type SurveyLink = { slug: string; title: string; status: string };

	let { surveys = [] }: { surveys?: SurveyLink[] } = $props();

	const sidebar = Sidebar.useSidebar();

	function closeOnMobile() {
		if (sidebar.isMobile) sidebar.setOpenMobile(false);
	}

	const statusDot: Record<string, string> = {
		open: 'bg-emerald-500',
		upcoming: 'bg-muted-foreground',
		closed: 'bg-destructive'
	};
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<div class="flex items-center gap-2 px-2 py-1.5">
			<div
				class="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-xs font-bold"
			>
				MV
			</div>
			<span class="font-display text-base font-semibold">MVP Vote</span>
		</div>
	</Sidebar.Header>

	<Sidebar.Content class="gap-4">
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu class="gap-1.5">
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={page.url.pathname === '/'}>
							{#snippet child({ props })}
								<a href="/" onclick={closeOnMobile} {...props}>
									<House />
									<span>Home</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={page.url.pathname === '/create'}>
							{#snippet child({ props })}
								<a href="/create" onclick={closeOnMobile} {...props}>
									<Plus />
									<span>Create survey</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={page.url.pathname === '/admin/players'}>
							{#snippet child({ props })}
								<a href="/admin/players" onclick={closeOnMobile} {...props}>
									<Users />
									<span>Players</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Group>
			<Sidebar.GroupLabel>Surveys</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				{#if surveys.length === 0}
					<p class="text-muted-foreground px-2 py-1.5 text-xs">No surveys yet.</p>
				{:else}
					<Sidebar.Menu class="gap-1.5">
						{#each surveys as survey (survey.slug)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.params.slug === survey.slug}>
									{#snippet child({ props })}
										<a
											href="/s/{survey.slug}/manage"
											title={survey.title}
											onclick={closeOnMobile}
											{...props}
										>
											<span
												class={[
													'size-2 shrink-0 rounded-full',
													statusDot[survey.status] ?? 'bg-muted-foreground'
												]}
											></span>
											<span>{survey.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				{/if}
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Rail />
</Sidebar.Root>
