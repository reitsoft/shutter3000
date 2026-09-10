<script lang="ts">
    import { Zap } from '@lucide/svelte';

    //Dummy-Daten
    const ZAEHLERSTAND = 12237.0;
</script>

<div class="rounded-2xl bg-navy-900 p-3 pb-2">
	<div class="flex items-center gap-5">
		<div
			class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 text-orange-500"
		>
			<Zap class="h-6 w-6" />
		</div>
		<div class="flex flex-col">
			<span class="text-sm font-medium tracking-wide text-cream-100/60 uppercase">
				Zählerstand
			</span>
			<div class="flex items-baseline gap-1">
				<span class="text-2xl leading-tight font-bold text-cream-100">
					{ZAEHLERSTAND.toLocaleString('de-DE', {
						minimumFractionDigits: 1,
						maximumFractionDigits: 1
					})}
				</span>
				<span class="text-md text-cream-200/60 font-medium">kWh</span>
			</div>
		</div>
	</div>
</div>