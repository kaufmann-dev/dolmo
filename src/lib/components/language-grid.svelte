<script lang="ts">
	import PinIcon from '@lucide/svelte/icons/pin';
	import LanguageFlag from '#lib/components/language-flag.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Toggle } from '#lib/components/ui/toggle/index.js';
	import { languageName, SUPPORTED_LANGUAGES, type LanguageCode } from '#lib/languages.ts';
	import type { LanguagePins } from '#lib/language-pins.svelte.ts';

	let { selected = $bindable([]), pins }: { selected?: LanguageCode[]; pins: LanguagePins } =
		$props();

	/** Tiles shown before "Load more…", pins and selections included. */
	const INITIAL_COUNT = 24;

	let expanded = $state(false);

	/** Pinned languages first, each group in importance order. */
	const ordered = $derived([
		...SUPPORTED_LANGUAGES.filter((code) => pins.has(code)),
		...SUPPORTED_LANGUAGES.filter((code) => !pins.has(code))
	]);

	/**
	 * The default view: pins and selections first, then the most important remaining languages,
	 * up to INITIAL_COUNT tiles in total. Pinning a language further down the list therefore pushes
	 * the least important default language out of view.
	 */
	const initial = $derived.by(() => {
		const keep: LanguageCode[] = [];
		for (const code of [...pins.codes, ...selected]) {
			if (!keep.includes(code)) keep.push(code);
		}
		for (const code of SUPPORTED_LANGUAGES) {
			if (keep.length >= INITIAL_COUNT) break;
			if (!keep.includes(code)) keep.push(code);
		}
		return keep;
	});

	/**
	 * Pin mode lists every language in the fixed importance order, so tiles stay put while they
	 * are pinned and every language can be reached.
	 */
	const visible = $derived(
		pins.editing
			? SUPPORTED_LANGUAGES
			: expanded
				? ordered
				: ordered.filter((code) => initial.includes(code))
	);

	const hiddenCount = $derived(ordered.length - visible.length);

	function toggle(code: LanguageCode, pressed: boolean) {
		selected = pressed ? [...selected, code] : selected.filter((language) => language !== code);
	}
</script>

<div class="flex flex-col gap-2">
	<ul class="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Languages">
		{#each visible as code (code)}
			{@const position = selected.indexOf(code) + 1}
			{@const isPinned = pins.has(code)}
			<li>
				<Toggle
					variant="outline"
					title={languageName(code)}
					aria-label={pins.editing ? `Pin ${languageName(code)}` : languageName(code)}
					class="relative flex h-auto min-h-18 w-full flex-col gap-1.5 rounded-2xl px-1 py-2.5 aria-pressed:border-primary aria-pressed:bg-primary/15"
					disabled={pins.editing && !isPinned && pins.full}
					pressed={pins.editing ? isPinned : position > 0}
					onPressedChange={(pressed) => (pins.editing ? pins.toggle(code) : toggle(code, pressed))}
				>
					<LanguageFlag {code} class="w-8" />
					<span class="max-w-full truncate text-xs font-semibold tracking-wide">
						{languageName(code)}
					</span>
					{#if pins.editing ? isPinned : position > 0}
						<span
							class="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-primary text-[0.7rem] font-semibold text-primary-foreground tabular-nums"
						>
							{#if pins.editing}
								<PinIcon class="size-3" fill="currentColor" />
							{:else}
								{position}
							{/if}
						</span>
					{/if}
				</Toggle>
			</li>
		{/each}
	</ul>
	{#if hiddenCount > 0}
		<Button variant="outline" class="h-11 w-full rounded-2xl" onclick={() => (expanded = true)}>
			Load more…
		</Button>
	{/if}
</div>
