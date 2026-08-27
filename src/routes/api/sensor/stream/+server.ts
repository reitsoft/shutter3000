// src/routes/api/sensor/stream/+server.ts
import { sensorStates, mqttEvents } from '$lib/server/mqtt';

export const GET = () => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send('snapshot', Object.fromEntries(sensorStates));

      const onUpdate = (payload: { id: string; state: unknown }) => send('update', payload);
      mqttEvents.on('sensor-update', onUpdate);

      const keepAlive = setInterval(() => controller.enqueue(encoder.encode(':\n\n')), 20000);

      return () => {
        mqttEvents.off('sensor-update', onUpdate);
        clearInterval(keepAlive);
      };
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