<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import HandIcon from '@lucide/svelte/icons/hand';
	import MicIcon from '@lucide/svelte/icons/mic';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Collapsible from '#lib/components/ui/collapsible/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import * as NativeSelect from '#lib/components/ui/native-select/index.js';
	import LanguageGrid from '#lib/components/language-grid.svelte';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { languageName } from '#lib/languages.ts';
	import { EFFORTS, MODEL_IDS, MODEL_LABELS } from '#lib/models.ts';
	import type { SessionMode, TranslationSession } from '#lib/translation-session.svelte.ts';

	let { session }: { session: TranslationSession } = $props();

	let settingsOpen = $state(false);

	function isMode(value: string): value is SessionMode {
		return value === 'conversation' || value === 'push-to-listen';
	}
	const ready = $derived(session.languages.length >= 2);
	const summary = $derived(session.languages.map((code) => languageName(code)).join(', '));
</script>

<section class="flex min-h-0 flex-1 flex-col" aria-label="Set up the conversation">
	<div class="min-h-0 flex-1 overflow-y-auto">
		<div class="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pt-8 pb-6">
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold tracking-tight text-balance">Who is at the table?</h1>
				<p class="text-pretty text-muted-foreground">
					Add every language spoken here. Dolmo says each translation out loud in all the others.
				</p>
			</div>

			<div class="flex flex-col gap-3">
				<h2 class="text-sm font-medium text-muted-foreground">How people talk</h2>
				<ToggleGroup.Root
					type="single"
					variant="outline"
					class="w-full"
					value={session.mode}
					onValueChange={(value) => {
						if (isMode(value)) session.mode = value;
					}}
				>
					<ToggleGroup.Item value="conversation" class="flex-1 gap-2">
						<MicIcon class="size-4" />
						Conversation
					</ToggleGroup.Item>
					<ToggleGroup.Item value="push-to-listen" class="flex-1 gap-2">
						<HandIcon class="size-4" />
						Push to listen
					</ToggleGroup.Item>
				</ToggleGroup.Root>
				<p class="text-sm text-muted-foreground">
					{session.mode === 'push-to-listen'
						? 'Dolmo stays quiet until you hold the button, then translates what is said while you hold it.'
						: 'Dolmo listens all the time and translates everyone.'}
				</p>
			</div>

			<div class="flex flex-col gap-3">
				<div class="flex items-baseline justify-between gap-3">
					<h2 class="text-sm font-medium text-muted-foreground">Languages</h2>
					<p class="text-sm text-muted-foreground tabular-nums">
						{session.languages.length} selected
					</p>
				</div>
				<LanguageGrid bind:selected={session.languages} />
				<p class="text-xs text-muted-foreground">
					Numbers show the order translations are spoken in. Tap a selected language to remove it.
				</p>
			</div>

			<Collapsible.Root bind:open={settingsOpen} class="flex flex-col">
				<Collapsible.Trigger
					class="flex h-12 w-full items-center justify-between rounded-2xl border bg-card px-4 text-sm font-medium"
				>
					Claude settings
					<ChevronDownIcon
						class={[
							'size-4 text-muted-foreground transition-transform motion-reduce:transition-none',
							settingsOpen && 'rotate-180'
						]}
					/>
				</Collapsible.Trigger>
				<Collapsible.Content class="grid grid-cols-2 gap-4 rounded-b-2xl px-4 pt-4 pb-1">
					<div class="flex flex-col gap-2">
						<Label for="model">Model</Label>
						<NativeSelect.Root id="model" class="w-full" bind:value={session.model}>
							{#each MODEL_IDS as id (id)}
								<NativeSelect.Option value={id}>{MODEL_LABELS[id]}</NativeSelect.Option>
							{/each}
						</NativeSelect.Root>
					</div>
					<div class="flex flex-col gap-2">
						<Label for="effort">Effort</Label>
						<NativeSelect.Root id="effort" class="w-full" bind:value={session.effort}>
							{#each EFFORTS as effort (effort)}
								<NativeSelect.Option value={effort}>{effort}</NativeSelect.Option>
							{/each}
						</NativeSelect.Root>
					</div>
					<p class="col-span-2 text-xs text-muted-foreground">
						Lower effort and smaller models answer faster. Changes apply from the next turn.
					</p>
				</Collapsible.Content>
			</Collapsible.Root>
		</div>
	</div>

	<div
		class="shrink-0 border-t bg-background/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur"
	>
		<div class="mx-auto flex w-full max-w-2xl flex-col gap-3">
			<p class="truncate text-center text-sm text-muted-foreground">
				{ready ? summary : 'Pick at least two languages to start.'}
			</p>
			{#if session.startError}
				<Alert.Root variant="destructive">
					<Alert.Title>Dolmo could not start</Alert.Title>
					<Alert.Description>{session.startError}</Alert.Description>
				</Alert.Root>
			{/if}
			<Button
				size="lg"
				class="h-14 w-full rounded-2xl text-base"
				disabled={!ready}
				onclick={() => session.start()}
			>
				<MicIcon class="size-5" />
				Start conversation
			</Button>
		</div>
	</div>
</section>
