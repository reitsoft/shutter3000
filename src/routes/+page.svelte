<script lang="ts">
	import Thermometer from '@lucide/svelte/icons/thermometer';
	import Droplet from '@lucide/svelte/icons/droplet';
	import Droplets from '@lucide/svelte/icons/droplets';
	import Flame from '@lucide/svelte/icons/flame';
	import Waves from '@lucide/svelte/icons/waves';
	import Fan from '@lucide/svelte/icons/fan';
	import DoorOpen from '@lucide/svelte/icons/door-open';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	import Check from '@lucide/svelte/icons/check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { CircleCheck, Power, Sparkles } from '@lucide/svelte';

	import { kondensationsRisiko } from '$lib/utilities/taupunkt';

	// Dummy-Daten
	const strom = {
		kwhHeute: 4,
		kostenHeute: '1,08',
		kwhMonat: 124,
		kostenMonat: '33,48'
	};
	const heizung = { temp: 21.4, an: true };
	const warmwasser = { temp: 48.2, aufbereitung: false };
	const bad = { temp: 23.8, feuchtigkeit: 62 };

	let luefterAn = $state(false);
	let restlaufzeitSekunden = $state(600);
	let restlaufzeitMinuten = $derived(Math.ceil(restlaufzeitSekunden / 60));

	type Modus = 'auto' | 'timer' | 'aus';
	let modus = $state<Modus>('aus');

	// Dummy-Daten — durch echte Props/Store-Werte ersetzen
	let kellerDummy = {
		temp: 15.8,
		feuchtigkeit: 57
	};

	let aussen = {
		temp: 26.4,
		feuchtigkeit: 53
	};

	let taupunktStatus = $derived(
		aussen.temp != null && aussen.feuchtigkeit != null && kellerDummy.temp != null
			? kondensationsRisiko({
					quellTempC: aussen.temp,
					quellFeuchtePercent: aussen.feuchtigkeit,
					oberflaechenTempC: kellerDummy.temp
				})
			: null
	);

	// Automatische Skalierung: verhindert Scrollbalken, indem der Content
	// bei zu wenig Platz proportional verkleinert wird
	let outerHeight = $state(0);
	let contentHeight = $state(0);
	let scale = $derived(contentHeight > 0 ? Math.min(1, outerHeight / contentHeight) : 1);

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

	// Türöffner (Slide to Unlock)
	const TUER_KNOB_GROESSE = 48;
	const TUER_TRACK_PADDING = 6;
	const AUTO_VERRIEGELN_MS = 4000;

	let tuerEntriegelt = $state(false);
	let tuerTrackBreite = $state(0);
	let tuerDragX = $state(0);
	let tuerDragging = $state(false);
	let tuerPointerStartX = 0;
	let tuerDragStartX = 0;
	let autoLockTimeout: ReturnType<typeof setTimeout> | undefined;

	let tuerMaxDrag = $derived(
		Math.max(tuerTrackBreite - TUER_KNOB_GROESSE - TUER_TRACK_PADDING * 2, 0)
	);
	let tuerFortschritt = $derived(tuerMaxDrag > 0 ? tuerDragX / tuerMaxDrag : 0);

	function onTuerPointerDown(e: PointerEvent) {
		if (tuerEntriegelt) return;
		tuerDragging = true;
		tuerPointerStartX = e.clientX;
		tuerDragStartX = tuerDragX;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onTuerPointerMove(e: PointerEvent) {
		if (!tuerDragging) return;
		const delta = e.clientX - tuerPointerStartX;
		tuerDragX = Math.min(Math.max(tuerDragStartX + delta, 0), tuerMaxDrag);
	}

	function onTuerPointerUp() {
		if (!tuerDragging) return;
		tuerDragging = false;
		if (tuerFortschritt > 0.85) {
			tuerEntriegeln();
		} else {
			tuerDragX = 0;
		}
	}

	function tuerEntriegeln() {
		tuerEntriegelt = true;
		tuerDragX = tuerMaxDrag;
		clearTimeout(autoLockTimeout);
		autoLockTimeout = setTimeout(() => {
			tuerEntriegelt = false;
			tuerDragX = 0;
		}, AUTO_VERRIEGELN_MS);
	}
</script>

<!-- Äußerer Container: feste Viewport-Höhe, zentriert den skalierten Content -->
<div
	bind:clientHeight={outerHeight}
	class="flex h-full w-full items-start justify-center overflow-hidden bg-navy-950"
>
	<!-- Innerer Container: wird gemessen und bei Bedarf herunterskaliert, Breite bleibt fix -->
	<div
		bind:clientHeight={contentHeight}
		style="transform: scale({scale}); transform-origin: top center; width: 28rem;"
		class="flex flex-col text-cream-100 select-none"
	>
		<!-- Header -->
		<header class="flex w-full shrink-0 items-center justify-between px-6 pt-7 pb-2">
			<div>
				<h1
					class="font-handwriting font-bold tracking-wide whitespace-nowrap text-cream-100"
					style="font-size: clamp(1.25rem, 7vw, 2.25rem);"
				>
					Dahoam is Dahoam
				</h1>
			</div>
		</header>

		<main class="w-full px-4 pb-4">
			<div class="flex flex-col gap-4">
				<!-- Stromverbrauch -->
				<div class="grid grid-cols-2 divide-x divide-navy-800 rounded-2xl bg-navy-900 p-4">
					<!-- Verbrauch heute -->
					<div class="flex items-center gap-3 pr-4 pl-2">
						<div class="flex min-w-0 flex-1 flex-col justify-center">
							<div class="flex items-center gap-1.5">
								<span class="text-2xl leading-tight font-bold text-cream-100">{strom.kwhHeute}</span
								>
								<span class="text-cream-200 text-sm font-medium">kWh</span>
								<span
									class="ml-auto rounded-md bg-navy-800 px-2 py-0.5 text-xs font-bold text-cream-100"
								>
									{strom.kostenHeute} €
								</span>
							</div>
							<span class="mt-0.5 truncate text-sm text-cream-100/50">Verbrauch heute</span>
						</div>
					</div>

					<!-- Diesen Monat -->
					<div class="flex items-center pl-4">
						<div class="flex min-w-0 flex-1 flex-col justify-center">
							<div class="flex items-center gap-1.5">
								<span class="text-2xl leading-tight font-bold text-cream-100">{strom.kwhMonat}</span
								>
								<span class="text-cream-200 text-sm font-medium">kWh</span>
								<span
									class="ml-auto rounded-md bg-navy-800 px-2 py-0.5 text-xs font-bold text-cream-100"
								>
									{strom.kostenMonat} €
								</span>
							</div>
							<span class="mt-0.5 truncate text-sm text-cream-100/50">Diesen Monat</span>
						</div>
					</div>
				</div>

				<!-- Heizung / Warmwasser -->
				<div class="flex flex-col gap-4 rounded-3xl border border-navy-800 bg-navy-900 p-5">
                <span class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Haus</span>
					<div class="grid grid-cols-2 divide-x divide-cream-100/10">
						<div class="flex items-center gap-3">
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/10"
							>
								<Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
							</div>
							<div>
								<div class="text-2xl font-bold text-cream-100">{heizung.temp.toFixed(1)}°</div>
								<div class="text-xs text-cream-100/50">Temperatur</div>
							</div>
						</div>
						<div class="flex items-center gap-3 pl-4">
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10"
							>
								<Droplets class="h-5 w-5 stroke-3 text-orange-500/80" />
							</div>
							<div>
								<div class="text-2xl font-bold text-cream-100">{warmwasser.temp.toFixed(1)}°</div>
								<div class="text-xs text-cream-100/50">Warmwasser</div>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<span
							class="inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-1.5 text-[11px] font-bold tracking-wide uppercase {heizung.an
								? 'border-orange-500/30 text-orange-500'
								: 'border-cream-100/15 text-cream-100/50'}"
						>
							<Flame class="h-4.5 w-4.5 stroke-3 {heizung.an ? 'animate-pulse' : ''}" />
							Heizung {heizung.an ? 'an' : 'aus'}
						</span>
						<span
							class="mx-2 inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-1.5 text-[11px] font-bold tracking-wide uppercase {warmwasser.aufbereitung
								? 'border-orange-500/30 text-orange-500'
								: 'border-cream-100/15 text-cream-100/50'}"
						>
							<Waves
								class="h-4.5 w-4.5 stroke-3 {warmwasser.aufbereitung ? 'animate-pulse' : ''}"
							/>
							Aufwärmen {warmwasser.aufbereitung ? 'an' : 'aus'}
						</span>
					</div>
				</div>

				<!-- Bad -->
				<div class="flex flex-col gap-4 rounded-3xl border border-navy-800 bg-navy-900 p-5">
					<span class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Bad</span>

					<div class="grid grid-cols-2 divide-x divide-cream-100/10">
						<div class="flex items-center gap-3">
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/10"
							>
								<Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
							</div>
							<div>
								<div class="text-2xl font-bold text-cream-100">{bad.temp.toFixed(1)}°</div>
								<div class="text-xs text-cream-100/50">Temperatur</div>
							</div>
						</div>
						<div class="flex items-center gap-3 pl-4">
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10"
							>
								<Droplet class="h-5 w-5 stroke-3 text-blue-400" />
							</div>
							<div>
								<div class="text-2xl font-bold text-cream-100">{bad.feuchtigkeit}%</div>
								<div class="text-xs text-cream-100/50">Feuchtigkeit</div>
							</div>
						</div>
					</div>

					<!-- Lüfter Segmented Control -->
					<div
						role="radiogroup"
						aria-label="Lüfter-Modus auswählen"
						class="flex h-10 w-full max-w-xs items-center justify-between self-center rounded-full border border-cream-100/10 bg-navy-950 p-1"
					>
						<!-- Auto -->
						<button
							type="button"
							role="radio"
							aria-checked={modus === 'auto'}
							onclick={() => (modus = 'auto')}
							class="flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 transition-colors {modus ===
							'auto'
								? 'bg-teal-500 font-bold text-navy-950'
								: 'text-cream-100/40 hover:text-cream-100/70'}"
						>
							<Sparkles class="h-5 w-5 stroke-2 {modus === 'auto' ? 'animate-pulse' : ''}" />
							<span class="text-[10px] tracking-wide uppercase">Auto</span>
						</button>

						<!-- Ein (10 Min) -->
						<button
							type="button"
							role="radio"
							aria-checked={modus === 'timer'}
							onclick={() => (modus = 'timer')}
							class="flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 transition-colors {modus ===
							'timer'
								? 'bg-teal-500 font-bold text-navy-950'
								: 'text-cream-100/40 hover:text-cream-100/70'}"
						>
							<Fan
								class="h-5 w-5 stroke-2 {modus === 'timer' ? 'animate-spin' : ''}"
								style={modus === 'timer' ? 'animation-duration: 1.4s;' : ''}
							/>
							<span class="text-[10px] tracking-wide uppercase">
								{modus === 'timer' ? `${restlaufzeitMinuten} Min` : '10 min'}
							</span>
						</button>

						<!-- Aus -->
						<button
							type="button"
							role="radio"
							aria-checked={modus === 'aus'}
							onclick={() => (modus = 'aus')}
							class="flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 transition-colors {modus ===
							'aus'
								? 'bg-cream-100/10 font-bold text-cream-100'
								: 'text-cream-100/40 hover:text-cream-100/70'}"
						>
							<Power class="h-5 w-5 stroke-2" />
							<span class="text-[10px] tracking-wide uppercase">Aus</span>
						</button>
					</div>
				</div>

				<!-- Keller -->
				<div class="flex flex-col gap-4 rounded-3xl border border-navy-800 bg-navy-900 p-5">
					<div class="relative flex items-center">
						<span class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Keller</span>

						{#if taupunktStatus}
							<div
								class="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase
				{taupunktStatus.risiko ? 'bg-orange-500/10 text-orange-400' : 'bg-teal-500/10 text-teal-500'}"
							>
								{#if taupunktStatus.risiko}
									<TriangleAlert class="h-4.5 w-4.5 animate-pulse stroke-2" />
									Kondensationsrisiko
								{:else}
									<CircleCheck class="h-3.5 w-3.5 stroke-2" />
									Taupunkt OK
								{/if}
							</div>
						{/if}
					</div>

					<div class="grid grid-cols-2 divide-x divide-cream-100/10">
						<div class="flex items-center gap-3">
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/10"
							>
								<Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
							</div>
							<div>
								<div class="text-2xl font-bold text-cream-100">
									{kellerDummy.temp != null ? kellerDummy.temp.toFixed(1) : '–'}°
								</div>
								<div class="text-xs text-cream-100/50">Temperatur</div>
							</div>
						</div>
						<div class="flex items-center gap-3 pl-4">
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10"
							>
								<Droplet class="h-5 w-5 stroke-3 text-blue-400" />
							</div>
							<div>
								<div class="text-2xl font-bold text-cream-100">
									{kellerDummy.feuchtigkeit != null ? kellerDummy.feuchtigkeit : '–'}%
								</div>
								<div class="text-xs text-cream-100/50">Feuchtigkeit</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Haustür -->
				<div class="flex flex-col gap-4 rounded-3xl border border-navy-800 bg-navy-900 p-5">
					<div class="flex items-center gap-3">
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/10"
						>
							<DoorOpen class="h-5 w-5 stroke-3 text-teal-500" />
						</div>
						<span class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Haustür</span>
					</div>

					<div
						bind:clientWidth={tuerTrackBreite}
						class="relative h-15 w-full overflow-hidden rounded-full border border-cream-100/10 bg-navy-950 p-1.5"
					>
						<div
							class="absolute inset-y-1.5 left-1.5 rounded-full bg-navy-950/15"
							style="width: {tuerDragX + TUER_KNOB_GROESSE / 2}px; transition: {tuerDragging
								? 'none'
								: 'width 200ms ease-out'};"
						></div>

						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<span
								class="text-xs font-bold tracking-wide uppercase {tuerEntriegelt
									? 'text-orange-500'
									: 'text-cream-100/40'}"
								style="opacity: {tuerEntriegelt ? 1 : Math.max(1 - tuerFortschritt * 1.6, 0)};"
							>
								{tuerEntriegelt ? 'Tür entriegelt' : 'Schieben zum Entriegeln'}
							</span>
						</div>

						<button
							type="button"
							aria-label={tuerEntriegelt
								? 'Tür ist entriegelt'
								: 'Zum Entriegeln nach rechts schieben'}
							onpointerdown={onTuerPointerDown}
							onpointermove={onTuerPointerMove}
							onpointerup={onTuerPointerUp}
							onpointercancel={onTuerPointerUp}
							class="absolute inset-y-1.5 left-1.5 z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full {tuerEntriegelt
								? 'bg-teal-500'
								: 'bg-cream-100/10'}"
							style="touch-action: none; transform: translateX({tuerDragX}px); transition: {tuerDragging
								? 'none'
								: 'transform 200ms ease-out'};"
						>
							{#if tuerEntriegelt}
								<Check class="h-6 w-6 stroke-3 text-navy-950" />
							{:else}
								<ChevronsRight class="h-6 w-6 stroke-3 text-cream-100/40" />
							{/if}
						</button>
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
