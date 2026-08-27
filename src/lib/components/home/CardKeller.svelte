<script lang="ts">
	import Thermometer from '@lucide/svelte/icons/thermometer';
	import Droplet from '@lucide/svelte/icons/droplet';
	import BatteryFull from '@lucide/svelte/icons/battery-full';
	import BatteryLow from '@lucide/svelte/icons/battery-low';
	import Plug from '@lucide/svelte/icons/plug';
	import { sensorStore } from '$lib/stores/sensors.sse.svelte';

	const keller = $derived(sensorStore.data['keller']);
</script>

<div class="col-span-2 flex flex-col gap-4 rounded-3xl border-4 border-navy-800 bg-navy-900 p-5">
	<div class="flex items-center justify-between">
		<span class="text-sm font-bold tracking-wide text-cream-100/50 uppercase">Keller</span>
		{#if keller?.externalPower}
	<Plug class="h-4 w-4 stroke-3 text-teal-500" />
{:else if keller?.batteryPercent != null}
	{@const isLow = keller.batteryPercent <= 10}
	<div class="flex items-center gap-1">
		{#if isLow}
			<BatteryLow class="h-4 w-4 stroke-3 text-orange-500" />
		{:else}
			<BatteryFull class="h-4 w-4 stroke-3 text-cream-100/50" />
		{/if}
		<span class="text-xs font-bold {isLow ? 'text-orange-500' : 'text-cream-100/50'}">
			{keller.batteryPercent}%
		</span>
	</div>
{/if}
	</div>

	<div class="grid grid-cols-2">
		<div>
			<div class="flex items-center gap-2">
				<Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
				<span class="text-2xl font-bold text-cream-100">
					{keller?.tempC != null ? keller.tempC.toFixed(1) : '–'}°
				</span>
			</div>
			<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Temperatur</div>
		</div>
		<div class="ml-7">
			<div class="flex items-center gap-2">
				<Droplet class="h-5 w-5 stroke-3 text-teal-500" />
				<span class="text-2xl font-bold text-cream-100">
					{keller?.humidity != null ? keller.humidity : '–'}%
				</span>
			</div>
			<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Feuchtigkeit</div>
		</div>
	</div>
</div>