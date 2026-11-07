<script lang="ts">
	import Logo from '#lib/components/logo.svelte';
	import ModeToggle from '#lib/components/mode-toggle.svelte';
	import SignOutButton from '#lib/components/sign-out-button.svelte';
</script>

<header
	class="shrink-0 border-b bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/70"
>
	<div class="mx-auto flex h-14 w-full max-w-2xl items-center gap-2.5 px-4">
		<Logo class="size-6" />
		<span class="text-base font-semibold tracking-tight">Dolmo</span>
		<div class="ml-auto flex items-center gap-1">
			<ModeToggle />
			<SignOutButton />
		</div>
	</div>
</header>
