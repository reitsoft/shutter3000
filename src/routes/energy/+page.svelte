<script lang="ts">
    import { Zap, RotateCcwClock, Calendar } from '@lucide/svelte';
    import { Line } from 'svelte-chartjs';
    import {
        Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
        Filler,
        type ChartData,
        type ChartOptions
    } from 'chart.js';

    // Chart.js Module registrieren
    ChartJS.register(
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
        Filler
    );

    let outerHeight = $state(0);
    let contentHeight = $state(0);
    let scale = $derived(contentHeight > 0 ? Math.min(1, outerHeight / contentHeight) : 1);

    const ZAEHLERSTAND = 12237.0;
    const VERBRAUCH_LETZTER_MONAT = 312.4;

    // Daten generieren
    let kumuliert = 0;
    const labels = Array.from({ length: new Date().getDate() }, (_, i) => String(i + 1));
    const dataPoints = Array.from({ length: new Date().getDate() }, (_, i) => {
        const tag = i + 1;
        const basis = 9 + Math.sin(tag / 3) * 3;
        const rauschen = (Math.sin(tag * 12.9898) * 43758.5453) % 1;
        const tagesverbrauch = Math.max(3, basis + rauschen * 6);
        kumuliert += tagesverbrauch;
        return Math.round(kumuliert * 10) / 10;
    });

    const VERBRAUCH_MONAT = dataPoints[dataPoints.length - 1] || 0;

    // Chart.js Data Objekt mit orange-500 (#e8632c)
    const chartData: ChartData<'line'> = {
        labels,
        datasets: [
            {
                label: 'Verbrauch (kWh)',
                data: dataPoints,
                fill: true,
                tension: 0.4,
                borderColor: '#e8632c',
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 4,
                // Canvas Gradient mit #e8632c (rgba(232, 99, 44, ...))
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return undefined;

                    const gradient = ctx.createLinearGradient(0, chartArea.top+20, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(232, 99, 44, 0.25)');
                    gradient.addColorStop(1, 'rgba(232, 99, 44, 0.0)');
                    return gradient;
                }
            }
        ]
    };

    const chartOptions: ChartOptions<'line'> = {
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
                    label: (context) => `${context.parsed.y} kWh`
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
                    callback: (value, index) => {
                        const day = index + 1;
                        return day % 5 === 0 ? day : '';
                    }
                }
            },
            y: {
                display: false,
                grid: { display: false },
                beginAtZero: true
            }
        }
    };
</script>

<div
    bind:clientHeight={outerHeight}
    class="flex h-full w-full items-start justify-center overflow-hidden bg-navy-950"
>
    <div
        bind:clientHeight={contentHeight}
        style="transform: scale({scale}); transform-origin: top center; width: 28rem; will-change: transform;"
        class="flex flex-col text-cream-100 select-none"
    >
        <!-- Header -->
        <header class="flex w-full shrink-0 items-center justify-between px-6 pt-7 pb-2">
            <div>
                <h1
                    class="font-handwriting font-bold tracking-wide whitespace-nowrap text-cream-100"
                    style="font-size: clamp(1.25rem, 7vw, 2.25rem);"
                >
                    Energie
                </h1>
            </div>
        </header>

        <main class="w-full px-4 pb-4">
            <div class="flex flex-col gap-4">
                <!-- Aktueller Zählerstand -->
                <div class="rounded-2xl bg-navy-900 p-4">
					<div class="flex items-center gap-5">
                            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 text-[#e8632c]">
                                <Zap class="h-6 w-6" />
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm font-medium tracking-wide text-cream-100/60 uppercase">
                                    Zählerstand
                                </span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-3xl leading-tight font-bold text-cream-100">
                                        {ZAEHLERSTAND.toLocaleString('de-DE', {
                                        minimumFractionDigits: 1,
                                        maximumFractionDigits: 1
                                    })}
                                    </span>
                                    <span class="text-md font-medium text-cream-200/60">kWh</span>
                                </div>
                            </div>
                        </div>
                </div>

                <!-- Minimalistische Monatsverbrauch-Card -->
                <div class="rounded-2xl bg-navy-900 p-5 pb-2">
                    <!-- Header Nebeneinander -->
                    <div class="flex items-center justify-between px-1 pb-2">
                        <!-- Diesen Monat (Passend im Orange-Tone) -->
                        <div class="flex items-center gap-3">
                            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100/10 text-cream-100/70">
                                <Calendar class="h-5 w-5" />
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs font-medium tracking-wide text-cream-100/40 uppercase">
                                    Diesen Monat
                                </span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-2xl font-semibold tracking-tight text-cream-100">
                                        {VERBRAUCH_MONAT.toFixed(1)}
                                    </span>
                                    <span class="text-xs font-medium text-cream-200/60">kWh</span>
                                </div>
                            </div>
                        </div>

                        <!-- Vormonat -->
                        <div class="flex items-center gap-3">
                            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100/5 text-cream-100/40">
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

                    <!-- svelte-chartjs Line Component -->
                    <div class="h-20 w-full pt-0">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>