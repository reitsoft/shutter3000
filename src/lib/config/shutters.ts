// src/lib/config/shutters.ts
import type { MqttDeviceConfig } from './device';

export const SHUTTER_LIST = [
  { id: 'kueche-west', name: 'Küche West', room: 'Küche', mqttId: 'shelly2pmg3-28372f357fcc' },
  { id: 'kueche-nord', name: 'Küche Nord', room: 'Küche', mqttId: 'shelly2pmg3-e4b063e8ca2c' },
  { id: 'esszimmer-nord', name: 'Esszimmer Nord', room: 'Esszimmer', mqttId: 'shelly2pmg3-e4b063e7edc4' },
  { id: 'esszimmer-ost', name: 'Esszimmer Ost', room: 'Esszimmer', mqttId: 'shelly2pmg3-28372f30d2ec' },
  { id: 'terrasse', name: 'Terrasse', room: 'Terrasse', mqttId: 'shelly2pmg3-b08184e8b708' },
  { id: 'wohnzimmer-ost', name: 'Wohnzimmer Ost', room: 'Wohnzimmer', mqttId: 'shelly2pmg3-28372f352da4' },
  { id: 'wohnzimmer-sued', name: 'Wohnzimmer Süd', room: 'Wohnzimmer', mqttId: 'shelly2pmg3-28372f33d1e0' },
  { id: 'gaestezimmer', name: 'Gästezimmer', room: 'Gästezimmer', mqttId: 'shelly2pmg3-e4b063e95e50' },
  { id: 'wc', name: 'WC', room: 'WC', mqttId: 'shelly2pmg3-28372f339018' },
] as const satisfies readonly MqttDeviceConfig[];

export type ShutterId = (typeof SHUTTER_LIST)[number]['id'];