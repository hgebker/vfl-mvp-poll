<script lang="ts">
	import { onMount } from 'svelte';
	import { toDataURL } from 'qrcode';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { Alert, AlertDescription } from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card/index.js';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '$lib/components/ui/alert-dialog/index.js';
	import SelectedPlayers from '$lib/components/selected-players.svelte';
	import PollHeader from '$lib/components/poll-header.svelte';
	import PollNavTabs from '$lib/components/poll-nav-tabs.svelte';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import ShareIcon from '@lucide/svelte/icons/share-2';
	import BarChartIcon from '@lucide/svelte/icons/bar-chart';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let qrDataUrl = $state('');
	let canShare = $state(false);

	onMount(async () => {
		canShare = typeof navigator.share === 'function';
		qrDataUrl = await toDataURL(data.shareUrl, { width: 320, margin: 1 });
	});

	async function copyLink() {
		await navigator.clipboard.writeText(data.shareUrl);
		toast.success(m.manage_link_copied());
	}

	async function copyQr() {
		try {
			// Passing the promise keeps the clipboard write inside the click gesture (needed by Safari).
			const blob = fetch(qrDataUrl).then((response) => response.blob());
			await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
			toast.success(m.manage_qr_copied());
		} catch {
			toast.error(m.manage_qr_copy_failed());
		}
	}

	async function share(includeQr: boolean) {
		const shareData: ShareData = { title: data.title, url: data.shareUrl };
		if (includeQr && qrDataUrl) {
			const blob = await (await fetch(qrDataUrl)).blob();
			const file = new File([blob], 'qr-code.png', { type: 'image/png' });
			if (navigator.canShare?.({ files: [file] })) {
				// Many targets (e.g. Instagram) drop `url` when a file is attached, so repeat it in the text.
				shareData.files = [file];
				shareData.text = `${data.title}\n${data.shareUrl}`;
				delete shareData.url;
			}
		}
		try {
			await navigator.share(shareData);
		} catch (err) {
			if (!(err instanceof DOMException && err.name === 'AbortError')) throw err;
		}
	}
</script>

<svelte:head>
	<title>{data.title} · {m.app_title()}</title>
</svelte:head>

<div class="page">
	<PollHeader
		opponent={data.opponent}
		homeAway={data.homeAway}
		matchDate={data.matchDate}
		status={data.status}
	/>

	<PollNavTabs />

	<Card>
		<CardHeader>
			<CardTitle>{m.manage_controls_title()}</CardTitle>
			<CardDescription>{m.manage_controls_desc()}</CardDescription>
		</CardHeader>

		<CardContent>
			{#if form?.error}
				<Alert variant="destructive">
					<CircleAlertIcon />
					<AlertDescription>{form.error}</AlertDescription>
				</Alert>
			{/if}
			{#if data.status === 'upcoming'}
				<div class="flex flex-col gap-2">
					<form method="POST" action="?/transition">
						<input type="hidden" name="next" value="open" />
						<Button type="submit" size="lg" class="w-full">{m.manage_open_voting()}</Button>
					</form>
					<Button
						href={resolve('/(app)/p/[slug]/edit', { slug: data.slug })}
						variant="secondary"
						size="lg"
						class="w-full"
					>
						{m.manage_edit_details()}
					</Button>
				</div>
			{:else if data.status === 'open'}
				<div class="flex flex-col gap-2">
					<Button
						href={resolve('/p/[slug]', { slug: data.slug })}
						target="_blank"
						rel="noopener noreferrer"
						variant="secondary"
						size="lg"
						class="w-full"
					>
						{m.results_open_voter_view()}
						<ExternalLinkIcon class="size-4" />
					</Button>
					<form method="POST" action="?/transition">
						<input type="hidden" name="next" value="closed" />
						<Button type="submit" size="lg" variant="destructive" class="w-full"
							>{m.manage_close_voting()}</Button
						>
					</form>
				</div>
			{:else}
				<Button
					href={resolve('/p/[slug]/results', { slug: data.slug })}
					variant="secondary"
					size="lg"
					class="w-full"
				>
					<BarChartIcon class="size-4" />
					{m.manage_see_results()}
				</Button>
			{/if}
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>{m.manage_public_link_title()}</CardTitle>
			<CardDescription>{m.manage_public_link_desc()}</CardDescription>
		</CardHeader>

		<CardContent class="flex flex-col gap-4">
			<div class="mx-auto size-[200px]">
				{#if qrDataUrl}
					<img
						class="border-border rounded-2xl border"
						src={qrDataUrl}
						alt={m.manage_qr_alt()}
						width="200"
						height="200"
					/>
				{/if}
			</div>

			<div class={['grid gap-2', canShare ? 'grid-cols-2' : 'grid-cols-1']}>
				<Button variant="secondary" size="lg" onclick={copyQr} disabled={!qrDataUrl}>
					<QrCodeIcon class="size-4" />
					{m.manage_copy_qr()}
				</Button>
				{#if canShare}
					<Button variant="secondary" size="lg" onclick={() => share(true)}>
						<ShareIcon class="size-4" />
						{m.manage_share_link()}
					</Button>
				{/if}
			</div>

			<div class="bg-secondary/60 flex items-center gap-2 rounded-2xl p-3">
				<code class="flex-1 overflow-hidden text-sm text-ellipsis">{data.shareUrl}</code>
				<Button
					variant="secondary"
					size="icon"
					onclick={copyLink}
					aria-label={m.manage_copy_link_aria_label()}
				>
					<CopyIcon class="size-4" />
				</Button>
				{#if canShare}
					<Button
						variant="secondary"
						size="icon"
						onclick={() => share(false)}
						aria-label={m.manage_share_link_aria_label()}
					>
						<ShareIcon class="size-4" />
					</Button>
				{/if}
			</div>
		</CardContent>
	</Card>

	<SelectedPlayers players={data.roster} />

	<Card class="border-destructive">
		<CardHeader>
			<CardTitle>{m.manage_danger_zone_title()}</CardTitle>
			<CardDescription>{m.manage_danger_zone_desc()}</CardDescription>
		</CardHeader>

		<CardContent>
			<AlertDialog>
				<AlertDialogTrigger class="w-full">
					{#snippet child({ props })}
						<Button {...props} size="lg" variant="destructive" class="w-full"
							>{m.manage_delete_poll()}</Button
						>
					{/snippet}
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{m.manage_delete_confirm_title()}</AlertDialogTitle>
						<AlertDialogDescription>
							{m.manage_delete_confirm_desc({ title: data.title })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel size="lg">{m.manage_cancel()}</AlertDialogCancel>
						<form method="POST" action="?/delete" class="w-full sm:w-auto">
							<AlertDialogAction type="submit" variant="destructive" size="lg" class="w-full"
								>{m.manage_delete_poll()}</AlertDialogAction
							>
						</form>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</CardContent>
	</Card>
</div>
