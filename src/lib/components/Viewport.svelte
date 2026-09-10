<!-- $lib/components/FullscreenViewport.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex h-dvh w-dvw flex-col items-center overflow-hidden bg-navy-950 text-cream-100 select-none">
	<div
		class="flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain pb-16 sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
	>
		{@render children()}
	</div>
</div>