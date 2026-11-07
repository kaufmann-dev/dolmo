<script lang="ts">
	import AppHeader from '#lib/components/app-header.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="flex h-dvh flex-col">
	<AppHeader />
	<div class="flex min-h-0 flex-1 flex-col">
		{@render children()}
	</div>
</div>
