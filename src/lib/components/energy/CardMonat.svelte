<!-- src/lib/components/energy/CardMonat.svelte -->
<script lang="ts">
	import { RotateCcwClock, Calendar } from '@lucide/svelte';
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

	// Aktuellen Monat & Gesamttage im Monat berechnen
	const now = new Date();
	const tageImMonat = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
	const heuteTag = now.getDate();

	// Tagesverbrauch-Daten generieren
	let verbrauchMonatGesamt = 0;
	const dataPoints = Array.from({ length: tageImMonat }, (_, i) => {
		const tag = i + 1;

		// Nur bis zum heutigen Tag Werte generieren (zukünftige Tage bleiben null)
		if (tag > heuteTag) return null;

		const basis = 9 + Math.sin(tag / 3) * 3;
		const rauschen = (Math.sin(tag * 12.9898) * 43758.5453) % 1;
		const tagesverbrauch = Math.round(Math.max(3, basis + rauschen * 6) * 10) / 10;

		verbrauchMonatGesamt += tagesverbrauch;
		return tagesverbrauch;
	});

	// X-Achsen Labels für ALLE Tage des Monats (1 bis 28/30/31)
	const labels = Array.from({ length: tageImMonat }, (_, i) => String(i + 1));

	const VERBRAUCH_MONAT = Math.round(verbrauchMonatGesamt * 10) / 10;
	const VERBRAUCH_LETZTER_MONAT = 312.4;

	// Höchsten Tagesverbrauch im Monat ermitteln (Filterung von null-Werten)
	const validDataPoints = dataPoints.filter((val): val is number => val !== null);
	const maxVerbrauch = validDataPoints.length > 0 ? Math.max(...validDataPoints) : 0;

	// Chart.js Data Objekt für Balkendiagramm
	const chartData: ChartData<'bar'> = {
		labels,
		datasets: [
			{
				label: 'Tagesverbrauch (kWh)',
				data: dataPoints,
				hoverBackgroundColor: '#f97316',
				borderRadius: 4, // Abgerundete Balken-Ecken oben
				borderSkipped: false,
				backgroundColor: (context) => {
					const chart = context.chart;
					const { ctx, chartArea } = chart;

					// Falls das Chart noch nicht gerendert wurde
					if (!chartArea) return '#e8632c';

					// Erstellt einen vertikalen Gradienten über die Gesamthöhe der Chart-Area
					const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
					// Oben: Vollton-Orange (#e8632c)
					gradient.addColorStop(0, 'rgba(232, 99, 44, 1.0)');
					// Unten: Stark transparentes Orange
					gradient.addColorStop(1, 'rgba(232, 99, 44, 0.35)');
					return gradient;
				}
			}
		]
	};

	const chartOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				enabled: true,
				mode: 'index',
				intersect: false,
				displayColors: false,
				callbacks: {
					title: (items) => `Tag ${items[0].label}`,
					label: (context) => (context.raw !== null ? `${context.parsed.y} kWh` : 'Keine Daten')
				}
			},
			annotation: {
				annotations: {
					maxLine: {
						type: 'line',
						yMin: maxVerbrauch,
						yMax: maxVerbrauch,
						borderColor: 'rgba(232, 99, 44, 0.6)', // Linie in Akzentfarbe
						borderWidth: 1,
						borderDash: [3, 6], // Erzeugt die gestrichelte Linie (4px Strich, 4px Lücke)
						label: {
							display: true,
							content: `${maxVerbrauch.toFixed(1)} kWh`,
							position: 'end', // Rechter Rand
							backgroundColor: 'rgba(232, 99, 44, 0.85)',
							color: '#fff',
							font: {
								size: 9,
								weight: 'bolder'
							},
							padding: {
								top: 2,
								bottom: 2,
								left: 4,
								right: 4
							},
							borderRadius: 4,
							yAdjust: -10 // Schiebt das Badge leicht über die Linie, damit es lesbar bleibt
						}
					}
				}
			}
		},
		scales: {
			x: {
				grid: { display: false },
				border: { display: false },
				ticks: {
					color: 'rgba(255, 248, 240, 0.3)',
					font: { size: 10 },
					maxRotation: 0,
					callback: (_, index) => {
						const day = index + 1;
						return [5, 15, 25].includes(day) ? day : '';
					}
				}
			},
			y: {
				display: false,
				grid: { display: false },
				beginAtZero: true,
				suggestedMax: maxVerbrauch * 1.2 // Skaliert die Y-Achse leicht über den Maximalwert hinaus, um Platz für das Badge zu schaffen
			}
		}
	};
</script>

<!-- Monatsverbrauch-Card mit Balkendiagramm -->
<div class="flex h-full flex-col overflow-hidden rounded-2xl bg-navy-900 p-3">
	<!-- Header Nebeneinander -->
	<div class="flex shrink-0 items-center justify-between px-1 pb-2">
		<!-- Diesen Monat -->
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-100/10 text-cream-100/70"
			>
				<Calendar class="h-5 w-5" />
			</div>
			<div class="flex flex-col">
				<span class="text-xs font-medium tracking-wide text-cream-100/40 uppercase">
					Aktueller Monat
				</span>
				<div class="flex items-baseline gap-1">
					<span class="text-2xl font-semibold tracking-tight text-cream-100">
						{VERBRAUCH_MONAT.toFixed(1)}
					</span>
					<span class="text-cream-200/60 text-xs font-medium">kWh</span>
				</div>
			</div>
		</div>

		<!-- Vormonat -->
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-100/5 text-cream-100/40"
			>
				<RotateCcwClock class="h-5 w-5" />
			</div>
			<div class="flex flex-col items-start">
				<span class="text-xs font-medium tracking-wide text-cream-100/40 uppercase">
					Vormonat
				</span>
				<div class="flex items-baseline gap-1">
					<span class="text-2xl font-semibold tracking-tight text-cream-100/60">
						{VERBRAUCH_LETZTER_MONAT.toFixed(1)}
					</span>
					<span class="text-xs font-medium text-cream-100/30">kWh</span>
				</div>
			</div>
		</div>
	</div>

	<!-- svelte-chartjs Bar Component -->
	<div class="relative h-28 w-full flex-1 overflow-hidden pt-2">
		<Bar data={chartData} options={chartOptions} />
	</div>
</div>