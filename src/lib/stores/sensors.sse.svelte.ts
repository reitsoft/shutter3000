interface SensorState {
	temperature: number | null;
	humidity: number | null;
	batteryPercent: number | null;
	lastUpdated: number | null;
}

class SensorStore {
	states = $state<Record<string, SensorState>>({});
	private eventSource: EventSource | null = null;

	constructor() {
		if (typeof window !== 'undefined') {
			this.connect();
		}
	}

	private connect() {
		this.eventSource = new EventSource('/api/sensor/stream');

		this.eventSource.addEventListener('snapshot', (e) => {
			this.states = JSON.parse(e.data);
		});

		this.eventSource.addEventListener('update', (e) => {
			const { id, state } = JSON.parse(e.data) as { id: string; state: SensorState };
			this.states[id] = state;
		});

		this.eventSource.onerror = () => {
			// EventSource reconnected automatisch bei Verbindungsabbruch,
			// kein manuelles Handling nötig.
		};
	}

	get(id: string): SensorState | undefined {
		return this.states[id];
	}
}

export const sensorStore = new SensorStore();