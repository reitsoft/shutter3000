<!-- $lib/components/FullscreenViewport.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children, footer }: { children: Snippet; footer?: Snippet } = $props();
</script>

<div class="flex h-full w-full flex-1 flex-col items-center overflow-hidden bg-navy-950 text-cream-100 select-none">
	<div class="flex h-full min-h-0 w-full max-w-md flex-1 flex-col sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
		{@render children()}
	</div>
	{#if footer}
		<div class="w-full shrink-0">{@render footer()}</div>
	{/if}
</div>