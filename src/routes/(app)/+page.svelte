<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import MicIcon from '@lucide/svelte/icons/mic';
	import PlayIcon from '@lucide/svelte/icons/play';
	import SkipForwardIcon from '@lucide/svelte/icons/skip-forward';
	import SquareIcon from '@lucide/svelte/icons/square';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import { toast } from 'svelte-sonner';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import * as NativeSelect from '#lib/components/ui/native-select/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { Toggle } from '#lib/components/ui/toggle/index.js';
	import { languageName, SUPPORTED_LANGUAGES, type LanguageCode } from '#lib/languages.ts';
	import { EFFORTS, MODEL_IDS, MODEL_LABELS } from '#lib/models.ts';
	import {
		audioKey,
		TranslationSession,
		type SessionTurn
	} from '#lib/translation-session.svelte.ts';

	const session = new TranslationSession((message) => toast.error(message));

	const languagesByName = [...SUPPORTED_LANGUAGES].sort((a, b) =>
		languageName(a).localeCompare(languageName(b))
	);

	const statusLabels = {
		idle: 'Stopped',
		starting: 'Starting',
		listening: 'Listening',
		thinking: 'Thinking',
		speaking: 'Speaking'
	} as const;

	function setLanguage(code: LanguageCode, selected: boolean) {
		session.languages = selected
			? [...session.languages, code]
			: session.languages.filter((language) => language !== code);
	}

	function formatSeconds(ms: number) {
		return `${(ms / 1000).toFixed(1)} s`;
	}

	function scrollIntoView(node: HTMLElement) {
		node.scrollIntoView({ block: 'nearest' });
	}

	function turnById(id: string | null): SessionTurn | undefined {
		return session.turns.find((turn) => turn.id === id);
	}
</script>

<section
	aria-label="Conversation controls"
	class={[
		'flex flex-col gap-5 rounded-xl border bg-card p-4',
		session.running && 'sticky top-2 z-10'
	]}
