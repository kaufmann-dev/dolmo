<script lang="ts">
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import LiveView from '#lib/components/live-view.svelte';
	import SetupView from '#lib/components/setup-view.svelte';
	import { LanguagePins } from '#lib/language-pins.svelte.ts';
	import { savePinnedLanguages } from '#lib/pins.remote.ts';
	import { TranslationSession } from '#lib/translation-session.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const session = new TranslationSession((message) => toast.error(message));
	// Pins load once; after that the browser owns the list and saves every change.
	const pins = new LanguagePins(
		untrack(() => data.pinnedLanguages),
		savePinnedLanguages,
		(message) => toast.error(message)
	);
</script>

{#if session.running}
	<LiveView {session} />
{:else}
	<SetupView {session} {pins} />
{/if}
