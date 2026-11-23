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
	let startError = $state<string | null>(null);

	const callbackError = $derived(
		data.errorCode ? `The identity provider returned “${data.errorCode}”.` : null
	);
	const failure = $derived(startError ?? callbackError);

	function describeStartError(error: { status: number; code?: string }): string {
		if (error.code === 'PROVIDER_NOT_FOUND') {
			return 'Sign-in is not configured correctly: the identity provider could not be loaded. The server log has details.';
		}
		if (error.status >= 500) {
			return `The server could not start sign-in (error ${error.status}). Try again in a moment.`;
		}
		return `Sign-in could not start (error ${error.status}${error.code ? `, ${error.code}` : ''}).`;
	}

	async function signIn() {
		pending = true;
		startError = null;
		try {
			const { error } = await authClient.signIn.social({
				provider: OIDC_PROVIDER_ID,
				callbackURL: data.redirectTo,
				errorCallbackURL: `${resolve('/login')}?redirectTo=${encodeURIComponent(data.redirectTo)}`
			});
			if (error) {
				pending = false;
				startError = describeStartError(error);
			}
		} catch {
			pending = false;
			startError = 'Dolmo could not be reached. Check your connection and try again.';
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

	{#if failure}
		<Alert.Root variant="destructive">
			<Alert.Title>Sign-in did not complete</Alert.Title>
			<Alert.Description>{failure}</Alert.Description>
		</Alert.Root>
	{/if}

	<Button class="h-11" disabled={pending} onclick={signIn}>
		<LogInIcon />
		{pending ? 'Redirecting…' : 'Sign in'}
	</Button>

	<nav aria-label="Legal" class="flex justify-center gap-4 text-sm text-muted-foreground">
		<a
			class="underline-offset-4 hover:text-foreground hover:underline"
			href="https://legal.kaufmann.dev/imprint?site=dolmo.kaufmann.dev"
		>
			Imprint
		</a>
		<a
			class="underline-offset-4 hover:text-foreground hover:underline"
			href="https://legal.kaufmann.dev/privacy?site=dolmo.kaufmann.dev"
		>
			Privacy
		</a>
	</nav>
</main>
