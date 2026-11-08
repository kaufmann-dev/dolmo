<script lang="ts">
	import { onMount } from 'svelte';
	import PinIcon from '@lucide/svelte/icons/pin';
	import LanguageFlag from '#lib/components/language-flag.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Toggle } from '#lib/components/ui/toggle/index.js';
	import {
		isSupportedLanguage,
		languageName,
		SUPPORTED_LANGUAGES,
		type LanguageCode
	} from '#lib/languages.ts';

	let { selected = $bindable([]) }: { selected?: LanguageCode[] } = $props();

	/** Tiles shown before "Load more…", pins and selections included. */
	const INITIAL_COUNT = 24;
	const MAX_PINNED = 24;
	const PINS_KEY = 'dolmo.pinnedLanguages';

	let pinned = $state<LanguageCode[]>([]);
	let expanded = $state(false);

	onMount(() => {
		try {
			const stored: unknown = JSON.parse(localStorage.getItem(PINS_KEY) ?? '[]');
			if (Array.isArray(stored)) {
				pinned = stored
					.filter(
						(code): code is LanguageCode => typeof code === 'string' && isSupportedLanguage(code)
					)
					.slice(0, MAX_PINNED);
			}
		} catch {
			// Storage is unavailable or holds something unreadable: start without pins.
		}
	});

	/** Pinned languages first, each group in importance order. */
	const ordered = $derived([
		...SUPPORTED_LANGUAGES.filter((code) => pinned.includes(code)),
		...SUPPORTED_LANGUAGES.filter((code) => !pinned.includes(code))
	]);

	/**
	 * The default view: pins and selections first, then the most important remaining languages,
	 * up to INITIAL_COUNT tiles in total. Pinning a language further down the list therefore pushes
	 * the least important default language out of view.
	 */
	const initial = $derived.by(() => {
		const keep: LanguageCode[] = [];
		for (const code of [...pinned, ...selected]) {
			if (!keep.includes(code)) keep.push(code);
		}
		for (const code of SUPPORTED_LANGUAGES) {
			if (keep.length >= INITIAL_COUNT) break;
			if (!keep.includes(code)) keep.push(code);
		}
		return keep;
	});

	const visible = $derived(expanded ? ordered : ordered.filter((code) => initial.includes(code)));

	const hiddenCount = $derived(ordered.length - visible.length);
	const pinLimitReached = $derived(pinned.length >= MAX_PINNED);

	function toggle(code: LanguageCode, pressed: boolean) {
		selected = pressed ? [...selected, code] : selected.filter((language) => language !== code);
	}

	function togglePin(code: LanguageCode) {
		if (!pinned.includes(code) && pinLimitReached) return;
		pinned = pinned.includes(code)
			? pinned.filter((language) => language !== code)
			: [...pinned, code];
		try {
			localStorage.setItem(PINS_KEY, JSON.stringify(pinned));
		} catch {
			// Storage is unavailable: the pin still applies for this visit.
		}
	}
</script>

<div class="flex flex-col gap-2">
	<ul class="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Languages">
		{#each visible as code (code)}
			{@const position = selected.indexOf(code) + 1}
			{@const isPinned = pinned.includes(code)}
			<li class="relative">
				<Toggle
					variant="outline"
					title={languageName(code)}
					aria-label={languageName(code)}
					class="relative flex h-auto min-h-18 w-full flex-col gap-1.5 rounded-2xl px-1 py-2.5 aria-pressed:border-primary aria-pressed:bg-primary/15"
					pressed={position > 0}
					onPressedChange={(pressed) => toggle(code, pressed)}
				>
					<LanguageFlag {code} class="w-8" />
					<span class="max-w-full truncate text-xs font-semibold tracking-wide">
						{languageName(code)}
					</span>
					{#if position > 0}
						<span
							class="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-primary text-[0.7rem] font-semibold text-primary-foreground tabular-nums"
						>
							{position}
						</span>
					{/if}
				</Toggle>
				<button
					type="button"
					class={[
						'absolute top-0.5 left-0.5 grid size-6 place-items-center rounded-full transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none',
						isPinned ? 'text-primary' : 'text-muted-foreground/70 hover:text-foreground'
					]}
					aria-label={`Pin ${languageName(code)}`}
					aria-pressed={isPinned}
					disabled={!isPinned && pinLimitReached}
					onclick={() => togglePin(code)}
				>
					<PinIcon class="size-3.5" fill={isPinned ? 'currentColor' : 'none'} />
				</button>
			</li>
		{/each}
	</ul>
	{#if hiddenCount > 0}
		<Button variant="outline" class="h-11 w-full rounded-2xl" onclick={() => (expanded = true)}>
			Load more…
		</Button>
	{/if}
</div>
