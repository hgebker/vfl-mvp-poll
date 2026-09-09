<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let passcode = $state('');
</script>

<svelte:head>
	<title>{m.login_title()} · {m.app_title()}</title>
</svelte:head>

<div class="page justify-center">
	<div class="flex flex-col items-center gap-1 text-center">
		<h1 class="font-display text-3xl">{m.login_title()}</h1>
		<p class="text-muted-foreground">{m.login_subtitle()}</p>
	</div>

	<Card>
		<CardContent>
			<form method="POST" class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<Label for="passcode">{m.login_passcode_label()}</Label>
					<Input id="passcode" name="passcode" type="password" bind:value={passcode} required />
				</div>
				{#if form?.error}
					<p class="text-destructive text-center font-medium">{form.error}</p>
				{/if}
				<Button type="submit" size="lg">{m.login_submit()}</Button>
			</form>
		</CardContent>
	</Card>
</div>
