<script lang="ts">
	import { ArrowUp, ArrowDown, Octagon } from '@lucide/svelte';

	interface Shutter {
		id: number;
		name: string;
		position: number; // 0 = Geschlossen, 100 = Offen
	}

	let shutters: Shutter[] = $state([
		{ id: 1, name: 'Wohnzimmer Links', position: 100 },
		{ id: 2, name: 'Wohnzimmer Rechts', position: 100 },
		{ id: 3, name: 'Küche', position: 0 },
		{ id: 4, name: 'Esszimmer', position: 80 },
		{ id: 5, name: 'Schlafzimmer', position: 0 },
		{ id: 6, name: 'Kind 1', position: 100 },
		{ id: 7, name: 'Kind 2', position: 50 },
		{ id: 8, name: 'Büro', position: 0 },
		{ id: 9, name: 'Badezimmer', position: 100 }
	]);

	let activeDraggingId: number | null = $state(null);

	function updatePosition(e: MouseEvent | TouchEvent, element: HTMLDivElement, id: number) {
		const rect = element.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const offsetX = clientX - rect.left;
		const percentage = Math.max(0, Math.min(100, Math.round((offsetX / rect.width) * 100)));
		shutters = shutters.map((s) => (s.id === id ? { ...s, position: percentage } : s));
	}

	function handlePointerDown(e: MouseEvent | TouchEvent, element: HTMLDivElement, id: number) {
		activeDraggingId = id;
		updatePosition(e, element, id);
	}

	function handlePointerMove(e: MouseEvent | TouchEvent, element: HTMLDivElement, id: number) {
		if (activeDraggingId === id) updatePosition(e, element, id);
	}

	function handlePointerUp() {
		activeDraggingId = null;
	}

	function setAll(targetPosition: number) {
		shutters = shutters.map((s) => ({ ...s, position: targetPosition }));
	}

	// Knob bleibt innerhalb der Balken-Enden sichtbar, statt an den Rändern abgeschnitten zu werden
	function knobPosition(pos: number) {
		return Math.min(94, Math.max(6, pos));
	}
</script>

<svelte:window onmouseup={handlePointerUp} ontouchend={handlePointerUp} />

<div class="flex h-screen flex-col items-center bg-navy-950 text-cream-100 select-none">
	<header class="w-full max-w-md shrink-0 px-6 pt-6 pb-4">
		<h1 class="text-center text-sm font-bold tracking-[0.2em] text-orange-500 uppercase">
			Rolläden
		</h1>
	</header>

	<main
		class="flex w-full max-w-md flex-1 flex-col justify-between overflow-y-auto px-4"
		style="padding-bottom: calc(10rem + env(safe-area-inset-bottom));"
	>
		{#each shutters as shutter (shutter.id)}
			{@const isDragging = activeDraggingId === shutter.id}
			<div class="flex w-full flex-col gap-1">
				<!-- Label über dem Slider -->
				<span class="px-3 text-sm font-bold tracking-wide text-cream-100">
					{shutter.name}
				</span>

				<!-- Slider: Track jetzt so hoch wie der Knob (h-9 statt h-16) -->
				<div class="relative h-10 w-full">
					<div
						role="slider"
						aria-valuenow={shutter.position}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={shutter.name}
						tabindex="0"
						class="absolute inset-0 cursor-pointer touch-none overflow-hidden rounded-full border-4 border-navy-800 bg-navy-900"
						onmousedown={(e) => handlePointerDown(e, e.currentTarget, shutter.id)}
						onmousemove={(e) => handlePointerMove(e, e.currentTarget, shutter.id)}
						ontouchstart={(e) => handlePointerDown(e, e.currentTarget, shutter.id)}
						ontouchmove={(e) => handlePointerMove(e, e.currentTarget, shutter.id)}
					>
						<div
							class="pointer-events-none absolute top-0 bottom-0 left-0 transition-[width] duration-150 ease-out {isDragging
								? 'stripes'
								: 'bg-teal-500'}"
							style="width: {shutter.position}%;"
						></div>
					</div>

					<!-- Knob: gleiche Größe wie Track-Höhe -->
					<div
						class="pointer-events-none absolute top-1/2 h-10 w-10 rounded-full border-4 border-orange-500 bg-cream-100 transition-[left] duration-150 ease-out"
						style="left: {knobPosition(shutter.position)}%; transform: translate(-50%, -50%);"
					></div>
				</div>
			</div>
		{/each}
	</main>

	<footer
		class="fixed right-0 left-0 z-40 bg-navy-950 p-4"
		style="bottom: calc(4rem + env(safe-area-inset-bottom));"
	>
		<div class="mx-auto grid w-full max-w-md grid-cols-3 gap-3">
			<button
				type="button"
				onclick={() => setAll(0)}
				class="flex flex-col items-center justify-center rounded-full bg-navy-800 py-2.5 text-cream-100 transition-all active:scale-95 active:bg-teal-700"
			>
				<ArrowDown class="mb-1 h-5 w-5 stroke-3 text-teal-500" />
				<span class="text-[9px] font-bold tracking-wider uppercase">Alle Runter</span>
			</button>

			<button
				type="button"
				onclick={() => setAll(50)}
				class="flex flex-col items-center justify-center rounded-full bg-navy-800 py-2.5 text-cream-100 transition-all active:scale-95 active:bg-orange-500/30"
			>
				<Octagon class="mb-1 h-5 w-5 stroke-3 text-orange-500" />
				<span class="text-[9px] font-bold tracking-wider uppercase">Stop</span>
			</button>
			<button
				type="button"
				onclick={() => setAll(100)}
				class="flex flex-col items-center justify-center rounded-full bg-navy-800 py-2.5 text-cream-100 transition-all active:scale-95 active:bg-teal-700"
			>
				<ArrowUp class="mb-1 h-5 w-5 stroke-3 text-teal-500" />
				<span class="text-[9px] font-bold tracking-wider uppercase">Alle Hoch</span>
			</button>
		</div>
	</footer>
</div>

<style>
	.stripes {
		background-image: repeating-linear-gradient(
			135deg,
			var(--color-orange-500) 0 12px,
			var(--color-teal-500) 12px 24px
		);
		background-size: 34px 34px;
		animation: stripes-move 0.6s linear infinite;
	}
</style>
