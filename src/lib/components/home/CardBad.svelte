<script lang="ts">
    import Thermometer from '@lucide/svelte/icons/thermometer';
	import Droplet from '@lucide/svelte/icons/droplet';
	import Fan from '@lucide/svelte/icons/fan';

    const LUEFTER_LAUFZEIT_SEKUNDEN = 120; // 2 Minuten
    const KNOB_GROESSE = 48; // entspricht h-12 / w-12
    const TRACK_PADDING = 6; // entspricht p-1.5

    let badTemperatur = $state(23.8);
	let badLuftfeuchtigkeit = $state(62);
	let luefterAn = $state(false);
	let restlaufzeitSekunden = $state(0);
	let restlaufzeitMinuten = $derived(Math.ceil(restlaufzeitSekunden / 60));

	let trackBreite = $state(0);
	let maxDrag = $derived(Math.max(trackBreite - KNOB_GROESSE - TRACK_PADDING * 2, 0));

	let dragging = $state(false);
	let wurdeGezogen = false; // verhindert, dass nach einem Drag zusätzlich ein Klick feuert
	let dragX = $state(0);
	let pointerStartX = 0;
	let dragStartX = 0;

	// Solange nicht gedraggt wird, folgt der Knopf einfach dem luefterAn-State
	$effect(() => {
		if (dragging) return;
		dragX = luefterAn ? maxDrag : 0;
	});

	function onPointerDown(e: PointerEvent) {
		dragging = true;
		wurdeGezogen = false;
		pointerStartX = e.clientX;
		dragStartX = dragX;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		const delta = e.clientX - pointerStartX;
		if (Math.abs(delta) > 4) wurdeGezogen = true;
		dragX = Math.min(Math.max(dragStartX + delta, 0), maxDrag);
	}

	function onPointerUp() {
		if (!dragging) return;
		dragging = false;
		if (!wurdeGezogen) return; // reiner Klick -> onKlick übernimmt das Toggle
		const fortschritt = maxDrag > 0 ? dragX / maxDrag : 0;
		setLuefter(fortschritt > 0.5);
	}

	function setLuefter(an: boolean) {
		luefterAn = an;
		restlaufzeitSekunden = an ? LUEFTER_LAUFZEIT_SEKUNDEN : 0;
	}

	function onKlick() {
		// Feuert bei Maus-/Touch-Klick UND bei Tastaturbedienung (Enter/Leertaste) des Buttons
		if (wurdeGezogen) return;
		setLuefter(!luefterAn);
	}

	// Läuft nur, solange luefterAn true ist; wird beim Ausschalten/Unmount automatisch aufgeräumt
	$effect(() => {
		if (!luefterAn) return;

		const interval = setInterval(() => {
			restlaufzeitSekunden -= 1;
			if (restlaufzeitSekunden <= 0) {
				luefterAn = false;
				restlaufzeitSekunden = 0;
			}
		}, 1000);

		return () => clearInterval(interval);
	});

</script>

<div
			class="col-span-2 flex flex-col gap-4 rounded-3xl border-4 border-navy-800 bg-navy-900 p-5"
		>
			<span class="text-sm font-bold tracking-wide text-cream-100/50 uppercase">Bad</span>

			<div class="grid grid-cols-2">
				<div>
					<div class="flex items-center gap-2">
						<Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
						<span class="text-2xl font-bold text-cream-100">{badTemperatur.toFixed(1)}°</span>
					</div>
					<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Temperatur</div>
				</div>
				<div class="ml-7">
					<div class="flex items-center gap-2">
						<Droplet class="h-5 w-5 stroke-3 text-teal-500" />
						<span class="text-2xl font-bold text-cream-100">{badLuftfeuchtigkeit}%</span>
					</div>
					<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">
						Feuchtigkeit
					</div>
				</div>
			</div>

			<!-- Lüfter-Schieber -->
			<div
				bind:clientWidth={trackBreite}
				class="relative h-16 w-full overflow-hidden rounded-full bg-navy-950 p-1.5"
			>
				<!-- Beschriftung -->
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
					<span
						class="text-sm font-bold tracking-wide uppercase {luefterAn ? 'text-cream-100' : 'text-cream-100/40'}"
					>
						{luefterAn ? `Restlaufzeit ${restlaufzeitMinuten} Min` : 'Lüfter ist Aus'}
					</span>
				</div>

				<!-- Knopf -->
				<button
					type="button"
					role="switch"
					aria-checked={luefterAn}
					aria-label={luefterAn
						? `Badlüfter ausschalten, noch ${restlaufzeitMinuten} Minuten aktiv`
						: 'Badlüfter einschalten'}
					onpointerdown={onPointerDown}
					onpointermove={onPointerMove}
					onpointerup={onPointerUp}
					onpointercancel={onPointerUp}
					onclick={onKlick}
					class="absolute inset-y-1.5 left-1.5 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-cream-100 shadow-lg {luefterAn
						? 'border-orange-500'
						: 'border-navy-950'}"
					style="touch-action: none; transform: translateX({dragX}px); transition: {dragging
						? 'none'
						: 'transform 200ms ease-out'};"
				>
					<Fan
						class="h-6 w-6 stroke-3 {luefterAn ? 'text-orange-500' : 'text-navy-950'}"
						style={luefterAn ? 'animation: fan-spin 1.4s linear infinite;' : ''}
					/>
				</button>
			</div>
		</div>