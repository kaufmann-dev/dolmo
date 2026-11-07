<script lang="ts">
	import MicIcon from '@lucide/svelte/icons/mic';
	import SkipForwardIcon from '@lucide/svelte/icons/skip-forward';
	import SquareIcon from '@lucide/svelte/icons/square';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import ListeningOrb from '#lib/components/listening-orb.svelte';
	import TurnCard from '#lib/components/turn-card.svelte';
	import type { SessionStatus, TranslationSession } from '#lib/translation-session.svelte.ts';

	let { session }: { session: TranslationSession } = $props();

	const statusLabels: Record<SessionStatus, string> = {
		idle: 'Stopped',
		starting: 'Starting',
		listening: 'Listening',
		thinking: 'Thinking',
		speaking: 'Speaking'
	};

	function scrollIntoView(node: HTMLElement) {
		node.scrollIntoView({ block: 'nearest' });
	}
</script>

<section class="flex min-h-0 flex-1 flex-col" aria-label="Conversation">
	<div class="min-h-0 flex-1 overflow-y-auto">
		<div class="mx-auto w-full max-w-2xl px-4 pt-4 pb-6">
			{#if session.turns.length === 0}
				<Empty.Root class="mt-10 border-0">
					<Empty.Header>
						<Empty.Media variant="icon"><MicIcon /></Empty.Media>
						<Empty.Title>Start talking</Empty.Title>
						<Empty.Description class="text-pretty">
							Dolmo waits for a pause, then speaks the translation in every other language. To hear
							something again, ask “Dolmo, what did he say?” in your language.
						</Empty.Description>
					</Empty.Header>
				</Empty.Root>
			{:else}
				<ol class="flex flex-col gap-3" aria-label="Translations">
					{#each session.turns as turn (turn.id)}
						<li {@attach scrollIntoView}>
							<TurnCard {turn} {session} />
						</li>
					{/each}
				</ol>
			{/if}
		</div>
	</div>

	<div
		class="shrink-0 border-t bg-background/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur"
	>
		<div class="mx-auto flex w-full max-w-2xl flex-col gap-3">
			{#if session.partial}
				<p
					class="line-clamp-3 rounded-2xl bg-muted px-4 py-2.5 text-sm text-pretty text-muted-foreground italic"
				>
					<span class="sr-only">Hearing:</span>{session.partial}
				</p>
			{/if}
			<div class="grid grid-cols-3 items-center">
				<div class="justify-self-start">
					{#if session.status === 'speaking'}
						<Button variant="outline" class="h-11 rounded-full px-4" onclick={() => session.skip()}>
							<SkipForwardIcon />
							Skip
						</Button>
					{/if}
				</div>
				<div class="flex flex-col items-center gap-1.5">
					<ListeningOrb status={session.status} />
					<p class="text-sm font-medium" aria-live="polite">{statusLabels[session.status]}</p>
				</div>
				<div class="justify-self-end">
					<Button variant="secondary" class="h-11 rounded-full px-4" onclick={() => session.stop()}>
						<SquareIcon />
						Stop
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>
