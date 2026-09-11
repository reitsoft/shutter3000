<!-- src/routes/energy/+page.svelte -->
<script lang="ts">
	import Viewport from '$lib/components/Viewport.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import CardZaehler from '$lib/components/energy/CardZaehler.svelte';
	import CardMonat from '$lib/components/energy/CardMonat.svelte';
	import CardJahr from '$lib/components/energy/CardJahr.svelte';
	import CardStromfluss2 from '$lib/components/energy/CardStromfluss2.svelte';

</script>

<Viewport>
	<AppHeader title="Energie" />

	<main class="grid min-h-0 w-full flex-1 grid-rows-[auto_11rem_13.75rem_1.5fr] gap-3 px-4 pb-3">
		<CardZaehler />
		<CardMonat />
		<CardJahr />
		<CardStromfluss2 />
	</main>
</Viewport>
