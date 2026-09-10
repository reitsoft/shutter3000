<script lang="ts">
	import Viewport from '$lib/components/Viewport.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import CardZaehler from '$lib/components/energy/CardZaehler.svelte';
	import CardMonat from '$lib/components/energy/CardMonat.svelte';
	import CardJahr from '$lib/components/energy/CardJahr.svelte';
	import CardStromfluss from '$lib/components/energy/CardStromfluss.svelte';
</script>

<Viewport>
	<AppHeader title="Energie" />
	
	<main class="flex w-full flex-col gap-4 px-4 pb-4">
		<CardZaehler />
		<CardMonat />
        <CardJahr />
		<CardStromfluss />
	</main>
</Viewport>