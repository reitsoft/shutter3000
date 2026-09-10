<script lang="ts">
	import ShutterRow from '$lib/components/shutters/ShutterRow.svelte';
	import { shutterStore } from '$lib/stores/shutters.sse.svelte';
	import { SHUTTER_LIST } from '$lib/config/shutters';
	import { ArrowUp, ArrowDown, Octagon, LoaderCircle } from '@lucide/svelte';

	// Automatische Skalierung: verhindert Scrollbalken, indem der Content
	// bei zu wenig Platz proportional verkleinert wird
	let outerHeight = $state(0);
	let contentHeight = $state(0);
	let scale = $derived(contentHeight > 0 ? Math.min(1, outerHeight / contentHeight) : 1);

	$effect(() => {
		const disconnect = shutterStore.connect();
		return () => disconnect?.();
	});

	const isConnecting = $derived(Object.keys(shutterStore.states).length === 0);

	// Getrennter Ladezustand pro Aktion, damit nur der jeweils
	// gedrückte Button einen Spinner zeigt und die anderen währenddessen gesperrt sind.
	let isOpeningAll = $state(false);
	let isClosingAll = $state(false);
	let isStoppingAll = $state(false);

	function anyBusy() {
		return isOpeningAll || isClosingAll || isStoppingAll;
	}

	async function allTo(pos: number, busyFlag: 'open' | 'close') {
		if (anyBusy()) return;

		if (busyFlag === 'open') isOpeningAll = true;
		else isClosingAll = true;

		try {
			await Promise.all(SHUTTER_LIST.map((s) => shutterStore.sendCommand(s.id, pos)));
		} finally {
			isOpeningAll = false;
			isClosingAll = false;
		}
	}

	async function stopAll() {
		if (anyBusy()) return;

		isStoppingAll = true;
		try {
			await Promise.all(SHUTTER_LIST.map((s) => shutterStore.sendCommand(s.id, 'stop')));
		} finally {
			isStoppingAll = false;
		}
	}
</script>

<svelte:head>
	<title>Rolläden</title>
</svelte:head>
<div
	bind:clientHeight={outerHeight}
	class="flex h-full w-full items-start justify-center overflow-hidden bg-navy-950"
>
	<div
		bind:clientHeight={contentHeight}
		style="min-height: {outerHeight}px; transform: scale({scale}); transform-origin: top center; width: 28rem;"
		class="flex flex-col text-cream-100 select-none"
	>
		<header class="shrink-0 flex w-full items-center justify-between px-6 pt-7 pb-2">
			<div>
				<h1
					class="font-handwriting font-bold tracking-wide whitespace-nowrap text-cream-100"
					style="font-size: clamp(1.25rem, 7vw, 2.25rem);"
				>
					FM13 - Dahoam is Dahoam
				</h1>
			</div>
			{#if isConnecting}
				<div class="absolute top-6 right-6 flex items-center gap-2 text-xs text-cream-100/60">
					<LoaderCircle class="h-4 w-4 animate-spin" />
				</div>
			{/if}
		</header>

		<main class="flex w-full max-w-md flex-1 flex-col justify-between overflow-y-auto px-4">
			{#each SHUTTER_LIST as shutter (shutter.id)}
				<ShutterRow {shutter} />
			{/each}
		</main>

		<footer class="shrink-0 bg-navy-950 p-4">
			<div class="mx-auto grid w-full max-w-md grid-cols-3 gap-3">
				<button
					type="button"
					onclick={() => allTo(10, 'close')}
					disabled={anyBusy()}
					class="flex flex-col items-center justify-center rounded-full bg-navy-800 py-2.5 text-cream-100 transition-all active:scale-95 active:bg-teal-700 disabled:opacity-60"
				>
					{#if isClosingAll}
						<LoaderCircle class="mb-1 h-5 w-5 animate-spin text-teal-500" />
					{:else}
						<ArrowDown class="mb-1 h-5 w-5 stroke-3 text-teal-500" />
					{/if}
					<span class="text-[9px] font-bold tracking-wider uppercase">Alle Runter</span>
				</button>

				<button
					type="button"
					onclick={stopAll}
					disabled={anyBusy()}
					class="flex flex-col items-center justify-center rounded-full bg-navy-800 py-2.5 text-cream-100 transition-all active:scale-95 active:bg-orange-500/30 disabled:opacity-60"
				>
					{#if isStoppingAll}
						<LoaderCircle class="mb-1 h-5 w-5 animate-spin text-orange-500" />
					{:else}
						<Octagon class="mb-1 h-5 w-5 stroke-3 text-orange-500" />
					{/if}
					<span class="text-[9px] font-bold tracking-wider uppercase">Stop</span>
				</button>

				<button
					type="button"
					onclick={() => allTo(100, 'open')}
					disabled={anyBusy()}
					class="flex flex-col items-center justify-center rounded-full bg-navy-800 py-2.5 text-cream-100 transition-all active:scale-95 active:bg-teal-700 disabled:opacity-60"
				>
					{#if isOpeningAll}
						<LoaderCircle class="mb-1 h-5 w-5 animate-spin text-teal-500" />
					{:else}
						<ArrowUp class="mb-1 h-5 w-5 stroke-3 text-teal-500" />
					{/if}
					<span class="text-[9px] font-bold tracking-wider uppercase">Alle Hoch</span>
				</button>
			</div>
		</footer>
	</div>
</div>
