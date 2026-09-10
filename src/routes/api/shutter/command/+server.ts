import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { mqttClient, CLIENT_ID } from '$lib/server/mqtt';
import { SHUTTER_LIST } from '$lib/config/shutters';

export const POST: RequestHandler = async ({ request }) => {
	const { id, command } = await request.json();

	const shutter = SHUTTER_LIST.find((s) => s.id === id);
	if (!shutter) {
		return json({ error: 'Unbekannter Rolladen' }, { status: 404 });
	}

	if (!mqttClient.connected) {
		return json({ error: 'MQTT-Broker nicht verbunden' }, { status: 503 });
	}

	const topic = `${shutter.mqttId}/rpc`;
	let method: string;
	const params: Record<string, unknown> = { id: 0 };

	if (command === 'open') method = 'Cover.Open';
	else if (command === 'close') method = 'Cover.Close';
	else if (command === 'stop') method = 'Cover.Stop';
	else {
		method = 'Cover.GoToPosition';
		params.pos = command;
	}

	const payload = JSON.stringify({
		id: Date.now(),
		src: CLIENT_ID, // muss mit der Subscription in mqtt.ts übereinstimmen,
		// sonst geht die RPC-Antwort des Geräts ins Leere
		method,
		params
	});

	const publishError = await new Promise<Error | undefined>((resolve) => {
		mqttClient.publish(topic, payload, (err) => resolve(err ?? undefined));
	});

	if (publishError) {
		console.error(`MQTT-Publish fehlgeschlagen für ${topic}:`, publishError);
		return json({ error: 'Publish fehlgeschlagen' }, { status: 502 });
	}

	return json({ ok: true });
};