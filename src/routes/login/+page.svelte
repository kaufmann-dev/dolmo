<script lang="ts">
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import { resolve } from '$app/paths';
	import { authClient } from '#lib/auth-client.ts';
	import { OIDC_PROVIDER_ID } from '#lib/auth-provider.ts';
	import Logo from '#lib/components/logo.svelte';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let pending = $state(false);
	let startFailed = $state(false);

	async function signIn() {
		pending = true;
		startFailed = false;
		const { error } = await authClient.signIn.social({
			provider: OIDC_PROVIDER_ID,
			callbackURL: data.redirectTo,
			errorCallbackURL: `${resolve('/login')}?redirectTo=${encodeURIComponent(data.redirectTo)}`
		});
		if (error) {
			pending = false;
			startFailed = true;
		}
	}
</script>

<svelte:head>
	<title>Sign in · Dolmo</title>
</svelte:head>

<main class="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-6 px-4">
	<div class="flex flex-col items-center gap-3 text-center">
		<Logo class="size-12" />
		<h1 class="text-2xl font-semibold">Dolmo</h1>
		<p class="text-muted-foreground">
			A live voice interpreter for conversations across languages. Sign in to start.
		</p>
	</div>

	{#if data.failed || startFailed}
		<Alert.Root variant="destructive">
			<Alert.Title>Sign-in did not complete</Alert.Title>
			<Alert.Description
				>Try again. If it keeps failing, ask the administrator for access.</Alert.Description
			>
		</Alert.Root>
	{/if}

	<Button class="h-11" disabled={pending} onclick={signIn}>
		<LogInIcon />
		{pending ? 'Redirecting…' : 'Sign in'}
	</Button>

	<nav aria-label="Legal" class="flex justify-center gap-4 text-sm text-muted-foreground">
		<a
			class="underline-offset-4 hover:text-foreground hover:underline"
			href="https://legal.kaufmann.dev/imprint?site=dolmo.kaufmann.dev">Imprint</a
		>
		<a
			class="underline-offset-4 hover:text-foreground hover:underline"
			href="https://legal.kaufmann.dev/privacy?site=dolmo.kaufmann.dev">Privacy</a
		>
	</nav>
</main>
