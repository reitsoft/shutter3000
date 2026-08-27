// src/lib/config/sensors.ts
import type { MqttDeviceConfig } from './device';

export const SENSOR_LIST = [
  { id: 'keller', name: 'Keller', room: 'Keller', mqttId: 'shellyhtg3-XXXXXXXXXXXX' }
] as const satisfies readonly MqttDeviceConfig[];

export type SensorId = (typeof SENSOR_LIST)[number]['id'];