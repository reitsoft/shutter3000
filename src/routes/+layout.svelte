<script lang="ts">
	import './layout.css';
	import { pwaInfo } from 'virtual:pwa-info';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import InstallPWA from '$lib/InstallPWA.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import AppNav from '$lib/components/AppNav.svelte';

	let { children } = $props();

	let webManifestLink = $derived(pwaInfo?.webManifest?.linkTag ?? '');

	useRegisterSW({
		onRegistered(r) {
			console.log('SW Registered:', r);
		},
		onRegisterError(error) {
			console.error('SW registration error', error);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{@html webManifestLink}
</svelte:head>
<div class="h-dvh w-full bg-navy-950 text-cream-100" style="padding-bottom: var(--nav-height);">
	<InstallPWA />
	{@render children()}
</div>

<AppNav />