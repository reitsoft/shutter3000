<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppNav from '$lib/components/AppNav.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="h-dvh w-full bg-navy-950 text-cream-100" style="padding-bottom: var(--nav-height);">
	{@render children()}
</div>

<AppNav />

