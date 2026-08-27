// src/lib/stores/sensors.sse.svelte.ts
import type { SensorState } from '$lib/server/mqtt';
import type { SensorId } from '$lib/config/sensors';

class SensorStore {
  data = $state<Record<SensorId, SensorState>>({} as Record<SensorId, SensorState>);

  constructor() {
    if (typeof window !== 'undefined') this.connect();
  }

  private connect() {
    const es = new EventSource('/api/sensor/stream');

    es.addEventListener('snapshot', (e) => {
      this.data = JSON.parse((e as MessageEvent).data);
    });

    es.addEventListener('update', (e) => {
      const { id, state } = JSON.parse((e as MessageEvent).data) as {
        id: SensorId;
        state: SensorState;
      };
      this.data[id] = state;
    });
  }
}

export const sensorStore = new SensorStore();