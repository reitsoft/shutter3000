<script lang="ts">
	import Thermometer from '@lucide/svelte/icons/thermometer';
	import Flame from '@lucide/svelte/icons/flame';
	import Droplets from '@lucide/svelte/icons/droplets';
	import Waves from '@lucide/svelte/icons/waves';
	import Zap from '@lucide/svelte/icons/zap';
	import Droplet from '@lucide/svelte/icons/droplet';
	import Fan from '@lucide/svelte/icons/fan';

	// Platzhalter-State — später via Home Assistant / myVAILLANT-Integration ersetzen
	let raumtemperatur = $state(21.4);
	let heizungAn = $state(true);
	let warmwassertemperatur = $state(48.2);
	let warmwasserAn = $state(false);
	let aktuellerVerbrauch = $state(1240); // Watt
	let badTemperatur = $state(23.8);
	let badLuftfeuchtigkeit = $state(62);

	const LUEFTER_LAUFZEIT_SEKUNDEN = 120; // 2 Minuten

	let luefterAn = $state(false);
	let restlaufzeitSekunden = $state(0);

	let restlaufzeitMinuten = $derived(Math.ceil(restlaufzeitSekunden / 60));

	function toggleLuefter() {
		if (luefterAn) {
			luefterAn = false;
			restlaufzeitSekunden = 0;
		} else {
			luefterAn = true;
			restlaufzeitSekunden = LUEFTER_LAUFZEIT_SEKUNDEN;
		}
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

<div class="flex h-screen flex-col items-center bg-navy-950 text-cream-100 select-none">
	<header class="w-full max-w-md shrink-0 px-6 pt-6 pb-4">
		<h1 class="text-center text-sm font-bold tracking-[0.2em] text-orange-500 uppercase">Haus</h1>
	</header>

	<main
		class="grid w-full max-w-md flex-1 grid-cols-2 content-start gap-4 overflow-y-auto px-4"
		style="padding-bottom: calc(10rem + env(safe-area-inset-bottom));"
	>
		<!-- Kachel: Raumtemperatur -->
		<div class="flex flex-col gap-3 rounded-3xl border-4 border-navy-800 bg-navy-900 p-5">
			<Thermometer class="h-6 w-6 stroke-3 text-teal-500" />
			<div>
				<div class="text-3xl font-bold text-cream-100">{raumtemperatur.toFixed(1)}°</div>
				<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">
					Raumtemperatur
				</div>
			</div>
			<div class="mt-auto flex w-fit items-center gap-2 rounded-full bg-navy-950 px-2 py-1.5">
				<Flame class="h-3.5 w-3.5 {heizungAn ? 'text-orange-500' : 'text-cream-100/30'} stroke-3" />
				<span
					class="text-[10px] font-bold tracking-wider uppercase {heizungAn
						? 'text-cream-100'
						: 'text-cream-100/40'}"
				>
					Heizung {heizungAn ? 'An' : 'Aus'}
				</span>
			</div>
		</div>

		<!-- Kachel: Warmwasser -->
		<div class="flex flex-col gap-3 rounded-3xl border-4 border-navy-800 bg-navy-900 p-5">
			<Droplets class="h-6 w-6 stroke-3 text-teal-500" />
			<div>
				<div class="text-3xl font-bold text-cream-100">{warmwassertemperatur.toFixed(1)}°</div>
				<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Warmwasser</div>
			</div>
			<div class="mt-auto flex w-fit items-center gap-2 rounded-full bg-navy-950 px-2 py-1.5">
				<Waves
					class="h-3.5 w-3.5 {warmwasserAn ? 'text-orange-500' : 'text-cream-100/30'} stroke-3"
				/>
				<span
					class="text-[10px] font-bold tracking-wider uppercase {warmwasserAn
						? 'text-cream-100'
						: 'text-cream-100/40'}"
				>
					Aufbereitung {warmwasserAn ? 'An' : 'Aus'}
				</span>
			</div>
		</div>

		<!-- Kachel: Stromverbrauch (volle Breite) -->
		<div
			class="col-span-2 flex items-center gap-4 rounded-3xl border-4 border-navy-800 bg-navy-900 p-5"
		>
			<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-950">
				<Zap class="h-6 w-6 stroke-3 text-orange-500" />
			</div>
			<div>
				<div class="text-3xl font-bold text-cream-100">
					{aktuellerVerbrauch.toLocaleString('de-DE')} W
				</div>
				<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">
					Aktueller Stromverbrauch
				</div>
			</div>
		</div>

		<!-- Kachel: Bad -->
		<div
			class="col-span-2 flex flex-col gap-4 rounded-3xl border-4 border-navy-800 bg-navy-900 p-5"
		>
			<span class="text-sm font-bold tracking-wide text-cream-100/50 uppercase">Bad</span>

			<div class="grid grid-cols-2">
				<div>
					<div class="flex items-center gap-2">
						<Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
						<span class="text-3xl font-bold text-cream-100">{badTemperatur.toFixed(1)}°</span>
					</div>
					<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Temperatur</div>
				</div>
				<div class="ml-7">
					<div class="flex items-center gap-2">
						<Droplet class="h-5 w-5 stroke-3 text-teal-500" />
						<span class="text-3xl font-bold text-cream-100">{badLuftfeuchtigkeit}%</span>
					</div>
					<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">
						Feuchtigkeit
					</div>
				</div>
			</div>

			<!-- Lüfter-Zeile -->
			<div class="flex items-center gap-2 rounded-full bg-navy-900 py-1.5 pr-4 pl-2">
  <button
    type="button"
    role="switch"
    aria-checked={luefterAn}
    aria-label={luefterAn ? `Badlüfter ausschalten, noch ${restlaufzeitMinuten} Minuten aktiv` : 'Badlüfter einschalten'}
    onclick={toggleLuefter}
    class="relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150 {luefterAn ? 'bg-teal-500' : 'bg-navy-800'}"
  >
    <span
      class="absolute top-1/2 h-5 w-5 rounded-full border-2 bg-cream-100 {luefterAn ? 'border-orange-500' : 'border-navy-950'} transition-[left] duration-150 ease-out"
      style="left: {luefterAn ? '1.65rem' : '0.15rem'}; transform: translateY(-50%);"
    ></span>
  </button>

  <Fan
  class="h-5 w-5 stroke-2 {luefterAn ? 'text-orange-500' : 'text-cream-100/30'}"
  style={luefterAn ? 'animation: fan-spin 1.4s linear infinite;' : ''}
/>
  <span class="text-sm font-bold uppercase {luefterAn ? 'text-cream-100' : 'text-cream-100/40'}">
    Lüfter ist {luefterAn ? `An · noch ${restlaufzeitMinuten} Min` : 'Aus'}
  </span>
</div>

		</div>
	</main>
</div>
