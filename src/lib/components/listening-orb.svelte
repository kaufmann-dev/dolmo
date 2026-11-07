<script lang="ts">
	import MicIcon from '@lucide/svelte/icons/mic';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import type { SessionStatus } from '#lib/translation-session.svelte.ts';

	let { status }: { status: SessionStatus } = $props();

	const bars = [0, 1, 2, 3];
</script>

<div class="relative grid size-20 place-items-center" aria-hidden="true">
	{#if status === 'listening' || status === 'recording'}
		<span
			class="absolute inset-0 rounded-full bg-primary/30 motion-safe:animate-ping motion-reduce:hidden"
		></span>
	{/if}
	<span
		class={[
			'relative grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform motion-reduce:transition-none',
			status === 'recording' && 'scale-110 shadow-primary/50'
		]}
	>
		{#if status === 'speaking'}
			<span class="flex h-6 items-end gap-1">
				{#each bars as bar (bar)}
					<span
						class="w-1 rounded-full bg-current motion-safe:animate-bounce motion-reduce:h-3"
						style:height={`${40 + ((bar * 37) % 60)}%`}
						style:animation-delay={`${bar * 120}ms`}
					></span>
				{/each}
			</span>
		{:else if status === 'starting' || status === 'thinking'}
			<Spinner class="size-7" />
		{:else}
			<MicIcon class="size-7" />
		{/if}
	</span>
</div>
