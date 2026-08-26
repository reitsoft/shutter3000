<script lang="ts">
import DoorOpen from '@lucide/svelte/icons/door-open';
import Lock from '@lucide/svelte/icons/lock';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import Check from '@lucide/svelte/icons/check';

// --- Türöffner (Slide to Unlock) ---
const KNOB_GROESSE = 48; // entspricht h-12 / w-12
const TRACK_PADDING = 6; // entspricht p-1.5
const AUTO_VERRIEGELN_MS = 4000;

let tuerEntriegelt = $state(false);
let trackBreite = $state(0);
let dragX = $state(0);
let dragging = $state(false);
let pointerStartX = 0;
let dragStartX = 0;
let autoLockTimeout: ReturnType<typeof setTimeout> | undefined;

let maxDrag = $derived(Math.max(trackBreite - KNOB_GROESSE - TRACK_PADDING * 2, 0));
let fortschritt = $derived(maxDrag > 0 ? dragX / maxDrag : 0);

function onPointerDown(e: PointerEvent) {
    if (tuerEntriegelt) return;
    dragging = true;
    pointerStartX = e.clientX;
    dragStartX = dragX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    const delta = e.clientX - pointerStartX;
    dragX = Math.min(Math.max(dragStartX + delta, 0), maxDrag);
}

function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    if (fortschritt > 0.85) {
        tuerEntriegeln();
    } else {
        dragX = 0;
    }
}

function tuerEntriegeln() {
    tuerEntriegelt = true;
    dragX = maxDrag;
    // TODO: hier den echten Türöffner-Call einbauen (z. B. Home Assistant Service Call)
    clearTimeout(autoLockTimeout);
    autoLockTimeout = setTimeout(() => {
        tuerEntriegelt = false;
        dragX = 0;
    }, AUTO_VERRIEGELN_MS);
}
</script>

<!-- Kachel: Türöffner -->
<div class="col-span-2 flex flex-col gap-4 rounded-3xl border-4 border-navy-800 bg-navy-900 p-5">
    <div class="flex items-center gap-2">
        {#if tuerEntriegelt}
            <Lock class="h-5 w-5 stroke-3 text-orange-500" />
        {:else}
            <DoorOpen class="h-5 w-5 stroke-3 text-teal-500" />
        {/if}
        <span class="text-sm font-bold tracking-wide text-cream-100/50 uppercase">Haustür</span>
    </div>

    <div
        bind:clientWidth={trackBreite}
        class="relative h-16 w-full overflow-hidden rounded-full bg-navy-950 p-1.5"
    >
        <!-- Fortschritts-Fläche hinter dem Knopf -->
        <div
            class="absolute inset-y-1.5 left-1.5 rounded-full bg-orange-500/15"
            style="width: {dragX + KNOB_GROESSE / 2}px; transition: {dragging ? 'none' : 'width 200ms ease-out'};"
        ></div>

        <!-- Beschriftung -->
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
                class="text-sm font-bold tracking-wide uppercase {tuerEntriegelt ? 'text-orange-500' : 'text-cream-100/40'}"
                style="opacity: {tuerEntriegelt ? 1 : Math.max(1 - fortschritt * 1.6, 0)};"
            >
                {tuerEntriegelt ? 'Tür entriegelt' : 'Schieben zum Entriegeln'}
            </span>
        </div>

        <!-- Knopf -->
        <button
            type="button"
            aria-label={tuerEntriegelt ? 'Tür ist entriegelt' : 'Zum Entriegeln nach rechts schieben'}
            onpointerdown={onPointerDown}
            onpointermove={onPointerMove}
            onpointerup={onPointerUp}
            onpointercancel={onPointerUp}
            class="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-cream-100 shadow-lg {tuerEntriegelt
                ? 'border-orange-500'
                : 'border-navy-950'}"
            style="touch-action: none; transform: translateX({dragX}px); transition: {dragging
                ? 'none'
                : 'transform 200ms ease-out'};"
        >
            {#if tuerEntriegelt}
                <Check class="h-6 w-6 stroke-3 text-orange-500" />
            {:else}
                <ChevronRight class="h-6 w-6 stroke-3 text-navy-950" />
            {/if}
        </button>
    </div>
</div>