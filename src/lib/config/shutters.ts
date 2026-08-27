// src/lib/config/shutters.ts
import type { MqttDeviceConfig } from './device';

export const SHUTTER_LIST = [
  { id: 'wz-links', name: 'Wohnzimmer Links', room: 'Wohnzimmer', mqttId: 'shellyswitch25-112233' },
  { id: 'wz-rechts', name: 'Wohnzimmer Rechts', room: 'Wohnzimmer', mqttId: 'shellyswitch25-112234' },
  { id: 'kueche', name: 'Küchenfenster', room: 'Küche', mqttId: 'shellyswitch25-112235' },
  { id: 'schlafzimmer', name: 'Schlafzimmer', room: 'Schlafzimmer', mqttId: 'shellyswitch25-112236' },
  { id: 'schlafzimmer2', name: 'Schlafzimmer2', room: 'Schlafzimmer2', mqttId: 'shellyswitch25-112237' }
] as const satisfies readonly MqttDeviceConfig[];

export type ShutterId = (typeof SHUTTER_LIST)[number]['id'];