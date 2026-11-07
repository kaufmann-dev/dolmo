<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import MicIcon from '@lucide/svelte/icons/mic';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Collapsible from '#lib/components/ui/collapsible/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import * as NativeSelect from '#lib/components/ui/native-select/index.js';
	import LanguagePicker from '#lib/components/language-picker.svelte';
	import { languageName, type LanguageCode } from '#lib/languages.ts';
	import { EFFORTS, MODEL_IDS, MODEL_LABELS } from '#lib/models.ts';
	import type { TranslationSession } from '#lib/translation-session.svelte.ts';

	let { session }: { session: TranslationSession } = $props();

	let pickerOpen = $state(false);
	let settingsOpen = $state(false);
	const ready = $derived(session.languages.length >= 2);

	function remove(code: LanguageCode) {
		session.languages = session.languages.filter((language) => language !== code);
	}
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
				<h2 class="text-sm font-medium text-muted-foreground">Languages</h2>
				<ul class="flex flex-wrap gap-2" aria-label="Selected languages">
					{#each session.languages as code (code)}
						<li
							class="flex h-11 items-center gap-1 rounded-full border bg-card pr-1 pl-4 text-sm font-medium shadow-sm"
						>
							{languageName(code)}
							<Button
								variant="ghost"
								size="icon"
								class="rounded-full"
								aria-label={`Remove ${languageName(code)}`}
								onclick={() => remove(code)}
							>
								<XIcon />
							</Button>
						</li>
					{/each}
					<li>
						<Button
							variant="outline"
							class="h-11 rounded-full border-dashed px-4"
							onclick={() => (pickerOpen = true)}
						>
							<PlusIcon />
							Add language
						</Button>
					</li>
				</ul>
				{#if !ready}
					<p class="text-sm text-muted-foreground">Add at least two languages to start.</p>
				{/if}
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

<LanguagePicker bind:open={pickerOpen} bind:selected={session.languages} />
