import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const LATITUDE = 47.85639756600935;
const LONGITUDE = 8.781613169200257;
const FETCH_TIMEOUT_MS = 5000;

export const GET: RequestHandler = async ({ fetch }) => {
	const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,relative_humidity_2m&timezone=Europe/Berlin`;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const response = await fetch(apiUrl, { signal: controller.signal });

		if (!response.ok) {
			return json({ error: 'Fehler beim Laden der Wetterdaten' }, { status: response.status });
		}

		const data = await response.json();

		return json({
			humidity: data.current.relative_humidity_2m,
			humidityUnit: data.current_units.relative_humidity_2m,
			temperature: data.current.temperature_2m,
			temperatureUnit: data.current_units.temperature_2m,
			time: data.current.time
		});
	} catch (error) {
		// Abbruch durch Timeout separat behandeln, damit die Meldung präzise ist
		if (error instanceof Error && error.name === 'AbortError') {
			console.error('Weather API request timed out after', FETCH_TIMEOUT_MS, 'ms');
			return json({ error: 'Wetterdaten aktuell nicht erreichbar (Timeout)' }, { status: 503 });
		}

		console.error('Weather API request failed:', error);

		const message = error instanceof Error ? error.message : 'Unbekannter Fehler';

		return json({ error: 'Wetterdaten aktuell nicht erreichbar', details: message }, { status: 503 });
	} finally {
		clearTimeout(timeoutId);
	}
};