<script lang="ts">
	import './layout.css';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import InstallPWA from '$lib/InstallPWA.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import AppNav from '$lib/components/AppNav.svelte';

	let { children } = $props();

	// Registriert den Service Worker automatisch
	useRegisterSW({
		onRegistered(r) {
			console.log('SW Registered:', r);
		},
		onRegisterError(error) {
			console.error('SW registration error', error);
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="h-dvh w-full bg-navy-950 text-cream-100" style="padding-bottom: var(--nav-height);">
	<InstallPWA />
	{@render children()}
</div>

<AppNav />

