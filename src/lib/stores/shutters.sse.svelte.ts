type ShutterState = { pos: number; state: string; online: boolean };

const THROTTLE_MS = 500;

class ShutterStore {
    states = $state<Record<string, ShutterState>>({});
    #eventSource: EventSource | null = null;
    #lastApplied = new Map<string, number>();
    #pending = new Map<string, ReturnType<typeof setTimeout>>();

    connect() {
        if (this.#eventSource) return () => this.disconnect();

        const es = new EventSource('/api/shutter/stream');
        this.#eventSource = es;

        es.addEventListener('snapshot', (e) => {
            // Ein Snapshot ist immer der aktuellste Vollzustand (z. B. nach
            // Reconnect). Alle noch ausstehenden, verzögerten Updates aus
            // #throttledApply verwerfen wir daher — sonst könnten sie kurz
            // danach mit veralteten Werten von vor dem Reconnect den
            // frischen Snapshot wieder überschreiben.
            for (const t of this.#pending.values()) clearTimeout(t);
            this.#pending.clear();
            this.#lastApplied.clear();
            this.states = JSON.parse(e.data);
        });

        es.addEventListener('update', (e) => {
            const data = JSON.parse(e.data);
            this.#throttledApply(data.id, data.state);
        });

        es.onerror = () => {
            console.warn('Shutter SSE-Verbindung unterbrochen, Browser versucht Reconnect …');
        };

        return () => this.disconnect();
    }

    #throttledApply(id: string, state: ShutterState) {
        const now = Date.now();
        const last = this.#lastApplied.get(id) ?? 0;
        const elapsed = now - last;

        // Bereits ein Update für diesen Rolladen geplant? Dann nur den Wert austauschen,
        // nicht mehrfach Timer setzen.
        const existingTimeout = this.#pending.get(id);

        if (elapsed >= THROTTLE_MS) {
            if (existingTimeout) {
                clearTimeout(existingTimeout);
                this.#pending.delete(id);
            }
            this.#lastApplied.set(id, now);
            this.states = { ...this.states, [id]: state };
            return;
        }

        if (existingTimeout) clearTimeout(existingTimeout);

        const remaining = THROTTLE_MS - elapsed;
        const timeout = setTimeout(() => {
            this.#lastApplied.set(id, Date.now());
            this.states = { ...this.states, [id]: state };
            this.#pending.delete(id);
        }, remaining);

        this.#pending.set(id, timeout);
    }

    disconnect() {
        this.#eventSource?.close();
        this.#eventSource = null;
        for (const t of this.#pending.values()) clearTimeout(t);
        this.#pending.clear();
    }

    async sendCommand(id: string, command: number | 'open' | 'close' | 'stop') {
        const res = await fetch('/api/shutter/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, command })
        });

        if (!res.ok) {
            throw new Error(`Command fehlgeschlagen (${res.status}): ${id} → ${command}`);
        }
    }
}

export const shutterStore = new ShutterStore();