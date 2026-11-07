<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	let { class: className, ...restProps }: SVGAttributes<SVGSVGElement> = $props();

	const gradientId = $props.id();
</script>

<!-- Dolmo mark from the logo family; gradient stops follow the app's light/dark mode. -->
<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 32 32"
	class={className}
	aria-hidden="true"
	{...restProps}
>
	<defs>
		<linearGradient id={gradientId} x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
			<stop class="[stop-color:#069fa6] dark:[stop-color:#0de2eb]" />
			<stop class="[stop-color:#01729f] dark:[stop-color:#24abe8]" offset="1" />
		</linearGradient>
	</defs>
	<path
		fill-rule="evenodd"
		d="M4.5 3H16.5A11 11 0 0 1 16.5 25H10L4.5 30.5ZM9.5 11h3v6h-3ZM15 7h3v14h-3ZM20.5 11h3v6h-3Z"
		fill="url(#{gradientId})"
	/>
</svg>
