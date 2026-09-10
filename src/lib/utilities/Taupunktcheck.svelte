<script lang="ts">
	import { kondensationsRisiko } from '$lib/utilities/taupunkt';

	interface Props {
		/** Außentemperatur in °C */
		aussenTemp: number;
		/** relative Außenluftfeuchte in % */
		aussenFeuchte: number;
		/** Kellertemperatur in °C (Näherung für Wandoberflächentemperatur) */
		kellerTemp: number;
		/** Sicherheitsabstand in Kelvin (optional, Default 2) */
		sicherheitsabstandK?: number;
	}

	let { aussenTemp, aussenFeuchte, kellerTemp, sicherheitsabstandK = 2 }: Props = $props();

	let ergebnis = $derived(
		kondensationsRisiko({
			quellTempC: aussenTemp,
			quellFeuchtePercent: aussenFeuchte,
			oberflaechenTempC: kellerTemp,
			sicherheitsabstandK
		})
	);
</script>

<div class="taupunkt-check" class:risiko={ergebnis.risiko}>
	<div class="zeile">
		<span>Taupunkt (Außenluft)</span>
		<strong>{ergebnis.taupunktC.toFixed(1)} °C</strong>
	</div>
	<div class="zeile">
		<span>Abstand zur Kellertemp.</span>
		<strong>{ergebnis.abstandK.toFixed(1)} K</strong>
	</div>
	<div class="status">
		{#if ergebnis.risiko}
			⚠️ Kondensationsrisiko — nicht lüften
		{:else}
			✅ Lüften unbedenklich
		{/if}
	</div>
</div>

<style>
	.taupunkt-check {
		display: grid;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		background: color-mix(in srgb, teal 12%, transparent);
	}
	.taupunkt-check.risiko {
		background: color-mix(in srgb, orangered 15%, transparent);
	}
	.zeile {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
	}
	.status {
		margin-top: 0.25rem;
		font-weight: 600;
	}
</style>