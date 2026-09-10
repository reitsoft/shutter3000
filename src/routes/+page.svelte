<script lang="ts">
	import Viewport from '$lib/components/Viewport.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import CardVerbrauch from '$lib/components/home/CardVerbrauch.svelte';
	import CardHeizung from '$lib/components/home/CardHeizung.svelte';
	import CardBad from '$lib/components/home/CardBad.svelte';
	import CardKeller from '$lib/components/home/CardKeller.svelte';
	import CardHaustuer from '$lib/components/home/CardHaustuer.svelte';

</script>

<Viewport>
		<AppHeader title="Dahoam is Dahoam" />

		<main class="flex w-full flex-col gap-4 px-4 pb-4">
			<CardVerbrauch />
			<CardHeizung />
			<CardBad />
			<CardKeller />
			<CardHaustuer />
		</main>
</Viewport>