>
	<div class="flex flex-col gap-2">
		<h1 class="text-base font-semibold">Languages in this conversation</h1>
		{#if session.running}
			<ul class="flex flex-wrap gap-1.5" aria-label="Selected languages">
				{#each session.languages as code (code)}
					<li><Badge variant="outline">{languageName(code)}</Badge></li>
				{/each}
			</ul>
		{:else}
			<p class="text-sm text-muted-foreground">
				Pick every language spoken at the table. Dolmo translates each speaker into all the others.
			</p>
			<div class="flex flex-wrap gap-2" role="group" aria-label="Languages">
				{#each languagesByName as code (code)}
					{@const selected = session.languages.includes(code)}
					<Toggle
						variant="outline"
						class="h-10 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
						pressed={selected}
						onPressedChange={(pressed) => setLanguage(code, pressed)}
					>
						{#if selected}<CheckIcon />{/if}
						{languageName(code)}
					</Toggle>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex flex-wrap items-end gap-3">
		<div class="flex flex-col gap-1.5">
			<Label for="model">Claude model</Label>
			<NativeSelect.Root id="model" class="w-40" bind:value={session.model}>
				{#each MODEL_IDS as id (id)}
					<NativeSelect.Option value={id}>{MODEL_LABELS[id]}</NativeSelect.Option>
				{/each}
			</NativeSelect.Root>
		</div>
		<div class="flex flex-col gap-1.5">
			<Label for="effort">Effort</Label>
			<NativeSelect.Root id="effort" class="w-32" bind:value={session.effort}>
				{#each EFFORTS as effort (effort)}
					<NativeSelect.Option value={effort}>{effort}</NativeSelect.Option>
				{/each}
			</NativeSelect.Root>
		</div>

		<div class="ml-auto flex items-center gap-2">
			{#if session.running}
				<p class="flex items-center gap-1.5 text-sm font-medium" aria-live="polite">
					{#if session.status === 'listening'}
						<MicIcon class="size-4" aria-hidden="true" />
					{:else if session.status === 'speaking'}
						<Volume2Icon class="size-4" aria-hidden="true" />
					{:else}
						<Spinner class="motion-reduce:animate-none" aria-hidden="true" />
					{/if}
					{statusLabels[session.status]}
				</p>
				{#if session.status === 'speaking'}
					<Button variant="outline" class="h-11 px-4" onclick={() => session.skip()}>
						<SkipForwardIcon />
						Skip
					</Button>
				{/if}
				<Button variant="destructive" class="h-11 px-4" onclick={() => session.stop()}>
					<SquareIcon />
					Stop
				</Button>
			{:else}
				<Button
					class="h-11 px-5"
					disabled={session.languages.length < 2}
					onclick={() => session.start()}
				>
					<MicIcon />
					Start
				</Button>
			{/if}
		</div>
	</div>

	{#if !session.running && session.languages.length < 2}
		<p class="text-sm text-muted-foreground">Select at least two languages to start.</p>
	{/if}

	{#if session.startError}
		<Alert.Root variant="destructive">
			<Alert.Title>Dolmo could not start</Alert.Title>
			<Alert.Description>{session.startError}</Alert.Description>
		</Alert.Root>
	{/if}
</section>

{#if session.running && session.partial}
	<p class="mt-4 px-1 text-muted-foreground italic">
		<span class="sr-only">Hearing:</span>{session.partial}
	</p>
{/if}

{#if session.running && session.turns.length === 0}
	<Empty.Root class="mt-6">
		<Empty.Header>
			<Empty.Media variant="icon"><MicIcon /></Empty.Media>
			<Empty.Title>Start talking</Empty.Title>
			<Empty.Description>
				Dolmo waits for a pause, then speaks the translation in every other language. To hear
				something again, ask “Dolmo, what did he say?” in your language.
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{/if}

{#if session.turns.length > 0}
	<ol class="mt-6 flex flex-col gap-3" aria-label="Conversation">
		{#each session.turns as turn (turn.id)}
			<li {@attach scrollIntoView}>
				{#if turn.kind === 'ignore'}
					<p class="truncate px-1 text-sm text-muted-foreground">
						Ignored “{turn.original}”
					</p>
				{:else if turn.kind === 'error'}
					<p class="px-1 text-sm text-destructive">
						“{turn.original}”: {turn.message}
					</p>
				{:else}
					<article class="flex flex-col gap-3 rounded-xl border p-4">
						<header class="flex min-w-0 flex-wrap items-center gap-2">
							<Badge variant="outline">{languageName(turn.sourceLanguage)}</Badge>
							{#if turn.kind === 'repeat'}
								<Badge variant="secondary">Repeat request</Badge>
							{:else if turn.kind === 'clarify'}
								<Badge variant="secondary">Question for Dolmo</Badge>
							{/if}
							<span class="ml-auto text-xs text-muted-foreground">
								{formatSeconds(turn.durationMs)} · {MODEL_LABELS[turn.model]}, {turn.effort}
							</span>
						</header>

						<p class="text-pretty">{turn.original}</p>

						{#if turn.kind === 'repeat'}
							{@const repeated = turnById(turn.repeatTurnId)}
							{@const output =
								repeated && repeated.kind !== 'error'
									? repeated.outputs.find((candidate) => candidate.language === turn.sourceLanguage)
									: undefined}
							{#if output}
								{@render outputRow(turn.repeatTurnId ?? '', output.language, output.text)}
							{/if}
						{:else}
							{#each turn.outputs as output (output.language)}
								{@render outputRow(turn.id, output.language, output.text)}
							{/each}
						{/if}
					</article>
				{/if}
			</li>
		{/each}
	</ol>
{/if}

{#snippet outputRow(turnId: string, language: string, text: string)}
	{@const speaking = session.speakingKey === audioKey(turnId, language)}
	<div class={['flex items-start gap-3 rounded-lg px-2 py-1.5', speaking && 'bg-muted']}>
		<span class="flex w-24 shrink-0 items-center gap-1 pt-0.5 text-sm font-medium">
			{#if speaking}<Volume2Icon class="size-4" aria-label="Speaking" />{/if}
			<span class="truncate">{languageName(language)}</span>
		</span>
		<p class="min-w-0 flex-1 text-pretty">{text}</p>
		<Button
			variant="ghost"
			size="icon-lg"
			aria-label={`Replay ${languageName(language)}`}
			onclick={() => session.replay(turnId, language)}
		>
			<PlayIcon />
		</Button>
	</div>
{/snippet}
