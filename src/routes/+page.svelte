<script lang="ts">
	import CardStrom from "$lib/components/home/CardStrom.svelte"
	import CardTuer from "$lib/components/home/CardTuer.svelte"
	import CardBad from "$lib/components/home/CardBad.svelte"
	import CardKeller from "$lib/components/home/CardKeller.svelte"

</script>

<div class="flex h-dvh flex-col items-center overflow-hidden bg-navy-950 text-cream-100 select-none">
	<header class="w-full max-w-md shrink-0 px-6 pt-6 pb-4">
		<h1 class="text-center text-sm font-bold tracking-[0.2em] text-orange-500 uppercase">Dahoam is Dahoam</h1>
	</header>

	<main
		class="grid w-full max-w-md flex-1 grid-cols-2 content-start gap-4 overflow-hidden px-4 pb-[env(safe-area-inset-bottom)]"
	>
		<CardStrom />
		<CardBad />
		<CardKeller />
		<CardTuer />
	</main>
</div>
