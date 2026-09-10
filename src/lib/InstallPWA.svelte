<script lang="ts">
	import { onMount } from 'svelte';

	let deferredPrompt: any = $state(null);
	let showInstallButton = $state(false);

	onMount(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			// Verhindert das automatische Browser-Banner
			e.preventDefault();
			// Speichert das Event für die spätere Ausführung
			deferredPrompt = e;
			// Zeigt deinen eigenen Button an
			showInstallButton = true;
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		};
	});

	async function installPWA() {
		if (!deferredPrompt) return;

		// Blendet den eigenen Dialog/Button aus
		showInstallButton = false;

		// Öffnet das native Android/Chrome-Installationsfenster
		deferredPrompt.prompt();

		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			console.log('PWA wurde installiert');
		}
		deferredPrompt = null;
	}
</script>

{#if showInstallButton}
	<div class="install-banner">
		<p>Installiere Dahoam als App auf deinem Smartphone!</p>
		<button onclick={installPWA}>Jetzt installieren</button>
	</div>
{/if}

<style>
	.install-banner {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		background-color: #1e293b;
		color: white;
		padding: 12px 20px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		gap: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 1000;
	}

	button {
		background-color: #3b82f6;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 8px;
		font-weight: bold;
		cursor: pointer;
	}
</style>