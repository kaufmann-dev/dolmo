<script lang="ts">
	import PlayIcon from '@lucide/svelte/icons/play';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import LanguageFlag from '#lib/components/language-flag.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { languageName } from '#lib/languages.ts';
	import { MODEL_LABELS } from '#lib/models.ts';
	import {
		audioKey,
		type SessionTurn,
		type TranslationSession
	} from '#lib/translation-session.svelte.ts';

	let { turn, session }: { turn: SessionTurn; session: TranslationSession } = $props();

	type Row = { turnId: string; language: string; text: string };

	/** Translations shown under this turn; a repeat shows the earlier audio in the asker's language. */
	const rows = $derived.by((): Row[] => {
		if (turn.kind === 'error' || turn.kind === 'ignore') return [];
		if (turn.kind === 'repeat') {
			const target = session.turns.find((candidate) => candidate.id === turn.repeatTurnId);
			const output =
				target && target.kind !== 'error'
					? target.outputs.find((candidate) => candidate.language === turn.sourceLanguage)
					: undefined;
			return output && turn.repeatTurnId
				? [{ turnId: turn.repeatTurnId, language: output.language, text: output.text }]
				: [];
		}
		return turn.outputs.map((output) => ({
			turnId: turn.id,
			language: output.language,
			text: output.text
		}));
	});

	function formatSeconds(ms: number) {
		return `${(ms / 1000).toFixed(1)} s`;
	}
</script>

{#if turn.kind === 'ignore'}
	<p class="truncate px-1 text-xs text-muted-foreground">Ignored “{turn.original}”</p>
{:else if turn.kind === 'error'}
	<div class="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
		<p class="text-sm font-medium text-destructive">{turn.message}</p>
		<p class="mt-1 text-sm text-pretty text-muted-foreground">“{turn.original}”</p>
	</div>
{:else}
	<article
		class="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-foreground/5 sm:p-5"
	>
		<header class="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
			<span class="flex items-center gap-1.5 font-semibold text-foreground">
				<LanguageFlag code={turn.sourceLanguage} class="w-4" />
				{languageName(turn.sourceLanguage)}
			</span>
			{#if turn.kind === 'repeat'}
				<Badge variant="secondary">Repeat request</Badge>
			{:else if turn.kind === 'clarify'}
				<Badge variant="secondary">Question for Dolmo</Badge>
			{/if}
			<span class="ml-auto tabular-nums">
				{formatSeconds(turn.durationMs)} · {MODEL_LABELS[turn.model]}, {turn.effort}
			</span>
		</header>

		<p class="text-sm text-pretty text-muted-foreground">“{turn.original}”</p>

		{#if rows.length > 0}
			<ul class="flex flex-col gap-2">
				{#each rows as row (`${row.turnId}:${row.language}`)}
					{@const speaking = session.speakingKey === audioKey(row.turnId, row.language)}
					<li
						class={[
							'flex items-start gap-3 rounded-2xl p-3 transition-colors motion-reduce:transition-none',
							speaking ? 'bg-primary/20 ring-1 ring-primary/50' : 'bg-muted/60'
						]}
					>
						<div class="min-w-0 flex-1">
							<p
								class="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase"
							>
								<LanguageFlag code={row.language} class="w-4" />
								{#if speaking}<Volume2Icon
										class="size-3.5 text-foreground"
										aria-hidden="true"
									/>{/if}
								{languageName(row.language)}
							</p>
							<p class="mt-1 text-lg/snug text-pretty">{row.text}</p>
						</div>
						<Button
							variant="ghost"
							size="icon-lg"
							class="shrink-0 rounded-full"
							aria-label={`Replay ${languageName(row.language)}`}
							onclick={() => session.replay(row.turnId, row.language)}
						>
							<PlayIcon />
						</Button>
					</li>
				{/each}
			</ul>
		{/if}
	</article>
{/if}
