<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';
	import { page } from '$app/state';
	import { routeTitle } from '$lib';
	import * as m from '$lib/paraglide/messages';

	type PollLink = { slug: string; title: string; status: string };

	let { polls = [], children }: { polls?: PollLink[]; children: import('svelte').Snippet } =
		$props();
</script>

<Sidebar.Provider>
	<AppSidebar {polls} />

	<Sidebar.Inset>
		<header class="flex h-14 shrink-0 items-center gap-2">
			<div class="flex h-5 items-center gap-2 px-4">
				<Sidebar.Trigger />

				<Separator orientation="vertical" class="me-2"></Separator>

				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/">{m.nav_home()}</Breadcrumb.Link>
						</Breadcrumb.Item>

						{#if page.route.id != '/(app)'}
							<Breadcrumb.Separator />
							<Breadcrumb.Item>
								<Breadcrumb.Page>{page.route.id ? routeTitle(page.route.id) : ''}</Breadcrumb.Page>
							</Breadcrumb.Item>
						{/if}
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>

			<div class="ml-auto flex items-center gap-2 px-4">
				<LanguageSwitcher />
			</div>
		</header>
		<main class="flex-1">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
