// src/lib/config/device.ts
export interface MqttDeviceConfig {
  id: string; // Eindeutige ID im UI
  name: string; // Anzeigename
  room: string; // Raumzuordnung
  mqttId: string; // Shelly Device-ID / Topic-ID
}