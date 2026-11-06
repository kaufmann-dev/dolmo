<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Logo from '#lib/components/logo.svelte';
	import { Button } from '#lib/components/ui/button/index.js';

	const messages: Record<number, { title: string; description: string }> = {
		403: {
			title: 'No access',
			description: 'Your account is not allowed to open this page.'
		},
		404: {
			title: 'Page not found',
			description: 'This page does not exist. Check the address or go back to Dolmo.'
		}
	};

	const content = $derived(
		messages[page.status] ?? {
			title: 'Something went wrong',
			description: 'Dolmo ran into a problem on its side. Try again in a moment.'
		}
	);
</script>

<svelte:head>
	<title>{content.title} · Dolmo</title>
</svelte:head>

<main
	class="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center"
>
	<Logo class="size-10" />
	<p class="text-sm text-muted-foreground">Error {page.status}</p>
	<h1 class="text-2xl font-semibold">{content.title}</h1>
	<p class="text-muted-foreground">{content.description}</p>
	<Button href={resolve('/(app)')} class="h-11 px-5">Back to Dolmo</Button>
</main>
