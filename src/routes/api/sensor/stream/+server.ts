import { sensorStates, mqttEvents } from '$lib/server/mqtt';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	let unsubscribe: () => void;

	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();

			const send = (event: string, data: unknown) => {
				controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
			};

			// Initialer Snapshot beim Verbindungsaufbau, damit das Frontend
			// nicht erst auf das nächste Wake-Intervall des Sensors warten muss.
			send('snapshot', Object.fromEntries(sensorStates));

			const onUpdate = (payload: { id: string; state: unknown }) => {
				send('update', payload);
			};

			mqttEvents.on('sensor-update', onUpdate);

			unsubscribe = () => mqttEvents.off('sensor-update', onUpdate);
		},
		cancel() {
			unsubscribe?.();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};