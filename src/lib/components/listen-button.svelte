<script lang="ts">
	import ListeningOrb from '#lib/components/listening-orb.svelte';
	import type { SessionStatus, TranslationSession } from '#lib/translation-session.svelte.ts';

	let { session }: { session: TranslationSession } = $props();

	const labels: Partial<Record<SessionStatus, string>> = {
		listening: 'Hold to listen',
		recording: 'Release to translate',
		thinking: 'Translating',
		speaking: 'Speaking'
	};

	const label = $derived(labels[session.status] ?? '');
	const ready = $derived(session.status === 'listening' || session.status === 'recording');

	function press() {
		if (session.status === 'listening') navigator.vibrate?.(15);
		session.beginListening();
	}

	function release() {
		if (session.status !== 'recording') return;
		navigator.vibrate?.(15);
		void session.endListening();
	}
</script>

<div class="flex flex-col items-center gap-2">
	<button
		type="button"
		aria-label="Push to listen"
		aria-pressed={session.status === 'recording'}
		disabled={!ready}
		class="grid size-28 touch-none place-items-center rounded-full outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
		onpointerdown={(event) => {
			event.currentTarget.setPointerCapture(event.pointerId);
			press();
		}}
		onpointerup={release}
		onpointercancel={release}
		onlostpointercapture={release}
		oncontextmenu={(event) => event.preventDefault()}
		onkeydown={(event) => {
			if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
				event.preventDefault();
				press();
			}
		}}
		onkeyup={(event) => {
			if (event.key === ' ' || event.key === 'Enter') release();
		}}
	>
		<ListeningOrb status={session.status} />
	</button>
	<p class="text-center text-sm font-medium whitespace-nowrap" aria-live="polite">{label}</p>
</div>
