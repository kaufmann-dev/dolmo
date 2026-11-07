<script lang="ts">
	import { languageFlag } from '#lib/flags.ts';
	import { cn } from '#lib/utils.js';

	let { code, class: className }: { code: string; class?: string } = $props();

	const flag = $derived(languageFlag(code));
</script>

{#if flag}
	<img
		src={flag.src}
		alt=""
		loading="lazy"
		class={cn(
			'aspect-[4/3] w-6 rounded-[3px] object-cover shadow-sm ring-1 ring-foreground/10',
			className
		)}
	/>
{/if}
