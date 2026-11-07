<script lang="ts">
	import * as Command from '#lib/components/ui/command/index.js';
	import * as Drawer from '#lib/components/ui/drawer/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { languageName, SUPPORTED_LANGUAGES, type LanguageCode } from '#lib/languages.ts';

	let {
		open = $bindable(false),
		selected = $bindable([])
	}: { open?: boolean; selected?: LanguageCode[] } = $props();

	const languages = [...SUPPORTED_LANGUAGES].sort((a, b) =>
		languageName(a).localeCompare(languageName(b))
	);

	function toggle(code: LanguageCode) {
		selected = selected.includes(code)
			? selected.filter((language) => language !== code)
			: [...selected, code];
	}
</script>

<Drawer.Root bind:open>
	<Drawer.Content class="max-h-[85dvh]">
		<Drawer.Header class="text-left">
			<Drawer.Title>Add languages</Drawer.Title>
			<Drawer.Description>
				Choose every language spoken at the table. Translations are spoken in the order you pick
				them.
			</Drawer.Description>
		</Drawer.Header>

		<Command.Root class="min-h-0 flex-1 rounded-none bg-transparent p-0">
			<Command.Input placeholder="Search languages" />
			<Command.List class="max-h-none min-h-0 flex-1">
				<Command.Empty>No language matches that search.</Command.Empty>
				<Command.Group>
					{#each languages as code (code)}
						{@const isSelected = selected.includes(code)}
						<Command.Item
							class="min-h-11 text-base"
							value={`${languageName(code)} ${code}`}
							data-checked={isSelected}
							onSelect={() => toggle(code)}
						>
							{languageName(code)}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>

		<Drawer.Footer class="px-0 pb-0">
			<Button size="lg" class="h-12 w-full rounded-2xl" onclick={() => (open = false)}>Done</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
