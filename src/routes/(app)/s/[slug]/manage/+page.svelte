<script lang="ts">
	import { onMount } from 'svelte';
	import { toDataURL } from 'qrcode';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
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

	const statusVariant = { upcoming: 'secondary', open: 'success', closed: 'outline' } as const;
</script>

<div class="page">
	<div class="flex flex-col items-center gap-2 text-center">
		<h1 class="font-display text-3xl">{data.title}</h1>
		<Badge variant={statusVariant[data.status]}>{data.status}</Badge>
	</div>

	<Card>
		<CardContent>
			<h2 class="font-display text-xl">Share link</h2>
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

	<Card>
		<CardContent>
			<h2 class="font-display text-xl">Controls</h2>
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
					<Button type="submit" size="lg" variant="destructive" class="w-full">Close voting</Button
					>
				</form>
			{:else}
				<p class="text-muted-foreground text-center">
					Voting is closed.
					<a
						href={resolve('/(app)/s/[slug]/results', { slug: data.slug })}
						class="text-primary underline"
					>
						See results
					</a>
				</p>
			{/if}
		</CardContent>
	</Card>
</div>
