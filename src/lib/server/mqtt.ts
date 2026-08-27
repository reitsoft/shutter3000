// src/lib/server/mqtt.ts
import { EventEmitter } from 'node:events';
import mqtt from 'mqtt';
import { SHUTTER_LIST, type ShutterId } from '$lib/config/shutters';
import { SENSOR_LIST, type SensorId } from '$lib/config/sensors';

export const mqttEvents = new EventEmitter();

export type ShutterState = { pos: number; state: string };

export const shutterStates = new Map<ShutterId, ShutterState>();
for (const shutter of SHUTTER_LIST) {
  shutterStates.set(shutter.id, { pos: 0, state: 'stop' });
}

export type SensorState = {
  tempC: number | null;
  humidity: number | null;
  batteryPercent: number | null;
  batteryVoltage: number | null;
  externalPower: boolean | null; // true = läuft an USB-C, false = Batteriebetrieb
  lastSeen: number | null; // wichtig, da Gerät nur periodisch aufwacht
};

export const sensorStates = new Map<SensorId, SensorState>();
for (const sensor of SENSOR_LIST) {
  sensorStates.set(sensor.id, {
    tempC: null,
    humidity: null,
    batteryPercent: null,
    batteryVoltage: null,
    externalPower: null,
    lastSeen: null
  });
}

export const mqttClient = mqtt.connect('mqtt://192.168.0.100:1883', {
  clientId: 'sveltekit-shutter-dashboard'
});

mqttClient.on('connect', () => {
  console.log('✅ MQTT mit Broker verbunden');
  mqttClient.subscribe('shellies/+/roller/0');
  mqttClient.subscribe('shellies/+/roller/0/pos');

  mqttClient.subscribe('+/status/temperature:0');
  mqttClient.subscribe('+/status/humidity:0');
  mqttClient.subscribe('+/status/devicepower:0');
});

mqttClient.on('message', (topic, message) => {
  const parts = topic.split('/');

  // --- Rolläden (bestehend) ---
  if (topic.startsWith('shellies/')) {
    const mqttId = parts[1];
    const matched = SHUTTER_LIST.find((s) => s.mqttId === mqttId);
    if (!matched) return;
    const payload = message.toString();
    const current = shutterStates.get(matched.id) ?? { pos: 0, state: 'stop' };
    if (topic.endsWith('/pos')) {
      current.pos = parseInt(payload, 10);
    } else if (topic.endsWith('/0')) {
      try {
        const data = JSON.parse(payload);
        current.pos = data.current_pos;
        current.state = data.state;
      } catch {
        current.state = payload;
      }
    }
    shutterStates.set(matched.id, current);
    mqttEvents.emit('shutter-update', { id: matched.id, state: current });
    return;
  }

  // --- Sensoren (neu, Gen3-RPC-Topics) ---
  const mqttId = parts[0];
  const matchedSensor = SENSOR_LIST.find((s) => s.mqttId === mqttId);
  if (!matchedSensor) return;

  const current = sensorStates.get(matchedSensor.id) ?? {
    tempC: null,
    humidity: null,
    batteryPercent: null,
    batteryVoltage: null,
    externalPower: null,
    lastSeen: null
  };

  try {
    const data = JSON.parse(message.toString());
    if (topic.endsWith('/status/temperature:0')) {
      current.tempC = data.tC;
    } else if (topic.endsWith('/status/humidity:0')) {
      current.humidity = data.rh;
    } else if (topic.endsWith('/status/devicepower:0')) {
      current.batteryPercent = data.battery?.percent ?? current.batteryPercent;
      current.batteryVoltage = data.battery?.V ?? current.batteryVoltage;
      current.externalPower = data.external?.present ?? current.externalPower;
    } else {
      return;
    }
  } catch {
    return;
  }

  current.lastSeen = Date.now();
  sensorStates.set(matchedSensor.id, current);
  mqttEvents.emit('sensor-update', { id: matchedSensor.id, state: current });
});