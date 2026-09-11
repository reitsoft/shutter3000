<!-- src/lib/components/shutters/ShutterRow.svelte -->
<script lang="ts">
	import { shutterStore } from '$lib/stores/shutters.sse.svelte';

	type Shutter = { id: string; name: string };

	let { shutter }: { shutter: Shutter } = $props();

	let sliderEl: HTMLDivElement;

	let localPos = $state<number | undefined>();
	let isDragging = $state(false);
	let pendingCommand = $state(false);

	const remoteState = $derived(shutterStore.states[shutter.id]?.state);
	const isMoving = $derived(remoteState === 'opening' || remoteState === 'closing');

	// Remote-Position übernehmen, außer während der Nutzer gerade zieht oder
	// ein Command noch aussteht — sonst überschreibt der Server-Wert den
	// Knob mitten im Drag oder kurz nach dem Loslassen. Sobald beides vorbei
	// ist, ist die Remote-Position wieder die alleinige Quelle der Wahrheit
	// (localPos wird zurückgesetzt), damit z. B. "Alle Runter", ein anderer
	// Client oder ein physischer Schalter hier sichtbar bleiben.
	$effect(() => {
		const remotePos = shutterStore.states[shutter.id]?.pos;
		if (remotePos !== undefined && !isDragging && !pendingCommand) {
			localPos = remotePos;
		}
	});

	const position = $derived(localPos ?? shutterStore.states[shutter.id]?.pos ?? 0);

	function updatePosition(e: MouseEvent | TouchEvent, element: HTMLDivElement) {
		const rect = element.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const offsetX = clientX - rect.left;
		const percentage = Math.max(0, Math.min(100, Math.round((offsetX / rect.width) * 100)));
		localPos = percentage;
	}

	function handlePointerDown(e: MouseEvent | TouchEvent, element: HTMLDivElement) {
		isDragging = true;
		updatePosition(e, element);
	}

	function handlePointerMove(e: MouseEvent | TouchEvent, element: HTMLDivElement) {
		if (isDragging) updatePosition(e, element);
	}

	async function handlePointerUp() {
		if (!isDragging) return;
		isDragging = false;

		const newPos = localPos;
		const currentRemotePos = shutterStore.states[shutter.id]?.pos;

		if (newPos === undefined || newPos === currentRemotePos) {
			// Keine Änderung — sofort wieder auf Remote-Sync umschalten
			localPos = undefined;
			return;
		}

		pendingCommand = true;
		try {
			await shutterStore.sendCommand(shutter.id, newPos);
		} catch (err) {
			console.error(`Fehler beim Senden des Commands für ${shutter.id}:`, err);
		} finally {
			pendingCommand = false;
			// Egal ob Erfolg oder Fehler: ab jetzt wieder der echte Server-Zustand,
			// damit die UI nie dauerhaft einen nicht erreichten Zielwert anzeigt.
			localPos = undefined;
		}
	}

	// Knob bleibt innerhalb der Balken-Enden sichtbar, statt an den Rändern abgeschnitten zu werden
	function knobPosition(pos: number) {
		return Math.min(94, Math.max(6, pos));
	}
</script>

<svelte:window
	onmouseup={handlePointerUp}
	ontouchend={handlePointerUp}
	onmousemove={(e) => {
		if (isDragging && sliderEl) updatePosition(e, sliderEl);
	}}
/>

<div class="flex h-full w-full min-h-0 flex-col justify-center gap-1">
	<!-- Label über dem Slider -->
	<span class="px-3 text-sm font-bold tracking-wide text-cream-100">
		{shutter.name}
	</span>

	<!-- Slider -->
	<div class="relative min-h-8 w-full flex-1 max-h-12">
		<div
			bind:this={sliderEl}
			role="slider"
			aria-valuenow={position}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label={shutter.name}
			tabindex="0"
			class="absolute inset-0 cursor-pointer touch-none overflow-hidden rounded-full border-4 border-navy-800 bg-navy-900"
			onmousedown={(e) => handlePointerDown(e, sliderEl)}
			ontouchstart={(e) => handlePointerDown(e, sliderEl)}
			ontouchmove={(e) => handlePointerMove(e, sliderEl)}
		>
			<div
				class="pointer-events-none absolute top-0 bottom-0 left-0 transition-[width] duration-150 ease-out {isMoving
					? 'stripes'
					: 'bg-teal-500'}"
				style="width: {position}%;"
			></div>
		</div>

		<!-- Knob -->
		<div
			class="pointer-events-none absolute top-1/2 h-10 w-10 rounded-full border-4 border-orange-500 bg-cream-100 transition-[left] duration-150 ease-out"
			style="left: {knobPosition(position)}%; transform: translate(-50%, -50%);"
		></div>
	</div>
</div>

<style>
	.stripes {
		background-image: repeating-linear-gradient(
			135deg,
			var(--color-orange-500) 0 12px,
			var(--color-teal-500) 12px 24px
		);
		background-size: 34px 34px;
		animation: stripes-move 0.6s linear infinite;
	}

	@keyframes stripes-move {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 40px 0;
		}
	}
</style>