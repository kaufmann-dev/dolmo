<script lang="ts">
	import LanguageFlag from '#lib/components/language-flag.svelte';
	import { Toggle } from '#lib/components/ui/toggle/index.js';
	import { LANGUAGE_FLAGS } from '#lib/flags.ts';
	import { languageName, SUPPORTED_LANGUAGES, type LanguageCode } from '#lib/languages.ts';

	let { selected = $bindable([]) }: { selected?: LanguageCode[] } = $props();

	const languages = [...SUPPORTED_LANGUAGES].sort((a, b) =>
		languageName(a).localeCompare(languageName(b))
	);

	function toggle(code: LanguageCode, pressed: boolean) {
		selected = pressed ? [...selected, code] : selected.filter((language) => language !== code);
	}
</script>

<ul class="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Languages">
	{#each languages as code (code)}
		{@const position = selected.indexOf(code) + 1}
		<li>
			<Toggle
				variant="outline"
				title={languageName(code)}
				aria-label={languageName(code)}
				class="relative flex h-auto min-h-18 w-full flex-col gap-1.5 rounded-2xl px-1 py-2.5 aria-pressed:border-primary aria-pressed:bg-primary/15"
				pressed={position > 0}
				onPressedChange={(pressed) => toggle(code, pressed)}
			>
				<LanguageFlag {code} class="w-8" />
				<span class="text-xs font-semibold tracking-wide">{LANGUAGE_FLAGS[code].country}</span>
				{#if position > 0}
					<span
						class="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-primary text-[0.7rem] font-semibold text-primary-foreground tabular-nums"
					>
						{position}
					</span>
				{/if}
			</Toggle>
		</li>
	{/each}
</ul>
