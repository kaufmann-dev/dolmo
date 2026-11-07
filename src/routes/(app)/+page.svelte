<script lang="ts">
	import { toast } from 'svelte-sonner';
	import LiveView from '#lib/components/live-view.svelte';
	import SetupView from '#lib/components/setup-view.svelte';
	import { TranslationSession } from '#lib/translation-session.svelte.ts';

	const session = new TranslationSession((message) => toast.error(message));
</script>

{#if session.running}
	<LiveView {session} />
{:else}
	<SetupView {session} />
{/if}
