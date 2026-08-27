<script lang="ts">
    import Zap from '@lucide/svelte/icons/zap';
    import Thermometer from '@lucide/svelte/icons/thermometer';
    import Droplet from '@lucide/svelte/icons/droplet';
    import Flame from '@lucide/svelte/icons/flame';
    import Waves from '@lucide/svelte/icons/waves';
    import Fan from '@lucide/svelte/icons/fan';
    import DoorOpen from '@lucide/svelte/icons/door-open';
    import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
    import Check from '@lucide/svelte/icons/check';
    import House from '@lucide/svelte/icons/house';
    import Rows3 from '@lucide/svelte/icons/rows-3';

    // Dummy-Daten
    const strom = { 
    kwhHeute: 4, 
    kostenHeute: '1,08',
    kwhMonat: 124,
    kostenMonat: '33,48'
};
    const heizung = { temp: 21.4, an: true };
    const warmwasser = { temp: 48.2, aufbereitung: false };
    const bad = { temp: 23.8, feuchtigkeit: 62 };
    const keller: { temp: number | null; feuchtigkeit: number | null } = {
        temp: null,
        feuchtigkeit: null
    };

    // Lüfter-Schieber (Bad)
    const LUEFTER_LAUFZEIT_SEKUNDEN = 120;
    const KNOB_GROESSE = 48; // Auf 48px angepasst (entspricht h-12)
    const TRACK_PADDING = 6;

    let luefterAn = $state(false);
    let restlaufzeitSekunden = $state(0);
    let restlaufzeitMinuten = $derived(Math.ceil(restlaufzeitSekunden / 60));

    let trackBreite = $state(0);
    let maxDrag = $derived(Math.max(trackBreite - KNOB_GROESSE - TRACK_PADDING * 2, 0));

    let dragging = $state(false);
    let wurdeGezogen = false;
    let dragX = $state(0);
    let pointerStartX = 0;
    let dragStartX = 0;

    $effect(() => {
        if (dragging) return;
        dragX = luefterAn ? maxDrag : 0;
    });

    function onPointerDown(e: PointerEvent) {
        dragging = true;
        wurdeGezogen = false;
        pointerStartX = e.clientX;
        dragStartX = dragX;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
        if (!dragging) return;
        const delta = e.clientX - pointerStartX;
        if (Math.abs(delta) > 4) wurdeGezogen = true;
        dragX = Math.min(Math.max(dragStartX + delta, 0), maxDrag);
    }

    function onPointerUp() {
        if (!dragging) return;
        dragging = false;
        if (!wurdeGezogen) return;
        const fortschritt = maxDrag > 0 ? dragX / maxDrag : 0;
        setLuefter(fortschritt > 0.5);
    }

    function setLuefter(an: boolean) {
        luefterAn = an;
        restlaufzeitSekunden = an ? LUEFTER_LAUFZEIT_SEKUNDEN : 0;
    }

    function onKlick() {
        if (wurdeGezogen) return;
        setLuefter(!luefterAn);
    }

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

    // Türöffner (Slide to Unlock)
    const TUER_KNOB_GROESSE = 48;
    const TUER_TRACK_PADDING = 6;
    const AUTO_VERRIEGELN_MS = 4000;

    let tuerEntriegelt = $state(false);
    let tuerTrackBreite = $state(0);
    let tuerDragX = $state(0);
    let tuerDragging = $state(false);
    let tuerPointerStartX = 0;
    let tuerDragStartX = 0;
    let autoLockTimeout: ReturnType<typeof setTimeout> | undefined;

    let tuerMaxDrag = $derived(Math.max(tuerTrackBreite - TUER_KNOB_GROESSE - TUER_TRACK_PADDING * 2, 0));
    let tuerFortschritt = $derived(tuerMaxDrag > 0 ? tuerDragX / tuerMaxDrag : 0);

    function onTuerPointerDown(e: PointerEvent) {
        if (tuerEntriegelt) return;
        tuerDragging = true;
        tuerPointerStartX = e.clientX;
        tuerDragStartX = tuerDragX;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onTuerPointerMove(e: PointerEvent) {
        if (!tuerDragging) return;
        const delta = e.clientX - tuerPointerStartX;
        tuerDragX = Math.min(Math.max(tuerDragStartX + delta, 0), tuerMaxDrag);
    }

    function onTuerPointerUp() {
        if (!tuerDragging) return;
        tuerDragging = false;
        if (tuerFortschritt > 0.85) {
            tuerEntriegeln();
        } else {
            tuerDragX = 0;
        }
    }

    function tuerEntriegeln() {
        tuerEntriegelt = true;
        tuerDragX = tuerMaxDrag;
        clearTimeout(autoLockTimeout);
        autoLockTimeout = setTimeout(() => {
            tuerEntriegelt = false;
            tuerDragX = 0;
        }, AUTO_VERRIEGELN_MS);
    }
</script>

<div class="flex h-dvh flex-col bg-navy-950 text-cream-100 select-none">
    <header class="w-full max-w-md shrink-0 self-center px-6 pt-6 pb-4">
        <h1 class="text-2xl font-bold tracking-tight text-cream-100">Dahoam is Dahoam</h1>
    </header>

    <main class="w-full max-w-md flex-1 self-center overflow-y-auto px-4 pb-4">
        <div class="flex flex-col gap-4">
           <!-- Stromverbrauch -->
<div class="grid grid-cols-2 divide-x divide-navy-800 rounded-2xl bg-navy-900 p-4">
    <!-- Verbrauch heute -->
    <div class="flex items-center gap-3 pr-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <Zap class="h-6 w-6 text-orange-500" />
        </div>
        <div class="flex min-w-0 flex-1 flex-col justify-center">
            <div class="flex items-center gap-1.5">
                <span class="text-2xl font-bold leading-tight text-cream-100">{strom.kwhHeute}</span>
                <span class="text-sm font-medium text-cream-200">kWh</span>
                <span class="ml-auto rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-500">
                    {strom.kostenHeute} €
                </span>
            </div>
            <span class="mt-0.5 text-sm text-cream-200 truncate">Verbrauch heute</span>
        </div>
    </div>

    <!-- Diesen Monat -->
    <div class="flex items-center pl-4">
        <div class="flex min-w-0 flex-1 flex-col justify-center">
            <div class="flex items-center gap-1.5">
                <span class="text-2xl font-bold leading-tight text-cream-100">{strom.kwhMonat}</span>
                <span class="text-sm font-medium text-cream-200">kWh</span>
                <span class="ml-auto rounded-md bg-navy-800 px-2 py-0.5 text-xs font-bold text-cream-100">
                    {strom.kostenMonat} €
                </span>
            </div>
            <span class="mt-0.5 text-sm text-cream-200 truncate">Diesen Monat</span>
        </div>
    </div>
</div>

            <!-- Heizung / Warmwasser -->
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-4 rounded-3xl border border-navy-800 bg-navy-900 p-5">
                    <div class="flex items-center gap-3">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/10">
                            <Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-cream-100">{heizung.temp.toFixed(1)}°</div>
                            <div class="text-xs text-cream-100/50">Temperatur</div>
                        </div>
                    </div>
                    <span class="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-500/30 px-3 py-1.5 text-[11px] font-bold tracking-wide text-orange-500 uppercase">
                        <Flame class="h-3.5 w-3.5 stroke-3" />
                        Heizung {heizung.an ? 'an' : 'aus'}
                    </span>
                </div>

                <div class="flex flex-col gap-4 rounded-3xl border border-navy-800 bg-navy-900 p-5">
                    <div class="flex items-center gap-3">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                            <Droplet class="h-5 w-5 stroke-3 text-blue-400" />
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-cream-100">{warmwasser.temp.toFixed(1)}°</div>
                            <div class="text-xs text-cream-100/50">Warmwasser</div>
                        </div>
                    </div>
                    <span class="inline-flex w-fit items-center gap-1.5 rounded-full border border-cream-100/15 px-3 py-1.5 text-[11px] font-bold tracking-wide text-cream-100/50 uppercase">
                        <Waves class="h-3.5 w-3.5 stroke-3" />
                        Aufwärmen {warmwasser.aufbereitung ? 'an' : 'aus'}
                    </span>
                </div>
            </div>

            <!-- Bad -->
            <div class="flex flex-col gap-4 rounded-3xl border border-navy-800 bg-navy-900 p-5">
                <span class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Bad</span>
                <div class="grid grid-cols-2 divide-x divide-cream-100/10">
                    <div class="flex items-center gap-3">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/10">
                            <Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-cream-100">{bad.temp.toFixed(1)}°</div>
                            <div class="text-xs text-cream-100/50">Temperatur</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 pl-4">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                            <Droplet class="h-5 w-5 stroke-3 text-blue-400" />
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-cream-100">{bad.feuchtigkeit}%</div>
                            <div class="text-xs text-cream-100/50">Feuchtigkeit</div>
                        </div>
                    </div>
                </div>

                <!-- Lüfter-Schieber -->
                <div
                    bind:clientWidth={trackBreite}
                    class="relative h-15 w-full overflow-hidden rounded-full border border-cream-100/10 bg-navy-950 p-1.5"
                >
                    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span class="text-xs font-bold tracking-wide uppercase {luefterAn ? 'text-cream-100' : 'text-cream-100/40'}">
                            {luefterAn ? `Restlaufzeit ${restlaufzeitMinuten} Min` : 'Lüfter ist Aus'}
                        </span>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={luefterAn}
                        aria-label={luefterAn ? `Badlüfter ausschalten, noch ${restlaufzeitMinuten} Minuten aktiv` : 'Badlüfter einschalten'}
                        onpointerdown={onPointerDown}
                        onpointermove={onPointerMove}
                        onpointerup={onPointerUp}
                        onpointercancel={onPointerUp}
                        onclick={onKlick}
                        class="absolute inset-y-1.5 left-1.5 z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full {luefterAn ? 'bg-teal-500' : 'bg-cream-100/10'}"
                        style="touch-action: none; transform: translateX({dragX}px); transition: {dragging ? 'none' : 'transform 200ms ease-out'};"
                    >
                        <Fan
                            class="h-6 w-6 stroke-3 {luefterAn ? 'text-navy-950' : 'text-cream-100/40'}"
                            style={luefterAn ? 'animation: fan-spin 1.4s linear infinite;' : ''}
                        />
                    </button>
                </div>
            </div>

            <!-- Keller -->
            <div class="flex flex-col gap-4 rounded-3xl border border-navy-800 bg-navy-900 p-5">
                <span class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Keller</span>
                <div class="grid grid-cols-2 divide-x divide-cream-100/10">
                    <div class="flex items-center gap-3">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/10">
                            <Thermometer class="h-5 w-5 stroke-3 text-teal-500" />
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-cream-100">
                                {keller.temp != null ? keller.temp.toFixed(1) : '–'}°
                            </div>
                            <div class="text-xs text-cream-100/50">Temperatur</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 pl-4">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                            <Droplet class="h-5 w-5 stroke-3 text-blue-400" />
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-cream-100">
                                {keller.feuchtigkeit != null ? keller.feuchtigkeit : '–'}%
                            </div>
                            <div class="text-xs text-cream-100/50">Feuchtigkeit</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Haustür -->
            <div class="flex flex-col gap-4 rounded-3xl border border-navy-800 bg-navy-900 p-5">
                <div class="flex items-center gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/10">
                        <DoorOpen class="h-5 w-5 stroke-3 text-teal-500" />
                    </div>
                    <span class="text-xs font-bold tracking-wide text-cream-100/50 uppercase">Haustür</span>
                </div>

                <div
                    bind:clientWidth={tuerTrackBreite}
                    class="relative h-15 w-full overflow-hidden rounded-full border border-cream-100/10 bg-navy-950 p-1.5"
                >
                    <div
                        class="absolute inset-y-1.5 left-1.5 rounded-full bg-navy-950/15"
                        style="width: {tuerDragX + TUER_KNOB_GROESSE / 2}px; transition: {tuerDragging ? 'none' : 'width 200ms ease-out'};"
                    ></div>

                    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span
                            class="text-xs font-bold tracking-wide uppercase {tuerEntriegelt ? 'text-orange-500' : 'text-cream-100/40'}"
                            style="opacity: {tuerEntriegelt ? 1 : Math.max(1 - tuerFortschritt * 1.6, 0)};"
                        >
                            {tuerEntriegelt ? 'Tür entriegelt' : 'Schieben zum Entriegeln'}
                        </span>
                    </div>

                    <button
                        type="button"
                        aria-label={tuerEntriegelt ? 'Tür ist entriegelt' : 'Zum Entriegeln nach rechts schieben'}
                        onpointerdown={onTuerPointerDown}
                        onpointermove={onTuerPointerMove}
                        onpointerup={onTuerPointerUp}
                        onpointercancel={onTuerPointerUp}
                        class="absolute inset-y-1.5 left-1.5 z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full {tuerEntriegelt ? 'bg-teal-500' : 'bg-cream-100/10'}"
                        style="touch-action: none; transform: translateX({tuerDragX}px); transition: {tuerDragging ? 'none' : 'transform 200ms ease-out'};"
                    >
                        {#if tuerEntriegelt}
                            <Check class="h-6 w-6 stroke-3 text-navy-950" />
                        {:else}
                            <ChevronsRight class="h-6 w-6 stroke-3 text-cream-100/40" />
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </main>

    <!-- Navigationsleiste -->
    <nav class="w-full shrink-0 bg-navy-950 pb-[env(safe-area-inset-bottom)]">
        <div class="mx-auto flex max-w-md items-center justify-around py-3">
            <a href="/dashboard" class="flex flex-col items-center gap-1 text-teal-500">
                <House class="h-5 w-5 stroke-3" />
                <span class="text-[11px] font-bold tracking-wide uppercase">Haus</span>
                <span class="mt-0.5 h-0.5 w-4 rounded-full bg-teal-500"></span>
            </a>
            <a href="/rollos" class="flex flex-col items-center gap-1 text-cream-100/40">
                <Rows3 class="h-5 w-5 stroke-3" />
                <span class="text-[11px] font-bold tracking-wide uppercase">Rollos</span>
            </a>
            <a href="/strom" class="flex flex-col items-center gap-1 text-cream-100/40">
                <Zap class="h-5 w-5 stroke-3" />
                <span class="text-[11px] font-bold tracking-wide uppercase">Strom</span>
            </a>
        </div>
    </nav>
</div>