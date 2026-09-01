<script lang="ts">
	import { onMount } from 'svelte';
	import { toDataURL } from 'qrcode';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card/index.js';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge/index.js';
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
	import SurveyNavTabs from '$lib/components/survey-nav-tabs.svelte';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let qrDataUrl = $state('');

	onMount(async () => {
		qrDataUrl = await toDataURL(data.shareUrl, { width: 320, margin: 1 });
	});

	async function copyLink() {
		await navigator.clipboard.writeText(data.shareUrl);
		toast.success('Link copied');
	}

	const statusVariant: Record<string, BadgeVariant> = {
		upcoming: 'secondary',
		open: 'default',
		closed: 'destructive'
	};
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<div class="page">
	<SurveyNavTabs />

	<div class="flex flex-col items-center gap-2 text-center">
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">{data.title}</h3>
		<Badge variant={statusVariant[data.status]}>{data.status}</Badge>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Controls</CardTitle>
			<CardDescription
				>Open voting when you're ready, then close it once everyone has voted.</CardDescription
			>
		</CardHeader>

		<CardContent>
			{#if form?.error}
				<p class="text-destructive text-center font-medium">{form.error}</p>
			{/if}
			{#if data.status === 'upcoming'}
				<form method="POST" action="?/transition">
					<input type="hidden" name="next" value="open" />
					<Button type="submit" size="lg" class="w-full">Open voting</Button>
				</form>
			{:else if data.status === 'open'}
				<form method="POST" action="?/transition">
					<input type="hidden" name="next" value="closed" />
					<Button type="submit" size="lg" variant="destructive" class="w-full">Close voting</Button>
				</form>
			{:else}
				<p class="text-muted-foreground text-center">
					Voting is closed.
					<a
						href={resolve('/s/[slug]/results', { slug: data.slug })}
						class="text-primary underline"
					>
						See results
					</a>
				</p>
			{/if}
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Public link</CardTitle>
			<CardDescription
				>Share this link or QR code with your players so they can cast their vote.</CardDescription
			>
		</CardHeader>

		<CardContent class="flex flex-col gap-4">
			<div class="bg-secondary/60 flex items-center gap-2 rounded-2xl p-3">
				<code class="flex-1 overflow-hidden text-sm text-ellipsis">{data.shareUrl}</code>
				<Button variant="secondary" size="icon" onclick={copyLink} aria-label="Copy link">
					<CopyIcon class="size-4" />
				</Button>
			</div>

			{#if qrDataUrl}
				<img
					class="border-border mx-auto rounded-2xl border"
					src={qrDataUrl}
					alt="QR code linking to the survey"
					width="200"
					height="200"
				/>
			{/if}
		</CardContent>
	</Card>

	<SelectedPlayers players={data.roster} />

	<Card class="border-destructive">
		<CardHeader>
			<CardTitle>Danger zone</CardTitle>
			<CardDescription>Permanently delete this survey and all of its votes.</CardDescription>
		</CardHeader>

		<CardContent>
			<AlertDialog>
				<AlertDialogTrigger class="w-full">
					{#snippet child({ props })}
						<Button {...props} size="lg" variant="destructive" class="w-full">Delete survey</Button>
					{/snippet}
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this survey?</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently deletes "{data.title}" and all votes cast for it. This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<form method="POST" action="?/delete">
							<AlertDialogAction type="submit" variant="destructive">
								Delete survey
							</AlertDialogAction>
						</form>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</CardContent>
	</Card>
</div>
