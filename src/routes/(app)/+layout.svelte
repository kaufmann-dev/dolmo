<script lang="ts">
	import Logo from '#lib/components/logo.svelte';
	import ModeToggle from '#lib/components/mode-toggle.svelte';
	import SignOutButton from '#lib/components/sign-out-button.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<header class="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-3">
	<Logo class="size-7" />
	<span class="text-lg font-semibold">Dolmo</span>
	<div class="ml-auto flex items-center gap-1">
		<ModeToggle />
		<SignOutButton />
	</div>
</header>

<main class="mx-auto w-full max-w-3xl px-4 pb-16">
	{@render children()}
</main>
