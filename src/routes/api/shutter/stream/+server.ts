// api/shutter/stream/+server.ts
import type { RequestHandler } from './$types';
import { shutterStates, mqttEvents } from '$lib/server/mqtt';

export const GET: RequestHandler = async () => {
    let closed = false;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const send = (event: string, data: unknown) => {
                if (closed) return;
                try {
                    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
                } catch {
                    closed = true;
                }
            };

            send('snapshot', Object.fromEntries(shutterStates));

            const onUpdate = (data: unknown) => send('update', data);
            mqttEvents.on('update', onUpdate);

            const keepAlive = setInterval(() => {
                if (closed) return;
                try {
                    controller.enqueue(encoder.encode(': ping\n\n'));
                } catch {
                    closed = true;
                    clearInterval(keepAlive);
                }
            }, 20000);

            return () => {
                closed = true;
                mqttEvents.off('update', onUpdate);
                clearInterval(keepAlive);
            };
        },
        cancel() {
            closed = true;
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