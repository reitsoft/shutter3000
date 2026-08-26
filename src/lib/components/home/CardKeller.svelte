<script lang="ts">
	import Thermometer from '@lucide/svelte/icons/thermometer';
	import Droplet from '@lucide/svelte/icons/droplet';

	// Platzhalter-State — später via Home Assistant / myVAILLANT-Integration ersetzen
	let kellerTemperatur = $state(16.2);
	let kellerLuftfeuchtigkeit = $state(58);
</script>

<div
			class="col-span-2 flex flex-col gap-4 rounded-3xl border-4 border-navy-800 bg-navy-900 p-5"
		>
			<span class="text-sm font-bold tracking-wide text-cream-100/50 uppercase">Keller</span>

			<div class="grid grid-cols-2">
				<div>
					<div class="flex items-center gap-2">
						<Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
						<span class="text-2xl font-bold text-cream-100">{kellerTemperatur.toFixed(1)}°</span>
					</div>
					<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Temperatur</div>
				</div>
				<div class="ml-7">
					<div class="flex items-center gap-2">
						<Droplet class="h-5 w-5 stroke-3 text-teal-500" />
						<span class="text-2xl font-bold text-cream-100">{kellerLuftfeuchtigkeit}%</span>
					</div>
					<div class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">
						Feuchtigkeit
					</div>
				</div>
			</div>
		</div>