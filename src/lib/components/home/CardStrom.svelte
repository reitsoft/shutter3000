<script lang="ts">
    import Thermometer from '@lucide/svelte/icons/thermometer';
	import Flame from '@lucide/svelte/icons/flame';
	import Droplets from '@lucide/svelte/icons/droplets';
	import Waves from '@lucide/svelte/icons/waves';
	import Zap from '@lucide/svelte/icons/zap';


	// Platzhalter-State — später via Home Assistant / myVAILLANT-Integration ersetzen
	let raumtemperatur = $state(21.4);
	let heizungAn = $state(true);
	let warmwassertemperatur = $state(48.2);
	let warmwasserAn = $state(false);
	let aktuellerVerbrauch = $state(4); // kWh

    const PREIS_PRO_KWH = 0.27;
</script>

<div class="col-span-2 flex flex-col gap-5 rounded-3xl border-4 border-navy-800 bg-navy-900 p-5">
  <!-- Hauptwert: Stromverbrauch -->
  <div class="flex items-center justify-between gap-4">
  <div class="flex items-center gap-4">
    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-950">
      <Zap class="h-6 w-6 stroke-3 text-orange-500" />
    </div>
    <div>
      <div class="text-3xl font-bold text-cream-100">
        {aktuellerVerbrauch.toLocaleString('de-DE')} kWh
      </div>
      <div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">
        Stromverbrauch heute
      </div>
    </div>
  </div>

  <div class="flex items-center gap-2 rounded-full bg-navy-950 px-3 py-1.5">
    <span class="text-md font-bold text-cream-100">
      {(aktuellerVerbrauch * PREIS_PRO_KWH).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
    </span>
  </div>
</div>

  <div class="border-t-2 border-navy-800"></div>

  <!-- Nebenwerte: Raumtemperatur & Warmwasser -->
  <div class="grid grid-cols-2">
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
        <span class="text-2xl font-bold text-cream-100">{raumtemperatur.toFixed(1)}°</span>
      </div>
      <div class="text-sm font-bold tracking-wide text-cream-100/50 uppercase">Temperatur</div>
      <div class="flex w-fit items-center gap-2 rounded-full bg-navy-950 px-2 py-1.5">
        <Flame class="h-3.5 w-3.5 {heizungAn ? 'text-orange-500' : 'text-cream-100/30'} stroke-3" />
        <span class="text-[10px] font-bold tracking-wider uppercase {heizungAn ? 'text-cream-100' : 'text-cream-100/40'}">
          Heizung {heizungAn ? 'An' : 'Aus'}
        </span>
      </div>
    </div>

    <div class="ml-7 flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <Droplets class="h-5 w-5 stroke-3 text-teal-500" />
        <span class="text-2xl font-bold text-cream-100">{warmwassertemperatur.toFixed(1)}°</span>
      </div>
      <div class="text-sm font-bold tracking-wide text-cream-100/50 uppercase">Warmwasser</div>
      <div class="flex w-fit items-center gap-2 rounded-full bg-navy-950 px-2 py-1.5">
        <Waves class="h-3.5 w-3.5 {warmwasserAn ? 'text-orange-500' : 'text-cream-100/30'} stroke-3" />
        <span class="text-[10px] font-bold tracking-wider uppercase {warmwasserAn ? 'text-cream-100' : 'text-cream-100/40'}">
          Aufbereitung {warmwasserAn ? 'An' : 'Aus'}
        </span>
      </div>
    </div>
  </div>
</div>