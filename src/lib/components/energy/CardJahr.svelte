<script lang="ts">
	import { ChartNoAxesColumnIncreasing } from '@lucide/svelte';
	import { Bar } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		Filler,
		BarElement,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		type ChartData,
		type ChartOptions
	} from 'chart.js';
	import annotationPlugin from 'chartjs-plugin-annotation';

	// Chart.js Module für Balkendiagramm registrieren
	ChartJS.register(
		Title,
		Tooltip,
		Legend,
		Filler,
		BarElement,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		annotationPlugin
	);

	// 1. Monats-Labels für das Jahr
	const monateLabels = [
		'Jan',
		'Feb',
		'Mär',
		'Apr',
		'Mai',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Okt',
		'Nov',
		'Dez'
	];

	// 2. Mockdaten pro Kategorie (in kWh)
	const heizungData = [320, 280, 190, 70, 10, 0, 0, 0, 15];
	const warmwasserData = [85, 80, 85, 80, 75, 70, 70, 70, 85];
	const haushaltData = [145, 140, 145, 135, 130, 125, 130, 135, 140];

	const sumHeizung = heizungData.reduce((acc, v) => acc + v, 0); // 885 kWh
	const sumWarmwasser = warmwasserData.reduce((acc, v) => acc + v, 0); // 700 kWh
	const sumHaushalt = haushaltData.reduce((acc, v) => acc + v, 0); // 1225 kWh

	// Summe aller Monate berechnen
	const VERBRAUCH_JAHR = [...heizungData, ...warmwasserData, ...haushaltData].reduce(
		(acc, val) => acc + val,
		0
	);

	// 3. Chart.js Data (Gestapelte Datensätze)
	const jahrChartData: ChartData<'bar'> = {
		labels: monateLabels,
		datasets: [
			{
				label: 'Haushalt',
				data: haushaltData,
				backgroundColor: '#3b82f6', // Tailwind blue-500
				borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
			},
			{
				label: 'Warmwasser',
				data: warmwasserData,
				backgroundColor: '#06b6d4' // Tailwind cyan-500
			},
			{
				label: 'Heizung',
				data: heizungData,
				backgroundColor: '#e8632c', // Dein Akzent-Orange
				borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
			}
		]
	};

	// 4. Chart.js Options (Stacked-Modus)
	const jahrChartOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				enabled: true,
				mode: 'index',
				intersect: false,
				displayColors: true,
				callbacks: {
					title: (items) => items[0].label,
					label: (context) => ` ${context.dataset.label}: ${context.parsed.y} kWh`,
					// Zeigt im Tooltip zusätzlich den Gesamtwert des Monats an
					footer: (items) => {
						const total = items.reduce((sum, item) => sum + (item.parsed.y ?? 0), 0);
						return `Gesamt: ${total} kWh`;
					}
				}
			}
		},
		scales: {
			x: {
				stacked: true, // Wichtig für gestapelte Balken!
				grid: { display: false },
				border: { display: false },
				ticks: {
					color: 'rgba(255, 248, 240, 0.3)',
					font: { size: 10 },
					maxRotation: 0
				}
			},
			y: {
				stacked: true, // Wichtig für gestapelte Balken!
				display: false,
				grid: { display: false },
				beginAtZero: true
			}
		}
	};
</script>

<div class="rounded-2xl bg-navy-900 p-5 pb-3">
	<div class="flex items-center justify-between px-1 pb-3">
		<!-- Linker Block (Verbrauch) -->
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100/10 text-cream-100/70"
			>
				<ChartNoAxesColumnIncreasing class="h-5 w-5" />
			</div>
			<div class="flex flex-col">
				<span class="text-xs font-medium tracking-wide text-cream-100/40 uppercase">
					Jahresverbrauch
				</span>
				<div class="flex items-baseline gap-1">
					<span class="text-2xl font-semibold tracking-tight text-cream-100">
						{VERBRAUCH_JAHR.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
					</span>
					<span class="text-cream-200/60 text-xs font-medium">kWh</span>
				</div>
			</div>
		</div>

		<!-- Rechter Block: self-end schiebt es ganz nach unten -->
		<div class="gap-0.8 flex flex-col self-end pb-0.5 text-xs font-medium text-cream-100/60">
			<div class="flex items-center gap-1.5 whitespace-nowrap">
				<span class="h-2 w-2 rounded-full bg-orange-500"></span>
				<span>Heizung: <span class="text-white/40">{sumHeizung} kWh</span></span>
			</div>
			<div class="flex items-center gap-1.5 whitespace-nowrap">
				<span class="h-2 w-2 rounded-full bg-[#06b6d4]"></span>
				<span>Warmwasser: <span class="text-white/40">{sumWarmwasser} kWh</span></span>
			</div>
			<div class="flex items-center gap-1.5 whitespace-nowrap">
				<span class="h-2 w-2 rounded-full bg-[#3b82f6]"></span>
				<span>Haushalt: <span class="text-white/40">{sumHaushalt} kWh</span></span>
			</div>
		</div>
	</div>

	<!-- svelte-chartjs Stacked Bar Component -->
	<div class="h-32 w-full pt-1">
		<Bar data={jahrChartData} options={jahrChartOptions} />
	</div>
</div>