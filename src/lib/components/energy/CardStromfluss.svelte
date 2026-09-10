<!-- $lib/components/home/CardStromfluss.svelte -->
<script lang="ts">
	import type { ChartData, ChartOptions } from 'chart.js';
	import { Waypoints } from '@lucide/svelte';
	import { Chart as SvelteChart } from 'svelte-chartjs';
	import { Chart as ChartJS, Tooltip } from 'chart.js';
	import { SankeyController, Flow } from 'chartjs-chart-sankey';

	ChartJS.register(SankeyController, Flow, Tooltip);

	// Bestehende Werte aus CardVerbrauch übernehmen (dieselbe Datenquelle!)
const sumHeizung = 885;
const sumWarmwasser = 700;
const sumHaushalt = 1225;
const GEBAEUDE_GESAMT = sumHeizung + sumWarmwasser + sumHaushalt; // 2810 kWh

const STROM_ERZEUGT = 3200; // Beispielwert, aus PV-Daten
const STROM_EINGESPEIST = 900;
const BATTERIE_GELADEN = 600;
const DIREKTVERBRAUCH = STROM_ERZEUGT - STROM_EINGESPEIST - BATTERIE_GELADEN; // 1700 kWh
const STROM_BEZOGEN = GEBAEUDE_GESAMT - DIREKTVERBRAUCH; // 1110 kWh

const sankeyData: ChartData<'sankey', { from: string; to: string; flow: number }[]> = {
	datasets: [
		{
			data: [
				{ from: 'PV-Erzeugung', to: 'Gebäude', flow: DIREKTVERBRAUCH },
				{ from: 'PV-Erzeugung', to: 'Batterie', flow: BATTERIE_GELADEN },
				{ from: 'PV-Erzeugung', to: 'Einspeisung', flow: STROM_EINGESPEIST },
				{ from: 'Netzbezug', to: 'Gebäude', flow: STROM_BEZOGEN },
				{ from: 'Gebäude', to: 'Haushalt', flow: sumHaushalt },
				{ from: 'Gebäude', to: 'Warmwasser', flow: sumWarmwasser },
				{ from: 'Gebäude', to: 'Heizung', flow: sumHeizung }
			],
			nodeWidth: 12, // schmaler statt Standard (10)
			nodePadding: 32, // größerer Abstand zwischen den Balken (Standard: 10)
			colorFrom: (ctx) => {
				const key = ctx.dataset.data[ctx.dataIndex].from;
				if (key === 'PV-Erzeugung') return '#e8632c';
				if (key === 'Netzbezug') return '#64748b';
				return '#3b82f6'; // Gebäude → Unterkategorien
			},
			colorTo: (ctx) => {
				const key = ctx.dataset.data[ctx.dataIndex].to;
				if (key === 'Gebäude') return '#3b82f6';
				if (key === 'Batterie') return '#22c55e';
				if (key === 'Einspeisung') return '#06b6d4';
				if (key === 'Heizung') return '#e8632c';
				if (key === 'Warmwasser') return '#06b6d4';
				return '#3b82f6'; // Haushalt
			},
			colorMode: 'gradient',
			labels: {
				'PV-Erzeugung': 'PV-Erzeugung',
				Netzbezug: 'Netzbezug',
				Gebäude: 'Gebäude',
				Batterie: 'Batterie',
				Einspeisung: 'Einspeisung',
				Haushalt: 'Haushalt',
				Warmwasser: 'Warmwasser',
				Heizung: 'Heizung'
			},
			color: '#fff8f0',
			font: { size: 11 }
		}
	]
};

	const sankeyOptions: ChartOptions<'sankey'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			tooltip: {
				callbacks: {
					label: (ctx) => {
						const d = ctx.dataset.data[ctx.dataIndex];
						return `${d.from} → ${d.to}: ${d.flow.toLocaleString('de-DE')} kWh`;
					}
				}
			}
		}
	};
</script>

<div class="rounded-2xl bg-navy-900 p-3 pb-2">
	<div class="flex items-center justify-between px-1 pb-3">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100/10 text-cream-100/70"
			>
				<Waypoints class="h-5 w-5" />
			</div>
			<div class="flex flex-col">
				<span class="text-xs font-medium tracking-wide text-cream-100/40 uppercase">
					Stromfluss
				</span>
				<div class="flex items-baseline gap-1">
					<span class="text-2xl font-semibold tracking-tight text-cream-100">
						{STROM_ERZEUGT.toLocaleString('de-DE')}
					</span>
					<span class="text-cream-200/60 text-xs font-medium">kWh erzeugt</span>
				</div>
			</div>
		</div>

		<div class="gap-0.8 flex flex-col self-end pb-0.5 text-xs font-medium text-cream-100/60">
			<div class="flex items-center gap-1.5 whitespace-nowrap">
				<span class="h-2 w-2 rounded-full bg-[#22c55e]"></span>
				<span
					>Autarkiegrad: <span class="text-white/40"
						>{Math.round((DIREKTVERBRAUCH / GEBAEUDE_GESAMT) * 100)}%</span
					></span
				>
			</div>
			<div class="flex items-center gap-1.5 whitespace-nowrap">
				<span class="h-2 w-2 rounded-full bg-[#06b6d4]"></span>
				<span>Eingespeist: <span class="text-white/40">{STROM_EINGESPEIST} kWh</span></span>
			</div>
			<div class="flex items-center gap-1.5 whitespace-nowrap">
				<span class="h-2 w-2 rounded-full bg-[#64748b]"></span>
				<span>Bezogen: <span class="text-white/40">{STROM_BEZOGEN} kWh</span></span>
			</div>
		</div>
	</div>

	<div class="h-48 w-full pt-1">
		<SvelteChart type="sankey" data={sankeyData} options={sankeyOptions} />
	</div>
</div>